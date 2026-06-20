# Fonts

Drop the PP Mori web files here with these exact names:

- `PPMori-Regular.woff2`  → weight 400
- `PPMori-SemiBold.woff2` → weight 500 (used as "Medium")

These are referenced by `@font-face` in `src/app/globals.css`.
Until they are present, the site falls back to a grotesque system stack.

Only Regular and Medium/SemiBold are used — no Thin, ExtraLight, or Black.
`.woff2` is preferred for performance; if you only have `.woff`/`.otf`,
convert to `.woff2` (e.g. via the Fontsquirrel or Transfonter generator).
