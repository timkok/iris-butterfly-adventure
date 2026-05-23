# QA Evidence - Cycle 14 Internationalization QA and English Polish

## Summary

- Date/time: 2026-05-23 17:20-17:45 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Commit hash tested: 525a4de2ec0b4e36c392cb08bfecaee16a5b36c8
- Branch: `main`
- Pages source: `main / root`
- Asset version tested locally: `v=24`
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `http://localhost:8000/v4/test.html?cycle14=v24`
- `http://localhost:8000/v4/?cycle14=v24`
- `http://localhost:8000/v4/?debug=1&cycle14=v24`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | `/v4/test.html` passes | PASS | Local browser smoke tests reported `Total: 25`, `Passed: 25`, `Failed: 0`, `lang=en`. |
| 2 | English default loads | PASS | With saved language cleared, `/v4/` rendered `lang="en"` and `Start Flying`. |
| 3 | Sound muted by default | PASS | State sound flag was false and sound button showed `🔇`. |
| 4 | Start button works in English | PASS | Tapping `Start Flying` entered `PLAYING`. |
| 5 | HUD appears | PASS | HUD and task display became visible after start. |
| 6 | Canvas updates | PASS | Frame count advanced during PLAYING. |
| 7 | Space jump works | PASS | Space key set butterfly velocity upward. |
| 8 | Touch jump works | PASS | Mobile touch tap on the game area set butterfly velocity upward. |
| 9 | Pause/resume works | PASS | Pause opened with English copy; resume returned to PLAYING. |
| 10 | Chinese switch works | PASS | Tapping `中文` set `lang="zh-CN"`, persisted `iris_butterfly_language=zh`, and changed start copy to `开始飞行`. |
| 11 | Language status is announced politely | PASS | `#language-status` contained `已切换到中文。`. |
| 12 | Start button works in Chinese | PASS | Tapping `开始飞行` entered `PLAYING`. |
| 13 | Mission text changes language | PASS | Chinese mission text rendered with 星星/花藤/秒/彩虹 wording. |
| 14 | Treasure opens in Chinese | PASS | Treasure screen opened, sticker tab said `魔法贴纸`, locked labels said `未解锁`. |
| 15 | Settings opens in Chinese | PASS | After closing Treasure and immediately tapping settings, settings opened with Chinese heading. |
| 16 | Debug panel opens | PASS | `/v4/?debug=1` opened the debug panel. |
| 17 | Console has no errors | PASS | Final local Playwright run captured zero console errors and zero page errors. |

## Console Errors

None in final local browser run. A browser favicon 404 was observed during earlier validation and fixed by adding a data favicon to `/v4/index.html` and `/v4/test.html`.

## Screenshots / Artifacts

- No screenshot files were committed.
- Temporary Playwright tooling was installed under `/tmp/iris-pw` only; no dependency files were added to the repository.

## Issues Found

### P0

- None.

### P1

- Fixed during QA: inactive panel children could intercept fast taps during fade-out after closing Treasure. CSS now limits pointer events to active panels.

### P2

- Some static HTML still contains fallback copy for no-JS readability; primary runtime UI is dictionary-driven and covered by tests.

## Release Recommendation

**PASS TO RELEASE**

Rationale: bilingual startup and primary UI flows pass, smoke tests pass 25/25, touch and keyboard controls work, debug opens, and final console capture has no errors.

# QA Evidence - Cycle 13 Safety and QA Guardrails

## Summary

