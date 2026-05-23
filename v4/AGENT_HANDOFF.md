# Agent Dialogue Protocol: V4 Cycle

## 1. Strategist
“I propose these gameplay improvements: A Level Director system to regulate game pacing. This includes a 2-second onboarding phase protecting players from obstacles, an adaptive safety gap widening of +20px on obstacle collision, and an encouragement prompt triggered upon 3 consecutive collisions in a single run.”

## 2. UX Designer
“UI impact and layout concerns: A hidden debug tuning panel accessed via triple-D press or URL query string, displaying real-time variables and rendering transparent canvas collision overlays. Additionally, all buttons, settings sliders, and unlockable cards must be sized to meet the 44x44px minimum touch-target size requirement.”

## 3. Accessibility Reviewer
“Accessibility/safety constraints: Implementation of a parent-controlled 'Calm Mode' to reduce screen shake to 0, slow down rainbow hue cycle rotations, cut particle bursts by 50%, mute scroll parallax, and attenuate synthesized audio gain by 50%. A media query listener for `prefers-reduced-motion` must automatically activate these calm settings.”

## 4. Builder
“Implementation plan and risk assessment: Refactor the monolithic script into 13 dedicated JS files under the `window.IrisGame` namespace. Load files sequentially using standard script tags in `index.html` to avoid module loading restrictions on local files. Risk: global namespace clutter. Mitigation: enforce strict encapsulation under `window.IrisGame` sub-objects.”

## 5. QA
“Verification plan: Create a client-side unit test runner in `test.html` and `js/smoke-tests.js` asserting 8 core configurations, storage migration, and director thresholds. Provide a manual test script in `TESTING.md` covering access tools, touch regions, and keyboard input traps.”

## 6. Release Manager
“Release checklist:
- [x] Pre-commit syntax validation using `node -c`.
- [x] Verify all 8 smoke tests report PASS status.
- [x] Stage `/v4/` files in local git workspace.
- [x] Push commit `b1ac209` to GitHub Pages publishing branch.
- [x] Verify live URLs: game page and test pages.”
