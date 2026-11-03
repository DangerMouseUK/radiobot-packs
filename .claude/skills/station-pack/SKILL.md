---
name: station-pack
description: >-
  Create, update, fix or review a Radio Bot station pack in this library (packs/<pack-id>/).
  Use whenever someone wants to add a broadcaster, company or curated list of radio stations,
  add or change stations or stream addresses, retire stations, disable broken sources, bump a
  pack's version, run the pack-author or validate-catalogue tools, or review a pack pull request.
  Covers scope, whether a company qualifies, finding official streams (including load-balanced
  streaming services) and recording provenance,
  intake.csv, generate, strict validation, the live check (only with permission), stop conditions
  and the pull request checklist.
---
# Station pack playbook

This is the procedure for making, updating, fixing and reviewing a station pack in this library. Follow it in order. It is written so that a new pack is right first time.

This playbook exists twice with the same content: `playbook/PLAYBOOK.md` for people and `.claude/skills/station-pack/SKILL.md` for coding agents. If you change one, change the other in the same pull request; CI checks that they match.

## What a pack is

- A pack is a folder, `packs/<pack-id>/`, holding `pack.json`, `stations.json`, `sources.json`, `SOURCE_PROVENANCE.md` and `evidence/`.
- One pack covers one company: a broadcaster, a holding company, or a curated list of small independent stations.
- A pack says where each station's streams are, and where and when that was found. Radio Bot checks every stream itself before it plays it.
- Installed bots download packs from this library. Discord installs only from here. This repository is the quality gate: every pack is reviewed before it is published.
- The pack format is described in the bot's [catalog/README.md](https://github.com/DangerMouseUK/radiobot/blob/main/catalog/README.md). Read it once before your first pack.

## The hard rules

