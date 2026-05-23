# Agent Handoff - Multi-Agent Discussion Protocol

## Required Pre-Code Discussion
Before any future cycle modifies implementation code, the agents must write the discussion in this file first. Builder may not modify code until all four role sections below are present for the cycle.

1. **Planner**
   - Proposed tasks.
   - Why each task matters.
   - Risk level.
   - Acceptance criteria.
2. **Builder**
   - Implementation plan.
   - Files to modify.
   - Rollback plan.
3. **QA**
   - Test plan.
   - Browser scenarios.
   - Pass/fail criteria.
4. **Release Manager**
   - Release checklist.
   - Version bump requirement.

## Enforcement Rules
- The discussion must be written into `/v4/AGENT_HANDOFF.md`.
- Only after the discussion is complete may Builder modify code.
- Stability or QA-only cycles that do not change code still need QA evidence, but do not need an asset version bump.
- If code changes after the discussion, update the same cycle section with implementation notes, QA results, release notes, commit hashes, and any deviations.

## Simplification Audit Every 5 Cycles
Every 5 cycles, run a Simplification Audit instead of adding features. The audit must answer:

1. Is V4 still easy for a child to understand?
2. Are there too many effects?
3. Does start still work?
4. Does browser QA pass?
5. Does reduced motion suppress animations?
6. Is Calm Mode noticeably calmer?
7. Is code becoming too coupled?
8. Can any recent feature be simplified?
9. Are tests covering browser startup?
10. Are protected versions untouched?

Audit output must classify findings as:

- `keep`
- `simplify`
- `defer`
- `remove only with user confirmation`

Do not remove files, protected versions, or product features during the audit without explicit user confirmation.

---

# Agent Handoff - Cycle 13 Safety and QA Guardrails

## Start Gate
- Live URL checked: `https://timkok.github.io/iris-butterfly-adventure/v4/?start-gate=cycle13`
- Result: PASS.
- Evidence: before start, home was visible and HUD/task were hidden; after clicking "开始飞行", home hid and HUD/task appeared; no `INIT ERROR` banner.
- Current asset version before Cycle 13: `v=22`.

## Planner Discussion
- Proposed Tasks:
  1. **P1-11**: Add a smoke test that scans player-facing safety text for addictive or purchase-like patterns while allowing explicit "no purchase" safety statements.
  2. **P1-10**: Add a concise reduced-motion and Calm Mode QA matrix under `/v4/docs/`.
  3. **P1-15**: Add responsive browser QA checkpoints to the same QA matrix so small-screen checks are repeatable.
- Why They Matter:
  - The game is for children, so future contributors need guardrails against daily pressure, gacha-like framing, purchase wording, and animation overload.
  - Reduced motion and Calm Mode now span several files; a written matrix makes release review less dependent on memory.
  - Responsive QA is required for the narrow mobile game container, but the current release notes scatter that expectation.
- Risk Level:
  - Low. This cycle adds test/documentation guardrails and does not add gameplay systems or visual effects.
- Acceptance Criteria:
  - `/v4/test.html` passes.
  - Browser QA confirms V4 still starts.
  - The safety text test rejects banned retention/purchase patterns but does not fail on approved "no purchase" notices.
  - `/v4/docs/QA_MATRIX.md` exists and covers reduced motion, Calm Mode, and responsive scenarios.
  - Protected versions remain untouched.

## Builder Discussion
- Implementation Plan:
  - Add a deterministic smoke test in `/v4/js/smoke-tests.js` for player-facing reward/safety copy and config strings.
  - Add `/v4/docs/QA_MATRIX.md` with reduced-motion, Calm Mode, and responsive browser QA checkpoints.
  - Increment `/v4/index.html` and `/v4/test.html` assets from `v=22` to `v=23` because test JavaScript changes.
- Files To Modify:
  - `/v4/js/smoke-tests.js`
  - `/v4/docs/QA_MATRIX.md`
  - `/v4/index.html`
  - `/v4/test.html`
  - `/v4/AGENT_HANDOFF.md`
  - `/v4/QA_EVIDENCE.md`
- Rollback Plan:
  - Revert the Cycle 13 commit to remove the smoke test, QA matrix, version bump, and docs updates.
  - If the new smoke test is too broad, narrow its text source to config and explicitly player-facing DOM copy before retrying.

