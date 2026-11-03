#!/usr/bin/env node
// Checks this pack library: what CI runs on every pull request and every push to main.
// No dependencies of its own: it uses Node 24 and a checkout of the Radio Bot repository,
// whose scripts do the pack-level work (validate-catalogue, pack-author).
//
//   node scripts/ci-check.mjs [--bot <dir>] [--base <git-ref>]
//
//   --bot <dir>    the Radio Bot checkout (default: .radiobot, then ../radiobot, or RADIO_BOT_DIR)
//   --base <ref>   compare with this commit too: no pack id removed, no pack folder deleted unless
//                  withdrawn, and diff-check for every pack changed since then (CI passes the
//                  pull request's base, or the commit before a push; locally try --base origin/main)
//
// It runs every check, prints what failed, and exits with 1 if anything did.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const PACK_ID = /^[a-z0-9][a-z0-9-]{0,31}$/;
const COLLECTION_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
// Names the bot or the release can't use as a pack id: `custom` is the bot's own, and the
// library's index is published as index.json beside the <id>.json bundles.
const RESERVED_IDS = new Set(['custom', 'index']);
// Never in a pack: artwork and audio.
const FORBIDDEN_FILE = /\.(png|jpe?g|gif|webp|svg|ico|bmp|tiff?|avif|heic|mp3|aac|m4a|ogg|oga|opus|wav|flac|aiff?)$/i;
const ZERO_SHA = /^0+$/;

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? null) : null;
};

const failures = [];
const inActions = process.env.GITHUB_ACTIONS === 'true';
function fail(message) {
  failures.push(message);
  process.stdout.write(inActions ? `::error::${message}\n` : `  FAIL  ${message}\n`);
}
function ok(message) {
  process.stdout.write(`  ok    ${message}\n`);
}
function section(title) {
  process.stdout.write(`\n== ${title}\n`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`${path}: ${err.message}`);
    return null;
  }
}

