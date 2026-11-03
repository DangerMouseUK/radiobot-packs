# Collections

A collection is a named group of packs that people can install or browse together. There are two kinds.

## Country collections (automatic)

You don't write these. When the library is built, every pack is added to a collection for each country in its `pack.json` `countries` list. A pack with `"countries": ["GB"]` appears in the United Kingdom collection, `country-gb`. Set `countries` correctly and the pack lands in the right place. Ids that start with `country-` are reserved for these.

## Hand-picked collections

A hand-picked collection is one JSON file in this folder, named after its id:

```text
collections/<collection-id>.json
```

```json
{
  "id": "my-collection",
  "name": "My collection",
  "description": "One sentence on what links these packs.",
  "packs": ["mypack", "otherpack"]
}
```

| Field         | Rule                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| `id`          | Required. Lower-case letters, digits and `-`, starting with a letter or digit, at most 40 characters. Must match the file name, and must not start with `country-`. |
| `name`        | Required, 1–80 characters.                                                                           |
| `description` | Optional, at most 300 characters.                                                                    |
| `packs`       | Required. Pack ids, at most 500. Each one must be a pack folder in `packs/`.                         |

Rules:

1. Keep the name and description generic and factual: what links the packs (a genre, a language, a theme), not who owns them.
2. Never invent a country collection by hand. Fix the packs' `countries` instead.
3. When a pack is withdrawn, remove it from every collection in the same change. CI refuses a collection that names a pack that isn't in `packs/`.
4. Open a pull request like any other change. CI checks that the file name matches the `id` and that every pack exists.