## QA Discussion
- Test Plan:
  - Run JS syntax checks for all `/v4/js/*.js`.
  - Run `git diff --check`.
  - Run `/v4/test.html` locally and confirm all tests pass.
  - Perform browser startup QA locally on `/v4/`.
  - Check `/v4/?debug=1` for debug panel and FX budget fields.
- Browser Scenarios:
  - Home loads, start button works, HUD/task appear.
  - Space and canvas click keep gameplay active.
  - Pause/resume works.
  - Treasure and settings open.
  - `/v4/test.html` reports all tests passing.
  - Debug panel opens with `?debug=1`.
- Pass/Fail Criteria:
  - PASS if tests pass, start works, no visible `INIT ERROR` or broken state appears, and only `/v4/` files changed.
  - FAIL if start regresses, smoke tests fail, protected files change, or any P0 runtime issue appears.

## Release Manager Discussion
- Release Checklist:
  - Confirm diff is limited to `/v4/`.
  - Confirm no dependencies, build tools, protected versions, deletions, or Pages source changes.
  - Confirm `/v4/index.html` and `/v4/test.html` use `v=23`.
  - Confirm `/v4/test.html` passes.
  - Confirm browser startup QA passes.
  - Commit and push to `main`.
  - Confirm GitHub Pages build reaches `built`.
- Version Bump Requirement:
  - Required, because `/v4/js/smoke-tests.js` changes.

## Implementation Notes
- Added `Child safety reward text avoids pressure and purchase framing` smoke test.
- Added `/v4/docs/QA_MATRIX.md` with reduced-motion, Calm Mode, responsive, and child-safety copy checklists.
- Incremented `/v4/index.html` and `/v4/test.html` assets from `v=22` to `v=23`.
- No gameplay systems or visual effects were added.

## QA Results
- JS syntax check: PASS
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
- Diff whitespace check: PASS
  - `git diff --check`
- Local browser smoke tests: PASS
  - `http://localhost:8000/v4/test.html?cycle13=v23`: 21 total, 21 passed, 0 failed.
- Local browser startup QA: PASS
  - `http://localhost:8000/v4/?cycle13=v23` loaded with home HUD/task hidden.
  - Clicking "开始飞行" showed HUD/task and hid the start screen.
  - Space and canvas click paths were exercised.
  - Pause/resume, treasure, settings, and debug panel paths were exercised.
  - No visible `INIT ERROR` banner or broken UI state was observed.
- Live post-push QA: PASS
  - `https://timkok.github.io/iris-butterfly-adventure/v4/test.html?cycle13=v23`: 21 total, 21 passed, 0 failed.
  - `https://timkok.github.io/iris-butterfly-adventure/v4/?cycle13=v23`: clicking "开始飞行" showed HUD/task and hid the start screen.

## Release Notes
- Cycle: Cycle 13
- Implementation Commit Hash: `a6478b461596510c42f0ee85ca0a6a5375f2d91f`
- Release Docs Commit Hash: pending until release docs commit.
- Pushed Branch: main.
- Pages Source: main / root.
- Asset Version: v=23.
- QA Status: PASS TO RELEASE.
- V4 URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html

## Next Cycle Proposal
- Cycle 14 should pick at most 3 items. Candidate: keyboard-only focus restoration, settings next-run-effect tests, or treasure locked-state comprehension.

---

# Agent Handoff - Cycle 12 Animation Budget + Calm Mode Guardrails

## Builder Plan
- Role: Codex Builder
- Task Type: stability
- Scope: `/v4/` only
- Selected Tasks:
  - Centralize the missing reduced-motion effect policy flags in `/v4/js/config.js`.
  - Enforce reduced-motion stagger and ripple policies through existing V4 effect code.
  - Extend smoke coverage for animation-budget policy fields, Calm Mode density reduction, and reduced-motion tap ripple suppression.
  - Increment asset versions from `v=21` to `v=22`.

## Implementation Notes
- Added explicit `reducedMotionDisableStagger` and `reducedMotionDisableRipple` fields to `EFFECTS_POLICY`.
- Updated tap ripple suppression to use `reducedMotionDisableRipple`.
- Updated treasure stagger suppression to use `reducedMotionDisableStagger`.
- Replaced the sticker seen timer magic number with `EFFECTS_POLICY.stickerCelebrationMs`.
- Extended `Effects Policy Caps & Modes validation` smoke coverage.
- No visual effects or gameplay systems were added.
- Asset Version:
  - `/v4/index.html`: `v=22`
  - `/v4/test.html`: `v=22`

