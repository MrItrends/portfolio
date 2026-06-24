# Audio

Ambient music for the sticky sound toggle (`src/components/AmbientSound.tsx`).

On each page load one track is shuffled in (avoiding an immediate repeat); when
a track ends, another is shuffled in. Click the toggle to mute/play — the choice
is remembered. Browsers block sound until a user gesture, so playback begins on
load where allowed, otherwise on the first interaction.

## Adding tracks

1. Drop the `.mp3` here (keep files reasonably small — they ship in the repo).
2. Add its path to the `TRACKS` array in `src/components/AmbientSound.tsx`.

Current:

- `drink-the-water.mp3`
- `cinema.mp3`
- `i-am-malala.mp3`
