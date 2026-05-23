# Agent Handoff - Cycle 8

## Cycle 8 Agent Dialogue

1. **Strategist (Product)**:
   "I propose these gameplay improvements: When a sticker transitions from locked to unlocked (via new high score), the treasure page should celebrate with a magic sparkle animation. This gives children a tangible moment of delight when they achieve a milestone. We also need to track which stickers are 'newly unlocked' vs 'previously seen' to distinguish fresh achievements."

2. **UX Designer**:
   "UI impact and layout concerns: We will add a CSS shimmer and sparkle burst animation on newly-unlocked sticker cards. A '新!' badge will appear on stickers the player hasn't viewed yet. The animation will use a radial gradient pulse combined with floating particle dots. No layout changes needed — the sticker grid dimensions remain the same."

3. **Accessibility Reviewer**:
   "Accessibility/safety constraints: The sparkle animation must be completely suppressed under prefers-reduced-motion. Under Calm Mode, the animation should be a single gentle fade-in instead of a burst. The '新!' badge should have appropriate aria-label text for screen readers. No flashing or strobing effects."

4. **Builder**:
   "Implementation plan and risk assessment: (1) Add a 'seenStickers' key to storage.js to track which unlocked stickers the user has already viewed. (2) In rewards.js renderTreasure(), compare unlocked stickers against seenStickers to identify newly-unlocked ones. (3) Add CSS class 'sticker-newly-unlocked' with sparkle keyframes. (4) When user opens treasure page, after animation plays, mark stickers as seen. (5) Add smoke test for seen-sticker tracking. Low risk — no game logic changes."

5. **QA**:
   "Verification plan: Add unit tests for seenStickers storage read/write, and verify that newly-unlocked detection works correctly. Run full headless test suite to confirm all 14 tests pass."

6. **Release Manager**:
   "Release checklist: Bump versions to v=13 across all HTML imports, run Node tests, write Cycle 8 Release Notes, commit and push to origin."

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
- **P1**: 游戏主界面微风树叶粒子漂浮动画。
- **P2**: 按键按下视觉气泡效果。

## Accessibility Backlog
由 Accessibility Reviewer 维护：
- **P0**: 默认静音控制、支持 reduced-motion 动态抑制、核心按钮具备清晰 ARIA 属性。
- **P2**: 增加键盘焦点环边框高亮。

---

## Current Sprint
本轮 Cycle 8 任务：
1. **P1 (Product)**: 增加贴纸解锁时的魔法泡泡庆祝效果，新解锁贴纸闪耀动画。
2. **P1 (UX)**: 在宝贝页面标记"新!"徽章，区分新解锁与已查看贴纸。
3. **P1 (QA)**: `smoke-tests.js` 补充 seenStickers 存储和新解锁检测的校验。

---

## Release Notes
- Cycle: Cycle 8
- Pushed Branch: main
- Commit Hash: c80c456
- Pages Source: main / root
- Game URL: https://timkok.github.io/iris-butterfly-adventure/v4/
- Tests URL: https://timkok.github.io/iris-butterfly-adventure/v4/test.html
- Asset Version: v=13
- QA Status: PASS (14/14)
- Remaining Issues:
  - None
- Next Cycle Starts Automatically: yes

---

## Next Sprint Proposal
- **P1 (Product)**: 贴纸页面支持按解锁类型进行高亮和分组过滤。
- **P2 (UX)**: 按键按下视觉气泡效果。
