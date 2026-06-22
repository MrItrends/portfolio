# Media

## Hero reel — `hero-reel.{mp4,webm}` + `hero-reel-poster.jpg`

The homepage hero film: a 16:9 visual manifesto (~16.4s, seamless loop, muted,
autoplay). Referenced by `src/components/Hero.tsx`.

### Concept

Each work sits as an editorial **plate** on the `#F1F1F1` ground with generous
whitespace; transitions dissolve *through* that ground — whitespace is the
connective tissue. Static plates, restrained dissolves, no decorative motion.

Sequence (alternating theme / orientation / light–dark):
NEDI dashboard (systems) → SPAL AI (detail) → Celo Events (interface) →
Moodoo (process) → NEDI hero (interface) → Relief Now (outcome).

### Rebuilding

Source stills live in `public/images/`. The film is assembled with ffmpeg —
landscape captures are cropped to remove the Safari window chrome
(`crop=3012:1471:30:210` on the 3072×1736 shots), placed on the ground with
margins, and joined with fade-through-ground transitions. The build script used
is `/tmp/build_reel.sh` (re-create it if you want to re-edit the sequence,
pacing, or swap shots).

To change a shot or the pacing, edit the `clips=()` list / `DUR` / `FD` and
re-run, then re-export `.mp4` (H.264, faststart) and `.webm` (VP9).