## QA Results
- JS syntax check: PASS
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
- Diff whitespace check: PASS
  - `git diff --check`
- Local browser smoke tests: PASS
  - `http://localhost:8000/v4/test.html?cycle12=v22`: 20 total, 20 passed, 0 failed.
- Local browser startup QA: PASS
  - `http://localhost:8000/v4/?cycle12=v22b` loaded with home HUD/task hidden.
  - Clicking "开始飞行" showed HUD/task and hid the start screen.
  - Space and canvas click paths were exercised.
  - Pause/resume, treasure, settings, debug, and sound toggle paths were exercised.
  - Canvas screenshots changed after 900 ms, confirming visible canvas updates.
  - No visible `INIT ERROR` banner or broken UI state was observed.
- QA Evidence:
  - `/v4/QA_EVIDENCE.md` updated with Cycle 12 PASS TO RELEASE.

## Release Notes
- Cycle: Cycle 12 requested stability cycle
- Implementation Commit Hash: `c0f86876d17ddf9bb65e30592dddc944e723cea0`
- QA Evidence Commit Hash: final pushed commit reported in release response.
- Pushed Branch: main.
- Pages Source: main / root.
- Asset Version: v=22.
- QA Status: PASS TO RELEASE.
- V4 URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html

---

# Agent Handoff - Cycle 15 Workflow Setup

## Planner Baseline
- Role: Codex Planner / Workflow Coordinator
- Task Type: QA baseline + stability cycle setup
- Scope: `/v4/` only, plus root `AGENTS.md` workflow rules.
- Current Baseline:
  - Latest completed release: Cycle 14.
  - Current asset version: `v=20`.
  - Latest known release commit before this setup: `f99c391d105bfce66571a379eaa1288585f9d5e6`.
  - Pages source remains `main / root`.
- Cycle Numbering:
  - User asked to begin the workflow and execute "Cycle 11" if QA passes.
  - Repository handoff and QA evidence already record Cycle 14 as released, so the next sequential cycle is Cycle 15 to preserve release history.
- Selected Cycle 15 Tasks:
  - **P0-1**: Lock down the start-game path after the recent runtime failure.
  - **P0-2**: Normalize lifecycle transition expectations through smoke coverage before broader refactors.
  - **P1-13**: Add deterministic smoke coverage for required controls/overlays where it can remain isolated.
- Acceptance Criteria:
  - Baseline QA confirms `/v4/` still starts from "开始飞行".
  - `/v4/test.html` passes before and after changes.
  - Any code change stays inside `/v4/`, increments `/v4/index.html` and `/v4/test.html` asset versions, and does not modify protected versions.
  - QA evidence is updated before release.

## Baseline QA
- Status: PASS.
- Live baseline:
  - `/v4/?baseline=cycle15f` loaded with the start screen active and no `INIT ERROR` banner.
  - "开始飞行" started gameplay; HUD and task display appeared.
  - Space and mouse/click input were exercised.
  - Pause/resume, return home, treasure, and settings paths were exercised.
  - `/v4/test.html?baseline=cycle15` passed 18/18 on current live `v=20` assets.
- Limitation:
  - Direct console log collection was unavailable in the current in-app browser API; QA checked visible runtime-error banners, DOM state, and smoke-test results.

## Builder Plan
- Role: Codex Builder
- Task Type: QA / stability
- Scope: `/v4/` only
- Selected Backlog Items:
  - **P0-1**: Lock down the start-game path after the recent runtime failure.
  - **P0-2**: Normalize lifecycle transition expectations through smoke coverage before broader refactors.
  - **P1-13**: Add deterministic smoke coverage for required controls/overlays where it can remain isolated.
- Implementation Plan:
  - Add a reusable smoke-test fixture with the required V4 controls and overlays.
  - Add lifecycle assertions for START, PLAYING, PAUSED, GAMEOVER, and back-to-home visibility rules.
  - Add a required-control hook/accessibility smoke test for the main buttons and overlay panels.
  - Increment `/v4/index.html` and `/v4/test.html` asset versions from `v=20` to `v=21`.

## Implementation Notes
- Added `ensureGameFixture()` to keep DOM setup consistent across smoke tests.
- Added `Lifecycle transitions keep HUD, task, and overlays in sync`.
- Added `Required UI controls and overlays expose stable hooks`.
- No gameplay behavior, product copy, dependencies, or protected versions were changed.
- Asset Version:
  - `/v4/index.html`: `v=21`
  - `/v4/test.html`: `v=21`

