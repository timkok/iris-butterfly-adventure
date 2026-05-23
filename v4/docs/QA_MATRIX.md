# V4 QA Matrix

Scope: `/v4/` only.

Use this matrix during QA and release review. It is a checklist, not a feature backlog.

## Reduced Motion

- Browser path: load `/v4/`, start the game, then verify `/v4/test.html`.
- Expected behavior:
  - Nonessential ambient motion is disabled or minimized.
  - Tap ripples do not expand when reduced motion policy disables ripples.
  - Treasure stagger effects are disabled when reduced motion policy disables stagger.
  - Star, shield, leaf, and particle effects do not become visually busy.
- Pass criteria:
  - `/v4/test.html` passes reduced-motion and effects-policy tests.
  - Start still works.
  - No visible `INIT ERROR` banner or broken UI state appears.

## Calm Mode

- Browser path: load `/v4/?debug=1`, start the game, and inspect the debug panel.
- Expected behavior:
  - Debug panel reports `Calm: YES` when Calm Mode is active.
  - Particle and leaf counts stay inside the FX budget.
  - Movement and effects feel noticeably quieter than normal mode.
- Pass criteria:
  - FX Budget reports `OK`.
  - Calm Mode does not suppress core gameplay controls.
  - HUD, task display, pause, treasure, and settings still work.

## Responsive QA

- Viewports to check:
  - 320 px wide mobile portrait.
  - 360 px wide mobile portrait.
  - 400 x 600 game-size viewport.
  - Desktop width.
- Screens to check:
  - Home.
  - Playing.
  - Pause.
  - Treasure.
  - Settings.
  - Game Over, simulated when needed.
- Pass criteria:
  - Primary controls remain visible and tappable.
  - Buttons and tabs do not overlap.
  - Scrollable panels keep close/save/back controls reachable.
  - Text remains readable without clipping important controls.

## Child-Safety Copy

- Text must avoid:
  - Daily streaks or daily reward pressure.
  - Gacha, random reward, or loot framing.
  - Purchase, store, or currency framing.
  - Countdown pressure or "come back tomorrow" prompts.
- Allowed:
  - Explicit safety notices such as "没有购买内容".
  - High-score unlock wording, as long as it stays calm and non-monetary.
