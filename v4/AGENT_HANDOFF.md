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
  - 等级导演系统优化：优化 onboarding 期间首个花藤前的间隙过渡。
- **P2**:
  - 新增贴纸图案和解锁历史记录。

## UX Backlog
由 UX Designer 维护：
- **P0**: 交互目标尺寸不小于 44x44px，移动端屏幕 320px 宽度不溢出。
- **P1**:
  - 主菜单添加更柔和的背景小草摆动装饰。
- **P2**:
  - 统一高分榜解锁音效和动效节奏。

## Accessibility Backlog
由 Accessibility Reviewer 维护：
- **P0**: 默认静音控制、支持 reduced-motion 动态抑制、核心按钮具备清晰 ARIA 属性。
- **P2**:
  - 增加对屏幕阅读器的完整焦点环辅助。

## Current Sprint
本轮 Cycle 3 任务：
1. **P1 (Product)**: 自适应速度曲线：当玩家连续无碰撞吃掉 3 颗星星时，触发 2 秒 (120 帧) 速度冲刺 (`speedBoostFrames = 120`)，速度提升 10% 并释放额外的粒子，在 `game.js` 和 `director.js` 中实现。
2. **P1 (UX)**: 加强主菜单开始按钮的引导动效：优化 `style.css` 中 `@keyframes breathingStart` 关键帧，为 `#start-btn` 增加微弱、平滑的脉冲缩放及外发光 (box-shadow glow) 阴影动画。
3. **P1 (Accessibility)**: 增加对屏幕阅读器的音量状态播报，在 `index.html` 中引入隐藏的 `sound-announcement` live region，并在 `audio.js` 的 `toggleMute()` 里实时更新其文本。

## Builder Plan
1. **速度冲刺**：
   - 在 `v4/js/state.js` 中初始化 `consecutiveStarsNoHit` 与 `speedBoostFrames` 并支持重置。
   - 在 `v4/js/game.js` 的 `collectStar()` 里累加该计数，当计数 >= 3 时，设置 `speedBoostFrames = 120` 并调用 `ui.showMessage()` 和粒子发射。
   - 在 `game.js` 的 `handleCollision()` 里将这两个计数清零。
   - 在 `game.js` 的 `updateGame()` 物理循环里逐帧递减 `speedBoostFrames`。
   - 在 `v4/js/director.js` 里的 `getCurrentDifficulty()` 里若冲刺帧计数 > 0，则将 butterfly speed 和 star speed 均乘上 1.10 倍。
2. **开始按钮光晕**：修改 `v4/style.css` 中 `@keyframes breathingStart` 动画，新增平滑的 scale 及 box-shadow 呼吸光晕动效。在 `v4/style.css` 结尾挂载 `.sr-only` 视觉隐藏样式。
3. **静音读屏辅助**：修改 `v4/index.html`，在 `#game-container` 顶部插入 `<div id="sound-announcement" class="sr-only" aria-live="polite"></div>`；修改 `v4/js/audio.js` 中的 `toggleMute()`，音量切换时将开启/关闭文字填充入该容器。
4. **版本递增**：修改 `v4/index.html` 和 `v4/test.html` 的静态文件后缀为 `?v=8`。

## Implementation Notes
- **Speed Dash on Star Streaks**: Configured `consecutiveStarsNoHit` and `speedBoostFrames` states in `state.js`. Added triggers in `game.js` inside `collectStar()` (sets `speedBoostFrames = 120` and particle explosion on streak of 3) and reset logic in `handleCollision()`. Configured speed multiplier scaling in `director.js` during boost frames (+10% velocity).
- **Glowing Start Button**: Updated keyframe `@keyframes breathingStart` in `style.css` to add scale transitions alongside glowing pink-to-blue drop shadow overlays. Added `.sr-only` utility style.
- **Audio Switch Announcements**: Added `#sound-announcement` element with `aria-live="polite"` inside `index.html`. Updated `toggleMute()` in `audio.js` to set text descriptions on toggling sound.
- **Resource Versions**: Incremented JS and CSS query parameters from `?v=7` to `?v=8` in `index.html` and `test.html`.

## QA Checklist
- [x] 检查 `v4/index.html` 的资源链接版本号已递增为 `?v=8`。
- [x] 验证 `v4/test.html` 自动化测试通过。
- [x] 连续成功吃掉 3 颗星星且不发生 any 碰撞，确认屏幕中央弹出“速度冲刺！✨”提示，蝴蝶及星星移动速度瞬时增加 10% 并喷洒金色粉末，2 秒后速度平滑恢复。
- [x] 处于速度冲刺状态中，如果小蝴蝶发生碰撞，确认冲刺状态与星星连击计数立即清零，且速度回归正常。
- [x] 验证主界面开始飞行按钮在呼吸收缩的同时伴有明暗变化的淡粉色光晕。
- [x] 打开屏幕阅读器或检查 DOM，点击静音按钮切换声音状态，确认 `#sound-announcement` 能够正确接收并播报“声音已开启”和“声音已关闭”。

## QA Results
- **Unit Testing**: All 8 assertions in browser unit runner `test.html` pass.
- **Mute Announcement DOM Check**: Verified `#sound-announcement` updates text dynamically to "声音已开启" or "声音已关闭".
- **Dynamic Keyframes**: Confirmed that `breathingStart` keyframes include box-shadow property transitions.

## Release Notes
- **Commit Hash**: `ac72446`
- **Push Branch**: `main`
- **Pages Source**: `https://timkok.github.io/iris-butterfly-adventure/v4/`
- **Test Page**: `https://timkok.github.io/iris-butterfly-adventure/v4/test.html`

## Next Sprint Proposal
提案本轮 Cycle 4 任务：
1. **P1 (Product)**: 优化首屏加载体验：自动检测 localStorage 贴纸与外观，如果玩家已经解锁过任何里程碑贴纸，主菜单标题下方增加一句随机的赞美话语（“今天也是充满勇气的一天 🦋”）。
2. **P2 (UX)**: 加强家长设置界面在移动端（320px 宽度）的弹性盒布局适应，增大输入框标签与开关之间的垂直间隔。
3. **P2 (Accessibility)**: 增加主界面 How-to-play 卡片关闭按钮的 `aria-keyshortcuts="Escape"` 说明，方便视障或仅用键盘的玩家退出说明卡。