## QA Results
- JS syntax check: PASS
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
- Diff whitespace check: PASS
  - `git diff --check`
- Local browser smoke tests: PASS
  - `http://localhost:8000/v4/test.html?cycle15=v21`: 20 total, 20 passed, 0 failed.
- Local browser startup QA: PASS
  - `http://localhost:8000/v4/?cycle15=v21b` loaded with home HUD/task hidden.
  - Clicking "开始飞行" showed HUD/task and hid the start screen.
  - Space and canvas click paths were exercised.
  - Pause/resume, back home, treasure, settings, debug, and sound toggle paths were exercised.
  - No visible `INIT ERROR` banner or broken UI state was observed.
- QA Evidence:
  - `/v4/QA_EVIDENCE.md` updated with Cycle 15 PASS TO RELEASE.

## Release Notes
- Cycle: Cycle 15
- Commit Hash: final pushed commit reported in release response.
- Pushed Branch: main.
- Pages Source: main / root.
- Asset Version: v=21.
- QA Status: PASS TO RELEASE.
- V4 URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html

## Next Cycle Proposal
- Cycle 16 should choose at most 3 low-risk items from `/v4/CODEX_BACKLOG.md`, with priority on early-game onboarding rhythm, mission feedback clarity, or treasure locked-state comprehension.

---

# Agent Handoff - Cycle 14 Builder

## Builder Plan
- Role: Codex Builder
- Task Type: hotfix + UI improvement + accessibility
- Scope: `/v4/` only
- Selected Backlog Items:
  - **P0-3**: Fix parent life-setting override regression risk.
  - **P1-5**: Align how-to copy with current obstacle and star rules.
  - **P1-9**: Complete ARIA labels and roles for overlay controls.
- Implementation Plan:
  - Preserve parent-selected lives from `storage.loadAll(state)` during `startGame()`, while keeping practice mode infinite.
  - Update the how-to text to mention click/space, flower-vine gaps, obstacles, and shiny stars.
  - Add missing accessible labels/roles for overlay controls and treasure tabs without changing gameplay.
  - Increment `/v4/index.html` and `/v4/test.html` asset versions after CSS/JS/HTML changes.
  - Run existing tests and browser startup QA before commit.

## Implementation Notes
- P0-3:
  - `game.startGame()` now preserves the lives value loaded from parent settings via `storage.loadAll(state)`.
  - Practice mode still forces infinite lives.
  - Difficulty lives remain the fallback if a stored lives value is invalid.
- P1-5:
  - Updated the how-to copy to mention screen/Space control, flower-vine gaps, obstacles, and shiny stars.
- P1-9:
  - Added missing accessible labels for settings, how-to close, pause, restart, and back-home controls.
  - Added tablist/tab/tabpanel relationships for treasure tabs and panels.
- Tests:
  - Added a smoke test for parent lives override on `startGame()`.
- Asset Version:
  - `/v4/index.html`: `v=20`
  - `/v4/test.html`: `v=20`

## QA Results
- JS syntax check: PASS
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
- Diff whitespace check: PASS
  - `git diff --check`
- Browser smoke tests: PASS
  - `/v4/test.html?cycle14=v20`: 18 total, 18 passed, 0 failed.
- Browser startup QA: PASS
  - `/v4/?cycle14=v20` loaded with `style.css?v=20` and JS `v=20`.
  - Clicked "开始飞行"; HUD and task display appeared and start screen closed.
  - Space key and canvas click were exercised during PLAYING.
  - Pause and resume worked.
  - How-to screen opened and showed updated copy.
  - Treasure opened; stickers/cosmetics tabs switched with correct ARIA state.
  - Settings opened; key settings controls exposed labels.
  - No `v=20` console errors observed.
- Note:
  - Browser tooling could not synthesize a true mobile `touchstart` event in this environment; the existing touch path was not changed in this cycle.

## Release Notes
- Cycle: Cycle 14
- Commit Hash: 97b56b763566685a8db9e65c7aeaf86c039bdd71
- QA Evidence Commit: de4b48699e46d74574a6b7da714eff80cc30faa0
- Pushed Branch: main
- Pages Source: main / root
- Asset Version: v=20
- QA Status: PASS TO RELEASE (live `/v4/test.html` 18/18 passing, no current-run `/v4/` console errors)
- V4 URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html

