# Vendored libraries

The site has no build step (ADR-0002). The one runtime library is copied here as a single
ES module so no CDN is needed at runtime (ADR-0006, the same reason the fonts are
self-hosted). It is imported only by `src/sync/sessie.js`, and only for a signed-in player or
on the account page.

| file | package | version | licence |
|---|---|---|---|
| `supabase.js` | `@supabase/supabase-js` (with auth-js, postgrest-js, realtime-js, storage-js, functions-js, phoenix, iceberg-js, tslib) | 2.119.0 | MIT, 0BSD — all texts in `supabase.LICENSE` |

SHA-256 of `supabase.js`: `a756f282e9682bb489527d7b6f0dd302608b7fe63c091af8f5acc7b43db59ac4`.

## Rebuilding or updating
Done outside the repository, so `package.json` gains no browser dependency. Pick a version
that has been out for at least two weeks.

```bash
mkdir -p "$TMPDIR/supabase-vendor" && cd "$TMPDIR/supabase-vendor" && npm init -y && npm install @supabase/supabase-js@2.119.0 esbuild@0.28.2
```

```bash
cd "$TMPDIR/supabase-vendor" && echo "export { createClient } from '@supabase/supabase-js';" > entry.mjs && npx esbuild entry.mjs --bundle --format=esm --platform=browser --target=es2020 --minify --legal-comments=eof --outfile=supabase.js
```

Copy `supabase.js` here, refresh `supabase.LICENSE` from the licence files in
`node_modules`, update the version and hash above, and run `npm run check:sync` (it checks
that `service_role` appears nowhere in `src/`).
