# CODEX Backlog - V4

Scope: `/v4/` only.

Planning role: Product + UX + Accessibility Reviewer.

Last reviewed against:
- `/v4/AGENT_HANDOFF.md`
- `/v4/index.html`
- `/v4/style.css`
- `/v4/js/config.js`
- `/v4/js/game.js`
- `/v4/js/ui.js`
- `/v4/js/director.js`
- `/v4/js/canvas.js`
- `/v4/js/rewards.js`
- `/v4/js/smoke-tests.js`

Design constraints:
- Child-friendly rainbow garden flying game.
- Default muted.
- No addictive retention loops.
- No daily streaks.
- No gacha.
- No purchase-like wording.
- Reduced motion must be respected.
- Calm Mode must reduce effects.
- Every new animation needs an off/reduced path.
- Keep `/v4/` playable at all times.
- Preserve `/legacy-v1/`, root V2, and `/v3/`.

## Next 5 Cycles

1. Cycle 14: stabilize startup regression coverage and state transitions after the P0 hotfix.
2. Cycle 15: improve child-friendly onboarding, mission clarity, and early-game rhythm.
3. Cycle 16: polish treasure UX, sticker grouping, and unlock communication without purchase metaphors.
4. Cycle 17: deepen accessibility and safety coverage for keyboard, screen reader, reduced motion, and Calm Mode.
5. Cycle 18: add release-quality QA evidence, browser smoke checks, and regression documentation.

## 1. P0 Hotfix / Stability

### P0-1: Lock down the start-game path after the recent runtime failure

- Problem: The recent P0 showed that unit-style smoke tests could pass while the browser runtime failed after clicking "开始飞行". Startup, HUD rendering, and the animation loop need stronger regression coverage.
- Proposed change: Add a browser-oriented smoke checklist and a small code-level smoke test that verifies `init()`, start-button binding, `game.startGame()`, `state.gameState === 'PLAYING'`, HUD visibility, and continued frame progression.
- Files likely affected: `/v4/js/smoke-tests.js`, `/v4/test.html`, `/v4/AGENT_HANDOFF.md`.
- Risk level: Medium. Tests touch setup assumptions and can become brittle if they duplicate too much DOM.
- Test plan: Run `/v4/test.html`; run local browser QA on `/v4/`; click "开始飞行"; wait 1 second; verify HUD appears and frame/canvas state changes; confirm no console errors.
- Acceptance criteria: `/v4/test.html` passes; the start path fails loudly if `ui`, `canvas`, `game`, `state`, or button binding is missing; no gameplay behavior changes are introduced.

### P0-2: Normalize game lifecycle transitions

- Problem: START, PLAYING, PAUSED, and GAMEOVER transitions are spread across `game.js` and `ui.js`; recent fixes touched HUD visibility and state reset paths, so future edits could reintroduce hidden HUD, stale task display, or unclosed overlays.
- Proposed change: Document and then centralize lifecycle invariants in a small helper or consistent call pattern: START hides HUD/task, PLAYING shows HUD/task, PAUSED shows pause panel with HUD, GAMEOVER hides task/HUD and shows final report.
- Files likely affected: `/v4/js/game.js`, `/v4/js/ui.js`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. Lifecycle changes affect every screen.
- Test plan: Browser QA: start, pause, resume, restart from pause, return home, force or simulate Game Over, then return home again. Confirm UI visibility after each transition.
- Acceptance criteria: No state leaves task display visible on START or GAMEOVER; no overlay remains active during PLAYING; restart clears obstacles, stars, particles, leaves, tap ripples, messages, and transient timers.

### P0-3: Fix parent life-setting override regression risk

- Problem: `storage.loadAll(state)` applies parent life settings, but `startGame()` immediately overwrites lives from `director.getCurrentDifficulty()`. This risks making the "3 hearts / 5 hearts" parent setting ineffective outside practice mode.
- Proposed change: Define the intended source of truth for starting lives and update startup logic so parent settings apply to the next run while practice remains infinite.
- Files likely affected: `/v4/js/game.js`, `/v4/js/director.js`, `/v4/js/storage.js`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. It changes initial game-state setup and must not affect practice mode.
- Test plan: Set parent lives to 3, start easy, verify 3 hearts. Set parent lives to 5, start normal, verify 5 hearts. Set practice, verify infinite hearts. Run `/v4/test.html`.
- Acceptance criteria: Parent lives setting takes effect on the next new run; practice mode always shows infinite hearts; no mid-run settings save mutates current run lives.

## 2. P1 Product / Gameplay

### P1-1: Refine early-game onboarding rhythm

