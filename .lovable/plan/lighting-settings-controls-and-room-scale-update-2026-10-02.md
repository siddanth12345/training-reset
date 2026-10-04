# Lighting, settings, controls, and room scale update

## Goal
Add player-configurable controls and scene modes while preserving the existing gameplay, room layout, and evening art direction.

## Changes
- Rebalance the current evening lighting halfway between the original bright version and the latest dark version; raise the existing lamp’s light output to 1.5× its current level.
- Add a Settings panel accessible from both the home screen and pause menu.
- Persist settings in the browser: mouse sensitivity, shadows on/off, hold/toggle shooting, keyboard bindings, and day/evening/night scene mode.
- Provide designed Day, Evening, and Night selectors with distinct active states:
  - Day: brighter, cooler white daylight and a bright daytime exterior.
  - Evening: the current orange sunrise look with the new midpoint lighting balance.
  - Night: dark exterior and low ambient light, with both perimeter lamps on at twice the improved lamp output.
- Add a second matching lamp on an open side of the room near the perimeter.
- Route movement and every keyboard-triggered ability through the selected bindings. Keep mouse look, left-click shooting, right-click scope, wheel zoom, Enter, and Escape fixed.
- Make the Controls & Bot Types panel and tutorial control wording read the current bindings instead of hardcoded defaults.
- Make windows 1.5× larger while deriving visual frames, wall openings, and collision volumes from the same dimensions.
- Make both fridges and the bookshelf 1.7× larger toward the room interior, keeping their wall-facing edges at the same distance from the wall; update their collision boxes and visible details together.

## Technical details
- Add a small client-side settings module with typed actions, defaults, key labels, validation, and localStorage loading/saving.
- Have the Three.js loop read settings without per-frame React updates; apply mouse sensitivity through the pointer-lock controls configuration and use action lookup helpers for keyboard input.
- Use scene-mode values for background, fog, sky shell, sun, hemisphere, ambient, environment fill, and lamp visibility/intensity.
- Keep shadows enabled at the renderer level and disable casting dynamically when the setting is off, avoiding a canvas rebuild during play.
- Scale wall openings angularly and scale frame dimensions from shared constants so appearance and collisions remain aligned.

## Verification
- Verify desktop rendering for day, evening, and night, including both night lamps and readable shadows.
- Confirm shadow toggle, sensitivity, hold/toggle firing, and remapped movement/actions work in a real play session.
- Confirm home/pause settings persist after refresh and control labels update immediately.
- Confirm enlarged windows, bookshelf, and fridges render without wall overlap and their collisions match.
- Confirm build, tests, runtime console, and network remain clean.
