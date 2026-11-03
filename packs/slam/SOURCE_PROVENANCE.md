# Source provenance: SLAM! (`slam`)

This file records where every station and source in this pack came from, what was checked and what was not.

> Radio Bot is **unofficial**. It is not affiliated with, endorsed by or sponsored by any broadcaster. Station names are used only to identify the stations. No logos, artwork or audio are included in this repository.

## Summary

| Item                    | Value                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Owner                   | Mediahuis Radio B.V. (named in the slam.nl privacy statement), brand SLAM!                    |
| Station list source     | The slam.nl web player's station list (`themeChannel` items from the site's own content API) |
| Station list snapshot   | 3 November 2026. 10 stations, in the player's order                                           |
| Source discovery        | 3 November 2026                                                                               |
| Stations catalogued     | 10                                                                                            |
| Sources                 | 10, all direct HE-AAC streams on Triton Digital (`streamtheworld.com`), all `curated`         |
| Live check              | 3 November 2026, 10 of 10 played ([`evidence/probe-2026-11-03.json`](evidence/probe-2026-11-03.json)) |

## Scope

Mediahuis Radio B.V. also runs 100%NL, Sunlite, Nostalgie and Radio Veronica. This pack covers only the SLAM! brand, as a brand pack with the company in `owner`: SLAM! has its own website (`slam.nl`) and its own station list, which the playbook allows a pack of its own (step 2). The company's other brands belong in packs of their own.

## Station list

- **Where.** The station picker of the web player on `https://www.slam.nl/` (the **Stations** row). The player fills it from the site's own content API, `https://api.mediahuisradio.nl/umbraco/delivery/api/v2/content?filter=contentType:themeChannel&sort=sortOrder:asc&brand=slam`, which returned 10 items on 3 November 2026. Names and order are taken from each item's `channelName`, in API order.
- **External IDs.** `externalId` is each item's `stationKey` (`slam`, `web08` … `web16`), the key the site uses for now-playing data.
- **Not included.** The site's article "Zo luister je naar de digitale stations van SLAM!" (1 January 2025) also describes a "SLAM! Summer" station. It is not in the player's list, so it is not in this pack. The `videoUrl` fields in the same API (HLS video for SLAM! TV) are video, and the nine theme stations all point at the same one, so none of them is used.
- **What was added by hand.** Slugs, aliases, categories and tags. The aliases "SLAM! FM Stream" and "SLAM! Nonstop" are the ICY names the streams announce.

## How the sources were found

1. Each API item carries a `tritonKey` (for example `web10_AAC`): the Triton Digital mount the player plays. Triton's provisioning API (`playerservices.streamtheworld.com/api/livestream`, the call the player's Triton SDK makes) reported every mount as `200 OK`, `<authentication>0</authentication>`, HE-AAC v1, 96 kbps, 44.1 kHz stereo, with `http` and HLS transports.
2. With the cookie banner declined, each station was started once in the official player. Each played `https://<node>.live.streamtheworld.com:443/<MOUNT>.aac`, where `<MOUNT>` is that station's `tritonKey` in capitals. The node is one of a load-balanced list that Triton returns afresh on every request, so the player gives out no single stable address.
3. The player's request also carried `dist`, `tdsdk`, `pname`, `pversion`, `banners`, `gdpr`, `gdpr_consent`, `burst-time`, `sbmid` and `swm`: SDK, consent and per-session tracking values. None of them was recorded.
4. **The recorded address is built, not copied.** Each source is `https://playerservices.streamtheworld.com/api/livestream-redirect/<MOUNT>.aac`, Triton's load-balanced redirect for the mount the official player plays. Because it is built from the mount name rather than taken from the player, every source is `curated`. This follows the playbook's "Load-balanced streaming services" section for Triton Digital.
5. The HLS transport (`<MOUNT>/HLS/playlist.m3u8`) was not recorded: the player never used it, and every station has a direct stream.

## Live check (3 November 2026)

Run with the maintainer's permission, one source at a time, with the bot's own `validate-catalogue --probe`. All 10 sources played. The redirect answered for every mount and led to a `live.streamtheworld.com` node, which differed from the node the browser player had used. Every stream was HE-AAC, 44.1 kHz stereo, measured at about 97 kbps (advertised 96). Each stream's ICY name matched its own station, for example "SLAM! Juize" for SLAM! JUIZE and "SLAM! FM Stream" for SLAM!.

## What was not verified

- **Other countries.** Nothing on the site mentions a region lock, and Triton's provisioning answered with no geo-blocking status, but the streams were checked only from one location. The player's code handles Triton's `STREAM_GEO_BLOCKED` codes.
- **The redirect's stability over time.** It was checked on one day only.
- **No audio comparison** (`--compare`): every station has one source.
- **No rights or terms review.** See [docs/rights-and-disclaimer.md](https://github.com/DangerMouseUK/radiobot/blob/main/docs/rights-and-disclaimer.md).

## Sources

<!-- sources:start -->
| Source ID                             | Station                   | Found at             | Date       | Provenance |
| ------------------------------------- | ------------------------- | -------------------- | ---------- | ---------- |
| `slam-slam-direct-aac`                | SLAM!                     | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-non-stop-direct-aac`            | SLAM! NON-STOP            | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-housuh-in-de-pauzuh-direct-aac` | SLAM! HOUSUH IN DE PAUZUH | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-mixmarathon-direct-aac`         | SLAM! MIXMARATHON         | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-90s-direct-aac`                 | SLAM! '90s                | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-00s-direct-aac`                 | SLAM! '00s                | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-10s-direct-aac`                 | SLAM! '10s                | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-the-boom-room-direct-aac`       | SLAM! THE BOOM ROOM       | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-wkndmx-direct-aac`              | SLAM! WKNDMX              | https://www.slam.nl/ | 2026-11-03 | curated    |
| `slam-juize-direct-aac`               | SLAM! JUIZE               | https://www.slam.nl/ | 2026-11-03 | curated    |
<!-- sources:end -->