- Problem: The current director suppresses obstacles for 120 frames and spawns starter stars, but the experience still needs explicit validation that the first 2 seconds teach tapping without surprise collisions.
- Proposed change: Treat the first 2 seconds as a named onboarding phase with documented behavior: no obstacles, 1-2 safe stars, a single gentle hint, and no high-priority messages competing with controls.
- Files likely affected: `/v4/js/director.js`, `/v4/js/game.js`, `/v4/js/config.js`, `/v4/js/smoke-tests.js`.
- Risk level: Low to Medium. Spawn timing changes can affect missions and perceived difficulty.
- Test plan: Start practice/easy/normal/hard and record the first 3 seconds. Verify no obstacle appears before frame 120 and starter stars are reachable.
- Acceptance criteria: First obstacle never appears before 2 seconds; at least one starter star appears before the first obstacle; the game remains playable in all modes.

### P1-2: Make mission completion copy consistent and non-disruptive

- Problem: Mission messages are defined in config, but the desired 10-star completion copy is product-specific: "任务完成！继续挑战更高分吧 ✨". Parent-message popups should remain rare and not interrupt normal collection.
- Proposed change: Standardize mission completion feedback across missions with a soft priority system. The 10-star mission should use the exact approved copy; parent message should trigger only for important milestones or Game Over new records.
- Files likely affected: `/v4/js/config.js`, `/v4/js/missions.js`, `/v4/js/game.js`, `/v4/js/ui.js`, `/v4/js/smoke-tests.js`.
- Risk level: Low. Mostly copy and message priority, but timing can affect child experience.
- Test plan: Simulate each mission completion; collect 10 stars; verify parent message cadence at 10, 15, and Game Over new record only.
- Acceptance criteria: 10-star completion shows the exact message; regular star collection does not spam overlay messages; game continues after task completion.

### P1-3: Tune practice and easy mode for younger children

- Problem: Practice and easy are intended to be forgiving, but future stage scaling can still narrow gaps and increase spawn pressure as score rises.
- Proposed change: Add explicit child-friendly floors for practice/easy that preserve wide gaps and slower pacing through warmup and garden phases while leaving hard mode challenging.
- Files likely affected: `/v4/js/config.js`, `/v4/js/director.js`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. Difficulty tuning affects long-run balance and mission completion.
- Test plan: Compare gap, speed, and spawn rate at scores 0, 6, 16, and 31 for all modes. Browser QA 30 seconds in practice and easy.
- Acceptance criteria: Practice remains the slowest and widest mode; easy remains visibly more forgiving than normal; hard remains the fastest and narrowest; no mode generates impossible gaps.

### P1-4: Clarify shield behavior for children

- Problem: The Starlight Shield mechanic is useful, but the UI only shows `✨🛡` in HUD and a short message, which may not clearly teach that one collision is protected.
- Proposed change: Add a soft, non-animated or reduced-motion-friendly shield status in HUD and pause/final report text. Keep it explanatory, not achievement-driven.
- Files likely affected: `/v4/index.html`, `/v4/style.css`, `/v4/js/ui.js`, `/v4/js/game.js`, `/v4/js/canvas.js`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. HUD changes can crowd small screens.
- Test plan: Collect 3 stars in easy/normal, verify shield HUD state; collide once, verify lives stay the same and status clears; verify reduced motion avoids flicker.
- Acceptance criteria: Children can tell when shield is active; shield has no purchase/loot framing; Calm Mode and reduced motion avoid flashy effects.

## 3. P1 UX / UI

### P1-5: Align how-to copy with current obstacle and star rules

- Problem: `/v4/index.html` still says "收集美丽的星星吧", while prior product copy requested clearer wording about flower-vine gaps, obstacles, and shiny stars.
- Proposed change: Update how-to text to concise, child-friendly gameplay guidance that mentions click/space, flying upward, flower-vine gaps, avoiding obstacles, and collecting shiny stars.
- Files likely affected: `/v4/index.html`.
- Risk level: Low. Copy-only change.
- Test plan: Open how-to screen and verify the exact copy is visible; check no layout overflow on 320px width.
- Acceptance criteria: How-to copy is current, clear, and does not imply punishment or failure.

### P1-6: Reduce start-screen clutter while preserving version navigation

