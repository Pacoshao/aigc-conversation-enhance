// ==UserScript==
// @name         AIGC 对话界面增强 · HKUST(GZ)
// @namespace    https://aigc.hkust-gz.edu.cn/
// @version      2.5.0
// @description  重设 aigc.hkust-gz.edu.cn 对话页：深蓝墨 + 校金配色、书栏式消息、随内容生长的输入框、平滑的新消息入场，自动跟随系统深色模式。
// @author       lead
// @match        https://aigc.hkust-gz.edu.cn/*
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  'use strict';
  if (window.__aigcx) return;
  window.__aigcx = true;

  var STORE_KEY = 'aigcx-theme';
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var pref = 'auto';
  try { pref = localStorage.getItem(STORE_KEY) || 'auto'; } catch (e) { /* 存储被禁用 */ }
  var CSS_TEXT = `
/* ============ 1. 设计令牌 ============ */
:root,
:root[data-aigcx-theme='light'] {
  --aigcx-canvas: #E8EDF3;
  --aigcx-surface: #FFFFFF;
  --aigcx-surface-2: #F4F7FA;
  --aigcx-surface-3: #E7EDF4;
  --aigcx-chip-active: #FFFFFF;
  --aigcx-ink: #15202D;
  --aigcx-ink-strong: #0A1F38;
  --aigcx-muted: #59677A;
  --aigcx-faint: #8494A6;
  --aigcx-hairline: rgba(10, 31, 56, .15);
  --aigcx-hairline-soft: rgba(10, 31, 56, .07);
  --aigcx-gold: #8A6512;
  --aigcx-gold-fill: #A97F22;
  --aigcx-gold-tint: rgba(169, 127, 34, .11);
  --aigcx-gold-edge: rgba(169, 127, 34, .42);
  --aigcx-on-accent: #FFFFFF;
  --aigcx-code-bg: #F1F5F9;
  --aigcx-code-ink: #15202D;
  --aigcx-code-border: rgba(10, 31, 56, .13);
  --aigcx-inline-bg: rgba(10, 31, 56, .06);
  --aigcx-inline-ink: #14314F;
  --aigcx-logo-filter: none;
  --aigcx-ring: 0 0 0 3px var(--aigcx-gold-tint);
  --aigcx-lift: 0 18px 40px -30px rgba(6, 16, 30, .55);
  --aigcx-me: #0A1F38;
  --aigcx-me-ink: #FFFFFF;
  color-scheme: light;
}

:root[data-aigcx-theme='dark'] {
  --aigcx-canvas: #070B11;
  --aigcx-surface: #0E1620;
  --aigcx-surface-2: #15202D;
  --aigcx-surface-3: #1F2C3D;
  --aigcx-chip-active: #223146;
  --aigcx-ink: #DFE7F1;
  --aigcx-ink-strong: #F4F8FD;
  --aigcx-muted: #8FA0B5;
  --aigcx-faint: #6B7C91;
  --aigcx-hairline: rgba(223, 231, 241, .17);
  --aigcx-hairline-soft: rgba(223, 231, 241, .08);
  --aigcx-gold: #DCB965;
  --aigcx-gold-fill: #DCB965;
  --aigcx-gold-tint: rgba(220, 185, 101, .15);
  --aigcx-gold-edge: rgba(220, 185, 101, .48);
  --aigcx-on-accent: #0A1220;
  --aigcx-code-bg: #060A10;
  --aigcx-code-ink: #DCE6F2;
  --aigcx-code-border: rgba(255, 255, 255, .09);
  --aigcx-inline-bg: rgba(223, 231, 241, .11);
  --aigcx-inline-ink: #E2EAF4;
  --aigcx-logo-filter: brightness(0) invert(1) opacity(.92);
  --aigcx-ring: 0 0 0 3px var(--aigcx-gold-tint);
  --aigcx-lift: 0 18px 40px -28px rgba(0, 0, 0, .8);
  --aigcx-me: #1D2C41;
  --aigcx-me-ink: #EAF1FA;
  color-scheme: dark;
}

/* ============ 2. 画布 ============ */
html, body, #app, .ant-spin-nested-loading, .ant-spin-container,
.h100, .ant-layout, .ant-layout-content, .layout-block {
  background: var(--aigcx-canvas) !important;
  color: var(--aigcx-ink) !important;
}
body, button, input, textarea, select, .ant-btn, .ant-menu, .ant-tabs, .ant-radio-button-wrapper {
  font-family: "SourceHanSansCN", "PingFang SC", "Microsoft YaHei UI", "Segoe UI", system-ui, sans-serif;
}
code, pre, kbd, samp { font-family: ui-monospace, "Cascadia Mono", Consolas, "SFMono-Regular", monospace !important; }
::selection { background: var(--aigcx-gold-tint); color: var(--aigcx-ink-strong); }

/* ============ 3. 顶栏 ============ */
header.ant-layout-header {
  background: var(--aigcx-surface) !important;
  border-bottom: 1px solid var(--aigcx-hairline);
  box-shadow: none !important;
}
.header { box-shadow: none !important; height: 64px; display: flex; align-items: center; padding-right: 24px; }
.header .logo-box { padding-left: 24px; }
.header .logo { height: 26px !important; filter: var(--aigcx-logo-filter); opacity: .95; transition: filter .2s ease; }
.header .systemName {
  color: var(--aigcx-ink-strong) !important;
  font-size: 16.5px !important; font-weight: 600 !important; letter-spacing: .012em;
  line-height: 1 !important; padding-left: 14px !important; padding-bottom: 2px !important;
  border-left: 1px solid var(--aigcx-hairline); margin-left: 16px;
}
.header .menu-unfold { filter: var(--aigcx-logo-filter); opacity: .55; }
.header .menu-unfold:hover { opacity: 1; }

/* ============ 4. 模型切换 ============ */
.gpt-change { top: 12px !important; right: 172px !important; }
.gpt-change .scroll-wrapper { overflow-x: auto !important; scrollbar-width: none; }
.gpt-change .scroll-wrapper::-webkit-scrollbar { display: none; }
.h-radio {
  background: var(--aigcx-surface-2) !important;
  border: 1px solid var(--aigcx-hairline) !important;
  border-radius: 999px !important; padding: 3px !important;
  height: 32px !important; box-sizing: content-box !important;
}
.gpt-change .scroll-content {
  background: transparent !important; border: 0 !important; padding: 0 !important;
  height: 32px !important; display: flex !important; align-items: center !important; gap: 2px !important;
}
.gpt-change .ant-radio-button-wrapper {
  border: 0 !important; background: transparent !important; color: var(--aigcx-muted) !important;
  height: 30px !important; line-height: 30px !important; border-radius: 999px !important;
  padding: 0 14px !important; font-size: 13.5px !important; font-weight: 500 !important;
  letter-spacing: .005em; box-shadow: none !important;
  transition: color .16s ease, background .16s ease, box-shadow .16s ease;
}
.gpt-change .ant-radio-button-wrapper::before,
.gpt-change .ant-radio-button-wrapper::after { display: none !important; }
.gpt-change .ant-radio-button-wrapper:hover { color: var(--aigcx-ink) !important; background: var(--aigcx-surface-3) !important; }
.gpt-change .ant-radio-button-wrapper-checked {
  background: var(--aigcx-chip-active) !important; color: var(--aigcx-gold) !important;
  font-weight: 600 !important; box-shadow: inset 0 0 0 1px var(--aigcx-gold-edge) !important;
}
.gpt-change .ant-radio-button-wrapper-checked:hover { color: var(--aigcx-gold) !important; background: var(--aigcx-chip-active) !important; }
.gpt-change .ant-radio-button { display: none !important; }
.gpt-change .ant-divider-vertical { border-color: var(--aigcx-hairline) !important; }

/* ============ 5. 用户菜单 ============ */
.h-circle { right: 32px !important; top: 0 !important; }
.h-circle .dropdown-style {
  height: 44px; margin-top: 10px; padding: 0 12px; border-radius: 999px;
  display: flex; align-items: center; gap: 8px; transition: background .16s ease;
}
.h-circle .dropdown-style:hover { background: var(--aigcx-surface-2); }
.name-text { color: var(--aigcx-ink) !important; font-size: 13.5px !important; font-weight: 500; }
.name-drop-icon { filter: var(--aigcx-logo-filter); opacity: .5; }

/* ============ 6. 左侧窄栏 + 抽屉 ============ */
aside.ant-layout-sider {
  background: var(--aigcx-surface) !important;
  border-right: 1px solid var(--aigcx-hairline) !important;
}
.ant-layout-sider .h-sider-height::-webkit-scrollbar { width: 0; }
.ant-menu-light, .ant-menu.ant-menu-light {
  background: transparent !important; border-inline-end: 0 !important; color: var(--aigcx-muted) !important;
}
.ant-menu-light .ant-menu-item {
  color: var(--aigcx-muted) !important; border-radius: 12px !important;
  margin: 6px 8px !important; width: calc(100% - 16px) !important;
  height: 44px !important; line-height: 44px !important;
  transition: background .16s ease, color .16s ease;
}
.ant-menu-light .ant-menu-item .anticon,
.ant-menu-light .ant-menu-item svg { color: inherit !important; }
.ant-menu-light .ant-menu-item:hover { background: var(--aigcx-surface-2) !important; color: var(--aigcx-ink) !important; }
.ant-menu-light .ant-menu-item-selected { background: var(--aigcx-gold-tint) !important; color: var(--aigcx-gold) !important; font-weight: 600; }
.ant-menu-light .ant-menu-item-selected::after { display: none !important; }
.ant-menu-inline-collapsed .ant-menu-item { margin: 6px 10px !important; width: calc(100% - 20px) !important; }
:root[data-aigcx-theme='dark'] aside .ant-menu-item img,
:root[data-aigcx-theme='dark'] aside .ant-menu-item .anticon { filter: brightness(0) invert(1); opacity: .6; }
aside .ant-menu-item img { max-width: 24px; height: auto; }
.ant-drawer-body, .ant-drawer-content, .ant-drawer-header { background: var(--aigcx-surface) !important; color: var(--aigcx-ink) !important; }
.ant-drawer-mask { background: rgba(4, 9, 16, .45) !important; }

/* ============ 7. 会话外壳 ============ */
.conversation, .conversation-right, .conversation-left, .conversation-top,
.right-up, .chat-box, .drager_col, .drager_left, .drager_right, .dragCol {
  background: transparent !important;
  border-color: var(--aigcx-hairline) !important;
}
.conversation { padding: 0 !important; }
.conversation-right { border-left: 0 !important; padding: 0 !important; }
.right-up { height: calc(100% - 10px) !important; }
.right-up, .conversation-right { overflow-x: hidden !important; }
.ant-layout-content { padding-bottom: 0 !important; }
.layout-block { padding: 8px 12px 0 !important; }
.slider_col { background: var(--aigcx-hairline-soft) !important; }
.drager_row > .slider_row { background: transparent !important; position: relative; }
.drager_row > .slider_row::before {
  left: 50% !important; right: auto !important; width: 40px !important;
  transform: translateX(-50%) !important;
  border-top: 3px solid var(--aigcx-hairline) !important;
  background-color: transparent !important; border-radius: 999px;
  transition: border-color .16s ease, width .16s ease !important;
}
.drager_row > .slider_row::after { display: none !important; }
.drager_row > .slider_row:hover::before, .drager_row > .slider_row:active::before {
  border-top-color: var(--aigcx-gold-edge) !important; width: 60px !important;
}

/* ============ 8. 历史列表 + 搜索框 ============ */
.conversation-left {
  background: var(--aigcx-surface) !important;
  border-right: 1px solid var(--aigcx-hairline) !important;
  padding: 18px 14px 0 !important;
}
.new-conversation { padding: 0 0 14px !important; }
.c-button, .mini-new {
  background: transparent !important;
  border: 1px solid var(--aigcx-hairline) !important;
  color: var(--aigcx-ink) !important;
  border-radius: 12px !important; font-size: 13.5px !important; font-weight: 550 !important;
  letter-spacing: .01em; padding: 9px 0 !important;
  transition: background .16s ease, border-color .16s ease, color .16s ease;
}
.c-button:hover, .mini-new:hover {
  background: var(--aigcx-gold-tint) !important;
  border-color: var(--aigcx-gold-edge) !important;
  color: var(--aigcx-gold) !important;
}
.c-button:active { transform: translateY(1px); }
.c-button .anticon { color: var(--aigcx-gold); margin-right: 6px; }

/* 搜索框：深色模式下不再是白底 */
.ant-input-search .ant-input,
.ant-input-search .ant-input-affix-wrapper,
.conversation-left .ant-input,
.conversation-left .ant-input-affix-wrapper,
.ant-input-group .ant-input,
.ant-input-search-button,
.ant-input-search .ant-input-group-addon {
  background: var(--aigcx-surface-2) !important;
  color: var(--aigcx-ink) !important;
  border-color: var(--aigcx-hairline) !important;
}
.ant-input-search .ant-input { border-radius: 10px 0 0 10px !important; }
.ant-input-search .ant-input-search-button,
.ant-input-search .ant-input-group-addon {
  border-radius: 0 10px 10px 0 !important;
  color: var(--aigcx-muted) !important;
}
.ant-input-search .ant-input-search-button:hover { color: var(--aigcx-gold) !important; }
.ant-input-search .anticon-search { color: inherit !important; }
.conversation-ul { height: calc(100% - 108px) !important; padding: 10px 0 20px !important; }
.conversation-li {
  border-radius: 12px; padding: 2px 8px;
  color: var(--aigcx-muted) !important; font-size: 13.5px;
  transition: background .16s ease, color .16s ease;
}
.conversation-li:hover { background: var(--aigcx-surface-2) !important; color: var(--aigcx-ink) !important; }
.chat-list-item-active {
  background: var(--aigcx-gold-tint) !important;
  color: var(--aigcx-ink-strong) !important;
  border-radius: 10px;
  box-shadow: inset 2px 0 0 var(--aigcx-gold);
}
.conversation-ul svg, .conversation-li .anticon { opacity: .65; margin-right: 8px; }

/* ============ 9. 阅读栏：消息 ============ */
.chat-box {
  --content-font-size: 16px;
  --content-color: var(--aigcx-ink);
  padding: 12px 0 34px !important;
  overflow-x: hidden !important;
  scroll-behavior: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--aigcx-hairline) transparent;
}
.chat-line-prompt, .chat-line-reply {
  background: transparent !important; border-bottom: 0 !important;
  padding: 0 !important; position: relative;
}
.chat-line-inner {
  width: 100% !important; max-width: 880px;
  margin: 0 auto !important; padding: 0 32px !important;
  display: flex !important; align-items: flex-start !important; gap: 18px;
}
/* 回合节奏：一问一答为一组，组间距明显大于组内间距 */
.chat-line-prompt { padding-top: 48px !important; }
.chat-line-reply { padding-top: 16px !important; padding-bottom: 16px !important; }
.chat-line-reply:last-child { padding-bottom: 44px !important; }
.chat-box > div > .chat-line-prompt:first-child { padding-top: 24px !important; }

/* 头像 */
.chat-line-prompt .chat-line-inner { flex-direction: row-reverse; }
.chat-line-prompt .name-icon,
.chat-line-prompt .chat-icon { order: -1; margin: 2px 0 0 12px !important; }
.chat-line-reply .chat-icon { margin: 1px 0 0 !important; }
.chat-line-reply .chat-icon img {
  box-shadow: 0 0 0 1px var(--aigcx-gold-edge), 0 0 0 5px var(--aigcx-gold-tint);
}
.chat-line-prompt .name-icon,
.chat-line-inner .name-icon,
.chat-line-reply .chat-icon img,
.chat-line-prompt .chat-icon img {
  width: 30px !important; height: 30px !important; min-width: 30px; min-height: 30px;
  border-radius: 10px !important;
  box-shadow: 0 0 0 1px var(--aigcx-hairline);
  background: var(--aigcx-surface-2);
}
.chat-line-inner .name-icon {
  display: flex; align-items: center; justify-content: center;
  color: var(--aigcx-gold) !important; font-size: 13px; font-weight: 650;
  letter-spacing: .02em;
}

/* 我的提问 */
.chat-line-prompt .chat-item {
  max-width: min(70%, 54ch);
  background: var(--aigcx-me) !important;
  border: 0 !important;
  border-radius: 18px 18px 6px 18px !important;
  overflow: hidden;
  box-shadow: var(--aigcx-lift);
}
.chat-line-prompt .chat-item .content {
  background: transparent !important;
  color: var(--aigcx-me-ink) !important;
  border-radius: 0 !important;
  padding: 13px 18px !important;
  font-size: 15.5px;
  line-height: 1.66 !important;
}
.chat-line-prompt .chat-item .content p { margin: 0; }
.chat-line-prompt .chat-item .content img { border-radius: 10px; }
.chat-line-prompt .chat-item .bar { padding: 0 14px 10px !important; border-top: 0 !important; }
.chat-line-prompt .chat-item .bar .bar-item { color: var(--aigcx-me-ink) !important; opacity: .6; }
.chat-line-prompt .chat-item .bar .bar-item:hover { opacity: 1; }

/* 助手回复：书栏式，左侧一条会淡出的金线 */
.chat-line-reply .chat-item {
  position: relative;
  background: transparent !important;
  border: 0 !important; border-radius: 0 !important;
  padding: 0 0 0 26px !important;
  width: 100% !important;
  border-left: 0 !important;
}
.chat-line-reply .chat-item::before {
  content: '';
  position: absolute; left: 0; top: 2px; bottom: 2px; width: 2px;
  border-radius: 2px;
  background: linear-gradient(to bottom,
    var(--aigcx-gold) 0,
    var(--aigcx-gold-edge) 18%,
    var(--aigcx-hairline) 46%,
    transparent 100%);
}
.chat-line-reply .chat-item .content {
  color: var(--aigcx-ink) !important;
  background: transparent !important;
  padding: 0 !important; min-height: 0 !important;
  font-size: var(--content-font-size);
  line-height: 1.75 !important;
  max-width: 70ch;
}
.chat-line-reply .chat-item .content p {
  margin: 0 0 .9em; line-height: 1.75 !important; text-wrap: pretty;
}
.chat-line-reply .chat-item .content > :first-child { margin-top: 0; }
.chat-line-reply .chat-item .content > :last-child { margin-bottom: 0; }
.chat-line-reply .chat-item .content h1,
.chat-line-reply .chat-item .content h2,
.chat-line-reply .chat-item .content h3,
.chat-line-reply .chat-item .content h4 {
  color: var(--aigcx-ink-strong) !important;
  font-weight: 650 !important; letter-spacing: -.008em;
  margin: 1.5em 0 .55em; line-height: 1.34;
}
.chat-line-reply .chat-item .content h1 { font-size: 1.5em; }
.chat-line-reply .chat-item .content h2 { font-size: 1.3em; }
.chat-line-reply .chat-item .content h3 { font-size: 1.12em; }
.chat-line-reply .chat-item .content h4 { font-size: 1em; }
.chat-line-reply .chat-item .content ul,
.chat-line-reply .chat-item .content ol { padding-left: 1.4em; margin: 0 0 .9em; }
.chat-line-reply .chat-item .content ul { list-style: disc outside !important; }
.chat-line-reply .chat-item .content ol { list-style: decimal outside !important; }
.chat-line-reply .chat-item .content li { margin: .3em 0; }
.chat-line-reply .chat-item .content li::marker { color: var(--aigcx-gold); }
.chat-line-reply .chat-item .content li p { margin: 0; }
.chat-line-reply .chat-item .content strong { color: var(--aigcx-ink-strong); font-weight: 650; }
.chat-line-reply .chat-item .content em { font-style: italic; }
.chat-line-reply .chat-item .content a {
  color: var(--aigcx-gold); text-decoration: underline;
  text-decoration-thickness: 1px; text-underline-offset: 3px;
}
.chat-line-reply .chat-item .content a:hover { text-decoration-thickness: 2px; }
.chat-line-reply .chat-item .content hr { border: 0; border-top: 1px solid var(--aigcx-hairline); margin: 1.6em 0; }
.chat-line-reply .chat-item .content blockquote {
  margin: 0 0 1em; padding: 4px 0 4px 16px;
  border-left: 2px solid var(--aigcx-gold-edge);
  color: var(--aigcx-muted);
}
.chat-line-reply .chat-item .content img { border-radius: 12px; max-width: 100%; }
.chat-line-reply .chat-item .content table {
  border-collapse: collapse; margin: 0 0 1.1em; font-size: .94em;
  display: block; overflow-x: auto;
}
.chat-line-reply .chat-item .content th,
.chat-line-reply .chat-item .content td {
  border: 1px solid var(--aigcx-hairline); padding: 8px 13px; text-align: left;
}
.chat-line-reply .chat-item .content th {
  background: var(--aigcx-surface-2); color: var(--aigcx-ink-strong); font-weight: 600;
}

/* 代码 */
.chat-item .content code {
  background: var(--aigcx-inline-bg) !important;
  color: var(--aigcx-inline-ink) !important;
  border-radius: 6px; padding: 1px 6px; font-size: .9em;
  border: 1px solid var(--aigcx-code-border);
}
.chat-item .content pre {
  background: var(--aigcx-code-bg) !important;
  color: var(--aigcx-code-ink) !important;
  border-radius: 14px; border: 1px solid var(--aigcx-code-border);
  padding: 16px 18px; margin: 0 0 1.1em;
  overflow-x: auto; line-height: 1.64;
  scrollbar-width: thin;
}
.chat-item .content pre code {
  background: transparent !important; border: 0 !important;
  padding: 0 !important; color: inherit !important; font-size: .92em;
}
.chat-line-prompt .chat-item .content code {
  background: rgba(255, 255, 255, .14) !important;
  color: var(--aigcx-me-ink) !important;
  border-color: rgba(255, 255, 255, .18);
}

/* 思考过程 */
.think-content {
  color: var(--aigcx-muted) !important;
  border-left: 2px solid var(--aigcx-gold-edge) !important;
  margin: 10px 0 16px 0 !important;
  padding: 2px 0 2px 16px !important;
  font-size: .96em;
  line-height: 1.7;
}
.deep-seek-btn { color: var(--aigcx-gold) !important; font-size: 12.5px; letter-spacing: .01em; }

/* 消息操作条：悬停才出现，避免噪音 */
.chat-item .tool-box { opacity: 0; transition: opacity .18s ease; }
.chat-line:hover .tool-box,
.chat-line:focus-within .tool-box { opacity: 1; }
.chat-item .bar .bar-item {
  background: transparent !important; color: var(--aigcx-muted) !important;
  border-radius: 999px; padding: 3px 9px !important; font-size: 12px;
  transition: background .16s ease, color .16s ease;
}
.chat-item .bar .bar-item:hover { background: var(--aigcx-surface-2) !important; color: var(--aigcx-ink) !important; }
.chat-item .bar { border-top-color: var(--aigcx-hairline-soft) !important; }
.chat-item .tool-box .ant-btn,
.chat-item .bar .ant-btn {
  background: transparent !important; color: var(--aigcx-muted) !important;
  border-radius: 8px !important; border-color: transparent !important;
}
.chat-item .tool-box .ant-btn:hover,
.chat-item .bar .ant-btn:hover { background: var(--aigcx-surface-2) !important; color: var(--aigcx-ink) !important; }
.chat-item .image-slot { color: var(--aigcx-muted) !important; border-color: var(--aigcx-hairline) !important; }
#disclaimer { color: var(--aigcx-muted) !important; }

/* 新消息入场：一次编排好的落位，不做满屏弹跳 */
@keyframes aigcx-rise {
  from { opacity: 0; transform: translateY(10px); filter: blur(2px); }
  to   { opacity: 1; transform: none; filter: none; }
}
.chat-line.aigcx-enter { animation: aigcx-rise .34s cubic-bezier(.22, .61, .36, 1) both; }

/* 空会话 */
.chat-box.aigcx-empty {
  display: flex !important; align-items: center; justify-content: center;
  padding: 0 0 40px !important;
}
.chat-box.aigcx-empty > div { width: 100%; }
.chat-box.aigcx-empty .chat-line-reply { padding: 0 !important; animation: none; }
.chat-box.aigcx-empty .chat-line-inner {
  max-width: 640px; margin: 0 auto !important; padding: 0 24px !important;
  flex-direction: column !important; align-items: center !important; gap: 22px !important;
}
.chat-box.aigcx-empty .chat-icon { margin: 0 !important; }
.chat-box.aigcx-empty .chat-icon img {
  width: 48px !important; height: 48px !important; border-radius: 16px !important;
  box-shadow: 0 0 0 1px var(--aigcx-hairline), 0 18px 34px -20px rgba(4, 12, 24, .6);
}
.chat-box.aigcx-empty .chat-item {
  border: 0 !important; padding: 0 !important; background: transparent !important; text-align: center;
}
.chat-box.aigcx-empty .chat-item::before { display: none !important; }
.chat-box.aigcx-empty .chat-item .content {
  font-size: 26px !important; font-weight: 600 !important; letter-spacing: -.014em;
  line-height: 1.32 !important; color: var(--aigcx-ink-strong) !important;
  min-height: 0 !important; max-width: none !important;
}

/* ============ 10. 输入区 ============ */
.drager_bottom { display: flex !important; align-items: flex-end !important; }
.drager_bottom > div { width: 100% !important; flex: 1 1 100% !important; }
/* 输入框的可见高度由脚本按面板真实空间计算（见 maxInputHeight） */
#right-down.right-down {
  height: auto !important; min-height: 60px;
  margin: 0 auto 14px !important;
}
.right-down {
  background: var(--aigcx-surface) !important;
  border: 1px solid var(--aigcx-hairline) !important;
  border-radius: 18px !important;
  padding: 9px 10px !important;
  max-width: 880px;
  width: calc(100% - 64px) !important;
  display: flex !important; align-items: flex-end !important; gap: 10px !important;
  box-shadow: var(--aigcx-lift);
  transition: border-color .18s ease, box-shadow .18s ease;
}
.right-down > .c-textarea, .right-down > .c-textarea2 {
  flex: 1 1 auto !important; width: auto !important; height: 100% !important;
  margin: 0 !important; min-width: 0;
}
.right-down > .add { display: none !important; }
#right-down > .c-textarea, #right-down > .c-textarea2 { height: auto !important; align-self: center; }
#right-down .c-textarea textarea, #right-down .c-textarea2 textarea {
  height: auto; min-height: 30px; max-height: 168px; overflow-y: auto;
}
.right-down:focus-within { border-color: var(--aigcx-gold-edge) !important; }
@supports selector(:has(*)) {
  .right-down:focus-within { border-color: var(--aigcx-hairline) !important; }
  .right-down:has(textarea:focus-visible) {
    border-color: var(--aigcx-gold-edge) !important;
    box-shadow: var(--aigcx-ring), var(--aigcx-lift);
  }
}
.c-textarea textarea, .c-textarea2 textarea, #right-down textarea.ant-input {
  background: transparent !important;
  color: var(--aigcx-ink) !important;
  font-size: 15.5px !important;
  line-height: 1.6 !important;
  padding: 8px 12px !important;
  border: 0 !important;
  box-shadow: none !important;
  resize: none;
}
.c-textarea textarea::placeholder, .c-textarea2 textarea::placeholder {
  color: var(--aigcx-faint) !important; opacity: 1;
}
.c-textarea textarea:focus, .c-textarea2 textarea:focus { box-shadow: none !important; }
.ant-input-textarea-show-count::after { color: var(--aigcx-faint) !important; font-size: 11px !important; }
#send-btn {
  width: 38px !important; height: 38px !important; min-width: 38px;
  border-radius: 50% !important;
  background: var(--aigcx-gold-fill) !important;
  border: 0 !important; padding: 0 !important;
  margin: 0 0 2px 0 !important;
  display: inline-flex !important; align-items: center; justify-content: center;
  box-shadow: none !important;
  transition: filter .16s ease, transform .16s ease;
}
#send-btn svg, #send-btn svg path, #send-btn svg * {
  width: 18px; height: 18px; fill: var(--aigcx-on-accent) !important;
}
#send-btn:hover { filter: brightness(.93); transform: translateY(-1px); }
#send-btn:active { transform: translateY(0); }
#send-btn:disabled, #send-btn[disabled] { opacity: .45; }
.speach-text-max, .speach-text-min, .stt-btn { color: var(--aigcx-muted) !important; }
.upload-but { opacity: .7; filter: var(--aigcx-logo-filter); }
.upload-but:hover { opacity: 1; }

/* 生成中的光标：比转圈更能说明「正在写」 */
@keyframes aigcx-caret {
  0%, 45% { opacity: 1; }
  55%, 100% { opacity: .15; }
}
.chat-line-reply .content > p:last-child::after,
.chat-line-reply .content > ul:last-child::after {
  content: '';
}
.chat-line-reply.aigcx-streaming .chat-item .content::after {
  content: '';
  display: inline-block;
  width: 7px; height: 1.05em;
  margin-left: 4px;
  vertical-align: -2px;
  border-radius: 1px;
  background: var(--aigcx-gold);
  animation: aigcx-caret 1.05s steps(1, end) infinite;
}

/* 流式输出时减少无谓的重排与重绘 */
.chat-box { contain: layout style; }
.chat-line { contain: layout; }
.chat-line-reply .chat-item .content, .chat-line-prompt .chat-item { contain: content; }
.chat-item .content pre, .chat-item .content table { contain: content; }
/* 只对可能变化的属性做过渡，避免全属性过渡带来的抖动 */
.chat-item, .chat-item .content, .chat-line-inner { will-change: auto; }
/* KaTeX 失败时不要把整段染红 */
.katex-error { color: inherit !important; }
/* 公式容器：块级公式独立成行，行内公式跟随文字基线 */
.aigcx-math { display: inline; }
.aigcx-math-block { display: block; margin: 1.1em 0 .35em; }
.aigcx-math-block .katex-display { margin: 0; }
.aigcx-math-block .katex-display > .katex { text-align: left; }
.aigcx-math-pending, .aigcx-math-pending-raw {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .88em;
  color: var(--aigcx-muted);
  background: var(--aigcx-surface-3);
  border-radius: 5px;
  padding: .1em .35em;
}
/* 流式输出时公式还没写完：显示为等宽原文，写完就替换成排版结果 */
.aigcx-math-pending-raw {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
  margin: .6em 0;
  opacity: .75;
}
/* 长公式在窄屏横向滚动，不撑破气泡 */
.chat-item .content .katex-display { overflow-x: auto; overflow-y: hidden; padding: .2em 0; }
.chat-item .content .katex-display::-webkit-scrollbar { height: 6px; }
.chat-item .content .katex-display::-webkit-scrollbar-thumb {
  background: var(--aigcx-hairline); border-radius: 3px;
}
/* KaTeX 使用自身字体，不要被站点中文字体覆盖 */
.katex, .katex .mathnormal, .katex .mord, .katex .mbin, .katex .mrel {
  font-family: KaTeX_Main, KaTeX_Math, Times New Roman, serif;
  letter-spacing: 0;
}

/* ============ 11. 杂项 ============ */
.menu_collapse { color: var(--aigcx-on-accent) !important; }
.menu_collapse::before { background: var(--aigcx-gold-fill) !important; }
.menu_collapse:hover::before { background: var(--aigcx-gold) !important; }
.sample-but { opacity: .9; transition: filter .2s ease, opacity .2s ease; }
:root[data-aigcx-theme='dark'] .sample-but { filter: invert(.92) hue-rotate(180deg) saturate(.6); opacity: .5; }
:root[data-aigcx-theme='light'] .sample-but { filter: none; }
.base-div, .ant-card, .ant-card-head, .ant-card-body {
  background: var(--aigcx-surface) !important;
  border-color: var(--aigcx-hairline) !important;
  color: var(--aigcx-ink) !important;
}
.ant-card-head { border-bottom-color: var(--aigcx-hairline) !important; }
.ant-back-top-content { background: var(--aigcx-gold-fill) !important; color: var(--aigcx-on-accent) !important; }
#nprogress .bar { background: var(--aigcx-gold-fill) !important; }
#nprogress .peg { box-shadow: 0 0 10px var(--aigcx-gold-fill), 0 0 5px var(--aigcx-gold-fill) !important; }
.ant-divider { border-color: var(--aigcx-hairline) !important; }

/* ============ 12. 浮层 ============ */
.ant-dropdown-menu, .ant-select-dropdown, .ant-popover-inner, .ant-tooltip-inner,
.ant-modal-content, .ant-modal-header, .ant-message-notice-content {
  background: var(--aigcx-surface) !important;
  color: var(--aigcx-ink) !important;
  border-radius: 14px !important;
  border: 1px solid var(--aigcx-hairline) !important;
  box-shadow: 0 16px 40px -18px rgba(4, 10, 20, .45) !important;
}
.ant-dropdown-menu-item, .ant-select-item, .ant-tooltip-inner {
  color: var(--aigcx-ink) !important; font-size: 13.5px !important;
}
.ant-dropdown-menu-item:hover, .ant-select-item-option-active { background: var(--aigcx-surface-2) !important; }
.ant-modal-title, .ant-modal-close { color: var(--aigcx-ink-strong) !important; }
.ant-modal-mask { background: rgba(4, 9, 16, .5) !important; }
.ant-image-preview-mask { background: rgba(4, 9, 16, .85) !important; }
.ant-spin-dot-item { background: var(--aigcx-gold-fill) !important; }
.ant-empty-description, .ant-descriptions-item-label { color: var(--aigcx-muted) !important; }

/* 通用输入控件（登录页、搜索框、设置等） */
.ant-input, .ant-input-affix-wrapper, .ant-input-group-addon,
.ant-select:not(.ant-select-customize-input) .ant-select-selector,
.ant-picker { background: var(--aigcx-surface-2) !important; }
.ant-input:focus, .ant-input-affix-wrapper-focused,
.ant-select-focused:not(.ant-select-disabled) .ant-select-selector {
  border-color: var(--aigcx-gold-edge) !important;
  box-shadow: var(--aigcx-ring) !important;
}

/* ============ 13. 登录页 ============ */
.loginbg[data-v-b583ecc1] {
  background-image: radial-gradient(120% 90% at 50% 0%, var(--aigcx-gold-tint) 0%, transparent 58%) !important;
  background-color: var(--aigcx-canvas) !important;
  background-size: auto !important;
}
.login-block[data-v-b583ecc1] {
  background: var(--aigcx-surface) !important;
  border: 1px solid var(--aigcx-hairline) !important;
  border-radius: 20px !important;
  box-shadow: 0 28px 64px -34px rgba(4, 10, 20, .5) !important;
  color: var(--aigcx-ink) !important;
  padding: 34px 30px 30px !important;
}
.login-block h2, .login-block h3, .login-block .ant-tabs-tab { color: var(--aigcx-ink-strong) !important; }
.login-block .ant-tabs-tab:hover { color: var(--aigcx-gold) !important; }
.login-block .ant-tabs-tab-active .ant-tabs-tab-btn { color: var(--aigcx-gold) !important; font-weight: 600; }
.login-block .ant-tabs-ink-bar { background: var(--aigcx-gold-fill) !important; }
.login-block .ant-tabs-top > .ant-tabs-nav::before { border-bottom-color: var(--aigcx-hairline) !important; }
.login-btn {
  background: var(--aigcx-gold-fill) !important; border: 0 !important;
  border-radius: 12px !important; color: var(--aigcx-on-accent) !important;
  font-size: 15px !important; font-weight: 600 !important;
  height: 44px !important; padding-top: 0 !important; margin-top: 26px !important;
  letter-spacing: .02em; transition: filter .16s ease;
}
.login-btn:hover { filter: brightness(.94); }
.disclaimer { color: var(--aigcx-muted) !important; font-size: 12.5px !important; }
.login-block .ant-checkbox-inner { background: var(--aigcx-surface-2) !important; border-color: var(--aigcx-hairline) !important; }
.login-block .ant-checkbox-checked .ant-checkbox-inner {
  background: var(--aigcx-gold-fill) !important; border-color: var(--aigcx-gold-fill) !important;
}

/* ============ 14. 无障碍 / 响应式 ============ */
:focus-visible { outline: 2px solid var(--aigcx-gold); outline-offset: 2px; border-radius: 8px; }
.chat-box, .conversation-ul, .conversation-right, .conversation-left,
.layout-block, pre, textarea { scrollbar-width: thin; scrollbar-color: var(--aigcx-hairline) transparent; }
.chat-box::-webkit-scrollbar, .conversation-ul::-webkit-scrollbar, .conversation-right::-webkit-scrollbar,
.conversation-left::-webkit-scrollbar, pre::-webkit-scrollbar, .layout-block::-webkit-scrollbar,
textarea::-webkit-scrollbar { width: 10px; height: 10px; }
.chat-box::-webkit-scrollbar-thumb, .conversation-ul::-webkit-scrollbar-thumb,
.conversation-right::-webkit-scrollbar-thumb, .conversation-left::-webkit-scrollbar-thumb,
pre::-webkit-scrollbar-thumb, .layout-block::-webkit-scrollbar-thumb, textarea::-webkit-scrollbar-thumb {
  background: var(--aigcx-hairline); border-radius: 999px;
  border: 3px solid transparent; background-clip: content-box;
}
.chat-box::-webkit-scrollbar-thumb:hover, .conversation-ul::-webkit-scrollbar-thumb:hover,
.conversation-right::-webkit-scrollbar-thumb:hover, pre::-webkit-scrollbar-thumb:hover,
textarea::-webkit-scrollbar-thumb:hover { background-clip: content-box; background-color: var(--aigcx-muted); }
.chat-box::-webkit-scrollbar-track, .conversation-ul::-webkit-scrollbar-track,
.conversation-right::-webkit-scrollbar-track, pre::-webkit-scrollbar-track,
textarea::-webkit-scrollbar-track { background: transparent; }

@media (max-width: 1024px) {
  .chat-line-inner { padding: 0 18px !important; }
  .chat-line-prompt .chat-item { max-width: 86%; }
  .right-down { width: calc(100% - 28px) !important; }
  .gpt-change { display: none !important; }
}
@media (max-width: 760px) {
  .chat-line-inner { gap: 10px; padding: 0 12px !important; }
  .chat-line-reply .chat-item { padding-left: 16px !important; }
  .chat-line-prompt .chat-item { max-width: 92%; }
  .chat-line-prompt { padding-top: 28px !important; }
  .chat-line-reply { padding-bottom: 30px !important; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: .001ms !important;
    animation-duration: .001ms !important;
    animation-delay: 0ms !important;
  }
  .chat-box { scroll-behavior: auto; }
}
`;

  function resolveTheme() {
    return pref === 'dark' || pref === 'light' ? pref : (media.matches ? 'dark' : 'light');
  }

  function apply() {
    var theme = resolveTheme();
    var root = document.documentElement;
    if (root.getAttribute('data-aigcx-theme') !== theme) root.setAttribute('data-aigcx-theme', theme);
    root.style.colorScheme = theme;
  }

  function inject() {
    if (document.getElementById('aigcx-style')) return;
    var style = document.createElement('style');
    style.id = 'aigcx-style';
    style.textContent = CSS_TEXT;
    (document.head || document.documentElement).appendChild(style);
  }

  var COMPOSER_MAX = 260;
  var settled = false;
  var watching = false;
  var syncQueued = false;
  var fitPending = false;

  /* ---------------- 输入框 ---------------- */

  function grow(target) {
    var ta = target || document.getElementById('c-textarea');
    if (!ta || ta.tagName !== 'TEXTAREA' || !ta.isConnected) return;
    if (ta.rows !== 1) ta.rows = 1;
    ta.style.maxHeight = COMPOSER_MAX + 'px';
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, COMPOSER_MAX) + 'px';
    ta.style.overflowY = ta.scrollHeight > COMPOSER_MAX + 1 ? 'auto' : 'hidden';
  }

  function fitComposer() {
    var row = document.querySelector('.drager_row');
    var top = row && row.querySelector('.drager_top');
    var bottom = row && row.querySelector('.drager_bottom');
    var ta = document.getElementById('c-textarea');
    if (!row || !top || !bottom || !ta) return;
    var rowH = row.getBoundingClientRect().height;
    if (!rowH) return;
    if (row.__aigcxBase === undefined) {
      row.__aigcxBase = bottom.getBoundingClientRect().height || rowH * 0.17;
    }
    var want = Math.min(ta.scrollHeight + 20, COMPOSER_MAX) + 66;
    var minTop = Math.max(180, rowH * 0.28);
    var target = Math.max(row.__aigcxBase, Math.min(want, rowH - minTop));
    if (Math.abs(bottom.getBoundingClientRect().height - target) < 1.5) return;
    row.style.height = rowH + 'px';
    bottom.style.height = 'auto';
    bottom.style.flex = '0 0 ' + target + 'px';
    top.style.height = 'auto';
    top.style.flex = '1 1 auto';
    top.style.minHeight = '0';
  }

  function requestFit() {
    if (fitPending) return;
    fitPending = true;
    requestAnimationFrame(function () { fitPending = false; fitComposer(); });
  }

  /* ---------------- 空会话 ---------------- */

  function tagWelcome() {
    var box = document.querySelector('.chat-box');
    if (!box) return;
    var lines = box.querySelectorAll('.chat-line');
    var welcome = lines.length === 1 ? lines[0] : null;
    var empty = false;
    if (welcome && welcome.classList.contains('chat-line-reply')) {
      var content = welcome.querySelector('.chat-item .content');
      if (content && !content.children.length && (content.textContent || '').trim().length < 40) empty = true;
    }
    if (box.classList.contains('aigcx-empty') !== empty) box.classList.toggle('aigcx-empty', empty);
  }

  /* ---------------- 滚动与入场 ---------------- */

  var stickToBottom = true;
  var lastScrollTop = 0;
  var userScrolledUp = false;
  var animated = new WeakSet();

  function nearBottom(box) {
    return !box || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  }

  function bindScroll() {
    var box = document.querySelector('.chat-box');
    if (!box || box.__aigcxScroll) return;
    box.__aigcxScroll = true;
    box.addEventListener('scroll', function () {
      if (box.scrollTop < lastScrollTop - 2) userScrolledUp = true;
      else if (nearBottom(box)) userScrolledUp = false;
      lastScrollTop = box.scrollTop;
      stickToBottom = !userScrolledUp;
    }, { passive: true });
  }

  function followTail() {
    var box = document.querySelector('.chat-box');
    if (!box || !stickToBottom || userScrolledUp) return;
    var target = box.scrollHeight - box.clientHeight;
    if (Math.abs(box.scrollTop - target) < 2) return;
    box.scrollTop = target;
  }

  function markArrivals() {
    var box = document.querySelector('.chat-box');
    if (!box) return;
    var lines = box.querySelectorAll('.chat-line');
    for (var i = 0; i < lines.length; i++) {
      var el = lines[i];
      if (animated.has(el)) continue;
      animated.add(el);
      if (!settled) continue;
      el.classList.add('aigcx-enter');
      (function (node) {
        setTimeout(function () { node.classList.remove('aigcx-enter'); }, 420);
      })(el);
    }
  }

  function trackStreaming() {
    var box = document.querySelector('.chat-box');
    var replies = document.querySelectorAll('.chat-box .chat-line-reply');
    var last = replies.length ? replies[replies.length - 1] : null;
    if (!last || (box && (box.classList.contains('aigcx-empty') || replies.length < 2))) {
      if (last) last.classList.remove('aigcx-streaming');
      return;
    }
    var streaming = !!last.querySelector('.chat-item .content') && !last.querySelector('.bar');
    if (streaming !== last.classList.contains('aigcx-streaming')) {
      last.classList.toggle('aigcx-streaming', !!streaming);
    }
  }

  /* ---------------- 数学公式：在 markdown-it 之前接管 ---------------- */

  /* 站点用 markdown-it 渲染整段回复，它的转义规则会破坏 LaTeX：
       \[ .. \]  -->  [ .. ]       反斜杠被当作标点转义吃掉
       1 \\ 2    -->  1 \ 2        矩阵行分隔符塌成单反斜杠，矩阵塌成一行
       x_i       -->  x<em>i</em>  下划线被当成强调
     这些变换全部有损，事后在 DOM 上无法还原。
     正确做法：在 markdown-it 之前把公式整段抽出来换成不可见占位符，
     渲染完成后把占位符换成 KaTeX 输出——公式全程不经过 markdown 解析。 */

  var BT = String.fromCharCode(96);
  var FENCE = BT + BT + BT;

  var KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
  var KATEX_JS = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';

  var ENV_HEAD = /^\\begin\{(matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|cases|dcases|aligned|align|alignat|gathered|gather|split|array|CD)\}/;

  var SENTINEL = '\u2063';
  var SLOT_HEAD = SENTINEL + 'AIGCX';
  var SLOT_RE = /\u2063AIGCX(\d+)\u2063/g;
  var BLOCK_SLOT_RE = /<p>\s*\u2063AIGCX(\d+)\u2063\s*<\/p>/g;

  var mathCache = Object.create(null);
  var mathCacheSize = 0;
  var upgradeQueued = false;
  var katexWaiters = [];
  var katexRequested = false;
  var hooked = false;

  /* ---------------- KaTeX 装载 ---------------- */

  function ensureKatexCss() {
    if (document.getElementById('aigcx-katex-css')) return;
    var link = document.createElement('link');
    link.id = 'aigcx-katex-css';
    link.rel = 'stylesheet';
    link.href = KATEX_CSS;
    (document.head || document.documentElement).appendChild(link);
  }

  function flushKatex(ok) {
    var waiters = katexWaiters;
    katexWaiters = [];
    for (var i = 0; i < waiters.length; i++) {
      try { waiters[i](ok); } catch (e) { /* 单个回调失败不影响其他 */ }
    }
  }

  function ensureKatex(cb) {
    ensureKatexCss();
    if (window.katex && typeof window.katex.renderToString === 'function') {
      if (cb) cb(true);
      return;
    }
    if (cb) katexWaiters.push(cb);
    if (katexRequested) return;
    katexRequested = true;
    var s = document.createElement('script');
    s.src = KATEX_JS;
    s.async = true;
    s.onload = function () { flushKatex(!!window.katex); };
    s.onerror = function () { flushKatex(false); };
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------------- 单条公式渲染（带缓存） ---------------- */

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderTex(tex, display) {
    var key = (display ? 'D:' : 'I:') + tex;
    var hit = mathCache[key];
    if (hit !== undefined) return hit;
    if (!window.katex || typeof window.katex.renderToString !== 'function') return null;
    var html = null;
    try {
      html = window.katex.renderToString(tex, {
        displayMode: !!display,
        throwOnError: false,
        strict: false,
        trust: false
      });
    } catch (e) {
      html = null;
    }
    if (html === null) return null;
    if (mathCacheSize > 900) {
      mathCache = Object.create(null);
      mathCacheSize = 0;
    }
    mathCache[key] = html;
    mathCacheSize += 1;
    return html;
  }

  function slotHtml(slot) {
    if (slot.partial) {
      return '<span class="aigcx-math-pending-raw">' + escapeAttr(slot.tex) + '</span>';
    }
    var html = renderTex(slot.tex, slot.display);
    if (html === null) {
      /* KaTeX 未就绪：先留占位，加载完成后统一升级 */
      return '<span class="aigcx-math-pending" data-aigcx-tex="' + escapeAttr(slot.tex) +
        '" data-aigcx-display="' + (slot.display ? '1' : '0') + '">' + escapeAttr(slot.tex) + '</span>';
    }
    if (slot.display) {
      return '<span class="aigcx-math aigcx-math-block">' + html + '</span>';
    }
    return '<span class="aigcx-math">' + html + '</span>';
  }

  /* ---------------- 抽取公式：换成占位符 ---------------- */

  /* 找到下一段正文的起点，用来限制"未闭合公式"的保护范围 */
  function paraEnd(s, from) {
    var idx = s.indexOf('\n\n', from);
    return idx < 0 ? s.length : idx;
  }

  /* 金额里的 $ 不是公式：$5 and $10 这类要原样保留 */
  function looksMoney(tex) {
    if (!tex) return true;
    if (/^[\d.,%]+$/.test(tex)) return true;
    if (/^\d[\d.,]*\s+\D/.test(tex)) return true;
    return false;
  }

  function maskMath(src) {
    var slots = [];
    var out = '';
    var i = 0;
    var n = src.length;
    var ch;

    function push(tex, display) {
      slots.push({ tex: tex, display: !!display });
      return SLOT_HEAD + (slots.length - 1) + SENTINEL;
    }

    while (i < n) {
      ch = src.charAt(i);

      /* 代码围栏与行内代码原样保留 */
      if (ch === BT) {
        var mark = src.substr(i, 3);
        if (mark === FENCE || mark === '~~~') {
          var fenceEnd = src.indexOf(mark, i + 3);
          if (fenceEnd < 0) { out += src.slice(i); break; }
          fenceEnd += 3;
          out += src.slice(i, fenceEnd);
          i = fenceEnd;
          continue;
        }
        var tickEnd = src.indexOf(BT, i + 1);
        if (tickEnd > 0 && src.slice(i, tickEnd).indexOf('\n') < 0) {
          out += src.slice(i, tickEnd + 1);
          i = tickEnd + 1;
          continue;
        }
        out += ch;
        i += 1;
        continue;
      }

      /* $$ ... $$（流式中尚未闭合也要保护，否则 markdown 会吃掉反斜杠） */
      if (ch === '$' && src.charAt(i + 1) === '$') {
        var endD = src.indexOf('$$', i + 2);
        if (endD > 0) {
          out += push(src.slice(i + 2, endD).trim(), true);
          i = endD + 2;
          continue;
        }
        /* 未闭合的 $$：只保护到本段结束。
           否则模型漏写开头时，后面的整段正文都会被吞进占位符。 */
        var stopD = paraEnd(src, i + 2);
        var segmentD = src.slice(i + 2, stopD);
        if (segmentD.trim()) {
          slots.push({ tex: segmentD.trim(), display: true, partial: true });
          out += SLOT_HEAD + (slots.length - 1) + SENTINEL;
        }
        /* 段落为空说明这是孤零零的定界符，直接丢掉 */
        i = stopD;
        continue;
      }

      /* \[ ... \] */
      if (ch === '\\' && src.charAt(i + 1) === '[') {
        var endB = src.indexOf('\\]', i + 2);
        if (endB > 0) {
          out += push(src.slice(i + 2, endB).trim(), true);
          i = endB + 2;
          continue;
        }
        var stopB = paraEnd(src, i + 2);
        var segmentB = src.slice(i + 2, stopB);
        if (segmentB.trim()) {
          slots.push({ tex: segmentB.trim(), display: true, partial: true });
          out += SLOT_HEAD + (slots.length - 1) + SENTINEL;
        }
        i = stopB;
        continue;
      }

      /* \( ... \) */
      if (ch === '\\' && src.charAt(i + 1) === '(') {
        var endP = src.indexOf('\\)', i + 2);
        if (endP > 0) {
          out += push(src.slice(i + 2, endP).trim(), false);
          i = endP + 2;
          continue;
        }
        var stopP = paraEnd(src, i + 2);
        var segmentP = src.slice(i + 2, stopP);
        if (segmentP.trim()) {
          slots.push({ tex: segmentP.trim(), display: false, partial: true });
          out += SLOT_HEAD + (slots.length - 1) + SENTINEL;
        }
        i = stopP;
        continue;
      }

      /* 裸环境 \begin{env} ... \end{env} */
      if (ch === '\\' && src.substr(i, 7) === '\\begin{') {
        var head = ENV_HEAD.exec(src.slice(i));
        if (head) {
          var env = head[1];
          var closer = '\\end{' + env + '}';
          var endE = src.indexOf(closer, i + head[0].length);
          if (endE > 0) {
            endE += closer.length;
            out += push(src.slice(i, endE), true);
            i = endE;
            continue;
          }
          /* 环境还没闭合（流式中）：保护到本段结束即可 */
          var stopE = paraEnd(src, i);
          var segmentE = src.slice(i, stopE);
          if (segmentE.trim()) {
            slots.push({ tex: segmentE.trim(), display: true, partial: true });
            out += SLOT_HEAD + (slots.length - 1) + SENTINEL;
          }
          i = stopE;
          continue;
        }
      }

      /* $ ... $ 行内；不像公式就当美元符号 */
      if (ch === '$') {
        var j = i + 1;
        var closed = -1;
        while (j < n) {
          var cj = src.charAt(j);
          if (cj === '\\') { j += 2; continue; }
          if (cj === '\n') break;
          if (cj === '$') { closed = j; break; }
          j += 1;
        }
        if (closed > i + 1) {
          var tex = src.slice(i + 1, closed).trim();
          if (tex && !looksMoney(tex)) {
            out += push(tex, false);
            i = closed + 1;
            continue;
          }
        }
        out += ch;
        i += 1;
        continue;
      }

      out += ch;
      i += 1;
    }

    return { text: out, slots: slots };
  }

  /* ---------------- 放回公式 ---------------- */

  function restoreMath(html, slots) {
    if (!slots.length) return html;
    BLOCK_SLOT_RE.lastIndex = 0;
    html = html.replace(BLOCK_SLOT_RE, function (whole, idx) {
      var slot = slots[+idx];
      if (!slot) return whole;
      return '<div class="aigcx-math aigcx-math-block">' + slotHtml(slot) + '</div>';
    });
    SLOT_RE.lastIndex = 0;
    html = html.replace(SLOT_RE, function (whole, idx) {
      var slot = slots[+idx];
      return slot ? slotHtml(slot) : whole;
    });
    /* 模型常把定界符写歪，留下孤零零的 $ 段落；只清掉整段仅含 $ 的 */
    html = html.replace(/<p>\s*\$+\s*<\/p>\s*/g, '');
    return html;
  }

  /* ---------------- 挂上 markdown-it ---------------- */

  function wrapRender(fn) {
    return function (src, options) {
      if (typeof src !== 'string' || !src) return fn.apply(this, arguments);
      if (src.indexOf('$') < 0 && src.indexOf('\\') < 0) return fn.apply(this, arguments);
      var masked;
      try {
        masked = maskMath(src);
      } catch (e) {
        return fn.apply(this, arguments);
      }
      var args = Array.prototype.slice.call(arguments);
      args[0] = masked.text;
      var rendered = fn.apply(this, args);
      if (!masked.slots.length) return rendered;
      return restoreMath(rendered, masked.slots);
    };
  }

  function patchMarkdown(mod) {
    var MD = mod && (mod.M || mod.default || mod);
    if (typeof MD !== 'function' || !MD.prototype) return false;
    var proto = MD.prototype;
    if (proto.__aigcxPatched) return true;
    if (typeof proto.render === 'function') proto.render = wrapRender(proto.render);
    if (typeof proto.renderInline === 'function') proto.renderInline = wrapRender(proto.renderInline);
    proto.__aigcxPatched = true;
    return true;
  }

  function markdownUrl() {
    var list = performance.getEntriesByType('resource');
    for (var i = 0; i < list.length; i++) {
      if (/\/assets\/js\/markdown-it-[0-9a-f]+\.js$/.test(list[i].name)) return list[i].name;
    }
    var links = document.querySelectorAll('link[rel="modulepreload"], link[rel="preload"]');
    for (var k = 0; k < links.length; k++) {
      var href = links[k].href || '';
      if (/\/assets\/js\/markdown-it-[0-9a-f]+\.js$/.test(href)) return href;
    }
    return null;
  }

  var pollCount = 0;

  function tryHook() {
    if (hooked) return true;
    var url = markdownUrl();
    if (!url) return false;
    hooked = true;
    import(url).then(function (mod) {
      if (!patchMarkdown(mod)) hooked = false;
    }).catch(function () {
      hooked = false;
    });
    return true;
  }

  /* 首次渲染可能紧接着 chunk 加载就发生，轮询太慢会漏掉。
     用 PerformanceObserver 在 markdown-it chunk 一出现时就立刻挂上。 */
  function observeResources() {
    if (typeof PerformanceObserver !== 'function') return false;
    try {
      var po = new PerformanceObserver(function () {
        if (!hooked) tryHook();
      });
      po.observe({ entryTypes: ['resource'] });
      return true;
    } catch (e) {
      return false;
    }
  }

  function pollHook() {
    if (tryHook()) return;
    if (pollCount >= 400) return;
    pollCount += 1;
    setTimeout(pollHook, 25);
  }

  /* ---------------- 占位升级 & 调度 ---------------- */

  function runMathPass() {
    if (!window.katex) {
      ensureKatex(function () { runMathPass(); });
      return false;
    }
    var nodes = document.querySelectorAll('.aigcx-math-pending[data-aigcx-tex]');
    if (!nodes.length) return true;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var tex = el.getAttribute('data-aigcx-tex') || '';
      var display = el.getAttribute('data-aigcx-display') === '1';
      var html = renderTex(tex, display);
      if (html === null) continue;
      var box = document.createElement('span');
      box.className = 'aigcx-math' + (display ? ' aigcx-math-block' : '');
      box.innerHTML = html;
      if (el.parentNode) el.parentNode.replaceChild(box, el);
    }
    return true;
  }

  function scheduleMath() {
    if (upgradeQueued) return;
    upgradeQueued = true;
    setTimeout(function () {
      upgradeQueued = false;
      runMathPass();
    }, 120);
  }

  function watchMath() {
    observeResources();
    pollHook();
    ensureKatex(function () { runMathPass(); });
    scheduleMath();
  }

  /* ---------------- 主循环 ---------------- */

  function sync() {
    var ta = document.getElementById('c-textarea');
    if (ta && !ta.__aigcxGrown) { ta.__aigcxGrown = true; grow(ta); requestFit(); }
    tagWelcome();
    markArrivals();
    bindScroll();
    trackStreaming();
    followTail();
    scheduleMath();
  }

  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    setTimeout(function () { syncQueued = false; sync(); }, 50);
  }

  function watchComposer() {
    if (!document.body || watching) return;
    watching = true;
    sync();

    var box = document.querySelector('.chat-box');
    new MutationObserver(function (records) {
      var meaningful = false;
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'childList' && (r.addedNodes.length || r.removedNodes.length)) {
          meaningful = true;
          break;
        }
      }
      if (!meaningful) return;
      queueSync();
    }).observe(document.body, { childList: true, subtree: true });

    document.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'c-textarea') { grow(e.target); requestFit(); }
    }, true);

    window.addEventListener('resize', function () { grow(null); requestFit(); }, { passive: true });
    setTimeout(function () { settled = true; }, 600);
  }

  function boot() { inject(); apply(); watchComposer(); watchMath(); }

  if (document.documentElement) { inject(); apply(); }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot, { once: true });

  if (media.addEventListener) media.addEventListener('change', apply);
  else if (media.addListener) media.addListener(apply);

  window.aigcx = {
    setTheme: function (v) {
      pref = v === 'dark' || v === 'light' ? v : 'auto';
      try { localStorage.setItem(STORE_KEY, pref); } catch (e) {}
      apply();
      return pref;
    },
    getTheme: function () { return resolveTheme(); },
    refresh: function () { boot(); },
    refreshMath: function () {
      mathCache = Object.create(null);
      mathCacheSize = 0;
      tryHook();
      pollHook();
      return runMathPass();
    }
  };
})();
