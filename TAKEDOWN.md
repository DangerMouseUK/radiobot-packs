# Takedown requests

Radio Bot and this library are unofficial and not affiliated with or endorsed by any broadcaster. Station names are used only to identify the stations; the names, audio and artwork belong to their owners.

If you are a broadcaster or rights holder, or represent one, and want a pack, a station or a stream address removed from this library, this page explains how to ask and what happens next.

## What the library holds

A pack holds station names, public stream addresses and a record of where and when each address was found. It holds no audio, logos or artwork.

Radio Bot relays a stream **as the station broadcasts it**, including its adverts, jingles and announcements. It decodes the audio and encodes it once for Discord, with no editing, no processing and nothing cut, replaced or inserted. It never records programmes. It identifies itself to stream servers as FFmpeg's network library and never pretends to be a web browser, so a stream server that refuses it stops it from playing.

## How to ask

Use either of these:

1. **Open an issue** in this repository with the title `Takedown request: <pack id>`. Say which pack, stations or addresses you mean (the pack id is the first part of every station id, before the `:`), and which company you represent. Please don't put personal contact details in a public issue.
2. **Contact the maintainer privately**, using the contact options on the maintainer's GitHub profile (linked from this repository's page).

There is no need for a formal notice. A clear request from the station, its owner or their representative is enough.

## What happens

This is a volunteer project, with no guaranteed response time, but takedown requests come before other work.

**For a whole pack:**

1. The maintainer acknowledges the request.
2. The pack's folder is removed from `packs/`, and the pack is added to `withdrawn.json` with a short reason.
3. The pack id stays reserved in `pack-ids.json`, so it can never be reused for anything else.
4. The next library release lists the pack as withdrawn.
5. Bots that installed the pack from this library remove it at their next check of the library (once a day), and tell their admins why.

**For some stations or addresses:** the pack is changed in a new version. Stations are marked retired and addresses are disabled, with the reason recorded. Bots show their admins that an update is available, and the change takes effect when the pack is updated.

## For maintainers: withdrawing a pack

In one pull request:

1. Delete the folder `packs/<pack-id>/`.
2. Add an entry to `withdrawn.json` with the pack's `id`, a `name`, the `reason` and the `date` (`YYYY-MM-DD`). The reason is shown to the admins of bots that had the pack, so keep it short, factual and free of personal details (at most 300 characters). Use the pack id as the `name`, so no broadcaster's name stays in the repository outside a pack folder:

   ```json
   {
     "schemaVersion": 1,
     "packs": [{ "id": "mypack", "name": "mypack", "reason": "Withdrawn at the owner's request.", "date": "2026-01-31" }]
   }
   ```

3. Leave the id in `pack-ids.json`. Never remove it.
4. Remove the pack from every file in `collections/`.
5. Merge. CI checks the change and publishes a new library release.

## What the maintainer can't control

Radio Bot is self-hosted. People who run it can also load packs of their own, or copies made before a withdrawal, and the maintainer has no control over those. Each operator is responsible for what their own bot relays. The bot's [rights and disclaimer](https://github.com/DangerMouseUK/radiobot/blob/main/docs/rights-and-disclaimer.md) page explains this and the switches operators have to stop a station at once.