- Problem: The start screen includes V3 and V2 navigation alongside core actions. This is useful for version preservation but competes with the child player's primary path.
- Proposed change: Move version navigation into a smaller "older versions" footer area or secondary affordance while keeping title, difficulty, start, how-to, treasure, and settings visually primary.
- Files likely affected: `/v4/index.html`, `/v4/style.css`, `/v4/js/smoke-tests.js`.
- Risk level: Low to Medium. Navigation must still remain available and protected versions must not be modified.
- Test plan: Browser visual QA at desktop, 400x600, and 320px width. Verify V2/V3 links still work and no UI overlaps.
- Acceptance criteria: Primary start UI is cleaner; V2/V3 links remain available but visually secondary; no protected files are touched.

### P1-7: Improve treasure tab hierarchy and locked-state comprehension

- Problem: Treasure cards show locked states, but children may still interpret disabled cosmetic buttons as broken, and current tabs can be visually similar to ordinary buttons.
- Proposed change: Strengthen tab semantics and visual hierarchy; ensure every locked card says "未解锁" plus a clear high-score requirement; ensure current cosmetic says "使用中" and owned inactive says "使用".
- Files likely affected: `/v4/index.html`, `/v4/style.css`, `/v4/js/rewards.js`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. Treasure rendering is dynamic and localStorage-dependent.
- Test plan: Test with high scores 0, 12, 25, and 50; switch stickers/cosmetics; verify button labels and ARIA labels; run reduced-motion mode.
- Acceptance criteria: Tabs are obvious; locked/owned/active states are visually and textually clear; no purchase-like wording appears.

### P1-8: Remove inline styles from key panels over time

- Problem: Several important UI elements use inline styles in `index.html`, making visual consistency and accessibility review harder.
- Proposed change: Move repeated inline styles for notices, final report headings, rest tips, and encouragement text into named CSS classes.
- Files likely affected: `/v4/index.html`, `/v4/style.css`.
- Risk level: Low. Visual-only refactor, but must avoid layout drift.
- Test plan: Visual QA for settings, pause, Game Over, and reduced-motion notice before/after. Run `/v4/test.html`.
- Acceptance criteria: No visible regressions; named classes cover the same styles; future reviewers can find and adjust UI styling in CSS.

## 4. P1 Accessibility / Safety

### P1-9: Complete ARIA labels and roles for all overlay controls

- Problem: Main emoji buttons have ARIA labels, but several panel controls do not yet have explicit labels or state semantics, including resume/restart/back buttons and some settings controls.
- Proposed change: Add or verify accessible names for all controls. Use `aria-selected` and `role="tablist"` for treasure tabs, `role="radio"`/`aria-checked` for difficulties, and clear labels for pause/resume/restart/back controls.
- Files likely affected: `/v4/index.html`, `/v4/js/ui.js`, `/v4/js/rewards.js`, `/v4/js/smoke-tests.js`.
- Risk level: Low to Medium. Attribute changes are safe but can drift with dynamic rendering.
- Test plan: DOM audit for every `button`, `select`, and `input`; keyboard tab through start, treasure, settings, pause, and Game Over; run smoke tests.
- Acceptance criteria: Every interactive control has an accessible name; tabs and difficulty buttons expose current state; no duplicate or misleading labels.

### P1-10: Define reduced-motion and Calm Mode acceptance rules

- Problem: Reduced motion and Calm Mode are implemented across CSS, canvas, entities, and rewards, but acceptance expectations are scattered and easy to miss when adding new animation.
- Proposed change: Add a short QA matrix to the backlog/handoff or smoke tests: ambient effects off/reduced, particles capped, no flicker in Calm Mode, no start-button breathing under reduced motion, and no new animation without a reduced path.
- Files likely affected: `/v4/js/smoke-tests.js`, `/v4/style.css`, `/v4/AGENT_HANDOFF.md`, optional `/v4/docs/`.
- Risk level: Low. Documentation and tests reduce risk.
- Test plan: Browser with `prefers-reduced-motion: reduce`; settings Calm Mode on/off; compare particles, leaves, ripples, treasure animations, and shield halo.
- Acceptance criteria: Reduced motion disables or minimizes nonessential animation; Calm Mode reduces particle density and movement; focus indicators remain visible.

### P1-11: Protect against accidental addictive patterns

- Problem: Rewards and unlocks are useful, but future contributors could accidentally add daily streaks, countdown pressure, purchase-like wording, or randomized reward mechanics.
- Proposed change: Add explicit product guardrails in backlog and tests or comments around rewards: high-score unlocks only, no daily streaks, no gacha, no store, no currency, no "buy", no urgency timers.
- Files likely affected: `/v4/CODEX_BACKLOG.md`, `/v4/js/config.js`, `/v4/js/rewards.js`, `/v4/js/smoke-tests.js`.
- Risk level: Low. Mostly guardrails; test wording scan can be simple.
- Test plan: Search UI text and config for banned terms and patterns; verify treasure footer says rewards are earned by flying.
- Acceptance criteria: No purchase-like wording; no randomized unlocks; no streaks or daily pressure; treasure remains calm and achievement-light.

