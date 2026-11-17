import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const userscript = readFileSync('aigc-conversation-enhance.user.js', 'utf8');
const start = userscript.indexOf('var CSS_TEXT = `') + 'var CSS_TEXT = `'.length;
const end = userscript.indexOf('`;\n\n  function resolveTheme');
if (start < 0 || end < 0) throw new Error('CSS_TEXT block not found');
const themeCss = userscript.slice(start, end);
const baseCss = readFileSync('preview/base.css', 'utf8');

const promptQ = '帮我总结一下这篇论文里关于扩散模型采样加速的三个主要方向，并说明各自的取舍。';
const reply = `<p>可以从三条主线来看：<strong>蒸馏</strong>、<strong>求解器改进</strong>、以及<strong>隐空间压缩</strong>。</p>
<ul><li>蒸馏：把多步采样压到 1–4 步，速度快，但多样性明显下降。</li><li>求解器：不改模型，用高阶 ODE 求解，几乎无损；步数下限受误差累积限制。</li><li>隐空间：在更小的空间里做扩散，计算量按维度平方下降，代价是细节损失。</li></ul>
<p>三种方法的对比：</p>
<pre><code>for step in range(steps):
    x = sampler.step(x, t, model)</code></pre>
<table><thead><tr><th>方法</th><th>步数</th><th>质量</th></tr></thead><tbody><tr><td>蒸馏</td><td>4</td><td>中</td></tr><tr><td>求解器</td><td>20</td><td>高</td></tr></tbody></table>
<p>综合来看，<a href="#">求解器改进</a>的性价比最高。</p>`;

const avatar = (c) => `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${c}"/></svg>`).toString('base64')}`;

const html = `<!doctype html>
<html lang="zh-CN" data-aigcx-theme="light">
<head>
<meta charset="utf-8">
<title>AIGC 界面增强 · 预览</title>
<style>${baseCss}</style>
<style>${themeCss}</style>
<style>
  body { margin: 0; }
  .preview-bar { position: fixed; left: 96px; bottom: 16px; z-index: 99; display: flex; gap: 8px; }
  .preview-bar button { font: inherit; font-size: 13px; padding: 7px 14px; border-radius: 999px; cursor: pointer;
    background: var(--aigcx-surface); color: var(--aigcx-ink); border: 1px solid var(--aigcx-hairline); }
  .preview-bar button[aria-pressed='true'] { background: var(--aigcx-gold-fill); color: var(--aigcx-on-accent); border-color: var(--aigcx-gold-fill); }
</style>
</head>
<body>
<header class="ant-layout-header">
  <div class="header">
    <div class="logo-box">
      <img class="logo" alt="" src="https://aigc.hkust-gz.edu.cn/assets/svg/in_UST-GZ_4C-en_L_svg-00fc1213.svg">
      <div class="systemName">AIGC Service System</div>
    </div>
    <div class="h-block"><img class="menu-unfold" alt="" src="data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="#000" stroke-width="2" fill="none"/></svg>').toString('base64')}"></div>
    <div class="gpt-change">
      <div class="h-radio">
        <div class="scroll-wrapper"><div class="ant-radio-group ant-radio-group-solid scroll-content">
          <label class="ant-radio-button-wrapper ant-radio-button-wrapper-checked scroll-item"><span>DeepSeek-V4.1</span></label>
          <label class="ant-radio-button-wrapper scroll-item"><span>GLM-5.3</span></label>
          <label class="ant-radio-button-wrapper scroll-item"><span>GPT-6</span></label>
          <label class="ant-radio-button-wrapper scroll-item"><span>DeepSeek-V4-Pro</span></label>
        </div></div>
      </div>
    </div>
    <div class="h-circle">
      <div class="dropdown-style"><div class="name-text">邵沛康</div><div class="name-icon">▾</div></div>
    </div>
  </div>
</header>

<aside class="ant-layout-sider">
  <ul class="ant-menu">
    <li class="ant-menu-item">▤</li>
    <li class="ant-menu-item">✎</li>
  </ul>
</aside>

<main class="ant-layout-content">
  <div class="layout-block">
    <div class="drager_col">
      <div class="drager_left">
        <div class="conversation">
          <div class="conversation-left">
            <div class="new-conversation"><div class="c-button">+ New Conversation</div></div>
            <div class="conversation-ul">
              <div class="conversation-li chat-list-item-active">▤ 扩散模型采样加速</div>
              <div class="conversation-li">▤ 论文翻译校对</div>
              <div class="conversation-li">▤ 实验数据整理</div>
            </div>
          </div>
          <div class="conversation-right">
            <div class="drager_row">
              <div class="drager_top">
                <div class="right-up">
                  <div class="chat-box">
                    <div class="chat-line chat-line-prompt">
                      <div class="chat-line-inner">
                        <div class="chat-item">
                          <div class="content"><p>${promptQ}</p></div>
                          <div class="bar"><span class="bar-item">复制</span><span class="bar-item">重新生成</span></div>
                        </div>
                        <div class="chat-icon"><img alt="" src="${avatar('#344f66')}"></div>
                      </div>
                    </div>
                    <div class="chat-line chat-line-reply">
                      <div class="chat-line-inner">
                        <div class="chat-icon"><img alt="" src="${avatar('#b08a2e')}"></div>
                        <div class="chat-item">
                          <div class="content">${reply}</div>
                          <div class="tool-box"><button class="ant-btn">⧉</button><button class="ant-btn">↻</button></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="slider_row"></div>
              <div class="drager_bottom">
                <div id="right-down" class="right-down">
                  <div class="ant-input-textarea c-textarea"><textarea rows="1" placeholder="Ask me anything"></textarea></div>
                  <button id="send-btn" class="ant-btn send-btn"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M2 21l21-9L2 3v7l15 2-15 2z" fill="#fff"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<div class="preview-bar">
  <button id="t-light">浅色</button>
  <button id="t-dark">深色</button>
</div>
<script>
  const apply = (t) => {
    document.documentElement.setAttribute('data-aigcx-theme', t);
    document.documentElement.style.colorScheme = t;
    document.getElementById('t-light').setAttribute('aria-pressed', String(t === 'light'));
    document.getElementById('t-dark').setAttribute('aria-pressed', String(t === 'dark'));
  };
  document.getElementById('t-light').onclick = () => apply('light');
  document.getElementById('t-dark').onclick = () => apply('dark');
  const ta = document.querySelector('#right-down textarea');
  const grow = () => {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 168) + 'px';
    ta.style.overflowY = ta.scrollHeight > 168 ? 'auto' : 'hidden';
  };
  if (ta) { grow(); ta.addEventListener('input', grow); }
  const q = new URLSearchParams(location.search).get('theme');
  apply(q === 'dark' ? 'dark' : 'light');
</script>
</body>
</html>`;

mkdirSync('preview', { recursive: true });
writeFileSync('preview/index.html', html);
console.log('preview/index.html', html.length, 'bytes; theme css', themeCss.length, 'bytes');