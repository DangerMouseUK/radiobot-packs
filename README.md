# Radio Bot station packs

The official station pack library for [Radio Bot](https://github.com/DangerMouseUK/radiobot), a self-hosted Discord bot that plays live internet radio.

A **station pack** lists one company's radio stations and the public stream addresses that carry them, with a record of where and when each address was found. The bot checks every stream itself before it plays it. A pack carries no audio, logos or artwork: only names, addresses and their provenance.

> **Radio Bot and this library are unofficial and not affiliated with or endorsed by any broadcaster.** Station names are used only to identify the stations. The names, audio and artwork belong to their owners. Rights holders can ask for a pack to be removed: see [TAKEDOWN.md](TAKEDOWN.md).

## Installing packs

You don't download anything from this repository by hand. A running Radio Bot fetches the library's list and installs the packs you choose:

- on the host, with the `radio-bot packs …` command (for example `radio-bot packs browse`, then `radio-bot packs add <pack-id>`);
- in Discord, with `/radio packs`.

Installing from Discord only ever uses this official library. The bot's own documentation explains the commands in full.

The list of available packs, with their owners, countries and languages, is in the latest release's `index.json`.

## How the library is published

Every change to `main` that touches a pack, a collection or `withdrawn.json` is checked again, then published as a new [release](https://github.com/DangerMouseUK/radiobot-packs/releases):

- `index.json` lists every pack: its version, owner, countries, languages, station and source counts, and the address and SHA-256 fingerprint of its bundle;
- `<pack-id>.json` is one bundle per pack, holding its `pack.json`, `stations.json` and `sources.json`.

Bots read `https://github.com/DangerMouseUK/radiobot-packs/releases/latest/download/index.json`, and refuse any bundle whose fingerprint doesn't match.

## Proposing a pack

Every pack is reviewed before it is published. To propose a new pack, or a change to one:

1. Read the [playbook](playbook/PLAYBOOK.md) and follow it step by step. It explains what qualifies, how to find a station's official streams, how to record where they came from, and the tools that build and check a pack.
2. Run the checks: `node scripts/ci-check.mjs --bot ../radiobot --base origin/main`.
3. Open a pull request and fill in its checklist.

What a pack must never contain: streams that need a log-in, an app, a particular country, DRM, or a signed or expiring address; logos, artwork or audio; personal data. The bot never pretends to be a web browser, and a stream host that refuses it is left alone.

## Repository layout

```text
packs/<pack-id>/       one folder per pack
pack-ids.json          every pack id ever used (ids are never reused)
withdrawn.json         packs removed from the library
collections/           hand-picked collections of packs
playbook/              how to make, update and review a pack
scripts/ci-check.mjs   the checks CI runs, also runnable locally
```

## Rights

Nothing in this library grants any rights to station names, brands, logos, artwork, programmes, music or the streams themselves. Whether relaying a stream is allowed is a question for whoever runs a bot; see the bot's [rights and disclaimer](https://github.com/DangerMouseUK/radiobot/blob/main/docs/rights-and-disclaimer.md) page.
