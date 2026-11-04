# Source provenance: Radio FG starter pack (`fg`)

This file records where every entry in this pack's `stations.json` and `sources.json` (in `packs/fg/`) came from, what was checked, and what was not. Each source's `provenanceDetail` field in the JSON repeats the relevant facts.

> Radio Bot is **unofficial**. It is not affiliated with, endorsed by or sponsored by any broadcaster. Station names are used only to identify the stations. No logos, artwork or audio are included in this repository. Distributing or operating a playable catalogue is subject to the rights review described in [docs/rights-and-disclaimer.md](https://github.com/DangerMouseUK/radiobot/blob/main/docs/rights-and-disclaimer.md).

## Summary

| Item                                      | Value                                                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Station list source                       | `https://www.radiofg.com/les-radios-fg` (formerly `/Webradios`, which now redirects there), the server-rendered page's inline `var apidata` object, `webradios` array (site order) |
| Station list snapshot                     | 3 November 2026 (first taken 31 October 2026). 63 names, in official order (`stations.json`), unchanged between the two                                                          |
| Source discovery                          | 31 October 2026, checked again the playbook's way on 3 November 2026 (see [Review on 3 November 2026](#review-on-3-november-2026)); fallbacks restored on 4 November 2026                                                |
| Method                                    | The official web player's own links, followed in a browser (below)                                                                                                               |
| Stations catalogued                       | 63                                                                                                                                                                               |
| Candidate sources                         | 126: 65 direct streams and 61 HLS playlists                                                                                                                                      |
| Enabled sources                           | 82: 63 direct streams and 19 HLS playlists (18 that played in the latest checks, and 1 dead one kept on purpose). 44 are disabled, each with its reason. See [Change on 4 November 2026](#change-on-4-november-2026-keep-working-sources) |
| Stations with at least one enabled source | 62. FG HÏ IBIZA has none: its host refuses the bot                                                                                                                               |
| Provenance values                         | `official-player` (125), `curated` (1)                                                                                                                                           |
| Evidence in the files                     | None in the JSON files: hints are not evidence of codec, bitrate or identity, and the bot probes every source at run time. Live-check reports are in [`evidence/`](evidence/)     |
| Host of every source                      | `stream.rcs.revma.com` (HTTPS)                                                                                                                                                   |
| Publisher                                 | The site's privacy policy names FG Concept as its publisher, hosted by Les Indés Radios. `owner` stays "Radio FG" by the maintainer's decision (3 November 2026)                  |

## Change on 4 November 2026: keep working sources

The library's playbook now says to **keep every working source**. Every stream the official site or player links to a station is recorded, in every format it gives, HLS included: these are the station's fallbacks. The bot ranks them itself (direct streams first, HLS always last), plays the best, moves to the next if it fails and moves back once the best works again. A source is switched off only when it is refused (HTTP 401, 403 or 451), plays another station, is unsafe, or has failed for 7 days (two failed checks at least 7 days apart). One timeout, server error or "not found" no longer switches a source off.

On 3 November 2026 this pack had switched off sources that the new rule keeps, which left 61 of 63 stations with one enabled source. This change puts them back:

- **11 HLS sources enabled again without a new check.** On 3 November they were disabled as "adding nothing" over the station's direct stream. That test belongs to the playbook's "same stream in another format" section, which covers only addresses an author writes; these 11 are `official-player` addresses, each from its station's own `format=hls` link in the site's player data. All 11 played in [`evidence/probe-2026-11-03.json`](evidence/probe-2026-11-03.json) (AAC-LC, about 128 kbps). They are `fg-dj-radio-hls-gk9y379uquhvv` (FG DJ RADIO), `fg-chic-hls-tde3349uquhvv`, `maxximum-hls-5kvvqu6uquhvv`, `fg-at-work-hls-w0318rn5rxhvv`, `fg-chic-french-hls-d17gfqp5rxhvv`, `fg-chic-lounge-hls-cbse4cp5rxhvv`, `fg-chic-and-chill-hls-nr839fp5rxhvv`, `maxximum-90s-hls-q2x6eeq5rxhvv`, `fg-beatport-hls-q3we61n5rxhvv`, `fg-chic-berlin-hls-7pww0pn0742vv` and `fg-chic-london-hls-8ha6164v5znwv`.
- **The 10 HLS sources disabled after one timeout were checked again**, with the maintainer's permission, on 4 November 2026 ([`evidence/probe-2026-11-04.json`](evidence/probe-2026-11-04.json)). Only those 10 stations were checked: each station's direct stream and its HLS, 20 sources, one at a time, with `validate-catalogue --probe` on a copy of the pack in which the 10 were switched on. All 10 direct streams played (MP3, 192 kbps measured; 128 kbps for FG DANCE). **7 HLS sources played** (AAC-LC, about 128 kbps, starting in 42–448 ms) and are enabled again: `fg-dance-hls-kcgbx37uquhvv`, `fg-starter-fg-by-hakimakli-hls-esyc4bn5rxhvv`, `fg-deep-dance-hls-1rd290m5rxhvv`, `fg-chic-spa-hls-3f12dmp5rxhvv`, `fg-disco-funk-hls-vcxvzyn5rxhvv`, `fg-mix-house-hls-n54bm7n5rxhvv` and `fg-mix-afro-house-hls-ycm6h2p5rxhvv`. **3 timed out again** and stay disabled for now, with both dates in their reason: `fg-classics-hls-twxsptp5rxhvv`, `fg-training-hls-51sgywp5rxhvv` and `fg-belgium-hls-br6wu5p5rxhvv`. They are to be checked again on or after 10 November 2026. No audio comparison was run: like the 11 above, each is the address the station's own official link leads to, and the HLS streams announce no name.
- **Not checked again yet:** the 29 HLS sources that answered "not found" (`NOT_FOUND`) and the 7 that answered HTTP 400 on 3 November. They stay disabled until a check on or after 10 November 2026, at least 7 days after the first, shows whether they are gone. Any that play the right station then are enabled again.
- **Left as they were:** FG HÏ IBIZA's two sources (HTTP 401; parked by the maintainer's decision), `fg-dj-radio-hls-wknqhm4yuchvv` (dead, kept enabled on purpose), and the three addresses that were broken on the official site at discovery (see [Disabled sources](#disabled-sources)).
- `version` is `2026.11.04`. No address, station or id changed.

The newest report, [`evidence/probe-2026-11-04.json`](evidence/probe-2026-11-04.json), covers only those 10 stations. The full check of every enabled source is still the one of 3 November 2026.

## Review on 3 November 2026

The pack was checked against the library's updated playbook.

**Station list.** The official list on `https://www.radiofg.com/les-radios-fg` (the old `/webradios` address redirects there) still holds the same 63 stations, with the same names, stable ids and order. `pack.json`'s `sync.url` now points at the new address.

**Sources, the playbook's way.** In a browser, with the consent banner closed without agreeing ("Continue without agreeing"), the official player was started and its requests read. Every station is set to play its `hd` link; the player requests the signed play URL with a consent string and a tracking id (`CAID`), neither of which is recorded. Each station's three official links (`hd`, `sd`, `hls`) were then requested once from the page itself, one at a time, as the player's own browser, and the address each finally reached was read, without its per-connection token (`rj-tok`, `rj-ttl`) or tracking parameter (`trk_ir_c`). This replaces the original method below, which sent a browser User-Agent and `Referer` from a script.

- **Every direct address in the pack is the one the official player reaches today**, for all 63 stations and the main stream entry. No new address was found.
- **The site's HLS links are mostly dead.** For 36 stations they lead to an address that answers 404 or 400, and several more time out. The player never uses them (every station is set to `hd`), so the site's own listeners don't notice. The HLS sources were recorded at discovery from the redirect alone and were never requested then (see step 5 below), which is how dead ones got in. Some HLS addresses answered differently from one request to the next, so the host's HLS service looks unreliable as well as mostly broken.

**Live check.** The bot's own `validate-catalogue --probe`, on every enabled source, one at a time, with the maintainer's permission ([`evidence/probe-2026-11-03.json`](evidence/probe-2026-11-03.json)). 74 of 122 sources played:

- every enabled direct stream played. Most are **MP3 at 192 kbps** (measured), not the 128 kbps seen on 31 October; FG DJ RADIO, FG CHIC, MAXXIMUM and FG CHIC IBIZA are MP3 at 128 kbps, and FG CHIC BERLIN and FG CHIC LONDON are AAC-LC at 128 kbps;
- 48 HLS sources failed: 30 `NOT_FOUND`, 10 `HTTP_TIMEOUT`, 7 `HTTP_STATUS` (HTTP 400) and 1 `ACCESS_DENIED` (FG HÏ IBIZA);
- the 11 HLS sources that played were all AAC-LC at about 128 kbps, never more than the station's direct stream.

**What changed.**

- **47 failed HLS sources are disabled**, each with its result as the reason. The 48th, `fg-dj-radio-hls-wknqhm4yuchvv` (`NOT_FOUND`), **stays enabled on purpose**: the maintainer is watching how the bot handles a stream that is dead and may stay dead or come back. `validate-catalogue --strict` warns about it; that is expected.
- **11 HLS sources that play were disabled because they add nothing** (enabled again on 4 November 2026: see [Change on 4 November 2026](#change-on-4-november-2026-keep-working-sources)): each carries AAC at about 128 kbps, the same as or less than the station's direct stream, and the official player doesn't use them. The reason gives both measured rates. They were each station's last-resort fallback; those stations now rely on their direct stream alone.
- **FG HÏ IBIZA has no enabled source.** Its direct stream and its HLS both answer HTTP 401 to the bot, as on 31 October. The station stays listed.
- **The flagship's direct AAC source is kept** under the playbook's "same stream in another format" rule: see [The flagship: FG DJ RADIO](#the-flagship-fg-dj-radio).
- `snapshotDate` and every station's `catalogueLastSeen` are 3 November 2026; `version` is `2026.11.03.2`.

## Station list

- **Where.** The station names and the site's stable 10-character stream IDs (`externalId` in `stations.json`) are taken from `apidata.webradios[].label` and `apidata.webradios[].id`.
- **What else was checked.** The same data block appears on every page of the site. The fallback navigation list (`nav.HeaderSources … button.dropdown-item`) carried the same 63 names in the same order.
- **What was added by hand.** Each station's slug, aliases, category and tags were written for this project. They are not official data.
- **Official pages.** `officialPage` is set only for the stations that have a dedicated official page. The flagship's page, `/radiofg`, is the brand home page.
- **Ongoing sync.** The bot's automated sync (`CATALOG_SYNC_ENABLED`, daily by default) **only reconciles names and stable IDs** from the same `var apidata` → `webradios` data on `https://www.radiofg.com/les-radios-fg`. It **never harvests stream URLs**, and it ignores the short-lived signed play URLs on the page. A new station that appears in a sync is added with no source and flagged "needs a reviewed source mapping".

## Source discovery method (31 October 2026)

This is the original method, kept for the record. The [review on 3 November 2026](#review-on-3-november-2026) checked every address again by following the official player's links in a browser instead.

1. **Fetch the play URLs.** The page was fetched, and for each `apidata.webradios` entry, plus the main FM stream `apidata.radiostreams[0]`, the official **signed play URLs** were read: `.hd`, `.bd`/`sd` and `.hls`. These have the form `https://streams.lesindesradios.fr/play/radios/radiofg/<officialId>/any/300/<signature>?format=hd|sd|hls`. The signature changes on every page load and expires.
2. **Read the redirect.** Each signed URL was requested **once**, at about one request per second, with `GET`, `Range: bytes=0-0`, a browser User-Agent and the site as `Referer`, and **without following the redirect**. The play endpoint answered `302` with a `Location` on `stream.rcs.revma.com`.
3. **Record the target.** The unsigned redirect target was recorded as the candidate source. A tracking parameter (`?trk_ir_c=0`) on some redirects was stripped.
4. **Check content types.** One short `GET` per distinct direct or non-standard target recorded the HTTP status and `Content-Type`. That was 66 checks: 61 returned `200 audio/mpeg`, 2 returned `200 audio/aac` (FG CHIC BERLIN and FG CHIC LONDON), 2 returned `404` and 1 returned `401`.
5. **Not stored.** Standard-form HLS targets (`<mount>/hls.m3u8`) were **not individually requested**. Spot checks of `/hls.m3u8` on other mounts returned `200 application/vnd.apple.mpegurl`.

**What was never stored:**

- the signed play URLs and their signatures;
- tracking parameters;
- the per-connection load-balancer token (`rj-tok`) that `stream.rcs.revma.com` adds when it redirects to a node host;
- any audio.

No authentication, DRM, geo-restriction or private API was bypassed. Only the public web player data that any browser receives was used.

### What was **not** verified at discovery

- **No `ffprobe` analysis.** No codec, bitrate, sample rate or channel measurement. The `codecHint` values (`mp3`, `aac`) come from the content type or the play format only.
- **No identity check.** Nobody listened, and no audio comparison was run to confirm that each mount carries the programme it is mapped to. The mapping is exactly what the official player does.
- **No HLS playlist parsing,** so no check of renditions or segments.
- **No check from other locations or networks.** Some mounts may be restricted by location; see the 401 below.
- **No rights or terms review.** See [docs/rights-and-disclaimer.md](https://github.com/DangerMouseUK/radiobot/blob/main/docs/rights-and-disclaimer.md).

The bot treats an `official-player` or `curated` mapping as identity provenance. After a successful technical probe, it marks such a source _verified_ with _medium_ confidence. That is weaker than an independent listening or correlation check, and the docs say so. See [docs/station-verification.md](https://github.com/DangerMouseUK/radiobot/blob/main/docs/station-verification.md#identity-rules).

## The flagship: FG DJ RADIO

The official site has **two** entries that lead to the flagship programme:

- the webradio **FG DJ RADIO** (`z0fDRzUSa2`), which redirects to the MP3 mount `wknqhm4yuchvv` and to `wknqhm4yuchvv/hls.m3u8`;
- the main FM radiostream **RADIO FG** (`5gWkrl9VKE`, type `RADIO`, shown in the site header as "Live : FG DJ RADIO"), which redirects to the same MP3 mount `wknqhm4yuchvv` and to `gk9y379uquhvv/hls.m3u8`.

The pack therefore has four flagship sources:

| Source ID                       | URL                                                   | Provenance                                                                                                                                                                                                                                                                                            |
| ------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fg-dj-radio-mp3-wknqhm4yuchvv` | `https://stream.rcs.revma.com/wknqhm4yuchvv`          | `official-player`. Webradio `z0fDRzUSa2`, `hd`/`sd`. `200 audio/mpeg`. Enabled; MP3 128 kbps measured on 3 November 2026                                                                                                                                                                              |
| `fg-dj-radio-hls-wknqhm4yuchvv` | `https://stream.rcs.revma.com/wknqhm4yuchvv/hls.m3u8` | `official-player`. Webradio `z0fDRzUSa2`, `hls`. **Dead (`NOT_FOUND`) on 31 October and 3 November 2026, and kept enabled on purpose** (see the review above)                                                                                                                                        |
| `fg-dj-radio-hls-gk9y379uquhvv` | `https://stream.rcs.revma.com/gk9y379uquhvv/hls.m3u8` | `official-player`. **Radiostream `5gWkrl9VKE`** ("RADIO FG"), `hls`. Plays (AAC-LC 128 kbps on 3 November 2026). Disabled on 3 November 2026 as adding nothing, **enabled again on 4 November 2026** as the flagship's last-resort fallback                                                                                                                            |
| `fg-dj-radio-aac-gk9y379uquhvv` | `https://stream.rcs.revma.com/gk9y379uquhvv`          | **`curated`**, under the playbook's **"same stream in another format"** rule: the direct form of the official HLS address above. Enabled. Details below                                                                                                                                             |

**The direct AAC source.** No official link leads to `https://stream.rcs.revma.com/gk9y379uquhvv`; the official player gives only its HLS form, `gk9y379uquhvv/hls.m3u8`, for the main stream entry. It was first seen in a separate investigation on 30 October 2026 (PRD §3.2). On 3 November 2026 it meets every condition of the playbook rule: the same host and stream name as the official address with only the format part dropped; it plays for the bot with nothing added (AAC-LC, 128 kbps measured, 44.1 kHz stereo); an audio comparison against the official MP3 scored **0.809** with prominence 14.8, which supports identity (the official HLS scored 0.508 against the same MP3) ([`evidence/compare-2026-11-03.json`](evidence/compare-2026-11-03.json)); and it adds something, a second direct stream for the flagship, so the bot can fall back to it before any HLS. It is not a higher-quality feed: it carries the same 128 kbps as the MP3. If the official HLS address stops working or changes, check this one again: nothing official points at it.

No distinct 192, 256 or 320 kbps or lossless flagship feed has been found. No "HD" claim is made.

## Disabled sources

44 sources are disabled. The bot never plays or checks them, and they are kept so that a later review can check them again and enable them again; each one's `disabledReason` says why.

- **40 HLS sources that failed the live check on 3 November 2026**: 29 `NOT_FOUND`, 7 HTTP 400 (`HTTP_STATUS`), 3 `HTTP_TIMEOUT` that timed out again on 4 November 2026, and FG HÏ IBIZA's HLS (HTTP 401). See the [review](#review-on-3-november-2026) and the [change on 4 November 2026](#change-on-4-november-2026-keep-working-sources). Under the playbook's rule, all but FG HÏ IBIZA's are to be checked again on or after 10 November 2026.
- **The 4 below, disabled at discovery on 31 October 2026**, with `disabledReason: "Broken on the official site at discovery time (see provenance)."`. The review found the same: FG BUDDHA BAR's and FG MIX MELODIC's malformed HLS addresses still answer 404, FG DISCO HOUSE's still leads to its plain MP3, and FG HÏ IBIZA still answers 401.

| Source ID                             | Station        | Official entry                     | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------- | -------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fg-buddha-bar-hls-kb8037g1t7uvv`     | FG BUDDHA BAR  | `gt0NmhAXye`, `format=hls`         | The redirect target `…/kb8037g1t7uvv.hls.m3u8` is malformed (`.hls.m3u8` instead of `/hls.m3u8`), and a short GET returned **HTTP 404**. The site's own HLS mapping appears broken for this station. The direct MP3 `zn73zqg1t7uvv` remains.                                                                                                                                                                                                                                                             |
| `fg-mix-melodic-hls-h0n0zbh1t7uvv`    | FG MIX MELODIC | `zXBoAmpxqQ`, `format=hls`         | Malformed target `…/h0n0zbh1t7uvv.hls.m3u8`, and a short GET returned **HTTP 404**. The direct MP3 `h0n0zbh1t7uvv` remains.                                                                                                                                                                                                                                                                                                                                                                              |
| `fg-disco-house-direct-ffn7zkskca3vv` | FG DISCO HOUSE | `jpZz0OFZPd`, `format=hls`         | The target `…/ffn7zkskca3vv.m3u8` has a non-standard suffix and returned `200 audio/mpeg`. It behaves like the plain MP3 mount, not like HLS, so it would be a **duplicate** of `fg-disco-house-mp3-ffn7zkskca3vv` with a misleading label.                                                                                                                                                                                                                                                              |
| `fg-hi-ibiza-direct-2ykcf6e1e2uvv`    | FG HÏ IBIZA    | `lzFQAVWWZQ`, `format=hd` and `sd` | The direct mount `2ykcf6e1e2uvv` answered **HTTP 401** at discovery, when it was checked with a browser User-Agent. It still answered **HTTP 401** when re-tested with the bot's FFmpeg User-Agent on 31 October 2026 (see [Release probe runs](#release-probe-runs-31-october-2026)). It may be geo- or rights-restricted, and the bot will not try to get around that. Its HLS source `2ykcf6e1e2uvv/hls.m3u8` answered **HTTP 401** too on 3 November 2026 and is now disabled, so the station has no enabled source. |

## Stations with a single source

Since 4 November 2026, 17 stations have two enabled sources (a direct stream and its HLS fallback), FG DJ RADIO has four, FG HÏ IBIZA has none, and **44 stations have one enabled source**, their direct stream. Whether the official site offers any other stream for them:

- **FG NOMADE and FG PULSE:** no. Their official `format=hls` link leads to the same plain MP3 mount, so the site offers only one stream.
- **FG DISCO HOUSE:** no other working stream. Its `format=hls` link leads to `…/ffn7zkskca3vv.m3u8`, which behaves as the same MP3 mount (`fg-disco-house-direct-ffn7zkskca3vv`, disabled).
- **FG BUDDHA BAR and FG MIX MELODIC:** the site links an HLS address, but it is malformed and answers 404 (disabled since discovery).
- **FG CLASSICS, FG TRAINING and FG BELGIUM:** the site links an HLS address; it timed out on 3 and 4 November 2026. To be checked again on or after 10 November 2026.
- **36 more stations:** the site links an HLS address that failed on 3 November 2026, to be checked again on or after 10 November 2026.
  - `NOT_FOUND` (29): FG AMSTERDAM DANCE EVENT, FG REMIX, FG HITS, FG DAVID GUETTA, FG BOB SINCLAR, FG YOGA, FG CHIC by Renault, FG CHIC VINTAGE, FG NEW WAVE, FG MADONNA, FG APERO, FG FRENCH TOUCH, FG DEEP HOUSE, FG ON THE ROAD, FG RELAX, FG DEFECTED, FG PURPLE DISCO MACHINE, FG USHUAÏA IBIZA, FG UNVRS, FG MARTIN GARRIX, FG CLUBBING, FG FUCKING GOOD MUSIC, FG MIX TECHNO, FG MIX TRANCE, FG MIX FESTIVAL, FG MIX CLUB, FG PHONK & GAMING, FG DANCE TOP40 and FG FEEL GOOD.
  - HTTP 400 (7): FG CHIC MIX, FG CHIC SOUL, FG POP LEGENDS, FG RnB LEGENDS, FG DANCEFLOOR, FG TECHNO and FG CHIC IBIZA.

Every source is on `stream.rcs.revma.com`, so an HLS fallback covers one mount failing, not the whole host going down.

## Release probe runs (31 October 2026)

This was a sample of 3 stations, kept for the record. The full live check of 3 November 2026 is summarised in the [review](#review-on-3-november-2026).

The release check is the bot's own probe, `validate-catalogue --probe` (plus `--compare`), run from the development environment against FG DJ RADIO, FG CHIC and FG DANCE. The latest output is in [`evidence/probe-2026-10-31.json`](evidence/probe-2026-10-31.json).

**Results (latest run).** 7 of the 8 sources played, all 44.1 kHz stereo:

| Source                                                      | Result                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `fg-dj-radio-mp3-wknqhm4yuchvv`                             | Direct MP3, 128 kbps measured                              |
| `fg-dj-radio-aac-gk9y379uquhvv` (curated)                   | Direct AAC-LC, ≈128 kbps measured                          |
| `fg-dj-radio-hls-gk9y379uquhvv`                             | HLS AAC-LC, ≈128 kbps measured                             |
| `fg-dj-radio-hls-wknqhm4yuchvv`                             | **Failed**: redirects, then never answers (`HTTP_TIMEOUT`) |
| `fg-chic-mp3-cgvrymb6p98uv` / `fg-chic-hls-tde3349uquhvv`   | Direct MP3 128 kbps / HLS AAC-LC 128 kbps                  |
| `fg-dance-mp3-zfad8vm4srhvv` / `fg-dance-hls-kcgbx37uquhvv` | Direct MP3 128 kbps / HLS AAC-LC 128 kbps                  |

The HLS master playlists on this host declare `BANDWIDTH=44100`, which is a sample rate, not a bitrate. The bot ignores such values (`plausibleBandwidth()`), and the measured figures above come from the audio itself.

**Audio comparisons.** On live radio, 40 s samples were compared over ±30 s of lag. A match needs a score of 0.3 or more and a prominence of 5 or more.

- FG DJ RADIO: MP3 against HLS scored **0.58**, and MP3 against AAC scored **0.61**. Both support identity.
- FG DANCE: MP3 against HLS scored **0.90**, which supports identity.
- FG CHIC: MP3 against HLS was **inconclusive** in the latest run (0.08), having matched at 0.61 and 0.49 in earlier runs.

During calibration, different stations scored 0.08–0.14.

**No higher-bitrate feed was found.** Every working source carries about 128 kbps. The direct MP3 and AAC are not ranked against each other by bitrate, and HLS is kept as a last-resort fallback.

**Earlier runs that day (14:48 and 14:52 UTC) were refused with HTTP 401** for all 8 sources. The cause has been established: `stream.rcs.revma.com` refuses clients it doesn't recognise, but serves standard media players. Tested without a `Referer`:

- Radio Bot's old User-Agent (`RadioBot/1.0 …`) got **401**;
- FFmpeg's `Lavf/61.7.100` got **200 `audio/mpeg`**;
- VLC got **200**.

Radio Bot now identifies to stream hosts as FFmpeg's network library, the `Lavf/<version>` of the installed FFmpeg. That is accurate, because FFmpeg is the software that decodes the audio. `STREAM_USER_AGENT` can override it. The bot does **not** imitate a web browser, sends no `Referer`, and never uses the signed play URLs.

**What this meant on 31 October** (superseded by the [review on 3 November 2026](#review-on-3-november-2026)):

- 3 of 63 stations were confirmed usable; the other 60 were not probed until 3 November.
- FG HÏ IBIZA's direct mount answered **HTTP 401** to the FFmpeg User-Agent too, so it stayed disabled as access-restricted.
- One live Discord call so far (1 November 2026): FG DJ RADIO played on a private test server from the direct MP3 source at 128 kbps, with one Opus encode at 128 kbps and DAVE negotiated. No 72-hour soak test has been done.

## Changing this pack

Every source mapping needs:

- **provenance:** how it maps to the station, and on what date;
- **evidence:** what was checked, and the result;
- a reviewer, as required for every audio or source change.

See [CONTRIBUTING.md](https://github.com/DangerMouseUK/radiobot/blob/main/CONTRIBUTING.md#catalogue-changes) and this library's [playbook](../../playbook/PLAYBOOK.md). Never commit signed or tokenised URLs. Follow the playbook's steps 7 to 9: `generate --base origin/main`, `validate-catalogue --strict`, and a live check of the stations you touched (with a person's permission), then `node scripts/ci-check.mjs --bot ../radiobot --base origin/main`, before opening a pull request. The pack format is described in [catalog/README.md](https://github.com/DangerMouseUK/radiobot/blob/main/catalog/README.md).

If a broadcaster or rights holder asks for a station or source to be removed, follow the takedown procedure in [TAKEDOWN.md](../../TAKEDOWN.md).

## Full mapping

Kinds are hints, not measurements. "Curated" and "disabled" are flagged. The `#` column is the site order.

| #   | Station                    | Station ID                      | Official ID  | Sources (ID — kind)                                                                                                                                                                                   |
| --- | -------------------------- | ------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | FG DJ RADIO                | `fg:fg-dj-radio`                | `z0fDRzUSa2` | `fg-dj-radio-mp3-wknqhm4yuchvv` — direct MP3<br>`fg-dj-radio-hls-wknqhm4yuchvv` — HLS<br>`fg-dj-radio-hls-gk9y379uquhvv` — HLS<br>`fg-dj-radio-aac-gk9y379uquhvv` — direct AAC, curated |
| 2   | FG CHIC                    | `fg:fg-chic`                    | `RW32opoTnZ` | `fg-chic-mp3-cgvrymb6p98uv` — direct MP3<br>`fg-chic-hls-tde3349uquhvv` — HLS                                                                                                           |
| 3   | FG DANCE                   | `fg:fg-dance`                   | `7aU8RbLARV` | `fg-dance-mp3-zfad8vm4srhvv` — direct MP3<br>`fg-dance-hls-kcgbx37uquhvv` — HLS                                                                                                         |
| 4   | MAXXIMUM                   | `fg:maxximum`                   | `UQDF1VGpkJ` | `maxximum-mp3-nwhyn2c6p98uv` — direct MP3<br>`maxximum-hls-5kvvqu6uquhvv` — HLS                                                                                                         |
| 5   | FG STARTER FG BY HAKIMAKLI | `fg:fg-starter-fg-by-hakimakli` | `sd1AI1njys` | `fg-starter-fg-by-hakimakli-mp3-vww68g69n98uv` — direct MP3<br>`fg-starter-fg-by-hakimakli-hls-esyc4bn5rxhvv` — HLS                                                                     |
| 6   | FG AMSTERDAM DANCE EVENT   | `fg:fg-amsterdam-dance-event`   | `y01diAOJ4b` | `fg-amsterdam-dance-event-mp3-asxs2vgk5rcwv` — direct MP3<br>`fg-amsterdam-dance-event-hls-asxs2vgk5rcwv` — HLS, **disabled**                                                                         |
| 7   | FG DEEP DANCE              | `fg:fg-deep-dance`              | `HJCBHp5Pv4` | `fg-deep-dance-mp3-tmbhq479n98uv` — direct MP3<br>`fg-deep-dance-hls-1rd290m5rxhvv` — HLS                                                                                               |
| 8   | FG REMIX                   | `fg:fg-remix`                   | `tKes8II5ya` | `fg-remix-mp3-w1psqtmd342vv` — direct MP3<br>`fg-remix-hls-w1psqtmd342vv` — HLS, **disabled**                                                                                                         |
| 9   | FG AT WORK                 | `fg:fg-at-work`                 | `TY7ilzEFzJ` | `fg-at-work-mp3-2v1zz979n98uv` — direct MP3<br>`fg-at-work-hls-w0318rn5rxhvv` — HLS                                                                                                     |
| 10  | FG HITS                    | `fg:fg-hits`                    | `qnR0myCe2C` | `fg-hits-mp3-mxfbr0dusd3vv` — direct MP3<br>`fg-hits-hls-mxfbr0dusd3vv` — HLS, **disabled**                                                                                                           |
| 11  | FG DAVID GUETTA            | `fg:fg-david-guetta`            | `ooIRv0rSPL` | `fg-david-guetta-mp3-88h6r9dusd3vv` — direct MP3<br>`fg-david-guetta-hls-88h6r9dusd3vv` — HLS, **disabled**                                                                                           |
| 12  | FG BOB SINCLAR             | `fg:fg-bob-sinclar`             | `2WcSlGokTg` | `fg-bob-sinclar-mp3-wphm12m4403vv` — direct MP3<br>`fg-bob-sinclar-hls-wphm12m4403vv` — HLS, **disabled**                                                                                             |
| 13  | FG CHIC FRENCH             | `fg:fg-chic-french`             | `dIkofhW0zB` | `fg-chic-french-mp3-3x5uxtcxgkhvv` — direct MP3<br>`fg-chic-french-hls-d17gfqp5rxhvv` — HLS                                                                                             |
| 14  | FG CHIC LOUNGE             | `fg:fg-chic-lounge`             | `yjz51VQf2J` | `fg-chic-lounge-mp3-1grpmk88n98uv` — direct MP3<br>`fg-chic-lounge-hls-cbse4cp5rxhvv` — HLS                                                                                             |
| 15  | FG CHIC MIX                | `fg:fg-chic-mix`                | `aBFIRkF5VY` | `fg-chic-mix-mp3-9sw5gp3w7guvv` — direct MP3<br>`fg-chic-mix-hls-9sw5gp3w7guvv` — HLS, **disabled**                                                                                                   |
| 16  | FG CHIC SOUL               | `fg:fg-chic-soul`               | `6MGIxfbO3H` | `fg-chic-soul-mp3-y4r1v13w7guvv` — direct MP3<br>`fg-chic-soul-hls-y4r1v13w7guvv` — HLS, **disabled**                                                                                                 |
| 17  | FG CHIC & CHILL            | `fg:fg-chic-and-chill`          | `QaKQL1fU1X` | `fg-chic-and-chill-mp3-d9ucg01d0chvv` — direct MP3<br>`fg-chic-and-chill-hls-nr839fp5rxhvv` — HLS                                                                                       |
| 18  | FG CHIC SPA                | `fg:fg-chic-spa`                | `8BgfEjVadz` | `fg-chic-spa-mp3-ffynknv9n98uv` — direct MP3<br>`fg-chic-spa-hls-3f12dmp5rxhvv` — HLS                                                                                                   |
| 19  | FG YOGA                    | `fg:fg-yoga`                    | `OHtteIMT8D` | `fg-yoga-mp3-xryf0bck5rcwv` — direct MP3<br>`fg-yoga-hls-xryf0bck5rcwv` — HLS, **disabled**                                                                                                           |
| 20  | FG CHIC by Renault         | `fg:fg-chic-by-renault`         | `yd6CI7j7Ie` | `fg-chic-by-renault-mp3-kg2bvya6wzuvv` — direct MP3<br>`fg-chic-by-renault-hls-kg2bvya6wzuvv` — HLS, **disabled**                                                                                     |
| 21  | FG CHIC VINTAGE            | `fg:fg-chic-vintage`            | `cTM5zhVaI3` | `fg-chic-vintage-mp3-csfyhrgr60bwv` — direct MP3<br>`fg-chic-vintage-hls-csfyhrgr60bwv` — HLS, **disabled**                                                                                           |
| 22  | FG DISCO FUNK              | `fg:fg-disco-funk`              | `YO0c3jE07e` | `fg-disco-funk-mp3-cpkhx08pq18uv` — direct MP3<br>`fg-disco-funk-hls-vcxvzyn5rxhvv` — HLS                                                                                               |
| 23  | FG CLASSICS                | `fg:fg-classics`                | `W1dGE6vop9` | `fg-classics-mp3-37n8gxv9n98uv` — direct MP3<br>`fg-classics-hls-twxsptp5rxhvv` — HLS, **disabled**                                                                                                   |
| 24  | MAXXIMUM 90's              | `fg:maxximum-90s`               | `UEoZIbjJdj` | `maxximum-90s-mp3-maygqbdap98uv` — direct MP3<br>`maxximum-90s-hls-q2x6eeq5rxhvv` — HLS                                                                                                 |
| 25  | FG NEW WAVE                | `fg:fg-new-wave`                | `A5xqPuMNdI` | `fg-new-wave-mp3-4vpbw1ad633vv` — direct MP3<br>`fg-new-wave-hls-4vpbw1ad633vv` — HLS, **disabled**                                                                                                   |
| 26  | FG MADONNA                 | `fg:fg-madonna`                 | `fRVSCSKM7V` | `fg-madonna-mp3-aq4u4dhk5rcwv` — direct MP3<br>`fg-madonna-hls-aq4u4dhk5rcwv` — HLS, **disabled**                                                                                                     |
| 27  | FG POP LEGENDS             | `fg:fg-pop-legends`             | `HJBe7ed8bh` | `fg-pop-legends-mp3-hdzyzvtbxd3vv` — direct MP3<br>`fg-pop-legends-hls-hdzyzvtbxd3vv` — HLS, **disabled**                                                                                             |
| 28  | FG RnB LEGENDS             | `fg:fg-rnb-legends`             | `ZG6p106Dcx` | `fg-rnb-legends-mp3-kau7e6tbxd3vv` — direct MP3<br>`fg-rnb-legends-hls-kau7e6tbxd3vv` — HLS, **disabled**                                                                                             |
| 29  | FG DANCEFLOOR              | `fg:fg-dancefloor`              | `qdCybOfBTL` | `fg-dancefloor-mp3-kv9m762w7guvv` — direct MP3<br>`fg-dancefloor-hls-kv9m762w7guvv` — HLS, **disabled**                                                                                               |
| 30  | FG MIX HOUSE               | `fg:fg-mix-house`               | `kVyKhEEe1d` | `fg-mix-house-mp3-5kucq079n98uv` — direct MP3<br>`fg-mix-house-hls-n54bm7n5rxhvv` — HLS                                                                                                 |
| 31  | FG MIX AFRO HOUSE          | `fg:fg-mix-afro-house`          | `Z32AlGsNvJ` | `fg-mix-afro-house-mp3-uv0x66bap98uv` — direct MP3<br>`fg-mix-afro-house-hls-ycm6h2p5rxhvv` — HLS                                                                                       |
| 32  | FG BUDDHA BAR              | `fg:fg-buddha-bar`              | `gt0NmhAXye` | `fg-buddha-bar-mp3-zn73zqg1t7uvv` — direct MP3<br>`fg-buddha-bar-hls-kb8037g1t7uvv` — HLS, **disabled**                                                                                               |
| 33  | FG NOMADE                  | `fg:fg-nomade`                  | `qggukqs0Pv` | `fg-nomade-mp3-yukrx3dusd3vv` — direct MP3                                                                                                                                                            |
| 34  | FG APERO                   | `fg:fg-apero`                   | `xDfwbc0TJN` | `fg-apero-mp3-3xvpxq50e2uvv` — direct MP3<br>`fg-apero-hls-3xvpxq50e2uvv` — HLS, **disabled**                                                                                                         |
| 35  | FG FRENCH TOUCH            | `fg:fg-french-touch`            | `XlmY3Z31aB` | `fg-french-touch-mp3-06y7t4gk5rcwv` — direct MP3<br>`fg-french-touch-hls-06y7t4gk5rcwv` — HLS, **disabled**                                                                                           |
| 36  | FG DISCO HOUSE             | `fg:fg-disco-house`             | `jpZz0OFZPd` | `fg-disco-house-mp3-ffn7zkskca3vv` — direct MP3<br>`fg-disco-house-direct-ffn7zkskca3vv` — direct, **disabled**                                                                                       |
| 37  | FG DEEP HOUSE              | `fg:fg-deep-house`              | `7Hs1eCV4GG` | `fg-deep-house-mp3-02s8zcv9898uv` — direct MP3<br>`fg-deep-house-hls-02s8zcv9898uv` — HLS, **disabled**                                                                                               |
| 38  | FG TRAINING                | `fg:fg-training`                | `mSfORCFRRb` | `fg-training-mp3-8daakscap98uv` — direct MP3<br>`fg-training-hls-51sgywp5rxhvv` — HLS, **disabled**                                                                                                   |
| 39  | FG ON THE ROAD             | `fg:fg-on-the-road`             | `ylItEVhAqm` | `fg-on-the-road-mp3-yg315gmd633vv` — direct MP3<br>`fg-on-the-road-hls-yg315gmd633vv` — HLS, **disabled**                                                                                             |
| 40  | FG RELAX                   | `fg:fg-relax`                   | `HUulTEP3Dg` | `fg-relax-mp3-ptaswwyza43vv` — direct MP3<br>`fg-relax-hls-ptaswwyza43vv` — HLS, **disabled**                                                                                                         |
| 41  | FG DEFECTED                | `fg:fg-defected`                | `6io6o5ta7u` | `fg-defected-mp3-423ppf862quvv` — direct MP3<br>`fg-defected-hls-423ppf862quvv` — HLS, **disabled**                                                                                                   |
| 42  | FG PURPLE DISCO MACHINE    | `fg:fg-purple-disco-machine`    | `RI9Tq3uSPp` | `fg-purple-disco-machine-mp3-xfnmkhw5b1bwv` — direct MP3<br>`fg-purple-disco-machine-hls-xfnmkhw5b1bwv` — HLS, **disabled**                                                                           |
| 43  | FG USHUAÏA IBIZA           | `fg:fg-ushuaia-ibiza`           | `c6tymuRseC` | `fg-ushuaia-ibiza-mp3-fbmngsck5rcwv` — direct MP3<br>`fg-ushuaia-ibiza-hls-fbmngsck5rcwv` — HLS, **disabled**                                                                                         |
| 44  | FG HÏ IBIZA                | `fg:fg-hi-ibiza`                | `lzFQAVWWZQ` | `fg-hi-ibiza-direct-2ykcf6e1e2uvv` — direct, **disabled**<br>`fg-hi-ibiza-hls-2ykcf6e1e2uvv` — HLS, **disabled**                                                                                      |
| 45  | FG UNVRS                   | `fg:fg-unvrs`                   | `U2YejHWMvs` | `fg-unvrs-mp3-5z13wp6wsccwv` — direct MP3<br>`fg-unvrs-hls-5z13wp6wsccwv` — HLS, **disabled**                                                                                                         |
| 46  | FG MARTIN GARRIX           | `fg:fg-martin-garrix`           | `ZiQL5azoDm` | `fg-martin-garrix-mp3-6zg5tahk5rcwv` — direct MP3<br>`fg-martin-garrix-hls-6zg5tahk5rcwv` — HLS, **disabled**                                                                                         |
| 47  | FG CLUBBING                | `fg:fg-clubbing`                | `OH86mQAECS` | `fg-clubbing-mp3-007e1v9f772vv` — direct MP3<br>`fg-clubbing-hls-007e1v9f772vv` — HLS, **disabled**                                                                                                   |
| 48  | FG PULSE                   | `fg:fg-pulse`                   | `wCQirN0q1q` | `fg-pulse-mp3-rzqck8ad633vv` — direct MP3                                                                                                                                                             |
| 49  | FG FUCKING GOOD MUSIC      | `fg:fg-fucking-good-music`      | `DfLr0ztMUw` | `fg-fucking-good-music-mp3-dvpevwak5rcwv` — direct MP3<br>`fg-fucking-good-music-hls-dvpevwak5rcwv` — HLS, **disabled**                                                                               |
| 50  | FG TECHNO                  | `fg:fg-techno`                  | `oJOKSeh3H1` | `fg-techno-mp3-1z19ak79n98uv` — direct MP3<br>`fg-techno-hls-1z19ak79n98uv` — HLS, **disabled**                                                                                                       |
| 51  | FG MIX TECHNO              | `fg:fg-mix-techno`              | `MZz9wlEBeV` | `fg-mix-techno-mp3-vat1rx60e2uvv` — direct MP3<br>`fg-mix-techno-hls-vat1rx60e2uvv` — HLS, **disabled**                                                                                               |
| 52  | FG MIX TRANCE              | `fg:fg-mix-trance`              | `eBkgtgkcQS` | `fg-mix-trance-mp3-v025nezpey3vv` — direct MP3<br>`fg-mix-trance-hls-v025nezpey3vv` — HLS, **disabled**                                                                                               |
| 53  | FG MIX FESTIVAL            | `fg:fg-mix-festival`            | `mSUEeSlUqN` | `fg-mix-festival-mp3-ky42f360e2uvv` — direct MP3<br>`fg-mix-festival-hls-ky42f360e2uvv` — HLS, **disabled**                                                                                           |
| 54  | FG MIX MELODIC             | `fg:fg-mix-melodic`             | `zXBoAmpxqQ` | `fg-mix-melodic-mp3-h0n0zbh1t7uvv` — direct MP3<br>`fg-mix-melodic-hls-h0n0zbh1t7uvv` — HLS, **disabled**                                                                                             |
| 55  | FG MIX CLUB                | `fg:fg-mix-club`                | `nO37ZEca3Y` | `fg-mix-club-mp3-e88ff5a1e2uvv` — direct MP3<br>`fg-mix-club-hls-e88ff5a1e2uvv` — HLS, **disabled**                                                                                                   |
| 56  | FG PHONK & GAMING          | `fg:fg-phonk-and-gaming`        | `IF9ISZYJpJ` | `fg-phonk-and-gaming-mp3-vzx3q9762quvv` — direct MP3<br>`fg-phonk-and-gaming-hls-vzx3q9762quvv` — HLS, **disabled**                                                                                   |
| 57  | FG BEATPORT                | `fg:fg-beatport`                | `Nn26ftlm1e` | `fg-beatport-mp3-vb3b5749n98uv` — direct MP3<br>`fg-beatport-hls-q3we61n5rxhvv` — HLS                                                                                                   |
| 58  | FG BELGIUM                 | `fg:fg-belgium`                 | `mWtSvNivqQ` | `fg-belgium-mp3-5wesqhfap98uv` — direct MP3<br>`fg-belgium-hls-br6wu5p5rxhvv` — HLS, **disabled**                                                                                                     |
| 59  | FG CHIC BERLIN             | `fg:fg-chic-berlin`             | `DxsBAhrtub` | `fg-chic-berlin-aac-7pww0pn0742vv` — direct AAC<br>`fg-chic-berlin-hls-7pww0pn0742vv` — HLS                                                                                             |
| 60  | FG CHIC LONDON             | `fg:fg-chic-london`             | `b1SVanSa5f` | `fg-chic-london-aac-8ha6164v5znwv` — direct AAC<br>`fg-chic-london-hls-8ha6164v5znwv` — HLS                                                                                             |
| 61  | FG CHIC IBIZA              | `fg:fg-chic-ibiza`              | `WDaxl2Pwxj` | `fg-chic-ibiza-mp3-z8v9hmhp0f3vv` — direct MP3<br>`fg-chic-ibiza-hls-z8v9hmhp0f3vv` — HLS, **disabled**                                                                                               |
| 62  | FG DANCE TOP40             | `fg:fg-dance-top40`             | `sz4bG6I6TH` | `fg-dance-top40-mp3-x1csugb6wzuvv` — direct MP3<br>`fg-dance-top40-hls-x1csugb6wzuvv` — HLS, **disabled**                                                                                             |
| 63  | FG FEEL GOOD               | `fg:fg-feel-good`               | `OK0BUk2esV` | `fg-feel-good-mp3-yamg15ak5rcwv` — direct MP3<br>`fg-feel-good-hls-yamg15ak5rcwv` — HLS, **disabled**                                                                                                 |

## Sources

Every source ID in `sources.json`, where its address was found and when. Disabled sources are listed too; see [Disabled sources](#disabled-sources).

<!-- sources:start -->
| Source ID                                      | Station                    | Found at                                                                         | Date       | Provenance      |
| ---------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- | ---------- | --------------- |
| `fg-dj-radio-mp3-wknqhm4yuchvv`                | FG DJ RADIO                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dj-radio-hls-wknqhm4yuchvv`                | FG DJ RADIO                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dj-radio-hls-gk9y379uquhvv`                | FG DJ RADIO                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dj-radio-aac-gk9y379uquhvv`                | FG DJ RADIO                | Separate investigation; same mount as the official FM entry `5gWkrl9VKE` HLS URL | 2026-10-30 | curated         |
| `fg-chic-mp3-cgvrymb6p98uv`                    | FG CHIC                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-hls-tde3349uquhvv`                    | FG CHIC                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dance-mp3-zfad8vm4srhvv`                   | FG DANCE                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dance-hls-kcgbx37uquhvv`                   | FG DANCE                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `maxximum-mp3-nwhyn2c6p98uv`                   | MAXXIMUM                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `maxximum-hls-5kvvqu6uquhvv`                   | MAXXIMUM                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-starter-fg-by-hakimakli-mp3-vww68g69n98uv` | FG STARTER FG BY HAKIMAKLI | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-starter-fg-by-hakimakli-hls-esyc4bn5rxhvv` | FG STARTER FG BY HAKIMAKLI | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-amsterdam-dance-event-mp3-asxs2vgk5rcwv`   | FG AMSTERDAM DANCE EVENT   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-amsterdam-dance-event-hls-asxs2vgk5rcwv`   | FG AMSTERDAM DANCE EVENT   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-deep-dance-mp3-tmbhq479n98uv`              | FG DEEP DANCE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-deep-dance-hls-1rd290m5rxhvv`              | FG DEEP DANCE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-remix-mp3-w1psqtmd342vv`                   | FG REMIX                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-remix-hls-w1psqtmd342vv`                   | FG REMIX                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-at-work-mp3-2v1zz979n98uv`                 | FG AT WORK                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-at-work-hls-w0318rn5rxhvv`                 | FG AT WORK                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-hits-mp3-mxfbr0dusd3vv`                    | FG HITS                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-hits-hls-mxfbr0dusd3vv`                    | FG HITS                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-david-guetta-mp3-88h6r9dusd3vv`            | FG DAVID GUETTA            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-david-guetta-hls-88h6r9dusd3vv`            | FG DAVID GUETTA            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-bob-sinclar-mp3-wphm12m4403vv`             | FG BOB SINCLAR             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-bob-sinclar-hls-wphm12m4403vv`             | FG BOB SINCLAR             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-french-mp3-3x5uxtcxgkhvv`             | FG CHIC FRENCH             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-french-hls-d17gfqp5rxhvv`             | FG CHIC FRENCH             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-lounge-mp3-1grpmk88n98uv`             | FG CHIC LOUNGE             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-lounge-hls-cbse4cp5rxhvv`             | FG CHIC LOUNGE             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-mix-mp3-9sw5gp3w7guvv`                | FG CHIC MIX                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-mix-hls-9sw5gp3w7guvv`                | FG CHIC MIX                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-soul-mp3-y4r1v13w7guvv`               | FG CHIC SOUL               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-soul-hls-y4r1v13w7guvv`               | FG CHIC SOUL               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-and-chill-mp3-d9ucg01d0chvv`          | FG CHIC & CHILL            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-and-chill-hls-nr839fp5rxhvv`          | FG CHIC & CHILL            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-spa-mp3-ffynknv9n98uv`                | FG CHIC SPA                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-spa-hls-3f12dmp5rxhvv`                | FG CHIC SPA                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-yoga-mp3-xryf0bck5rcwv`                    | FG YOGA                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-yoga-hls-xryf0bck5rcwv`                    | FG YOGA                    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-by-renault-mp3-kg2bvya6wzuvv`         | FG CHIC by Renault         | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-by-renault-hls-kg2bvya6wzuvv`         | FG CHIC by Renault         | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-vintage-mp3-csfyhrgr60bwv`            | FG CHIC VINTAGE            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-vintage-hls-csfyhrgr60bwv`            | FG CHIC VINTAGE            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-disco-funk-mp3-cpkhx08pq18uv`              | FG DISCO FUNK              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-disco-funk-hls-vcxvzyn5rxhvv`              | FG DISCO FUNK              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-classics-mp3-37n8gxv9n98uv`                | FG CLASSICS                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-classics-hls-twxsptp5rxhvv`                | FG CLASSICS                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `maxximum-90s-mp3-maygqbdap98uv`               | MAXXIMUM 90's              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `maxximum-90s-hls-q2x6eeq5rxhvv`               | MAXXIMUM 90's              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-new-wave-mp3-4vpbw1ad633vv`                | FG NEW WAVE                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-new-wave-hls-4vpbw1ad633vv`                | FG NEW WAVE                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-madonna-mp3-aq4u4dhk5rcwv`                 | FG MADONNA                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-madonna-hls-aq4u4dhk5rcwv`                 | FG MADONNA                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-pop-legends-mp3-hdzyzvtbxd3vv`             | FG POP LEGENDS             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-pop-legends-hls-hdzyzvtbxd3vv`             | FG POP LEGENDS             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-rnb-legends-mp3-kau7e6tbxd3vv`             | FG RnB LEGENDS             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-rnb-legends-hls-kau7e6tbxd3vv`             | FG RnB LEGENDS             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dancefloor-mp3-kv9m762w7guvv`              | FG DANCEFLOOR              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dancefloor-hls-kv9m762w7guvv`              | FG DANCEFLOOR              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-house-mp3-5kucq079n98uv`               | FG MIX HOUSE               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-house-hls-n54bm7n5rxhvv`               | FG MIX HOUSE               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-afro-house-mp3-uv0x66bap98uv`          | FG MIX AFRO HOUSE          | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-afro-house-hls-ycm6h2p5rxhvv`          | FG MIX AFRO HOUSE          | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-buddha-bar-mp3-zn73zqg1t7uvv`              | FG BUDDHA BAR              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-buddha-bar-hls-kb8037g1t7uvv`              | FG BUDDHA BAR              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-nomade-mp3-yukrx3dusd3vv`                  | FG NOMADE                  | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-apero-mp3-3xvpxq50e2uvv`                   | FG APERO                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-apero-hls-3xvpxq50e2uvv`                   | FG APERO                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-french-touch-mp3-06y7t4gk5rcwv`            | FG FRENCH TOUCH            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-french-touch-hls-06y7t4gk5rcwv`            | FG FRENCH TOUCH            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-disco-house-mp3-ffn7zkskca3vv`             | FG DISCO HOUSE             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-disco-house-direct-ffn7zkskca3vv`          | FG DISCO HOUSE             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-deep-house-mp3-02s8zcv9898uv`              | FG DEEP HOUSE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-deep-house-hls-02s8zcv9898uv`              | FG DEEP HOUSE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-training-mp3-8daakscap98uv`                | FG TRAINING                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-training-hls-51sgywp5rxhvv`                | FG TRAINING                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-on-the-road-mp3-yg315gmd633vv`             | FG ON THE ROAD             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-on-the-road-hls-yg315gmd633vv`             | FG ON THE ROAD             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-relax-mp3-ptaswwyza43vv`                   | FG RELAX                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-relax-hls-ptaswwyza43vv`                   | FG RELAX                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-defected-mp3-423ppf862quvv`                | FG DEFECTED                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-defected-hls-423ppf862quvv`                | FG DEFECTED                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-purple-disco-machine-mp3-xfnmkhw5b1bwv`    | FG PURPLE DISCO MACHINE    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-purple-disco-machine-hls-xfnmkhw5b1bwv`    | FG PURPLE DISCO MACHINE    | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-ushuaia-ibiza-mp3-fbmngsck5rcwv`           | FG USHUAÏA IBIZA           | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-ushuaia-ibiza-hls-fbmngsck5rcwv`           | FG USHUAÏA IBIZA           | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-hi-ibiza-direct-2ykcf6e1e2uvv`             | FG HÏ IBIZA                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-hi-ibiza-hls-2ykcf6e1e2uvv`                | FG HÏ IBIZA                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-unvrs-mp3-5z13wp6wsccwv`                   | FG UNVRS                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-unvrs-hls-5z13wp6wsccwv`                   | FG UNVRS                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-martin-garrix-mp3-6zg5tahk5rcwv`           | FG MARTIN GARRIX           | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-martin-garrix-hls-6zg5tahk5rcwv`           | FG MARTIN GARRIX           | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-clubbing-mp3-007e1v9f772vv`                | FG CLUBBING                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-clubbing-hls-007e1v9f772vv`                | FG CLUBBING                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-pulse-mp3-rzqck8ad633vv`                   | FG PULSE                   | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-fucking-good-music-mp3-dvpevwak5rcwv`      | FG FUCKING GOOD MUSIC      | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-fucking-good-music-hls-dvpevwak5rcwv`      | FG FUCKING GOOD MUSIC      | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-techno-mp3-1z19ak79n98uv`                  | FG TECHNO                  | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-techno-hls-1z19ak79n98uv`                  | FG TECHNO                  | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-techno-mp3-vat1rx60e2uvv`              | FG MIX TECHNO              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-techno-hls-vat1rx60e2uvv`              | FG MIX TECHNO              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-trance-mp3-v025nezpey3vv`              | FG MIX TRANCE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-trance-hls-v025nezpey3vv`              | FG MIX TRANCE              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-festival-mp3-ky42f360e2uvv`            | FG MIX FESTIVAL            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-festival-hls-ky42f360e2uvv`            | FG MIX FESTIVAL            | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-melodic-mp3-h0n0zbh1t7uvv`             | FG MIX MELODIC             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-melodic-hls-h0n0zbh1t7uvv`             | FG MIX MELODIC             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-club-mp3-e88ff5a1e2uvv`                | FG MIX CLUB                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-mix-club-hls-e88ff5a1e2uvv`                | FG MIX CLUB                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-phonk-and-gaming-mp3-vzx3q9762quvv`        | FG PHONK & GAMING          | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-phonk-and-gaming-hls-vzx3q9762quvv`        | FG PHONK & GAMING          | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-beatport-mp3-vb3b5749n98uv`                | FG BEATPORT                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-beatport-hls-q3we61n5rxhvv`                | FG BEATPORT                | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-belgium-mp3-5wesqhfap98uv`                 | FG BELGIUM                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-belgium-hls-br6wu5p5rxhvv`                 | FG BELGIUM                 | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-berlin-aac-7pww0pn0742vv`             | FG CHIC BERLIN             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-berlin-hls-7pww0pn0742vv`             | FG CHIC BERLIN             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-london-aac-8ha6164v5znwv`             | FG CHIC LONDON             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-london-hls-8ha6164v5znwv`             | FG CHIC LONDON             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-ibiza-mp3-z8v9hmhp0f3vv`              | FG CHIC IBIZA              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-chic-ibiza-hls-z8v9hmhp0f3vv`              | FG CHIC IBIZA              | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dance-top40-mp3-x1csugb6wzuvv`             | FG DANCE TOP40             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-dance-top40-hls-x1csugb6wzuvv`             | FG DANCE TOP40             | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-feel-good-mp3-yamg15ak5rcwv`               | FG FEEL GOOD               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
| `fg-feel-good-hls-yamg15ak5rcwv`               | FG FEEL GOOD               | Official web player, https://www.radiofg.com/Webradios                           | 2026-10-31 | official-player |
<!-- sources:end -->