### P1-12: Improve keyboard-only play and escape behavior

- Problem: Space and P work, and Escape closes overlays, but keyboard-only navigation through overlays and focus restoration after closing panels should be verified and tightened.
- Proposed change: Ensure focus moves predictably when opening and closing how-to, treasure, settings, pause, and Game Over. Return focus to the triggering button or start button where appropriate.
- Files likely affected: `/v4/js/ui.js`, `/v4/index.html`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. Focus management can accidentally interfere with space-to-jump.
- Test plan: Keyboard-only QA: Tab to each entry, Enter/Space activate, Escape close, start game, Space jump, P pause/resume.
- Acceptance criteria: Keyboard users can operate all screens; Space still controls flight during PLAYING unless focus is in an input/select/textarea; no keyboard trap.

## 5. P1 QA / Testing

### P1-13: Add smoke coverage for required buttons and overlays

- Problem: Existing tests cover many logic paths but do not assert all required buttons exist and bind safely in the real UI.
- Proposed change: Add a selector and click-safety test for difficulty buttons, start, sound, pause, how-to, settings, treasure, tabs, restart, back home, and reset high score.
- Files likely affected: `/v4/js/smoke-tests.js`, `/v4/test.html`.
- Risk level: Medium. Simulated click tests need isolation and cleanup to avoid state leakage.
- Test plan: Run `/v4/test.html`; then browser QA for all overlays. Keep tests deterministic by using fixtures or state reset.
- Acceptance criteria: Missing IDs or broken handlers fail tests; tests clean up local state; no duplicate event listeners are introduced.

### P1-14: Add settings persistence and next-run-effect tests

- Problem: Settings are meant to apply next run, but some settings update current state immediately while speed/tolerance/lives are read through storage at runtime.
- Proposed change: Add tests documenting which settings are immediate and which apply next run, especially lives, speed, tolerance, gentle mode, Calm Mode, and rest reminders.
- Files likely affected: `/v4/js/smoke-tests.js`, `/v4/js/storage.js`, `/v4/js/ui.js`, `/v4/js/director.js`.
- Risk level: Medium. Clarifying behavior may reveal product inconsistencies.
- Test plan: Change settings, start/restart a run, verify speed/gap/lives and mode flags. Confirm saving during non-PLAYING state only.
- Acceptance criteria: Parent settings have predictable timing; settings do not corrupt current run state; practice mode remains infinite lives.

### P1-15: Add responsive browser QA checklist

- Problem: CSS has mobile constraints, safe-area padding, and scrollable settings/treasure panels, but the release checklist needs consistent evidence for small screens.
- Proposed change: Add a documented QA checklist or test notes for 320px, 360px, 400x600, and desktop viewports; verify no text/button overlap and all buttons remain at least 44px tall.
- Files likely affected: `/v4/AGENT_HANDOFF.md`, optional `/v4/QA_EVIDENCE.md`, `/v4/style.css` if issues are found later.
- Risk level: Low. Documentation first; later fixes may be separate.
- Test plan: Browser screenshots for start, playing, pause, treasure, settings, and Game Over at target widths.
- Acceptance criteria: QA can reproduce viewport checks; no viewport has clipped primary controls; scrollable panels keep return/save buttons reachable.

## 6. P2 Nice-to-have

### P2-1: Sticker grouping and filtering

- Problem: The handoff already proposes sticker grouping by unlock type or milestone, but current config has only high-score requirements and no grouping metadata.
- Proposed change: Add simple non-monetary grouping metadata such as "刚开始", "花园", "彩虹" or score bands. Add filter chips that do not hide locked items by default.
- Files likely affected: `/v4/js/config.js`, `/v4/js/rewards.js`, `/v4/style.css`, `/v4/index.html`, `/v4/js/smoke-tests.js`.
- Risk level: Medium. Treasure rendering and accessibility need careful handling.
- Test plan: Test at high scores 0, 10, 25, and 50; verify filters with keyboard and screen reader labels; reduced-motion animations remain suppressed.
- Acceptance criteria: Groups help children understand progress without pressure; no daily/streak/gacha mechanics; locked rewards remain understandable.

### P2-2: Sticker history panel

