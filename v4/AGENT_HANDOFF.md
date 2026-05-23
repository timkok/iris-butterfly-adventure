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
  - 提升自适应星线指引：当连续通过 5 个障碍时，在花藤中心路径上方生成一条有轨迹可循的 3 颗引导星星线，辅助孩子操作。
  - 等级导演系统优化：优化 onboarding 期间首个花藤前的间隙过渡。
- **P2**:
  - 新增贴纸图案和解锁历史记录。

## UX Backlog
由 UX Designer 维护：
- **P0**: 交互目标尺寸不小于 44x44px，移动端屏幕 320px 宽度不溢出。
- **P1**:
  - 加强生命值过低提示：当生命值为 1 时，HUD 心形图标添加红色微弱缩放动画效果 `.low-lives`。
  - 主菜单添加更柔和的背景小草摆动装饰。
- **P2**:
  - 统一高分榜解锁音效和动效节奏。

## Accessibility Backlog
由 Accessibility Reviewer 维护：
- **P0**: 默认静音控制、支持 reduced-motion 动态抑制、核心按钮具备清晰 ARIA 属性。
- **P1**:
  - 补齐宝贝仓库中解锁卡片 (stickers / cosmetics) 的聚焦 ARIA 说明，使无障碍阅读器能正确朗读贴纸的锁定分数线与解锁状态。
- **P2**:
  - 增加对屏幕阅读器的完整焦点环辅助。

## Current Sprint
本轮 Cycle 2 任务：
1. **P1 (Product)**: 优化 `game.js` 的 `spawnObstacle` 方法，当 `state.game.consecutivePasses >= 5` 时，在花藤缺口前方、中央和后方生成一串由 3 颗星星组成的引导轨迹线。
2. **P1 (UX)**: 在 `style.css` 中添加 `@keyframes heart-pulse` 缩放脉动关键帧，并在 `ui.js` 的 `renderHUD` 中，当 `lives === 1` 时，为心形元素追加 `.low-lives` 类。
3. **P1 (Accessibility)**: 修改 `rewards.js`，为贴纸卡片赋予 `tabindex="0"`, `role="img"`, 和描述其解锁条件的 `aria-label`。同时为外观解锁按钮添加包含解锁分数的 `aria-label` 属性。

## Builder Plan
1. **引导星线**：在 `v4/js/game.js` 的 `spawnObstacle()` 中，若 `state.game.consecutivePasses >= 5`，则连续调用 `this.spawnStar()` 生成三个有间距的引导星，取代原有的单星生成逻辑。
2. **低生命值闪烁**：在 `v4/style.css` 结尾处新增 `.low-lives` 和 `@keyframes heart-pulse` 红色阴影呼吸动效；在 `v4/js/ui.js` 的 `renderHUD()` 里，当心数为 1 且不为练习模式时启用该动效。
3. **ARIA 支持**：在 `v4/js/rewards.js` 生成贴纸卡片时，使用 `setAttribute` 配置 `tabindex`, `role="img"`, 以及多语言无障碍 `aria-label` 说明。为外观购买/应用按钮根据其锁定/解锁状态绑定详细的 `aria-label` 文本。
4. **版本控制**：更新 `v4/index.html` 和 `v4/test.html` 导入静态资源的版本为 `?v=7`。

## Implementation Notes
- **Guided Star Trail**: Modified `game.js` in `spawnObstacle()`. When the player achieves a pass streak (`state.game.consecutivePasses >= 5`), three stars are spawned in a line through the gap center (`obsX - 42`, `obsX + width / 2`, and `obsX + width + 42`), replacing the random/single star placement.
- **Low Health Visual Warning**: Added `@keyframes heart-pulse` and `.low-lives` styles in `style.css`. Updated `ui.js` in `renderHUD()` to append the `.low-lives` class to the heart counter when `lives === 1` and mode is not practice, respecting reduced-motion and calm mode restrictions.
- **Treasure Locker Keyboard & ARIA Access**: Modified `rewards.js` during sticker creation to add `tabindex="0"`, `role="img"`, and verbose `aria-label` describing the unlocked state or score target. Likewise, updated cosmetic select button creation to set detailed `aria-label` text indicating item name, cost, or activation state.
- **Cache Busters**: Incremented resource links to `?v=7` in `index.html` and `test.html`.

## QA Checklist
- [x] 检查 `v4/index.html` 的资源链接版本号已递增为 `?v=7`。
- [x] 验证 `v4/test.html` 自动化测试通过。
- [x] 连续成功穿过 5 组藤蔓障碍，确认在下一组障碍的通道上平滑生成 3 颗引导星星。
- [x] 启动游戏后把生命碰撞到 1，确认 HUD 左上角的 ❤️ 图标呈现红色呼吸缩放动画。
- [x] 开启低刺激模式，确认 lives 心形的缩放动效处于被抑制状态（不脉动）。
- [x] 打开宝贝仓库面板，使用键盘 Tab 键能聚焦到各个贴纸卡片，并且带有正确的读屏属性。

## QA Results
- **Headless Unit Tests**: All 8 assertions in `smoke-tests.js` passed successfully in Node environment.
- **Syntax Check**: Checked all files using `node -c v4/js/*.js`; zero syntax or parser errors.
- **ARIA/Locker Validation**: Confirmed that sticker div tags receive focus and contain descriptive aria-labels, and cosmetic buttons have context-aware screen reader descriptions.

## Release Notes
- **Commit Hash**: `[pending]`
- **Push Branch**: `main`
- **Pages Source**: `https://timkok.github.io/iris-butterfly-adventure/v4/`
- **Test Page**: `https://timkok.github.io/iris-butterfly-adventure/v4/test.html`

## Next Sprint Proposal
提案本轮 Cycle 3 任务：
1. **P1 (Product)**: 自适应速度曲线：当玩家连续无碰撞吃掉 3 颗星星时，短暂提升 10% 移动速度并释放额外的微型花粉粒子，强化收集奖励机制。
2. **P1 (UX)**: 加强主菜单开始按钮的引导动效：为“开始飞行”按钮增加一个微弱、平滑的脉冲缩放及光晕动画，吸引儿童点击。
3. **P1 (Accessibility)**: 增加对屏幕阅读器的音量状态播报，当静音切换被点击时，播报声音开启/关闭状态。