---

# Agent Handoff - HOTFIX V4 Start Game Failure

## HOTFIX: V4 start game failure
- Priority: P0
- Task Type: hotfix
- Root Cause:
  - The gameplay loop crashed after pressing "开始飞行" because `updateGame()` referenced `ui.renderHUD()` without declaring `const ui = window.IrisGame.ui;` in that function scope.
  - Adjacent startup state issue: `director.getCurrentDifficulty()` did not return `lives`, so `startGame()` could overwrite loaded lives with `undefined`.
- Files Changed:
  - `/v4/js/game.js`
  - `/v4/js/director.js`
  - `/v4/js/smoke-tests.js`
  - `/v4/index.html`
  - `/v4/test.html`
  - `/v4/AGENT_HANDOFF.md`
- Console Error Before:
  - `ReferenceError: ui is not defined`
  - `at Object.updateGame (http://localhost:8000/v4/js/game.js?v=17:512:13)`
  - `at Object.loop (http://localhost:8000/v4/js/game.js?v=17:577:18)`
  - `at http://localhost:8000/v4/js/game.js?v=17:586:42`
- Console Status After:
  - Local browser QA with final `v=19` assets: no new `/v4/` console errors.
- Tests Run:
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
  - `/v4/test.html?hotfix=v19`: 17 total, 17 passed, 0 failed.
  - Browser QA on `/v4/?hotfix=domqa`: "开始飞行" starts the game, HUD and task display appear, Space and mouse input exercised, pause/restart works, no new `/v4/` console errors.
  - Browser QA on `/v4/?hotfix=overlayqa`: treasure opens, settings opens, Game Over path observed, no new `/v4/` console errors.
  - Browser visual movement check: screenshots differ while playing, confirming the canvas continues updating.
- Asset Version: v=19
- Commit Hash: 525a4de2ec0b4e36c392cb08bfecaee16a5b36c8; final pushed hash reported in release response.

---

# Agent Handoff - Cycle 13

## Cycle 12 Agent Dialogue

1. **Strategist (Product)**:
   "We completed Cycle 12 (Browser Evidence QA Cycle) without introducing new gameplay features, ensuring the core game remains extremely stable, simple, and clean."

2. **UX Designer**:
   "Visual verification across all game screens (Home, Playing, Pause, Treasure, Settings, Game Over) confirms UI layouts are clean, interactive, and responsive under 320px width constraints."

3. **Accessibility Reviewer**:
   "Verified Reduced Motion and Calm Mode displays. Interactive layouts and custom focus indicators remain fully accessible, ensuring a high-quality experience."

4. **Builder**:
   "Successfully created QA_EVIDENCE.md and automated headless Google Chrome to capture visual state screenshots for documentation."

5. **QA**:
   "All 16 programmatic unit tests pass cleanly, and manual/visual checks show no console errors. The game initializes and plays correctly."

6. **Release Manager**:
   "Added QA_EVIDENCE.md with screenshots, verified all tests pass, and pushed Cycle 12 updates to the main branch."

---

## Current Long-Term Goal
持续把 /v4/ 改进成儿童友好的彩虹花园飞行冒险游戏。

## Protected Areas
- /legacy-v1/
- root V2 files
- /v3/

## Active Scope
- /v4/

## Safety Rules
- 禁止运行危险删除指令：`rm -rf /`, `rm -rf ~`, `rm -rf /Users`, `find / -delete`, `git clean -fdx`, `sudo rm` 或任何删除 workspace 目录外的指令。
- 如果要删除 `/v4/` 中的任何文件，必须在此文档写明原因路径并等待用户确认。未确认不得删除。

---

## Product Backlog
由 Product Strategist 维护：
- **P0**: 保持 `/v4/` 稳定可运行、无控制台报错、默认静音、不影响 V1/V2/V3 版。
- **P1**: 贴纸页面支持按解锁类型进行高亮和分组过滤。
- **P2**: 新增贴纸历史记录面板。

## UX Backlog
由 UX Designer 维护：
- **P0**: 交互目标尺寸不小于 44x44px，移动端屏幕 320px 宽度不溢出。

## Accessibility Backlog
由 Accessibility Reviewer 维护：
- **P0**: 默认静音控制、支持 reduced-motion 动态抑制、核心按钮具备清晰 ARIA 属性。

---

