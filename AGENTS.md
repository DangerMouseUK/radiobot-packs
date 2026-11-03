# AGENTS.md

Instructions for AI coding agents (and people) working in this repository. Read this file in full before changing anything.

## What this is

The station pack library for **Radio Bot**, a self-hosted Discord bot that plays live internet radio. The bot lives in [DangerMouseUK/radiobot](https://github.com/DangerMouseUK/radiobot); this repository holds only its station packs. The repository is **public**.

- Each pack is a folder, `packs/<pack-id>/`, covering one company: a broadcaster, a holding company or a curated list.
- On every push to `main` that touches packs, CI builds `index.json` plus one `<pack-id>.json` bundle per pack and publishes them as the assets of a GitHub release. Installed bots read `releases/latest/download/index.json`. The formats are defined in the bot's `src/catalogue/pack-library.ts`.
- Discord installs packs only from this library, so this repository is the quality gate. Every pack is reviewed.

## Before you touch a pack

**Load the `station-pack` skill** (`.claude/skills/station-pack/SKILL.md`) and follow it step by step. It is the same text as [playbook/PLAYBOOK.md](playbook/PLAYBOOK.md), for people. It covers set-up, scope, qualifying a company, finding streams (including load-balanced streaming services), `pack-author`, validation, the live check, updates, stop conditions, known traps and the pull request checklist. If you change one copy, change the other in the same change; CI checks that they match.

The skill is only offered to an agent started in this repository's folder. If you were started elsewhere (in the bot's folder, say), read `playbook/PLAYBOOK.md` in full instead; it is the same text.

## Layout

```text
packs/<pack-id>/          pack.json, stations.json, sources.json, SOURCE_PROVENANCE.md, evidence/
pack-ids.json             every pack id ever used; ids are only ever added
withdrawn.json            packs removed from the library (TAKEDOWN.md)
collections/              hand-picked collections, one <id>.json each (country collections are automatic)
playbook/PLAYBOOK.md      the pack procedure, for people
.claude/skills/station-pack/SKILL.md   the same procedure, as a Claude Code skill
scripts/ci-check.mjs      every CI check, runnable locally (Node 24, no dependencies)
.github/workflows/        check.yml (pull requests and main), publish.yml (releases)
TAKEDOWN.md               how rights holders ask for removal, and what happens
```

## Commands

Clone the bot next to this repository (`../radiobot`), then in the bot run `corepack enable` and `pnpm install` (which also brings the FFmpeg the live check uses on Windows and macOS; on Linux, install the distribution's FFmpeg). From this repository's root, with Node 24.17 or later:

```sh
node scripts/ci-check.mjs --bot ../radiobot --base origin/main    # everything CI checks
node ../radiobot/scripts/validate-catalogue.ts --pack packs/<pack-id> --strict
node ../radiobot/scripts/pack-author.ts new <pack-id> --root packs --ids pack-ids.json
node ../radiobot/scripts/pack-author.ts export packs/<pack-id>      # writes intake.csv
node ../radiobot/scripts/pack-author.ts generate packs/<pack-id> --base origin/main
                                   # rebuilds the JSON from intake.csv, bumping version once against origin/main
node ../radiobot/scripts/pack-author.ts diff-check <old-pack-dir> <new-pack-dir>
node ../radiobot/scripts/validate-catalogue.ts --pack packs/<pack-id> --probe --pack-id <pack-id> \
  --json packs/<pack-id>/evidence/probe-YYYY-MM-DD.json   # the live check: only with a person's yes
```

**Definition of done:** `node scripts/ci-check.mjs --base origin/main` passes, and the pull request template is filled in.

## Hard rules

1. **Public, free streams only.** No log-in, app-only, region-locked, DRM-protected, signed, tokenised or expiring addresses.
2. **No disguises.** The bot identifies to stream hosts as FFmpeg (`Lavf/<version>`), never as a browser, with no `Referer` or cookies. A host that refuses it is left alone.
3. **Provenance for every source**: `official-player` or `curated`, with where and when it was found, in `provenanceDetail` and in the sources table of the pack's `SOURCE_PROVENANCE.md`. Only addresses the broadcaster's site or player gives, with two exceptions, both `curated`: a load-balanced streaming service's stable address for the exact mount the official player plays (the playbook lists the services), and an official stream at the same address in another format, proven by an audio comparison (`--compare`) and adding something the station lacks. Never try other stream names or bitrates, never record a load-balanced service's per-listener server, and never commit addresses found by a crawler or guessed.
4. **IDs are permanent.** Pack ids, station slugs and source ids are never changed, reused or deleted. Rename with an alias; retire stations with `catalogueStatus: "retired"`; disable sources with `enabled: false` and a `disabledReason`. Never remove an id from `pack-ids.json`.
5. **Every change to a pack bumps its `version`** (`YYYY.MM.DD`, then `.2`, `.3` … the same day), once per change: run `generate` with `--base origin/main`. A pack that was never published keeps the date it was started with. `diff-check` enforces the bump.
6. **Contacting stream servers only with a person's explicit permission**: starting a station's player, opening a stream address and live checks (`--probe`). Never in CI or tests. Reading web pages and the player's configuration is fine. Reports go in `packs/<pack-id>/evidence/probe-YYYY-MM-DD.json`. If a consent banner blocks a player, refuse everything that can be refused.
7. **Stop and ask** when the playbook says so: tokens or signed links, log-ins, region locks, a third-party directory as the only source, two stations sharing a stream, an unclear owner or pack scope, or a load-balanced service the playbook doesn't list.
8. **Nothing but data in a pack.** No logos, artwork, images, audio or personal data.
9. **Names stay in their pack.** A broadcaster's name and its stations' names appear only inside `packs/<pack-id>/` (and in generated output). Everything else, including this file, the README, the playbook, collections and CI, stays generic: use examples such as `mypack:my-station`.
10. **Unofficial.** Radio Bot and this library are not affiliated with or endorsed by any broadcaster. Never add wording that suggests otherwise, and never put a broadcaster's name in a pack's `disclaimer`.
11. **Nothing personal** anywhere in the repository: no people's names, e-mail addresses, IP addresses, Discord server, channel or user ids, or tokens.
12. **Withdrawals** follow [TAKEDOWN.md](TAKEDOWN.md): the folder goes, an entry (`id`, `name`, `reason`, `date`) goes into `withdrawn.json`, and the id stays in `pack-ids.json`.
13. **New packs need a live check.** Strict validation requires that the newest probe report in `evidence/` checks the pack's own sources, that at least one of them played and that FFmpeg ran, so a pack can't be published until a person has allowed and run `--probe`. It warns about enabled sources that failed: disable them with a reason, or explain them.
14. **`pack-author new` never edits `pack-ids.json`.** Add a new pack's id there yourself, at the end.

## CI and workflows

- `scripts/ci-check.mjs` holds the check logic so it runs the same locally and in CI. Keep it dependency-free and runnable on Node 24 on Linux, macOS and Windows.
- The workflows check out the bot at `${{ vars.RADIO_BOT_REF || 'main' }}`. Set the `RADIO_BOT_REF` repository variable to test against a bot branch or tag.
- Pin every third-party (non-`actions/*`) action by full commit SHA with a version comment.
- `publish.yml` creates the releases. Never create, edit or delete releases or tags by hand unless the maintainer asks.

## Safety

- Don't commit, push, tag or publish unless the maintainer asks.
- Never run live checks, or anything else that contacts real stream servers, without a person's explicit permission.
- British English in all text ("catalogue", "licence", "favourites").
