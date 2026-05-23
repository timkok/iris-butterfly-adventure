# QA Evidence - Cycle 14 Browser Validation

## Summary

- Date/time: 2026-05-23 15:59-16:05 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Commit hash tested: `97b56b763566685a8db9e65c7aeaf86c039bdd71`
- Branch: `main`
- Pages source: `main / root`
- Asset version observed: `v=20`
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `https://timkok.github.io/iris-butterfly-adventure/v4/?qa=cycle14-main`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?qa=cycle14-overlays`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?qa=cycle14-canvas`
- `https://timkok.github.io/iris-butterfly-adventure/v4/test.html?qa=cycle14-tests`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?debug=1&qa=cycle14-debug`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Home loads | PASS | Home screen rendered with title, difficulty buttons, start button, how-to, treasure, settings, and V2/V3 links. HUD/task hidden on home. |
| 2 | Start button works | PASS | Clicking `开始飞行` closed the start panel and entered gameplay. |
| 3 | HUD appears | PASS | Score, lives, sound, pause, and task display appeared after starting. |
| 4 | Canvas updates | PASS | Two gameplay screenshots taken 800 ms apart differed (`27180` vs `27238` bytes), confirming visual updates. |
| 5 | Space jump works | PASS | Space key was exercised during PLAYING with no console errors or state breakage. |
| 6 | Mouse/touch jump works | PASS with limitation | Canvas click path was exercised successfully. True mobile touch synthesis was not available in this browser automation environment; existing touch code path was not changed in Cycle 14. |
| 7 | Pause/resume works | PASS | Pause panel opened; `继续飞行` returned to gameplay with HUD still visible. |
| 8 | Treasure opens | PASS | Treasure panel opened; sticker and cosmetics tabs displayed and switched correctly. |
| 9 | Settings opens | PASS | Parent settings panel opened; speed/lives labels and controls rendered. |
| 10 | Sound muted by default | PASS | On first load, sound button showed `🔇` and `aria-checked="false"`. |
| 11 | Sound toggle works | PASS | Sound button toggled to `🔊` / `aria-checked="true"` and back to `🔇` / `aria-checked="false"`. |
| 12 | Starlight Shield simulated or verified | PASS | `/v4/test.html` includes `Starlight Shield Mechanics`; it passed on live Pages. |
| 13 | Calm Mode does not produce excessive animation | PASS | Settings showed Calm Mode enabled; debug panel showed `Calm: YES` and FX budget `OK`. |
| 14 | Reduced Motion path checked if possible | PASS with limitation | Browser reported `prefers-reduced-motion: reduce` as `false`; live smoke tests passed `Reduced motion fallbacks` and `Effects Policy Caps & Modes validation`. No forced OS-level reduced-motion emulation was available. |
| 15 | Debug panel opens with `?debug=1` | PASS | Debug panel rendered with realtime data, tuning controls, `Mute: YES`, `Calm: YES`, `RMotion: NO`. |
| 16 | `/v4/test.html` passes | PASS | Live test page reported `Total: 18`, `Passed: 18`, `Failed: 0`; all scripts loaded with `v=20`. |
| 17 | Console has no errors | PASS | No new console errors observed for the tested live `/v4/` `v=20` pages. |

## Console Errors

No console errors were observed during the live `v=20` QA run.

Filtering note: browser logs were filtered to the current QA run and `/iris-butterfly-adventure/v4/` URLs to avoid stale logs from previous local sessions.

## Screenshots / Artifacts

Screenshots were captured through the browser QA session for:

- Gameplay after start: captured, 27756 bytes.
- Treasure screen: captured, 30868 bytes.
- Settings screen: captured, 33051 bytes.
- Debug panel: captured, 72258 bytes.
- Smoke test page: captured, 81232 bytes.
- Canvas motion comparison: captured, 27180 bytes and 27238 bytes.

Screenshots were used as transient QA evidence and were not committed as repository artifacts.

## Issues Found

### P0

- None.

### P1

- None.

### P2 / QA Limitations

- True mobile `touchstart` input could not be synthesized in the current browser automation environment. Mouse/canvas click was verified, and the touch code path was not modified in Cycle 14.
- OS-level reduced-motion emulation was not available in the current browser automation environment. The current browser reports reduced motion as `false`; reduced-motion fallback coverage passed through smoke tests.

## Release Recommendation

**PASS TO RELEASE**

Rationale: latest `/v4/` Pages build loads `v=20` assets, gameplay startup works, HUD/canvas/pause/treasure/settings/debug paths pass, live smoke tests pass 18/18, and no P0/P1 issues or console errors were found.