## Current Sprint
本轮 Cycle 13 任务：
1. **P1 (Product)**: 宝贝仓库的贴纸页面支持按解锁类型（如 milestone/score 等）进行高亮和分组过滤。
2. **P2 (UX)**: 暂停画面增加动态背景虚化效果。

---

## Release Notes
- Cycle: Cycle 12
- Pushed Branch: main
- Commit Hash: a67bf04
- Pages Source: main / root
- Game URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html
- Asset Version: v=17
- QA Status: PASS (16/16 tests passing, screenshots generated)
- Remaining Issues:
  - None
- Next Cycle Starts Automatically: yes

---

## Next Sprint Proposal
- **P2 (UX)**: 新增贴纸历史记录面板，支持展示解锁日期和时间。
---

# Agent Handoff - Cycle 14 Internationalization QA and English Polish

## Planner Agent Discussion
- Task Type: accessibility + UI improvement + QA.
- Scope: `/v4/` only. Protected versions remain untouched.
- Baseline Finding:
  - User reported V4 is English-first with Chinese switching, but current `main` at `be2e7af0908d3ff733ca72ad1187df450e894665` still has `/v4/index.html` as `lang="zh-CN"` and primary UI copy in Chinese.
  - Current asset version before this cycle: `v=23`.
- Proposed Tasks, max 3:
  1. Establish a core i18n architecture with English default, Chinese switch, persisted language choice, `<html lang>` updates, and polite switch announcements.
  2. Localize primary player-facing surfaces: home, difficulty labels, HUD controls, how-to, settings, treasure, pause, Game Over, missions, reward labels, sound messages, and high-priority gameplay messages.
  3. Add bilingual smoke coverage and backlog notes for any remaining lower-priority strings that should be cleaned in a later cycle.
- Why They Matter:
  - English-first must be real at startup, not just a partial copy pass.
  - Children and assistive-tech users need labels, visible text, and announcements in the same language.
  - Start reliability remains the hard gate; i18n must not break the game loop.
- Risk Level:
  - Medium to High, because this touches script load order, UI binding, storage, and text used during gameplay.
  - Risk is contained by avoiding gameplay feature changes and limiting implementation to primary player-facing text.
- Acceptance Criteria:
  - `/v4/` defaults to English and `document.documentElement.lang === "en"` when no saved language exists.
  - Language switch changes visible labels, ARIA/title attributes, mission display, treasure cards, settings, pause, and Game Over text.
  - Chinese mode persists in localStorage and sets `lang="zh-CN"`.
  - Language switch announces politely: `Language switched to English.` or `已切换到中文。`
  - Clicking `Start Flying` and `开始飞行` both enter PLAYING and show HUD/task UI.
  - `/v4/test.html` passes with bilingual smoke tests.
  - No protected files change.

## Builder Agent Discussion
- Implementation Plan:
  1. Add `/v4/js/i18n.js` with `window.IrisGame.i18n`, English and Chinese dictionaries, language persistence, DOM application helpers, and config synchronization helpers.
  2. Load `i18n.js` before `config.js`, update `/v4/index.html` to English defaults plus language switch/status live region, and bump `/v4/index.html` plus `/v4/test.html` from `v=23` to `v=24`.
  3. Wire existing modules to use i18n helpers for primary UI and dynamic messages: `main.js`, `audio.js`, `ui.js`, `missions.js`, `rewards.js`, and `game.js`.
  4. Update smoke tests for default English, Chinese switching, storage, HTML lang, mission/reward/Game Over localization, and translation-key coverage.
  5. Update backlog and QA evidence after validation.
- Files To Modify:
  - `/v4/index.html`
  - `/v4/test.html`
  - `/v4/js/i18n.js`
  - `/v4/js/config.js`
  - `/v4/js/main.js`
  - `/v4/js/audio.js`
  - `/v4/js/ui.js`
  - `/v4/js/missions.js`
  - `/v4/js/rewards.js`
  - `/v4/js/game.js`
  - `/v4/js/smoke-tests.js`
  - `/v4/CODEX_BACKLOG.md`
  - `/v4/QA_EVIDENCE.md`
  - `/v4/AGENT_HANDOFF.md`
- Rollback Plan:
  - Revert the Cycle 14 commit if startup or tests regress.
  - If tests fail after two repair attempts, stop and return a Builder bug report.

