<!--
Follow playbook/PLAYBOOK.md. Answer every line; write "n/a" where a line doesn't apply.
Keep broadcaster and station names inside the pack's own folder: refer to the pack by its id here.
-->

## What this changes

Pack(s):
New pack / update / fix / withdrawal:

## Evidence

- **Station list:** where it came from (official page), and the date it was taken:
- **Stations without a working stream,** and why:
- **Stations with only one enabled source,** and whether the official site offers any other stream for them (for information):
- **Live check:** date, run with a person's permission (or "not run", and why), how many sources played, and every enabled source that failed and why:
- **Load-balanced services:** for any address built from a service's mount, the mount and the server the official player used (or "n/a"):
- **Same stream, other format:** for any official stream recorded in another format, the official address it comes from and the audio comparison score (or "n/a"):
- **Anything uncertain,** or any stop-and-ask question still open:

## Checklist

- [ ] I followed the playbook, step by step.
- [ ] `validate-catalogue --strict` passed for every changed pack.
- [ ] `node scripts/ci-check.mjs --base origin/main` passed.
- [ ] No pack id, station slug or source id was removed, changed or reused (renames use aliases, closed stations are retired, broken sources are disabled with a reason).
- [ ] `version` was bumped in every changed pack (`generate --base origin/main`), and a new pack keeps the date it was started with.
- [ ] A new pack's id was added to `pack-ids.json`.
- [ ] Every stream the official site or player links to a station is recorded, and no source that plays the right station was switched off because another is as good or better (only refused, wrong-station, unsafe or 7-days-failed sources are disabled).
- [ ] Every source has provenance, and `SOURCE_PROVENANCE.md` records where and when every address was found.
- [ ] Only public, free streams: no log-in, app-only, region-locked, DRM, signed, tokenised or expiring addresses.
- [ ] No logos, artwork, audio, personal data, tokens or tracking parameters (including consent strings and session ids).
- [ ] Broadcaster and station names appear only inside the pack's own folder.
