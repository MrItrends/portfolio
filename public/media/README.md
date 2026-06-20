# Media

## Hero reel

The homepage hero plays an edited showreel. Drop the files here with these names:

- `hero-reel.webm`        → primary source (VP9/AV1, smallest)
- `hero-reel.mp4`         → fallback source (H.264, broad support)
- `hero-reel-poster.jpg`  → first-frame poster (shown before play / on reduced motion)

Referenced by `src/components/Hero.tsx`. Until they exist, the band renders as a
clean dark panel (`#070707`).

### Editing notes

- It is presented as a **wide, full-width cinematic band** (`object-fit: cover`),
  so edit/crop with a wide safe-area in mind — important detail kept centred.
- Autoplays **muted**, **loops**, no controls. Keep it short (~10–20s) and seamless.
- Keep it light: target **< 5 MB**. Mute/strip the audio track entirely.
- It is a *design trailer* — product thinking, interaction, system + visual craft.
  Not a project walkthrough, not full screens. Quick, confident, edited.
- Suggested work: SPAL, Xterns, Skillspace, ReliefNow, motion studies.
