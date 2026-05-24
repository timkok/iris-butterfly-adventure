# V4 Release Candidate

## Summary

- Release candidate cycle: Cycle 16
- Tested implementation commit: `66418c717b1a8efac9be4227c70ca7d338b793cb`
- Asset version: `v=25`
- V4 URL: `https://timkok.github.io/iris-butterfly-adventure/v4/`
- Test URL: `https://timkok.github.io/iris-butterfly-adventure/v4/test.html`
- Pages source: `main / root`
- Browser QA status: PASS
- Release recommendation: PASS TO RELEASE

## QA Status

- `/v4/test.html`: PASS, `Total: 29`, `Passed: 29`, `Failed: 0`
- English default: PASS
- Chinese switch: PASS
- Start gate: PASS for `Start Flying` and `开始飞行`
- All modes: PASS for practice, easy, normal, and hard startup
- Controls: PASS for Space, touch, click, pause, resume, and sound toggle
- Screens: PASS for Game Over, Treasure, Settings, and Debug
- Mobile widths: PASS at 320px, 375px, and 390px
- Console/page errors: none captured in final QA runs

## Known Issues

- No P0 or P1 release-blocking issues found.
- P2 QA note: the animated Start button can be treated as moving by Playwright, so automated clicks use forced click. Manual and smoke-test startup paths pass.
- P2 QA note: static no-JS fallback HTML still contains some Chinese source copy before runtime i18n updates. Runtime English/Chinese UI passes current i18n tests.

## Rollback Note

- If a release regression is found, roll back to the previous known-good V4 commit or revert the Cycle 15 gameplay-feel commit plus the Cycle 16 documentation commit.
- Protected older versions should not be changed during rollback without explicit user confirmation.

## Protected Versions Status

- `/legacy-v1/`: not modified.
- Root V2 files: not modified.
- `/v3/`: not modified.
- GitHub Pages source: unchanged, `main / root`.

## English / Chinese Status

- Default language is English.
- Chinese can be selected and persists through the existing language system.
- English `Start Flying` enters `PLAYING`.
- Chinese `开始飞行` enters `PLAYING`.
- Mission, treasure, settings, Game Over, and major button labels render in the selected language during QA.

## Accessibility Status

- Main controls have aria labels or text labels.
- Language status and sound status use polite live regions.
- Mobile QA found no horizontal overflow at 320px, 375px, or 390px.
- Visible button targets in mobile QA were at least 24x24 CSS px; main controls were about 44px tall or larger for child-friendly touch use.
- Reduced Motion remains a release gate.

## Performance / Effects Budget Status

- Calm Mode is enabled by default and reduces effect density.
- Reduced Motion suppresses non-essential ambient leaves and tap ripples.
- Final Reduced Motion QA reported `leaves=0`, `tapRipples=0`, and `particles=0` after startup/tap.
- Debug panel exposes effects and adaptive-flow metrics.
- No console/page errors were captured during the release-candidate QA runs.