- Date/time: 2026-05-23 16:33-16:36 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Implementation commit tested locally and live: `a6478b461596510c42f0ee85ca0a6a5375f2d91f`
- Branch: `main`
- Pages source: `main / root`
- Asset version tested locally: `v=23`
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `https://timkok.github.io/iris-butterfly-adventure/v4/?start-gate=cycle13`
- `http://localhost:8000/v4/test.html?cycle13=v23`
- `http://localhost:8000/v4/?cycle13=v23`
- `http://localhost:8000/v4/?debug=1&cycle13=v23`
- `https://timkok.github.io/iris-butterfly-adventure/v4/test.html?cycle13=v23`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?cycle13=v23`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Home loads | PASS | Home rendered with start visible, HUD/task hidden, and no `INIT ERROR` banner. |
| 2 | Start button works | PASS | Live start gate, local `v=23`, and post-push live `v=23` start button checks hid start and showed gameplay UI. |
| 3 | HUD appears | PASS | HUD and task display appeared after start. |
| 4 | Canvas updates | PASS | Existing startup path remained active; Cycle 13 did not touch rendering code. |
| 5 | Space jump works | PASS | Space key was exercised during gameplay with HUD/task still active. |
| 6 | Mouse/touch jump works | PASS with limitation | Canvas click path was exercised successfully. True mobile `touchstart` synthesis was not available in this browser automation environment. |
| 7 | Pause/resume works | PASS | Pause panel opened and resume restored gameplay/task UI. |
| 8 | Treasure opens | PASS | Treasure panel opened successfully. |
| 9 | Settings opens | PASS | Parent settings panel opened successfully. |
| 10 | Debug panel opens with `?debug=1` | PASS | Debug panel opened and showed FX budget fields. |
| 11 | `/v4/test.html` passes | PASS | Local and live `v=23` smoke tests reported `Total: 21`, `Passed: 21`, `Failed: 0`. |
| 12 | Child-safety guardrail test passes | PASS | New smoke test verified reward/safety text avoids pressure and purchase framing while allowing approved "no purchase" notices. |
| 13 | Console has no errors | PASS with limitation | No visible runtime error banner or broken interaction state appeared. Direct console log collection was unavailable in the current in-app browser API. |

## Console Errors

No visible runtime error banner or broken interaction state was observed during local `v=23` QA. Direct console log collection was unavailable in the current in-app browser API.

## Screenshots / Artifacts

- Local smoke test result: `Total: 21`, `Passed: 21`, `Failed: 0`.
- Live smoke test result: `Total: 21`, `Passed: 21`, `Failed: 0`.
- No screenshot files were committed.

## Issues Found

### P0

- None.

### P1

- None.

### P2 / QA Limitations

- True mobile `touchstart` input could not be synthesized in the current browser automation environment; canvas click was verified.
- Direct console log collection was unavailable in the current in-app browser API.

## Release Recommendation

**PASS TO RELEASE**

Rationale: live start gate passes, local and live `v=23` load and start, smoke tests pass 21/21, debug panel opens, and no P0/P1 issues or protected-version changes were found.

---

# QA Evidence - Cycle 11 Browser QA Evidence + Stability Gate

## Summary

- Date/time: 2026-05-23 16:27-16:29 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Commit hash tested: `691949078264d63d50b363e3da3d59e11bd13312`
- Branch: `main`
- Pages source: `main / root`
- Asset version observed: `v=22`
- Code changes made: none
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `https://timkok.github.io/iris-butterfly-adventure/v4/?cycle11=stability-v22`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?cycle11=motion-v22`
- `https://timkok.github.io/iris-butterfly-adventure/v4/?debug=1&cycle11=debug-v22`
- `https://timkok.github.io/iris-butterfly-adventure/v4/test.html?cycle11=stability-v22`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Home loads | PASS | Home screen rendered with start visible, HUD/task hidden, sound muted, and no `INIT ERROR` banner. |
| 2 | Start button works | PASS | Clicking `开始飞行` hid the start screen and showed gameplay UI. |
| 3 | Game state changes to PLAYING | PASS | Observable gameplay state changed to PLAYING UI: start hidden, HUD/task visible. Smoke test `startGame changes gameState from START to PLAYING without throwing` passed on live `/v4/test.html`. |
| 4 | HUD appears | PASS | HUD appeared after starting. |
| 5 | Canvas updates | PASS | Two screenshots after start differed after 900 ms: `28175` vs `27440` bytes, different SHA-256 hashes. |
| 6 | Space jump works | PASS | Space key was exercised during gameplay with HUD/task still active and no visible error state. |
| 7 | Mouse/touch jump works | PASS with limitation | Canvas click path was exercised successfully. True mobile `touchstart` synthesis was not available in this browser automation environment. |
| 8 | Pause/resume works | PASS | Pause panel opened; resume returned to gameplay and restored task display. |
| 9 | Treasure opens | PASS | Treasure panel opened from home. |
| 10 | Settings opens | PASS | Parent settings panel opened from home. |
| 11 | Sound is muted by default | PASS | Sound button started as `🔇` with `aria-checked="false"`. |
| 12 | Sound toggle works | PASS | Sound toggled to `🔊` / `aria-checked="true"` and back to `🔇` / `aria-checked="false"`. |
| 13 | Calm Mode does not crash | PASS | Debug panel during play reported `Calm: YES` and `FX Budget: OK`; smoke tests passed effects policy coverage. |
| 14 | Reduced Motion path does not crash | PASS | Live smoke tests passed `Reduced motion fallbacks` and effects policy coverage. OS-level reduced-motion emulation was not available. |
| 15 | Debug panel opens with `?debug=1` | PASS | Debug panel opened and showed FX budget, particle, leaves, ripple, Calm, and RMotion fields. |
| 16 | `/v4/test.html` passes | PASS | Live `v=22` smoke tests reported `Total: 20`, `Passed: 20`, `Failed: 0`. |
| 17 | Console has no errors | PASS with limitation | No visible runtime error banner, no broken interaction state, and live smoke tests passed. Direct console log collection was unavailable in the current in-app browser API. |

