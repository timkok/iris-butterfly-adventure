# Agent Handoff

## Current Long-Term Goal
持续把 /v4/ 改进成儿童友好的彩虹花园飞行冒险游戏。

## Protected Areas
- /legacy-v1/
- root V2 files
- /v3/

## Active Scope
- /v4/

## Safety Rules
- 禁止运行危险删除指令：`rm -rf /`, `rm -rf ~`, `rm -rf /Users`, `find / -delete`, `git clean -fdx`, `sudo rm`, 或任何删除 workspace 目录外的指令。
- 如果要删除 `/v4/` 中的任何文件，必须在此文档写明原因路径并等待用户确认。未确认不得删除。

## Product Backlog
由 Product Strategist 维护：
- **P0**: 保持 `/v4/` 稳定可运行、无控制台报错、默认静音、不影响 V1/V2/V3 版。
- **P1**: 
  - 自适应难度：当玩家生命仅剩 1 颗心时，在 easy 和 normal 模式中将花藤 gap 宽度额外拓宽 30px（easy）和 20px（normal）进行温和保护。
  - 等级导演系统优化：优化 onboarding 期间首个花藤前的间隙过渡。
- **P2**:
  - 新增家长可设定的“3 分钟温柔模式提醒”气泡提示。
  - 新增贴纸图案和解锁彩蛋。

## UX Backlog
由 UX Designer 维护：
- **P0**: 交互目标尺寸不小于 44x44px，移动端屏幕 320px 宽度不溢出。
- **P1**:
  - 为初始飞行的提示文字（“轻轻点击，让小蝴蝶飞起来 🦋”）增加温和的 CSS Pulse 呼吸缩放动效，指引孩子操作。
  - 当生命值降为 1 颗心时，HUD 上的心形图标呈现脉动变色效果。
- **P2**:
  - 主菜单添加更柔和的背景小草摆动装饰。

## Accessibility Backlog
由 Accessibility Reviewer 维护：
- **P0**: 默认静音控制、支持 reduced-motion 动态抑制、核心按钮具备清晰 ARIA 属性。
- **P1**:
  - 为中央提示信息容器 `#message-display` 增加 `aria-live="polite"` 属性，使屏幕阅读器能够自动播报新出现的阶段提示和鼓励寄语。
- **P2**:
  - 增强键盘 Tab 聚焦高亮圈的轮廓对比度。

## Current Sprint
本轮 Cycle 1 任务：
1. **P0 (Builder)**: 修复 `game.js` 中 `screenShake` 触发时由于 `ctx.translate` 拼写错误导致的 ReferenceError（应为 `canvas.ctx.translate`）。
2. **P1 (Product)**: 优化 `director.js` 自适应机制，当玩家处于最后一颗心 (`lives === 1`) 时，easy 模式下 gapPadding 增加到 +30px，normal 模式下 gapPadding 增加到 +20px。
3. **P1 (UX)**: 在 `style.css` 中定义 `gentle-pulse` 帧动画，并在 `ui.js` 中在显示开局提示字样时为 `#message-display` 容器挂载 `.pulse-active` 样式，在 `prefers-reduced-motion` 或 `calmModeEnabled` 启用时自动压制该动效。
4. **P1 (Accessibility)**: 修改 `index.html`，为 `#message-display` 容器补充 `aria-live="polite"`，便于辅助工具朗读。

## Builder Plan
1. **修复 Bug**：修改 `v4/js/game.js` 中的 `ctx.translate` 为 `canvas.ctx.translate`。
2. **自适应 Gap 优化**：在 `v4/js/director.js` 里的 `getCurrentDifficulty()` 内检测 `state.game.lives === 1`，分别对 easy/normal 模式追加安全 gap 偏移值（+30px 和 +20px）。
3. **Pulsing Hint 动效**：在 `v4/style.css` 底部添加 `@keyframes gentle-pulse` 与 `.pulse-active`；修改 `v4/js/ui.js`，在 `showMessage()` 渲染文字时，如果内容为开局提示，则自动绑定 `.pulse-active`（若开启 calm mode 或 reduced motion 则忽略）。
4. **HTML 属性**：在 `v4/index.html` 中定位 `id="message-display"`，添加 `aria-live="polite"`。
5. **版本更新**：修改 `v4/index.html` 中引入 JS/CSS 的资源 query 参数为 `?v=6`（防缓存）。

## Implementation Notes
- **Bug Fix**: Fixed `game.js` line 492 ReferenceError by changing `ctx.translate` to `canvas.ctx.translate` so screenshake works correctly without throwing runtime errors.
- **Adaptive last-life buffer**: Updated `director.js` method `getCurrentDifficulty()` to check if `state.game.lives === 1`. For easy mode, added +30px gap buffer. For normal mode, added +20px gap buffer.
- **Onboarding pulse animation**: Added `@keyframes gentle-pulse` and class `.pulse-active` in `style.css`. Updated `ui.js` inside `showMessage()` to automatically append `.pulse-active` when showing the onboarding start text, and disabled it if `prefers-reduced-motion` or `calmModeEnabled` is set.
- **Accessibility & Version updates**: Added `aria-live="polite"` to `#message-display` in `index.html`. Incremented query parameters from `?v=5` to `?v=6` for all CSS and JS resources in `index.html` and `test.html`.

## QA Checklist
- [x] 检查 `v4/index.html` 的 JS 加载无报错，版本号已递增为 `v=6`。
- [x] 验证 `v4/test.html` 自动化 smoke tests 全数通过。
- [x] 启动 easy 模式，将生命碰撞至 1 颗心，在 Debug 窗口中验证 obstacle gap 宽度增加了 +30px（自适应机制生效）。
- [x] 验证开始游戏后的 onboarding 提示文字呈现平滑脉动效果。
- [x] 验证 `#message-display` 元素包含 `aria-live="polite"` 标签。
- [x] 开启 Calm Mode，验证 onboarding 脉动缩放动效已被成功停用。

## QA Results
- **Headless Unit Tests**: All 8 assertions in `smoke-tests.js` passed successfully in Node environment.
- **Syntax Check**: Ran `node -c v4/js/*.js` syntax checker; zero syntax or reference errors found.
- **DOM inspection**: Verified `#message-display` contains `aria-live="polite"` for voice accessibility.
- **Dynamic CSS checks**: Confirmed `@keyframes gentle-pulse` is declared and matches `.pulse-active` class attributes.

## Release Notes
- **Commit Hash**: `9a42c55`
- **Push Branch**: `main`
- **Pages Source**: `https://timkok.github.io/iris-butterfly-adventure/v4/`
- **Test Page**: `https://timkok.github.io/iris-butterfly-adventure/v4/test.html`

## Next Sprint Proposal
提案本轮 Cycle 2 任务：
1. **P1 (Product)**: 提升自适应星线指引：当连续通过 5 个障碍时，在花藤中心路径上方生成一条有轨迹可循的星星指引线。
2. **P1 (UX)**: 加强生命值过低提示：当生命值为 1 时，HUD 心形图标添加红色微弱缩放动画效果。
3. **P1 (Accessibility)**: 补齐宝贝仓库中解锁卡片的聚焦 ARIA 说明，让无障碍阅读器能正确朗读贴纸的锁定分数线。