1. **Public, free streams only.** Never a stream that needs a log-in, an app, a particular country, DRM, or a signed, tokenised or expiring address.
2. **No disguises.** The bot identifies itself to stream hosts as FFmpeg (`Lavf/<version>`). It never pretends to be a browser and sends no `Referer` or cookies. If a host refuses it (HTTP 401, 403 or 451), that is the answer. Don't look for a way round it.
3. **Every source has provenance.** Where the address was found, when, and why it belongs to that station. Only addresses that the broadcaster's own site or player gives, with one exception: for a stream on a load-balanced streaming service, that service's stable address for the exact mount the official player plays (see [Load-balanced streaming services](#load-balanced-streaming-services)). Never addresses found by a crawler or guessed by editing a URL.
4. **IDs are permanent.** The pack id, every station slug and every source id. Never change one, never reuse one, never delete one. Installed bots' favourites and queues point at them.
5. **Nothing but data.** No logos, artwork, images, audio or personal data.
6. **Names stay in their pack.** A broadcaster's name and its stations' names appear only inside `packs/<pack-id>/`. Everything else in this repository stays generic (use examples such as `mypack:my-station`).
7. **Contacting stream servers needs a person's permission.** Starting a station's player, opening a stream address and `--probe` all connect to real stream servers. A person does these in their own browser and terminal; an agent asks first and waits for an explicit yes. Reading the broadcaster's web pages and the player's configuration (station lists, stream keys, a streaming service's station lookup, which returns addresses but no audio) needs no permission.

## 1. Set up

1. Install Node 24 (24.17 or later) and Git. Check with `node --version`.
2. Clone this repository and the bot's repository side by side, in the same parent folder:

   ```sh
   git clone https://github.com/DangerMouseUK/radiobot-packs.git
   git clone https://github.com/DangerMouseUK/radiobot.git
   ```

3. Install the bot's dependencies:

   ```sh
   cd radiobot
   corepack enable
   pnpm install
   cd ../radiobot-packs
   ```

4. Run every command below from the `radiobot-packs` folder. They reach the bot's tools as `../radiobot/scripts/…`. The same commands work in Bash and PowerShell. A coding agent should be started in the `radiobot-packs` folder too, so that it loads this playbook as its `station-pack` skill.
5. Make a branch: `git switch -c pack/<pack-id>` (or `fix/<pack-id>` for a fix).
6. You only need FFmpeg and FFprobe for the live check (step 8). The check uses `FFMPEG_PATH` and `FFPROBE_PATH` if you set them, otherwise the ones on your `PATH`, otherwise the copies that `pnpm install` put in the bot's folder, so on Windows and macOS there is nothing more to do. On Linux, install your distribution's FFmpeg (`sudo apt install ffmpeg` or the like): the bundled Linux build can crash on HLS streams.
7. Fetch the library's latest state now and then (`git fetch origin`). The commands below compare your work with `origin/main`.

## 2. Decide the pack's scope

1. **One company, one pack.** List the stations the company runs on its own website. They all go in one pack.
2. **A holding company whose brands share one website and station list** gets one pack, with `owner.kind` `group`.
3. **A brand with its own website and its own station list** may get its own pack, however many stations it has, even when its company owns other brands. Its `owner` names the company, with `kind` `group` and the brand in `owner.brand`. The company's other brands then get packs of their own in the same way; never put a station in a brand pack and a group pack both. Say in `SOURCE_PROVENANCE.md` which company owns the brand and which other brands it has.
4. **Small independents** with no common owner go in a curated pack (`owner.kind` `curated`), grouped by country, region or genre.
5. **Check it doesn't exist already.** Search `packs/` and `pack-ids.json`. A station belongs to one pack only. If another pack already has it, don't add it again.
6. **Choose the pack id.** Short, lower-case letters, digits and `-`, at most 32 characters, based on the company or brand name. It must not be in `pack-ids.json`, even as a withdrawn pack. `custom` and `index` are reserved. The id can never change.
7. **Write down** the owner's exact name, the countries (two-letter codes such as `GB`), the languages (codes such as `en` or `pt-BR`), and any regions. The owner's legal name is usually in the site's privacy statement, terms of use or imprint (in other languages: colofon, Impressum, mentions légales, aviso legal), which often lists the company's other brands too.

`owner` examples:

```json
{ "name": "Example Broadcasting", "kind": "broadcaster", "brand": null }
{ "name": "Example Media Group", "kind": "group", "brand": "Example Hits" }
{ "name": "Independent stations of Exampleshire", "kind": "curated", "brand": null }
```

Don't guess an owner. If you aren't sure which company owns a station, stop and ask (see [Stop and ask](#10-stop-and-ask)).

## 3. Check the company qualifies

Answer every question. One "no" means the stream, or the whole company, can't go in a pack.

1. Can anyone listen free on the company's own website, without an account?
2. Does it play in a web player, not only in an app?
3. Does it play without a country restriction? (A site saying "only available in …" is a no, and so is a streaming service's lookup answering with a geo-blocking status.)
4. Is it free of DRM and encryption? (An HLS playlist with `#EXT-X-KEY` is a no.)
5. Is the stream address stable? It must contain no token, signature, session id or expiry time, and must be the same address tomorrow. (A load-balanced service that hands out a different server each time qualifies if it has a stable address for the mount: see [Load-balanced streaming services](#load-balanced-streaming-services).)
6. Does the host serve it to an ordinary media player, with no browser `User-Agent`, `Referer` or cookies? You'll confirm this in the live check.
7. Does the company publish its own list of stations? A third-party directory alone isn't enough.

## 4. Find the stations and their streams

1. **Find the official station list** on the company's own website. Record its address and today's date. The date goes in `pack.json` as `snapshotDate`.
   - The list the web player shows is the one that counts. Many players load it from the site's own JSON API: in the browser's developer tools, choose **Network**, reload, and look for the request that returns the stations. Record that address too. It often gives each station's stable id and its stream key or mount.
   - News articles ("our digital stations") go out of date. Use them only as a cross-check, and say in `SOURCE_PROVENANCE.md` when one lists a station the player doesn't.
2. **Take each station's name exactly as the list shows it.** Note its page (`official_page`) and any stable id the site uses for it (`external_id`).
3. **Before you start any player, read hard rule 7.** Starting a player contacts the stream servers: an agent asks first. If a consent (cookie) banner blocks the player, choose the most private option: refuse everything that can be refused, and never accept tracking to make a player work.
4. **Open each station's official player** in your own browser and start it.
5. **Find the stream address.** Use one of these, in this order:
   1. a "listen in your own player" link or a `.pls` or `.m3u` file that the site offers;
   2. the address the player requests: open the browser's developer tools, choose **Network**, filter by media or `m3u8`, and copy the audio request's URL.
6. **Clean the address.** Remove tracking parameters only if the stream still plays without them. Typical ones are player or SDK names and versions, consent strings (`gdpr`, `gdpr_consent`), session or listener ids (such as `sbmid`, `uuid`, `listenerid`), and distribution or campaign tags. Never record a consent string or a session id. If the stream needs a parameter that looks like a token or a signature, it is a signed address: stop.
7. **Signed links that redirect.** Some players hand out a signed link that redirects to a plain address. Never record the signed link. The plain address may be used only if it plays on its own, with nothing added, and stays the same over time. If in doubt, stop and ask.
8. **Numbered servers that change.** If the address names one of many servers that a streaming service picks afresh for each listener (such as `12345.live.example-cdn.com`), don't record that server: see [Load-balanced streaming services](#load-balanced-streaming-services).
9. **Record every quality the player offers** as a separate source: a direct stream (Icecast or SHOUTcast, MP3, AAC or Opus) and HLS. The bot measures them and picks the best. Direct streams come first; HLS is a last resort. A streaming service may offer other formats that the player never uses; leave those out.
10. **Never invent an address.** Don't change `128` to `320` in a URL, or try mount names. Only the site and its player count. The one address you may write yourself is a load-balanced service's stable address for the exact mount the player plays, as described below.
11. **Video is not audio.** Visual-radio or TV streams in the player's data are not sources, even when they carry the same programme.
12. **Record for every address:**
   - `found_at`: the page or player where you found it;
   - `found_on`: the date, `YYYY-MM-DD`;
   - `provenance`: `official-player` if the broadcaster's site or player links this address to this station; `curated` if it is a reviewed mapping with other evidence, explained in `provenance_detail`;
   - `provenance_detail`: one or two sentences saying what linked the address to the station, and when.
13. A station with no stream you can use is still listed, with no source. Say so in the pull request.

## 5. Scaffold a new pack

1. Create the folder from the template:

   ```sh
   node ../radiobot/scripts/pack-author.ts new <pack-id> --root packs --ids pack-ids.json
   ```

   It refuses an id that is already in `pack-ids.json`. It creates `pack.json`, empty `stations.json` and `sources.json`, a `SOURCE_PROVENANCE.md` outline, an `evidence/` folder holding only a `.gitkeep` (delete it once the probe report is there) and an `intake.csv` with just the header row. It prints the next steps, as commands for the folder you ran it from.
2. **Add the new id to the end of `pack-ids.json` yourself.** The command never edits that file.
3. Fill in `pack.json`. The bot's [template README](https://github.com/DangerMouseUK/radiobot/blob/main/catalog/packs/_template/README.md) explains every field.
   - `name` and a one-sentence `description`;
   - `version`: already today's date, for example `2026.11.03`. Leave it: `generate --base origin/main` keeps it until the pack is published;
   - `owner`, `countries`, `languages` and, if useful, `regions`;
   - `brandLabels`: network names that appear in the stream names of several stations (see [Known traps](#11-known-traps));
   - `categories`, if the stations fall into clear groups;
   - `snapshotDate`: the date you took the station list;
   - `sync`: only if the official list matches one of the bot's sync adapters (`webradio-apidata`, `json-name-list`). Otherwise `null`.
4. Leave `disclaimer` as `null`. The bot always shows its own "unofficial" notice, and a disclaimer must never name the broadcaster.

## 6. Fill in the intake sheet

1. A new pack already has `packs/<pack-id>/intake.csv`, with just the header row. For an existing pack, write it from the pack's files first (step 9). Edit it in a spreadsheet or a text editor, and save it as CSV in UTF-8.
2. One row per stream address. A station with two addresses has two rows, with its station columns repeated (or left empty on the second row). A station with no address has one row with the address columns empty.
3. An empty cell keeps whatever the pack's files already say. To clear a value, edit the JSON by hand.
4. Fill in the columns:

| Column             | What to write                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `station`          | The name exactly as the official list shows it.                                                        |
| `slug`             | Leave blank for a new station and `generate` makes one from the name, or write one to choose it (see [Known traps](#11-known-traps)). Never change an existing slug. |
| `aliases`          | Other names people search for, separated by `\|`. Each name must belong to one station only.          |
| `category`         | A category id from `pack.json`, or blank.                                                             |
| `tags`             | Genres and keywords, separated by `\|`. The first three are shown in lists.                            |
| `order`            | The station's position on the official list.                                                          |
| `external_id`      | The site's own stable id for the station, if it has one.                                              |
| `official_page`    | The station's page on the official site.                                                              |
| `country`          | Only if it differs from the pack's.                                                                   |
| `region`           | Only if it differs from the pack's.                                                                   |
| `catalogue_status` | `active`, `missing_from_official` (gone from the list, maybe for a while) or `retired` (closed).      |
| `url`              | The stream address. Each address appears once in the whole sheet.                                      |
| `label`            | A short description such as `Direct MP3` or `HLS`. A new source's id is made from it. Never "HD", "lossless" or a bitrate you haven't measured. |
| `transport`        | `http-continuous` for a direct stream, `hls` for HLS, or blank.                                        |
| `codec`            | `mp3`, `aac` or `opus` if the site or the content type says so, or blank. It is a hint only.          |
| `priority`         | Lower is tried first. Use `10` for direct streams and `20` for HLS.                                   |
| `provenance`       | `official-player` or `curated`.                                                                       |
| `found_at`         | The page or player where you found the address. Always fill it in for a new address.                  |
| `found_on`         | The date you found it, `YYYY-MM-DD`. Always fill it in for a new address.                             |
| `provenance_detail`| What linked the address to the station, and when. If you leave it blank, `generate` writes "Linked from `found_at` on `found_on`." |
| `enabled`          | `true`, or `false` for a source that doesn't work.                                                    |
| `disabled_reason`  | Why it is disabled, when `enabled` is `false`.                                                         |

5. `intake.csv` is a working file. Git ignores it; never commit it. The JSON files and `SOURCE_PROVENANCE.md` are the record. `export` doesn't write `found_at` and `found_on` back into the sheet; they live in the sources table of `SOURCE_PROVENANCE.md`, which `generate` keeps.

## 7. Generate and validate

1. Rebuild the pack's files from the sheet:

   ```sh
   node ../radiobot/scripts/pack-author.ts generate packs/<pack-id> --base origin/main
   ```

   This rewrites `stations.json` and `sources.json`, and the sources table in `SOURCE_PROVENANCE.md` between `<!-- sources:start -->` and `<!-- sources:end -->`. It never changes or removes an existing slug or source id. New source ids are `<pack-id>-<slug>-<label>`. If it reports a problem, it writes nothing: fix the sheet and run it again. Read its warnings too.

   `--base origin/main` sets `version` against the published pack: a pack that isn't published yet keeps the date it was started with, and a published pack is bumped once (today's date, or `.2`, `.3` … after a change already published today), however often you run `generate`. Always pass it. Without it, every run that changes something bumps the version again.
2. Write the rest of `SOURCE_PROVENANCE.md` by hand, outside the markers. Never edit the table between the markers by hand. Write down:
   - where the station list came from, and its date;
   - how the stream addresses were found, and when;
   - what was checked, and what was not;
   - every disabled source and why;
   - anything unusual (stations sharing a stream, single-source stations, HLS-only stations).
3. Validate strictly:

   ```sh
   node ../radiobot/scripts/validate-catalogue.ts --pack packs/<pack-id> --strict
   ```

   Fix every problem it reports, then run it again. Strict validation needs a probe report in `evidence/` in which at least one of the pack's sources played, so a new pack can't pass until the live check (step 8) is done. Every other problem should be fixed now.
4. Read your own diff (`git diff`). Every station and every address should be one you meant to add.

## 8. The live check (only with a person's permission)

1. **Ask first.** A person must say yes before every live check. An agent asks in the chat and waits. Never run it in CI or in tests.
2. Check the whole pack once, gently. The script checks one source at a time:

   ```sh
   node ../radiobot/scripts/validate-catalogue.ts --pack packs/<pack-id> --probe --pack-id <pack-id> --json packs/<pack-id>/evidence/probe-YYYY-MM-DD.json
   ```

   For a very large pack, the person may prefer a sample: name stations instead of `--pack-id`, for example `--probe mypack:my-station mypack:other-station`. Add `--compare` to compare the audio of a station's sources (about 40 s each).

   It checks FFmpeg before anything else and prints the FFprobe it uses (`Using ffprobe version …`). If it says none could be run, nothing was contacted and no report was written: fix the set-up (step 1.6) and run it. That doesn't count as repeating a run.
3. Don't repeat a run that failed just to get a better result. Find out why.
4. Read the report (the script prints one line per source):
   - `ACCESS_DENIED` (HTTP 401, 403 or 451): the host refuses the bot. Disable the source with the reason. Don't work round it.
   - Not found, timeouts, not audio: disable the source with the reason.
   - A source that plays a different station: disable it and say so. The `icy-name` each stream announces is a quick check that every mount is mapped to the right station.
5. Write a short summary of the results in `SOURCE_PROVENANCE.md`: the date, how many sources played, and which failed and why.
6. Keep the date in the report's file name. The library shows the newest one as the date the pack was last checked, and strict validation reads only the newest one.
7. The report holds no audio. Never add audio to `evidence/`.
8. Disabling sources changes the pack: run `export`, set `enabled` to `false` with a reason, and `generate --base origin/main` again (step 7).
9. Run the strict validation again. It must pass now: the newest report must check the pack's own sources, at least one must have played, and FFmpeg must have run. It also prints a warning for every enabled source that failed the newest check; disable each one, or find out why and say so in `SOURCE_PROVENANCE.md`. Then run the library's own checks, as CI will:

   ```sh
   node scripts/ci-check.mjs --bot ../radiobot --base origin/main
   ```

## 9. Update an existing pack

1. Write the sheet from the current files:

   ```sh
   node ../radiobot/scripts/pack-author.ts export packs/<pack-id>
   ```

   It writes one row per source, and one row with no `url` for each station without a source. Rows are matched to stations by `slug`, and to sources by `url`.
2. Edit the rows:
   - **Renamed station:** change `station` and leave its `slug` as it is. `generate` keeps the old name as an alias, so people searching for it still find it.
   - **New station:** add its rows with a blank `slug`.
   - **Station closed:** set `catalogue_status` to `retired`. Never delete the row.
   - **Station gone from the official list, but you aren't sure it closed:** `missing_from_official`.
   - **Broken address:** set `enabled` to `false` and give a `disabled_reason`. Never delete the row.
   - **New address for a station:** add a new row with its own `found_at`, `found_on` and provenance. Don't overwrite the old row's `url`: that makes a new source and leaves the old one as it was. Disable the old row instead, with a reason.
   - **A source on the wrong station:** `generate` refuses to move it. Stop and ask; a maintainer moves it by editing `sources.json`.
   - Deleting a row from the sheet deletes nothing: `generate` keeps the station or source and warns you.
   - Never reuse a slug or a source id, and never change one.
3. Run `generate --base origin/main`, then the strict validation (step 7). `generate` bumps `version` once against the published pack: today's date, or `.2`, `.3` and so on after a change already published today (`2026.11.03.2`). If you edit the JSON by hand instead, bump `version` yourself.
4. Run diff-check against the published version. `ci-check.mjs --base origin/main` does this for every changed pack. By hand:

   ```sh
   git worktree add ../packs-base origin/main
   node ../radiobot/scripts/pack-author.ts diff-check ../packs-base/packs/<pack-id> packs/<pack-id>
   git worktree remove ../packs-base
   ```

   It refuses removed ids and changes without a version bump.
5. Update the narrative in `SOURCE_PROVENANCE.md`: what changed, when, and why.
6. If you changed addresses, a live check of those stations is needed (step 8, with permission).

## 10. Stop and ask

Stop work on the affected stations and ask a maintainer (an agent asks the person it is working for) when:

- an address contains a token, a signature, a session id or an expiry time, or only a signed link plays;
- a stream needs a log-in, an account or an app;
- a stream is region-locked, or the site says it is only for some countries;
- the only place an address appears is a third-party directory, not the broadcaster's site or player;
- two stations share one stream address;
- you aren't sure which company owns a station, or whether stations belong in one pack;
- the player streams from numbered servers that change, and the service has no stable address listed under [Load-balanced streaming services](#load-balanced-streaming-services);
- a streaming service's lookup says a mount needs authentication, or answers with a status other than OK;
- the host refuses the bot (`ACCESS_DENIED`) and the only way in would be pretending to be a browser;
- the station list or the player looks broken, and you would have to guess.

Write down what you found. Don't commit anything for those stations until a person decides.

## 11. Known traps

- **Regional variants with the same stream name.** "My Station North" and "My Station South" may both announce themselves as "My Station". Give each its own name as the official list shows it, map each address from that region's own player, and never give the shared name to one of them as an alias.
- **The network name in every stream name.** If several stations' streams announce "Example Network – …", add "Example Network" to `brandLabels`. Otherwise the bot can't tell the stations apart by name.
- **HLS-only stations.** Allowed, as a last resort. Check that the player really offers no direct stream, that the playlist has no `#EXT-X-KEY`, and that segment addresses carry no tokens.
- **Closed stations still listed.** A station may still appear on the site after it has closed. If its player doesn't play and the station has said it is closing, mark it `retired` and say so in `SOURCE_PROVENANCE.md`.
- **http and https duplicates.** The same mount on `http://` and `https://` is one stream. Keep the `https://` address if it plays; keep `http://` only if it is the only one that works.
- **Playlist and direct duplicates.** A `.pls` or `.m3u` file that points at a direct stream you already have adds nothing. Keep the direct address.
- **Names that collide.** Names and aliases are compared ignoring case, accents and punctuation. "My Station" and "MY-STATION!" are the same name, and only one station may use it.
- **Long slugs.** A slug is at most 32 characters, and `generate` cuts a long name short to make one. If the result reads badly, write a shorter slug yourself in `intake.csv` before the first `generate`. Once published, it can't change.
- **Slugs that repeat the pack id.** A station's full id is `<pack-id>:<slug>`, and its source ids start with `<pack-id>-`. When every station name starts with the brand, `generate` makes ids such as `mypack:mypack-hits`, and a station named just like the brand gets source ids such as `mypack-mypack-direct-aac`. Both are allowed. If you'd rather have `mypack:hits`, write the slugs in `intake.csv` before the first `generate`, and keep to one style across the pack. Once published, they can't change.
- **Very large companies.** A pack holds at most 2000 stations. Split a bigger company by brand, with the holding company in `owner`.
- **Every stream announcing the same name.** Read the `icy-name` lines of the live check. If every station's stream announces the brand alone, add it to `brandLabels`; if each announces its own name (such as "My Station Hits"), that name is a useful alias when it differs from the official one.

### Load-balanced streaming services

Some broadcasters stream through a service that spreads listeners over many servers. The player asks the service for a server, then plays from whichever one it got, so the address it requests (`https://12345.live.example-cdn.com/MOUNT.aac?…`) names a server that may not carry the stream tomorrow. Never record that server. Instead:

1. Find the service's name for the station's stream (its mount or station key). It is in the player's request, and usually in the site's station list too. Record both places in `provenance_detail`.
2. Check the service's own station lookup, if it has one, for that mount: it must answer OK, ask for no authentication and report no geo-blocking. Otherwise stop and ask.
3. Record the service's stable address for that mount, from the list below, with the same format suffix the player uses. Its `provenance` is `curated`, and `provenance_detail` says which mount the official player played, which server it used and on what date, and that the address was built from the mount name. Drop every query parameter the player adds.
4. If the service isn't in the list, stop and ask. A maintainer adds it here once its stable address is confirmed.

Known services:

- **Triton Digital** (servers `<number>.live.streamtheworld.com`). The player looks the mount up at `https://playerservices.streamtheworld.com/api/livestream?mount=<MOUNT>&transports=http,hls&version=1.10`, which must show `<status-code>200</status-code>` and `<authentication>0</authentication>`. Record `https://playerservices.streamtheworld.com/api/livestream-redirect/<MOUNT>.aac` for an AAC mount (`.mp3` for an MP3 one), with `<MOUNT>` as the player writes it in capitals (for example `MYSTATION_AAC`). The address redirects to a working server for each listener. Record the HLS form only if the player itself uses HLS.
- **A stable address that redirects to a server with a per-connection token** (such as `rj-tok`). Record the stable address the player was given, never the server it redirects to or its token.

## 12. Pull request checklist

Copy this into the pull request (the template does it for you) and answer every line:

- [ ] Where the station list came from, and the date it was taken.
- [ ] Stations without a working stream, and why.
- [ ] The date of the live check, run with a person's permission (or "not run"), how many sources played, and every enabled source that failed and why.
- [ ] Anything uncertain, and any stop-and-ask question still open.
- [ ] Any address built for a load-balanced service names its mount and the server the player used, and is `curated`.
- [ ] `validate-catalogue --strict` passed for every changed pack.
- [ ] `node scripts/ci-check.mjs --base origin/main` passed.
- [ ] No pack id, slug or source id was removed, changed or reused.
- [ ] `version` was bumped in every changed pack.
- [ ] A new pack id was added to `pack-ids.json`.
- [ ] `SOURCE_PROVENANCE.md` records where and when every address was found.
- [ ] No logos, artwork, audio, personal data, tokens or signed addresses.
- [ ] Broadcaster and station names appear only inside the pack's own folder.

## 13. What never goes in a pack

- Logos, artwork, screenshots or any other image.
- Audio of any kind, even a short clip.
- Personal data: people's names, e-mail addresses, Discord server, channel or user ids, IP addresses.
- Tokens, passwords, cookies, signed or expiring addresses, or tracking parameters.
- A disclaimer that names the broadcaster, or any text suggesting the pack is official.

## Reviewing a pack

A reviewer goes through the same steps in reverse:

1. Run `node scripts/ci-check.mjs --base origin/main` on the branch.
2. Open the official station list and compare it with `stations.json`: names, count and order.
3. For a sample of stations, open the official player and confirm that the addresses in `sources.json` are the ones it uses (for a load-balanced service, that the mount is the one it plays). Starting a player contacts stream servers: an agent reviewing asks first (hard rule 7).
4. Read the newest report in `evidence/`: its date, which sources played, and that every enabled source that failed is explained.
5. Read `SOURCE_PROVENANCE.md`: every source id appears in the table, and the narrative says what was and wasn't checked.
6. Check the pull request answers every checklist line, and that no stop-and-ask question is still open.