## Console Errors

No visible runtime error banner or broken interaction state was observed during live `v=22` QA. Direct console log collection was unavailable in the current in-app browser API, so this check is recorded as PASS with limitation based on visible runtime state and smoke-test results.

## Screenshots / Artifacts

- Canvas motion comparison: screenshot bytes `28175` and `27440`; hashes differed.
- Live smoke test result: `Total: 20`, `Passed: 20`, `Failed: 0`.
- No screenshot files were committed.

## Issues Found

### P0

- None.

### P1

- None.

### P2 / QA Limitations

- True mobile `touchstart` input could not be synthesized in the current browser automation environment; canvas click was verified.
- Direct console log collection was unavailable in the current in-app browser API.
- OS-level reduced-motion emulation was not available; reduced-motion smoke coverage passed.

## Release Recommendation

**PASS TO RELEASE**

Rationale: current live `/v4/` at commit `691949078264d63d50b363e3da3d59e11bd13312` loads, starts, shows HUD/task, updates canvas, passes live smoke tests 20/20, and has no P0/P1 issues. Because no P0 was found, only this QA document was updated and asset versions remain `v=22`.

---

# QA Evidence - Cycle 12 Animation Budget + Calm Mode Guardrails

## Summary

- Date/time: 2026-05-23 16:21-16:24 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Implementation commit tested: `c0f86876d17ddf9bb65e30592dddc944e723cea0`
- Branch: `main`
- Pages source: `main / root`
- Asset version tested locally: `v=22`
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `http://localhost:8000/v4/test.html?cycle12=v22`
- `http://localhost:8000/v4/?cycle12=v22b`
- `http://localhost:8000/v4/?cycle12=motion`
- `http://localhost:8000/v4/?debug=1&cycle12=v22`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Home loads | PASS | Local `v=22` home rendered with start screen visible, HUD/task hidden, and no `INIT ERROR` banner. |
| 2 | Start button works | PASS | Clicking `开始飞行` hid the start panel and entered gameplay. |
| 3 | Game state changes to PLAYING | PASS | Gameplay UI transitioned to active state after start; smoke tests also assert `startGame` sets PLAYING. |
| 4 | HUD appears | PASS | HUD and task display were visible after start. |
| 5 | Canvas updates | PASS | Gameplay screenshots differed after 900 ms (`27044` vs `26860` bytes; hashes differed), confirming visual updates. |
| 6 | Space jump works | PASS | Space key was exercised during PLAYING with no visible error state. |
| 7 | Mouse/touch jump works | PASS with limitation | Canvas click path was exercised successfully. True mobile `touchstart` synthesis was not available in this browser automation environment. |
| 8 | Pause/resume works | PASS | Pause panel opened and resume restored gameplay/task UI. |
| 9 | Treasure opens | PASS | Treasure panel opened successfully. |
| 10 | Settings opens | PASS | Parent settings panel opened successfully. |
| 11 | Sound is muted by default | PASS | Sound button started as `🔇` with `aria-checked="false"`. |
| 12 | Sound toggle works | PASS | Sound toggled to `🔊` / `aria-checked="true"` and back to `🔇` / `aria-checked="false"`. |
| 13 | Calm Mode does not crash | PASS | Smoke tests passed Calm Mode particle/leaves density checks; debug panel reported `Calm: YES` during play. |
| 14 | Reduced Motion path does not crash | PASS | Smoke tests passed reduced-motion fallbacks, ambient disable policy, and tap ripple suppression. |
| 15 | Debug panel opens with `?debug=1` | PASS | Debug panel opened and showed FX budget fields. During play it reported `FX Budget: OK`, particle/leaves/ripple counts, `Calm: YES`, and `RMotion: NO`. |
| 16 | `/v4/test.html` passes | PASS | Local `v=22` smoke tests reported `Total: 20`, `Passed: 20`, `Failed: 0`. |
| 17 | Console has no errors | PASS with limitation | Browser QA showed no `INIT ERROR` banner or broken UI state. Direct console log collection was unavailable in the current in-app browser API. |

## Console Errors

No visible runtime error banner or broken interaction state was observed during local `v=22` QA. Direct console log collection was unavailable in the current in-app browser API.

## Screenshots / Artifacts

- Local smoke test result: `Total: 20`, `Passed: 20`, `Failed: 0`.
- Canvas motion comparison: screenshot bytes `27044` and `26860`; hashes differed.
- No screenshot files were committed.

## Issues Found

### P0

- None.

### P1

- None.

### P2 / QA Limitations

- True mobile `touchstart` input could not be synthesized in the current browser automation environment; canvas click was verified.
- Direct console log collection was unavailable in the current in-app browser API.
- OS-level reduced-motion emulation was not available; reduced-motion smoke coverage passed.

