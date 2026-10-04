# Warm sunrise gameplay update

## Goal
Update the uploaded Table Wars game without changing its combat flow or home-screen layout.

## Changes
- Import the uploaded game source and assets into the project, excluding repository metadata and generated files.
- Make speed streaks smoothly fade in as speed rises and fade out as it falls, rather than appearing abruptly.
- Add a compact top-left flight readout showing altitude in meters and a live ground-pound area bar that grows through the existing damage tiers.
- Limit each airborne wall run to three seconds. Once exhausted, prevent wall attachment until landing, then require one continuous second on the ground before recharging wall run.
- Add collision volumes for every pale window jamb, sill, crossbar, and trim section so the player/table cannot pass through them, while preserving the transparent glass openings.
- Shift the sky, sun, ambient fill, environment light, and materials toward a strongly orange sunrise/sunset look with darker, richer shadows.
- Give the home screen the warmest light and deepest shadows by changing scene lighting dynamically when the home presentation is active.
- Update the tutorial wording and HUD wall-run status so the three-second limit and recharge state are clear.

## Verification
- Check the preview at desktop size and confirm the scene is visible, orange-lit, and shadowed without becoming unreadably dark.
- Enter play, verify the altitude/AOE display updates, speed lines transition smoothly, window trim blocks movement, and wall run locks after three seconds until one second after landing.
- Confirm the latest build and runtime logs are clean.

## Technical details
- Reuse the current mutable game state for HUD values, updating rounded display values from the frame loop.
- Model wall-run availability as airborne budget plus grounded recharge timer, reset with the existing game reset flow.
- Generate window-frame AABBs from the same window angles and dimensions used to render the frame, avoiding visual/collision drift.