function run(cmd, cmdArgs, { quiet = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit' });
  if (r.error) return { status: 1, stdout: '', stderr: r.error.message };
  return { status: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function git(...gitArgs) {
  const r = run('git', gitArgs, { quiet: true });
  return r.status === 0 ? r.stdout.trim() : null;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// ---------------------------------------------------------------------------------------------
// The Radio Bot checkout

function findBot() {
  const candidates = [option('--bot'), process.env.RADIO_BOT_DIR, '.radiobot', '../radiobot'].filter(Boolean);
  for (const c of candidates) {
    const dir = resolve(c);
    if (existsSync(join(dir, 'scripts', 'validate-catalogue.ts'))) return dir;
  }
  return null;
}

const bot = findBot();
const validator = bot ? join(bot, 'scripts', 'validate-catalogue.ts') : null;
const packAuthor = bot ? join(bot, 'scripts', 'pack-author.ts') : null;
const hasPackAuthor = Boolean(packAuthor && existsSync(packAuthor));
const hasStrict = Boolean(validator && readFileSync(validator, 'utf8').includes("'--strict'"));

// ---------------------------------------------------------------------------------------------
// Library files: pack-ids.json, withdrawn.json, packs/, collections/

section('Library files');

const packIdsFile = readJson('pack-ids.json');
let packIds = [];
if (packIdsFile) {
  if (packIdsFile.schemaVersion !== 1 || !Array.isArray(packIdsFile.ids)) {
    fail('pack-ids.json must be { "schemaVersion": 1, "ids": [ ... ] }');
  } else {
    packIds = packIdsFile.ids;
    const seen = new Set();
    for (const id of packIds) {
      if (typeof id !== 'string' || !PACK_ID.test(id)) fail(`pack-ids.json: "${id}" is not a valid pack id`);
      else if (RESERVED_IDS.has(id)) fail(`pack-ids.json: "${id}" is reserved and can't be a pack id`);
      if (seen.has(id)) fail(`pack-ids.json lists "${id}" twice`);
      seen.add(id);
    }
    ok(`pack-ids.json: ${packIds.length} ids`);
  }
}
const packIdSet = new Set(packIds);

const withdrawnFile = readJson('withdrawn.json');
let withdrawn = [];
if (withdrawnFile) {
  if (withdrawnFile.schemaVersion !== 1 || !Array.isArray(withdrawnFile.packs)) {
    fail('withdrawn.json must be { "schemaVersion": 1, "packs": [ ... ] }');
  } else {
    withdrawn = withdrawnFile.packs;
    const seen = new Set();
    for (const w of withdrawn) {
      const id = w?.id;
      if (typeof id !== 'string' || !PACK_ID.test(id)) {
        fail(`withdrawn.json: entry ${JSON.stringify(w)} has no valid "id"`);
        continue;
      }
      if (typeof w.reason !== 'string' || w.reason.length < 1 || w.reason.length > 300)
        fail(`withdrawn.json: "${id}" needs a "reason" of 1–300 characters`);
      if (typeof w.name !== 'string' || w.name.length < 1 || w.name.length > 80)
        fail(`withdrawn.json: "${id}" needs a "name" of 1–80 characters`);
      if (typeof w.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(w.date))
        fail(`withdrawn.json: "${id}" needs a "date" written YYYY-MM-DD`);
      if (!packIdSet.has(id)) fail(`withdrawn.json: "${id}" is not in pack-ids.json`);
      if (seen.has(id)) fail(`withdrawn.json lists "${id}" twice`);
      seen.add(id);
    }
    ok(`withdrawn.json: ${withdrawn.length} withdrawn`);
  }
}
const withdrawnSet = new Set(withdrawn.map((w) => w?.id).filter(Boolean));

const packDirs = [];
const packVersions = new Map();
if (!existsSync('packs')) {
  fail('there is no packs/ folder');
} else {
  for (const name of readdirSync('packs').sort()) {
    const dir = join('packs', name);
    if (!statSync(dir).isDirectory()) {
      fail(`packs/${name}: only pack folders belong in packs/`);
      continue;
    }
    if (!PACK_ID.test(name) || RESERVED_IDS.has(name)) {
      fail(`packs/${name}: the folder name must be a valid pack id (lower-case letters, digits and -, at most 32)`);
      continue;
    }
    if (!existsSync(join(dir, 'pack.json'))) {
      fail(`packs/${name}: has no pack.json`);
      continue;
    }
    const meta = readJson(join(dir, 'pack.json'));
    if (meta && meta.id !== name) fail(`packs/${name}/pack.json: "id" is "${meta.id}" but the folder is "${name}"`);
    if (meta) packVersions.set(name, meta.version ?? null);
    if (!packIdSet.has(name)) fail(`packs/${name}: "${name}" is missing from pack-ids.json`);
    if (withdrawnSet.has(name)) fail(`packs/${name}: "${name}" is withdrawn (withdrawn.json) but its folder is still here`);
    for (const file of listFiles(dir)) {
      if (FORBIDDEN_FILE.test(file)) fail(`${file}: no artwork or audio in packs`);
    }
    packDirs.push(name);
  }
  ok(`packs/: ${packDirs.length} pack folders`);
}
const packDirSet = new Set(packDirs);

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(path));
    else out.push(path);
  }
  return out;
}

const collectionIds = [];
if (existsSync('collections')) {
  for (const name of readdirSync('collections').sort()) {
    if (!name.endsWith('.json')) continue;
    const path = join('collections', name);
    const c = readJson(path);
    if (!c) continue;
    const id = name.slice(0, -'.json'.length);
    if (c.id !== id) fail(`${path}: "id" must be "${id}", the file name`);
    if (!COLLECTION_ID.test(id)) fail(`${path}: "${id}" is not a valid collection id`);
    if (id.startsWith('country-')) fail(`${path}: ids starting with "country-" are kept for the automatic country collections`);
    if (typeof c.name !== 'string' || c.name.length < 1 || c.name.length > 80)
      fail(`${path}: needs a "name" of 1–80 characters`);
    if (c.description !== undefined && (typeof c.description !== 'string' || c.description.length > 300))
      fail(`${path}: "description" must be at most 300 characters`);
    if (!Array.isArray(c.packs) || c.packs.length > 500) {
      fail(`${path}: "packs" must be a list of at most 500 pack ids`);
      continue;
    }
    if (new Set(c.packs).size !== c.packs.length) fail(`${path}: a pack is listed twice`);
    for (const p of c.packs) if (!packDirSet.has(p)) fail(`${path}: "${p}" is not a pack in packs/`);
    collectionIds.push(id);
  }
  ok(`collections/: ${collectionIds.length} hand-picked collections`);
}

// The playbook exists twice, for people and as the agents' skill, and the two must say the same.
const PLAYBOOK = 'playbook/PLAYBOOK.md';
const SKILL = '.claude/skills/station-pack/SKILL.md';
if (!existsSync(PLAYBOOK) || !existsSync(SKILL)) {
  fail(`${PLAYBOOK} and ${SKILL} must both exist`);
} else {
  const lf = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const skillBody = lf(SKILL).replace(/^---\n[\s\S]*?\n---\n\n?/, '');
  if (skillBody !== lf(PLAYBOOK)) fail(`${SKILL} (after its front matter) must match ${PLAYBOOK}`);
  else ok(`${SKILL} matches ${PLAYBOOK}`);
}

// ---------------------------------------------------------------------------------------------
// Every pack, with the bot's own validator in strict mode

section('Pack validation (validate-catalogue --strict)');

if (!bot) {
  fail('no Radio Bot checkout found: clone it into .radiobot or ../radiobot, or pass --bot <dir>');
} else if (!hasStrict) {
  fail(`${validator} has no --strict option: use a Radio Bot checkout that has it (RADIO_BOT_REF in CI)`);
} else {
  for (const id of packDirs) {
    process.stdout.write(`-- packs/${id}\n`);
    const r = run(process.execPath, [validator, '--pack', join('packs', id), '--strict']);
    if (r.status === 0) ok(`packs/${id}`);
    else fail(`packs/${id}: strict validation failed (see the output above)`);
  }
}

// ---------------------------------------------------------------------------------------------
// Against the base commit: nothing removed, every changed pack passes diff-check

const base = option('--base');
if (base) {
  section(`Changes since ${base}`);
  compareWithBase(base);
}

function compareWithBase(ref) {
  if (ZERO_SHA.test(ref)) {
    ok('no earlier commit to compare with (new branch)');
    return;
  }
  const baseCommit = git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
  if (!baseCommit) {
    fail(`can't find the commit "${ref}" (CI needs fetch-depth: 0)`);
    return;
  }
  const mergeBase = git('merge-base', baseCommit, 'HEAD') ?? baseCommit;

  const baseIdsText = git('show', `${mergeBase}:pack-ids.json`);
  let baseIds = [];
  if (baseIdsText) {
    try {
      baseIds = JSON.parse(baseIdsText).ids ?? [];
    } catch {
      fail(`pack-ids.json at ${mergeBase.slice(0, 12)} is not valid JSON`);
    }
  }
  const removedIds = baseIds.filter((id) => !packIdSet.has(id));
  if (removedIds.length) fail(`pack-ids.json: ids removed (never remove one): ${removedIds.join(', ')}`);
  else ok(`pack-ids.json keeps all ${baseIds.length} earlier ids`);

  const baseTree = git('ls-tree', '-d', '--name-only', `${mergeBase}:packs`);
  const baseDirs = baseTree ? baseTree.split('\n').filter(Boolean) : [];
  for (const id of baseDirs) {
    if (!packDirSet.has(id) && !withdrawnSet.has(id))
      fail(`packs/${id} was deleted: retire stations and disable sources instead, or withdraw the pack in withdrawn.json`);
  }

  // Changed files, including uncommitted and untracked ones when this runs locally.
  const changed = new Set();
  const diff = git('diff', '--name-only', mergeBase, '--', 'packs');
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', 'packs');
  for (const line of `${diff ?? ''}\n${untracked ?? ''}`.split('\n')) {
    const m = /^packs\/([^/]+)\//.exec(line.trim());
    if (m) changed.add(m[1]);
  }
  const toCheck = [...changed].filter((id) => packDirSet.has(id) && baseDirs.includes(id)).sort();
  const added = [...changed].filter((id) => packDirSet.has(id) && !baseDirs.includes(id)).sort();
  if (added.length) ok(`new packs: ${added.join(', ')}`);
  if (toCheck.length === 0) {
    ok('no existing pack changed');
    return;
  }
  if (!hasPackAuthor) {
    fail(`changed packs (${toCheck.join(', ')}) need diff-check, but ${packAuthor ?? 'pack-author.ts'} is missing`);
    return;
  }

  const tmp = mkdtempSync(join(tmpdir(), 'packs-base-'));
  const worktree = join(tmp, 'base');
  if (git('worktree', 'add', '--detach', '--quiet', worktree, mergeBase) === null) {
    fail(`couldn't check out ${mergeBase.slice(0, 12)} to compare with`);
    rmSync(tmp, { recursive: true, force: true });
    return;
  }
  try {
    for (const id of toCheck) {
      process.stdout.write(`-- diff-check packs/${id}\n`);
      const r = run(process.execPath, [packAuthor, 'diff-check', join(worktree, 'packs', id), join('packs', id)]);
      if (r.status === 0) ok(`packs/${id}: no ids removed, version bumped`);
      else fail(`packs/${id}: diff-check failed (see the output above)`);
    }
  } finally {
    git('worktree', 'remove', '--force', worktree);
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------
// A trial build of the library, checked the way the bot will read it

section('Trial library build (build-library)');
if (!hasPackAuthor) {
  fail(`${packAuthor ?? 'pack-author.ts'} is missing: use a Radio Bot checkout that has it (RADIO_BOT_REF in CI)`);
} else {
  await trialBuild();
}

async function trialBuild() {
  const out = mkdtempSync(join(tmpdir(), 'packs-build-'));
  try {
    const buildArgs = [packAuthor, 'build-library', 'packs', out, '--base-url', 'https://example.invalid/library/'];
    if (existsSync('collections')) buildArgs.push('--collections', 'collections');
    buildArgs.push('--withdrawn', 'withdrawn.json');
    const r = run(process.execPath, buildArgs);
    if (r.status !== 0) {
      fail('build-library failed (see the output above)');
      return;
    }
    const indexPath = join(out, 'index.json');
    if (!existsSync(indexPath)) {
      fail('build-library wrote no index.json');
      return;
    }
    const indexText = readFileSync(indexPath, 'utf8');

    // The bot's own parsers, so the trial build is checked exactly as an installation checks it.
    let lib;
    try {
      lib = await import(pathToFileURL(join(bot, 'src', 'catalogue', 'pack-library.ts')).href);
    } catch (err) {
      fail(`couldn't load the bot's pack-library.ts: ${err.message}`);
      return;
    }
    let index;
    try {
      index = lib.parseLibraryIndex(indexText);
    } catch (err) {
      fail(`index.json: ${err.message}`);
      return;
    }
    ok(`index.json: ${index.packs.length} packs, ${index.collections.length} collections`);

    const entries = new Map(index.packs.map((p) => [p.id, p]));
    for (const id of packDirs) {
      const e = entries.get(id);
      if (!e) {
        fail(`index.json has no entry for "${id}"`);
        continue;
      }
      if (e.status !== 'available') fail(`index.json: "${id}" is "${e.status}", expected "available"`);
      if (e.version !== packVersions.get(id))
        fail(`index.json: "${id}" has version ${e.version}, pack.json has ${packVersions.get(id)}`);
      const fileName = e.file?.split('/').pop();
      const bundlePath = fileName ? join(out, fileName) : null;
      if (!bundlePath || !existsSync(bundlePath)) {
        fail(`index.json: "${id}" points at ${e.file}, which build-library didn't write`);
        continue;
      }
      const bytes = readFileSync(bundlePath);
      if (e.bytes !== null && e.bytes !== bytes.length) fail(`index.json: "${id}" says ${e.bytes} bytes, the file has ${bytes.length}`);
      if (e.sha256 !== sha256(bytes)) fail(`index.json: "${id}" has the wrong SHA-256`);
      try {
        lib.checkBundle(bytes, { id, sha256: e.sha256 });
        ok(`${fileName}: accepted by the bot (${e.stations} stations, ${e.sources} sources)`);
      } catch (err) {
        fail(`${fileName}: ${err.message}`);
      }
    }
    for (const id of withdrawnSet) {
      const e = entries.get(id);
      if (!e || e.status !== 'withdrawn') fail(`index.json: "${id}" should be listed as withdrawn`);
    }
    for (const e of index.packs) {
      if (!packDirSet.has(e.id) && !withdrawnSet.has(e.id)) fail(`index.json lists "${e.id}", which is not a pack here`);
    }
    const builtCollections = new Set(index.collections.map((c) => c.id));
    for (const id of collectionIds) {
      if (!builtCollections.has(id)) fail(`index.json is missing the collection "${id}"`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------

process.stdout.write('\n');
if (failures.length) {
  process.stdout.write(`${failures.length} problem(s) found.\n`);
  process.exit(1);
}
process.stdout.write('All checks passed.\n');