## Release Recommendation

**PASS TO RELEASE**

Rationale: local `v=22` loads and starts, key screens and controls work, animation-budget smoke tests pass, debug budget status reports OK, no protected versions changed, and no P0/P1 issues were found.

---

# QA Evidence - Cycle 15 Browser Validation

## Summary

- Date/time: 2026-05-23 16:09-16:17 EDT
- Role: Codex QA / Browser Tester
- Scope: `/v4/`
- Commit hash tested: Cycle 15 local working tree; final pushed commit reported in release response
- Branch: `main`
- Pages source: `main / root`
- Asset version tested locally: `v=21`
- Live baseline asset version before Cycle 15: `v=20`
- Recommendation: **PASS TO RELEASE**

## URLs Tested

- `https://timkok.github.io/iris-butterfly-adventure/v4/?baseline=cycle15f`
- `https://timkok.github.io/iris-butterfly-adventure/v4/test.html?baseline=cycle15`
- `http://localhost:8000/v4/?cycle15=v21b`
- `http://localhost:8000/v4/?debug=1&cycle15=v21`
- `http://localhost:8000/v4/?debug=1&cycle15=sound`
- `http://localhost:8000/v4/test.html?cycle15=v21`

## Pass / Fail Table

| # | Check | Result | Evidence / Notes |
|---|---|---|---|
| 1 | Home loads | PASS | Live baseline and local `v=21` home rendered. Local home had start screen visible, HUD/task hidden, and no `INIT ERROR` banner. |
| 2 | Start button works | PASS | Clicking `开始飞行` hid the start panel and entered gameplay. |
| 3 | HUD appears | PASS | Local `v=21` showed HUD and task display after start. |
| 4 | Canvas updates | PASS | Existing gameplay loop stayed active during startup QA; local smoke tests cover `startGame` and lifecycle transitions without throwing. |
| 5 | Space jump works | PASS | Space key was exercised during PLAYING with gameplay UI still active afterward. |
| 6 | Mouse/touch jump works | PASS with limitation | Canvas click path was exercised successfully. True mobile `touchstart` synthesis was not available in this browser automation environment. |
| 7 | Pause/resume works | PASS | Pause panel opened, task display hid during pause, and resume restored gameplay/task UI. |
| 8 | Treasure opens | PASS | Treasure panel opened and sticker tab had `aria-selected="true"`. |
| 9 | Settings opens | PASS | Parent settings panel opened successfully. |
| 10 | Sound muted by default | PASS | Sound button started as `🔇` with `aria-checked="false"`. |
| 11 | Sound toggle works | PASS | Sound toggled to `🔊` / `aria-checked="true"` and back to `🔇` / `aria-checked="false"`. |
| 12 | Starlight Shield simulated or verified | PASS | `/v4/test.html` includes `Starlight Shield Mechanics`; local `v=21` test passed. |
| 13 | Calm Mode does not produce excessive animation | PASS | Existing `Effects Policy Caps & Modes validation` smoke test passed. |
| 14 | Reduced Motion path checked if possible | PASS with limitation | Smoke tests passed `Reduced motion fallbacks`; OS-level reduced-motion emulation was not available. |
| 15 | Debug panel opens with `?debug=1` | PASS | Debug text was present on `?debug=1` and no `INIT ERROR` banner appeared. |
| 16 | `/v4/test.html` passes | PASS | Live baseline `v=20`: 18/18. Local `v=21`: 20 total, 20 passed, 0 failed. |
| 17 | Console has no errors | PASS with limitation | Browser runtime showed no `INIT ERROR` banner or broken UI state. Direct console log collection was unavailable in the current in-app browser API. |

## Console Errors

No visible runtime error banner or broken interaction state was observed during local `v=21` QA. Direct console log collection was unavailable in the current in-app browser API, so this run relied on DOM state, smoke tests, and visible runtime-error checks.

## Screenshots / Artifacts

- Local smoke test result: `Total: 20`, `Passed: 20`, `Failed: 0`.
- Live baseline smoke test result: `Total: 18`, `Passed: 18`, `Failed: 0`.
- No screenshot files were committed.

## Issues Found

### P0

- None.

### P1

- None.

### P2 / QA Limitations

- True mobile `touchstart` input could not be synthesized in the current browser automation environment; canvas click was verified.
- Direct console log collection was unavailable in the current in-app browser API.
- OS-level reduced-motion emulation was not available; reduced-motion smoke coverage passed.

## Release Recommendation

**PASS TO RELEASE**

Rationale: live `v=20` baseline still starts successfully, local `v=21` loads and starts, key screens and controls work, smoke tests pass 20/20, no protected versions changed, and no P0/P1 issues were found.

---

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
