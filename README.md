# AIGC 对话界面增强 · HKUST(GZ)

油猴脚本，重设 <https://aigc.hkust-gz.edu.cn/conversation-mode> 的视觉与输入体验，并自动跟随系统深色模式。

## 安装

1. 浏览器安装 Tampermonkey / Violentmonkey。
2. 新建脚本，粘贴 `aigc-conversation-enhance.user.js` 全文，或用扩展的「从文件导入」。
3. 打开 AIGC 对话页，脚本自动生效（`@match https://aigc.hkust-gz.edu.cn/*`，登录页同样生效）。

## 设计要点

- **配色**：浅色为冷灰纸面 `#E8EDF3` + 纯白面板 + 深蓝墨 `#0A1F38`；深色为墨黑 `#070B11` + 板岩蓝面板 `#0E1620`。
  强调色取自校徽金 `#A97F22`（深色下提亮为 `#DCB965`），只用于选中态、焦点环、发送按钮与链接，保持稀缺。
- **提问**：右侧深蓝气泡，18/18/6 圆角形成指向感，浮起式投影与答复区拉开层次。
- **回答**：不做卡片，用左侧 2px 金色渐隐竖条当作书栏；正文 70ch、1.75 行高、`text-wrap: pretty`，适合长文阅读。
- **回合节奏**：一问一答为一组，组间 48px 远大于组内 16px，滚动时能一眼看出问答边界。
- **操作条**：复制/重新生成默认隐藏，悬停或键盘聚焦才出现，避免每屏都是按钮噪音。
- **新消息**：仅对新出现的消息播放一次 0.34s 上浮淡入（含轻微去模糊），首屏历史消息不参与动画，刷新时不会整页抖动。
- **生成中**：最后一条回复追加脉动的金色光标，并在用户未手动上翻时持续贴底跟随。
- **深色模式**：校徽与图标单色反转；代码块、引用、表格、弹窗、下拉、搜索框、登录页同步换肤。
- **数学公式**：直接接管站点的 Markdown 渲染（`MarkdownIt.prototype.render`），在解析前把公式整段抽出，
  渲染完再用 KaTeX 放回。公式全程不经过 Markdown 语法，所以 `_`、`\\`、`\[` 都不可能被改写。

## 交互细节

| 行为 | 说明 |
| --- | --- |
| 输入框长高 | 随内容增长；下方输入区会自动向对话区借高度，超出后输入框内部滚动 |
| 跟随输出 | 生成时自动贴底；用户上翻超过 120px 后停止跟随 |
| 流式流畅度 | 每条公式的 KaTeX 结果按源码缓存，逐 token 重渲染时命中缓存；公式没写完时先显示原文，写完立刻排版 |
| 搜索框 | 历史列表内搜索框与整体主题一致，深色下不再白底 |
| 拖拽分隔 | 通栏硬线收成居中小把手，悬停变金 |
| 键盘 | `:focus-visible` 金色焦点环；`prefers-reduced-motion` 下全部动画关闭 |

## 主题切换

默认跟随系统 `prefers-color-scheme`，系统切换时实时生效。也可在控制台手动指定并记住：

```js
aigcx.setTheme('dark')   // 固定深色
aigcx.setTheme('light')  // 固定浅色
aigcx.setTheme('auto')   // 回到跟随系统
aigcx.getTheme()         // 当前生效值
```

## 预览

- `preview/index.html`：对话页离线预览（含示例问答、代码块、表格）。
- `preview/login-mock.html`：登录页离线预览。
- 两者都可直接双击打开，用页面左下角的按钮切换深浅色；`?theme=dark` 也可指定。
- `preview/build.mjs` 从脚本内嵌的 CSS 重新生成 `preview/index.html`：`node preview/build.mjs`。

## 兼容性

- 目标站点为 Vue 3 + Ant Design Vue + vue-resizer；脚本仅通过 CSS 与少量 DOM 标记（`.aigcx-empty`、`.aigcx-enter`、`.aigcx-streaming`）增强，不改动业务逻辑与请求。
- 输入框自动长高上限约 5 行（168px），超出后内部滚动。
- 支持键盘焦点环（`:focus-visible`）与 `prefers-reduced-motion`。
- KaTeX 走 jsDelivr CDN；未就绪时公式先以等宽占位显示，加载完成后自动替换，不影响其他功能。
- 站点渲染器是 markdown-it，其转义规则会把 `a \\\\ b` 折成 `a \ b`（矩阵因此塌成一行）、`\[` 折成 `[`、
  `_x_` 当成强调。这些变换**有损且不可逆**，所以只能在 `render()` 之前拦截，事后修补 DOM 是补不回来的。
- 已逐项验证：`pmatrix`/`bmatrix`/`matrix`/`cases`/`aligned`/`array` 行列均正确；`$…$`、`$$…$$`、
  `\(…\)`、`\[…\]` 与裸 `\begin{…}` 环境都能渲染；金额（`$5 and $10`）不会被误判成公式。
- 流式输出时未闭合的公式只保护到当前段落为止，模型漏写定界符不会连累后面的正文。