## QA Agent Discussion
- Test Plan:
  - Run syntax checks for all `/v4/js/*.js`.
  - Run `/v4/test.html` locally in browser.
  - Start a local static server and perform browser startup QA for `/v4/`, `/v4/test.html`, and `/v4/?debug=1`.
- Browser Scenarios:
  - English default: home loads, `Start Flying` starts game, HUD/task appear, canvas updates, Space and mouse/touch jump work, pause/resume works, treasure/settings open, sound muted by default and toggle works.
  - Chinese switch: switch to Chinese, `开始飞行` starts game, mission/pause/treasure/settings/Game Over surfaces show Chinese, sound labels update, no console errors.
  - Reduced Motion and Calm Mode paths do not crash.
  - Debug panel opens with `?debug=1`.
- Pass/Fail Criteria:
  - PASS only if start works in both languages, `/v4/test.html` passes, and no visible init/runtime error appears.
  - BLOCK RELEASE for any P0 startup, language-switch, or protected-file issue.

## Release Manager Discussion
- Release Checklist:
  - Confirm QA says `PASS TO RELEASE`.
  - Confirm `git diff --name-only` is limited to `/v4/`.
  - Confirm no dependencies, build tools, deletions, or GitHub Pages source changes.
  - Confirm asset versions are bumped to `v=24` in `/v4/index.html` and `/v4/test.html`.
  - Confirm `/v4/test.html` passes.
  - Commit as `Cycle 14: Internationalization QA and English polish`.
  - Push to `main` only after tests and browser QA pass.
- Pages Source:
  - Expected unchanged: `main / root`.

## Implementation Notes
- Added `/v4/js/i18n.js` as the central English/Chinese dictionary and language runtime.
- Default language is English when no saved language exists.
- Language choice persists to `iris_butterfly_language`.
- Switching language updates:
  - `<html lang>`
  - home/start controls
  - difficulty labels and ARIA labels
  - sound/pause labels
  - how-to, settings, treasure, pause, Game Over
  - mission titles/progress text
  - reward labels/status/ARIA/title
  - key gameplay messages and debug action labels
- Added bilingual smoke coverage for:
  - English default
  - language key parity
  - language switch DOM/storage/lang updates
  - mission/reward/Game Over localized rendering
  - primary visible UI not staying in the wrong language
- Added `/v4/js/i18n-check.js` coverage for missing keys, empty translations, and visible fallback key leaks.
- Fixed a panel-transition click interception bug found during QA by ensuring inactive panels and their children do not receive pointer events.
- Added empty data favicon links to avoid browser `favicon.ico` 404 console noise.
- Asset Version:
  - `/v4/index.html`: `v=24`
  - `/v4/test.html`: `v=24`

## QA Results
- JS syntax check: PASS
  - `for f in v4/js/*.js; do node --check "$f" || exit 1; done`
- Diff whitespace check: PASS
  - `git diff --check`
- Local browser smoke tests: PASS
  - `http://localhost:8000/v4/test.html?cycle14=v24`: 25 total, 25 passed, 0 failed.
- Local bilingual browser QA: PASS
  - English default loads with `lang="en"` and `Start Flying`.
  - `Start Flying` enters PLAYING, HUD/task appears, canvas frame count advances.
  - Space and touch input make the butterfly jump.
  - Pause/resume works in English.
  - Language switch sets `lang="zh-CN"`, persists `iris_butterfly_language=zh`, and announces `已切换到中文。`.
  - `开始飞行` enters PLAYING.
  - Chinese mission, treasure, and settings surfaces render correctly.
  - Settings opens after immediately closing treasure, verifying inactive overlays no longer intercept fast taps.
  - `/v4/?debug=1&cycle14=v24` opens the debug panel.
  - Final browser console/page-error capture: 0 errors.
- QA Evidence:
  - `/v4/QA_EVIDENCE.md` updated with Cycle 14 PASS TO RELEASE.

## Release Notes
- Cycle: Cycle 14 Internationalization QA and English polish
- Commit Hash: 525a4de2ec0b4e36c392cb08bfecaee16a5b36c8.
- Pushed Branch: main.
- Pages Source: main / root.
- Asset Version: v=24.
- QA Status: PASS TO RELEASE.
- V4 URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html

## Next Cycle Proposal
- Cycle 15 should avoid gameplay feature additions unless requested. Recommended next work: a focused cleanup pass for remaining static fallback text and debug-only i18n polish, or a Simplification Audit if cycle numbering is reconciled to a 5-cycle boundary.
