# Fonts

The portfolio uses exactly two PP Mori weights (per `visual_system.md`):

- `PPMori-Regular.woff2`  → weight 400  ✓ installed
- `PPMori-SemiBold.woff2` → weight 500  ✓ installed (upright, used for headlines)

These are referenced by `@font-face` in `src/app/globals.css`.

Note: the `PPMori-Medium.woff2` in the original kit is mislabeled — it contains
the *italic* glyphs. SemiBold is used instead as the upright heavier weight (it
is PP Mori's genuine second weight). If you later obtain a true upright Medium,
drop it in and point the weight-500 `@font-face` back at it.

Only these two upright weights are used — no Thin, ExtraLight, Bold, Black, or
italics — to keep the type voice restrained and the payload small.