- Problem: A previous proposal mentions sticker history, but history can easily become a retention loop if presented like a streak or daily log.
- Proposed change: If added, make it a calm "已解锁的小宝贝" list with optional unlock session notes, not dates, streaks, countdowns, or daily goals.
- Files likely affected: `/v4/js/rewards.js`, `/v4/js/storage.js`, `/v4/index.html`, `/v4/style.css`.
- Risk level: Medium. Storage migration and wording require care.
- Test plan: Unlock stickers, reload, verify history persists; reset high score behavior should be explicitly defined.
- Acceptance criteria: History is informational and gentle; no streaks, calendar pressure, or "come back tomorrow" messaging.

### P2-3: Optional visual QA evidence page

- Problem: QA evidence exists from earlier cycles, but ongoing visual regressions would be easier to review if screenshots and checklists are updated in a consistent place.
- Proposed change: Maintain a lightweight `/v4/QA_EVIDENCE.md` or screenshots note per release cycle, without adding dependencies or build tooling.
- Files likely affected: `/v4/QA_EVIDENCE.md`, `/v4/AGENT_HANDOFF.md`.
- Risk level: Low. Documentation only.
- Test plan: Review evidence for current cycle; verify it names viewport, browser, test URL, and result.
- Acceptance criteria: Release Manager can inspect visual coverage without rerunning every manual step; no generated binary churn unless explicitly requested.

### P2-4: Gentle pause background blur

- Problem: The handoff mentions a paused background blur effect, but any new visual effect must respect reduced motion and not obscure text.
- Proposed change: Add a static soft overlay or blur only if it keeps contrast high. Under reduced motion and Calm Mode, use a non-animated solid translucent background.
- Files likely affected: `/v4/style.css`, `/v4/js/ui.js`.
- Risk level: Low to Medium. Blur can hurt contrast or performance on mobile.
- Test plan: Pause in all modes, test 320px width, test reduced motion and Calm Mode, verify text contrast.
- Acceptance criteria: Pause panel remains readable; no animation is required; reduced path is static and calm.

## 7. Do Not Add

### DNA-1: Do not add daily streaks or comeback pressure

- Problem: Daily streaks and comeback prompts can create addictive retention loops, which conflicts with the child-friendly safety constraints.
- Proposed change: Reject proposals for daily streak counters, daily rewards, missed-day warnings, countdowns, push-like reminders, or "come back tomorrow" mechanics.
- Files likely affected: None unless removing accidental wording in `/v4/js/config.js`, `/v4/js/rewards.js`, or `/v4/index.html`.
- Risk level: High if violated. It changes the product posture.
- Test plan: Text and config scan for daily/streak/countdown language before release.
- Acceptance criteria: No daily streak or urgency mechanics exist anywhere in `/v4/`.

### DNA-2: Do not add gacha, randomized rewards, or store metaphors

- Problem: Randomized rewards and store-like wording can confuse children and resemble monetization even without payments.
- Proposed change: Keep all unlocks deterministic through high score or clear progress. Avoid "buy", "price", "shop", "currency", "loot", "draw", "spin", or "limited" language.
- Files likely affected: None unless cleaning wording in `/v4/js/rewards.js`, `/v4/js/config.js`, `/v4/index.html`.
- Risk level: High if violated. It undermines parent trust.
- Test plan: Text scan for purchase-like wording; review treasure UI manually.
- Acceptance criteria: Rewards are deterministic, transparent, and non-commercial; treasure footer remains clear that there are no purchases.

### DNA-3: Do not add frameworks, bundlers, or build tooling

- Problem: The project is intentionally native HTML/CSS/JS. New tooling would add maintenance and deployment complexity for a small static game.
- Proposed change: Continue using plain files under `/v4/`, native tests, and GitHub Pages static hosting.
- Files likely affected: None. Do not add package manifests, build configs, generated bundles, or framework directories.
- Risk level: High if violated. It conflicts with repository instructions.
- Test plan: Release Manager checks diff for new dependency files or build artifacts.
- Acceptance criteria: No new dependencies, frameworks, package managers, or build steps are introduced.

### DNA-4: Do not change protected versions or GitHub Pages source

- Problem: `/legacy-v1/`, root V2, and `/v3/` are preserved versions. GitHub Pages source is already established as `main / root`.
- Proposed change: Keep all work scoped to `/v4/`; do not edit protected versions or Pages settings unless the user explicitly requests it.
- Files likely affected: None unless a future task explicitly expands scope.
- Risk level: High if violated. It can break older playable versions.
- Test plan: `git diff --name-only` before commit must show only `/v4/` files for V4 work.
- Acceptance criteria: Protected areas remain untouched; Pages source remains unchanged.
