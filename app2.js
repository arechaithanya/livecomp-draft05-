/* ═══════════════════════════════════════════════════════════
   NEXUS IDE — Application Logic Part 2
   AI Integration (Puter.js — FREE), Dry Run, Visualizations
   ═══════════════════════════════════════════════════════════ */

// ── Puter.js AI Helper (FREE — no API key needed) ─────────

async function callAI(prompt) {
  try {
    const response = await puter.ai.chat(prompt);
    // puter.ai.chat returns the text directly or an object with .message.content
    if (typeof response === 'string') return response;
    if (response?.message?.content) return response.message.content;
    if (response?.text) return response.text;
    return String(response);
  } catch (e) {
    console.warn('Puter AI call failed:', e);
    return null;
  }
}

function showAILoading(targetId) {
  document.getElementById(targetId).innerHTML = `
    <div class="ai-card">
      <div class="skeleton-line" style="width:60%"></div>
      <div class="skeleton-line" style="width:90%"></div>
      <div class="skeleton-line" style="width:75%"></div>
      <div class="skeleton-line" style="width:85%"></div>
      <div class="skeleton-line" style="width:50%"></div>
    </div>`;
}

// ── 1. AI Error Analysis (auto-triggered on error) ────────

async function analyzeErrorAI(code, language, errorMessage) {
  showAILoading('aiContent');

  const prompt = `You are an expert programming tutor. A student wrote ${language} code and got this error:

ERROR:
${errorMessage}

CODE:
${code}

Respond ONLY in this exact JSON format (no markdown, no code fences, no extra text):
{
  "errorType": "the type of error",
  "whatHappened": "plain English explanation of what went wrong",
  "lineNumber": "the line number that caused it, or unknown",
  "whyItOccurred": "why this error happened",
  "howToFix": "step-by-step fix instructions",
  "correctedSnippet": "the corrected version of the problematic code"
}`;

  const raw = await callAI(prompt);
  if (!raw) {
    document.getElementById('aiContent').innerHTML = `
      <div class="ai-card" style="border-color:var(--accent-red);">
        <div class="ai-card-header" style="color:var(--accent-red);">🔴 Error Analysis Unavailable</div>
        <div class="ai-card-section">AI service is temporarily unavailable. Try again in a moment.</div>
        <div class="ai-card-section"><strong>Raw Error:</strong><div class="ai-code-block">${escapeHtml(errorMessage)}</div></div>
      </div>`;
    return;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);
    document.getElementById('aiContent').innerHTML = `
      <div class="ai-card" style="border-color:rgba(255,77,106,0.3);">
        <div class="ai-card-header" style="color:var(--accent-red);">🔴 ${escapeHtml(data.errorType)}</div>
        <div class="ai-card-section">
          <strong>📋 What happened:</strong>
          <div>${escapeHtml(data.whatHappened)}</div>
        </div>
        <div class="ai-card-section">
          <strong>📍 Line: ${escapeHtml(String(data.lineNumber))}</strong>
        </div>
        <div class="ai-card-section">
          <strong>💡 Why it occurred:</strong>
          <div>${escapeHtml(data.whyItOccurred)}</div>
        </div>
        <div class="ai-card-section">
          <strong>✅ How to fix:</strong>
          <div>${escapeHtml(data.howToFix)}</div>
        </div>
        <div class="ai-card-section">
          <strong>📝 Corrected code:</strong>
          <div class="ai-code-block">${escapeHtml(data.correctedSnippet)}</div>
        </div>
      </div>`;
  } catch (e) {
    document.getElementById('aiContent').innerHTML = `
      <div class="ai-card"><div class="ai-card-section" style="white-space:pre-wrap;">${escapeHtml(raw)}</div></div>`;
  }
}

// ── 2. Code Explanation (auto-triggered on success) ───────

async function explainCodeAI(code, language, output) {
  showAILoading('aiContent');

  const prompt = `You are an expert CS educator. Analyze this ${language} code:

CODE:
${code}

OUTPUT:
${output}

Respond ONLY in this exact JSON format (no markdown, no code fences, no extra text):
{
  "summary": "1-2 sentence summary of what the code does",
  "howItWorks": "detailed explanation of the algorithm or logic",
  "keyConcepts": ["concept1", "concept2", "concept3"],
  "stepByStep": ["step 1 description", "step 2 description"]
}`;

  const raw = await callAI(prompt);
  if (!raw) {
    document.getElementById('aiContent').innerHTML = `
      <div class="ai-success-card">
        <div class="ai-success-icon">✅</div>
        <div style="font-weight:600;margin-bottom:4px;">Code ran successfully!</div>
        <div style="font-size:12px;color:var(--text-secondary);">AI explanation temporarily unavailable.</div>
      </div>`;
    return;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);
    const concepts = (data.keyConcepts || []).map(c => `<span class="concept-pill">${escapeHtml(c)}</span>`).join('');
    const steps = (data.stepByStep || []).map((s, i) =>
      `<div class="step-item"><span class="step-num">${i + 1}</span><span>${escapeHtml(s)}</span></div>`
    ).join('');

    document.getElementById('aiContent').innerHTML = `
      <div class="ai-card" style="border-color:rgba(0,255,157,0.3);">
        <div class="ai-card-header" style="color:var(--accent-green);">✅ Code Explanation</div>
        <div class="ai-card-section">
          <strong>📋 Summary:</strong>
          <div>${escapeHtml(data.summary)}</div>
        </div>
        <div class="ai-card-section">
          <strong>🔄 How it works:</strong>
          <div>${escapeHtml(data.howItWorks)}</div>
        </div>
        <div class="ai-card-section">
          <strong>🔑 Key Concepts:</strong>
          <div class="concepts-wrap">${concepts}</div>
        </div>
        <div class="ai-card-section">
          <strong>📝 Step-by-step:</strong>
          <div class="steps-list">${steps}</div>
        </div>
      </div>`;
  } catch (e) {
    document.getElementById('aiContent').innerHTML = `
      <div class="ai-card"><div class="ai-card-section" style="white-space:pre-wrap;">${escapeHtml(raw)}</div></div>`;
  }
}

// ── 3. Complexity Analysis (on-demand via tab click) ──────

async function analyzeComplexityAI(code) {
  if (!code || !code.trim()) return;
  showAILoading('complexityContent');
  sessionStats.algosAnalyzed++;
  updateAnalyticsUI();

  const prompt = `You are an expert algorithms professor. Analyze the time and space complexity of this ${currentLang.name} code:

CODE:
${code}

Respond ONLY in this exact JSON format (no markdown, no code fences, no extra text):
{
  "bestCase": "O(n)",
  "averageCase": "O(n log n)",
  "worstCase": "O(n^2)",
  "spaceComplexity": "O(1)",
  "algorithmDetected": "name of algorithm if recognizable",
  "loopExplanation": "detailed explanation of loop or recursion structure and why the complexity is what it is",
  "optimizationTip": "suggestion to improve, or empty string if already optimal"
}`;

  const raw = await callAI(prompt);
  if (!raw) {
    document.getElementById('complexityContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div>AI service temporarily unavailable. Try again.</div>
      </div>`;
    return;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const a = JSON.parse(jsonMatch[0]);

    function getClass(val) {
      if (val.includes('1)') || val.includes('log')) return 'complexity-green';
      if (val.includes('n^2') || val.includes('n²') || val.includes('2^n') || val.includes('2ⁿ')) return 'complexity-red';
      return 'complexity-yellow';
    }

    document.getElementById('complexityContent').innerHTML = `
      <div class="complexity-grid">
        <div class="complexity-card">
          <div class="complexity-label">⏱ Best Case</div>
          <div class="complexity-value ${getClass(a.bestCase)}">${escapeHtml(a.bestCase)}</div>
        </div>
        <div class="complexity-card">
          <div class="complexity-label">⏱ Average Case</div>
          <div class="complexity-value ${getClass(a.averageCase)}">${escapeHtml(a.averageCase)}</div>
        </div>
        <div class="complexity-card">
          <div class="complexity-label">⏱ Worst Case</div>
          <div class="complexity-value ${getClass(a.worstCase)}">${escapeHtml(a.worstCase)}</div>
        </div>
        <div class="complexity-card">
          <div class="complexity-label">💾 Space</div>
          <div class="complexity-value ${getClass(a.spaceComplexity)}">${escapeHtml(a.spaceComplexity)}</div>
        </div>
      </div>
      <div class="complexity-detection">🔍 Detected: <strong>${escapeHtml(a.algorithmDetected || 'Custom Logic')}</strong></div>
      <div class="complexity-tip">${escapeHtml(a.loopExplanation)}</div>
      ${a.optimizationTip ? `<div class="complexity-tip" style="margin-top:8px;">💡 ${escapeHtml(a.optimizationTip)}</div>` : ''}`;
  } catch (e) {
    document.getElementById('complexityContent').innerHTML = `
      <div class="ai-card"><div class="ai-card-section" style="white-space:pre-wrap;">${escapeHtml(raw)}</div></div>`;
  }
}

// ── 4. Dry Run — Line-by-Line Trace (on-demand) ──────────

async function dryRunCode() {
  if (!editor) return;
  const code = editor.getValue().trim();
  if (!code) return;

  const stdin = document.getElementById('stdinInput').value;

  switchRightTab('dryrun');
  showAILoading('dryRunContent');

  const prompt = `You are a code execution tracer. Trace through this ${currentLang.name} code step by step, simulating execution exactly.

CODE:
${code}

${stdin ? `INPUT (stdin):\n${stdin}` : 'No stdin input.'}

Respond ONLY in this exact JSON format (no markdown, no code fences, no extra text):
{
  "steps": [
    {
      "line": 1,
      "code": "the exact line of code",
      "action": "what happens at this line",
      "variables": {"var1": "value1", "var2": "value2"},
      "output": ""
    }
  ]
}

Trace every meaningful line. Show variables as they change. Keep actions concise.`;

  const raw = await callAI(prompt);
  if (!raw) {
    document.getElementById('dryRunContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div>AI service temporarily unavailable. Try again.</div>
      </div>`;
    return;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);
    dryRunState.steps = data.steps || [];
    dryRunState.currentStep = -1;

    renderDryRunSteps(dryRunState.steps, -1);
  } catch (e) {
    document.getElementById('dryRunContent').innerHTML = `
      <div class="ai-card"><div class="ai-card-section" style="white-space:pre-wrap;">${escapeHtml(raw)}</div></div>`;
  }
}

function renderDryRunSteps(steps, highlightIdx) {
  if (!steps.length) {
    document.getElementById('dryRunContent').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div>No steps to display</div>
      </div>`;
    return;
  }

  const html = steps.map((step, i) => {
    const isActive = i === highlightIdx;
    const isVisible = highlightIdx === -1 || i <= highlightIdx;
    const vars = step.variables ? Object.entries(step.variables).map(([k, v]) =>
      `<span class="var-pill"><span class="var-key">${escapeHtml(k)}</span>=<span class="var-val">${escapeHtml(String(v))}</span></span>`
    ).join('') : '';

    return `
      <div class="step-card ${isActive ? 'step-active' : ''}" style="${isVisible ? '' : 'opacity:0.3;'}">
        <div class="step-card-header">
          <span class="step-line-badge">Line ${step.line}</span>
          <code class="step-code">${escapeHtml(step.code)}</code>
        </div>
        <div class="step-card-body">
          <div class="step-action">→ ${escapeHtml(step.action)}</div>
          ${vars ? `<div class="step-vars">${vars}</div>` : ''}
          ${step.output ? `<div class="step-output">📤 ${escapeHtml(step.output)}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const counter = highlightIdx >= 0
    ? `<div class="step-counter">Step ${highlightIdx + 1} of ${steps.length}</div>`
    : `<div class="step-counter">All ${steps.length} steps — use ⏭ Step to walk through</div>`;

  document.getElementById('dryRunContent').innerHTML = counter + html;
}

function stepDryRun() {
  if (!dryRunState.steps.length) {
    dryRunCode();
    return;
  }

  switchRightTab('dryrun');

  dryRunState.currentStep++;
  if (dryRunState.currentStep >= dryRunState.steps.length) {
    dryRunState.currentStep = 0;
  }
  renderDryRunSteps(dryRunState.steps, dryRunState.currentStep);

  setTimeout(() => {
    const active = document.querySelector('.step-card.step-active');
    if (active) active.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
}

// ── Visualization Engine ──────────────────────────────────

function initVizDemo() {
  document.getElementById('vizSection').style.display = 'none';
}

function runVisualizer(code) {
  const section = document.getElementById('vizSection');

  let arr = null;
  const stdinVal = document.getElementById('stdinInput').value;
  if (stdinVal.trim() !== '') {
    const nums = stdinVal.replace(/[\[\]{}]/g, '').split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (nums.length > 2 && nums.length <= 30) arr = nums;
  }

  if (!arr) {
    arr = [64, 34, 25, 12, 22, 11, 90];
    const arrMatch = code.match(/\[([\d\s,-]+)\]/) || code.match(/\{([\d\s,-]+)\}/);
    if (arrMatch && arrMatch[1]) {
      const nums = arrMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (nums.length > 2 && nums.length <= 20) arr = nums;
    }
  }

  if (/sort/i.test(code) || /bubble/i.test(code)) {
    section.style.display = 'block';
    generateBubbleSortFrames(arr);
    renderArrayFrame(0);
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Array'));
    if (tabBtn) switchVizTab(tabBtn, 'vizArray');
  } else if (/search/i.test(code) || /binary/i.test(code)) {
    section.style.display = 'block';
    vizState.frames = [{ array: [...arr].sort((a,b)=>a-b), active: [], comparing: [], sorted: [], label: 'Sorted Array for Search' }];
    renderArrayFrame(0);
  } else if (/Node|Linked|next/i.test(code)) {
    section.style.display = 'block';
    renderLinkedListDemo(arr);
  } else if (/Tree|root|child/i.test(code)) {
    section.style.display = 'block';
    renderTreeDemo();
  } else if (/fib|recursi/i.test(code)) {
    section.style.display = 'block';
    renderRecursionDemo();
  } else {
    section.style.display = 'none';
  }
}

// -- Array Visualization (Bubble Sort) --
function generateBubbleSortFrames(arr) {
  vizState.frames = [];
  const a = [...arr];
  const n = a.length;
  vizState.frames.push({ array: [...a], active: [], comparing: [], sorted: [], label: 'Initial array' });
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      vizState.frames.push({ array: [...a], active: [], comparing: [j, j+1], sorted: makeSortedIndices(n, i), label: `Compare index ${j} and ${j+1}` });
      if (a[j] > a[j+1]) {
        [a[j], a[j+1]] = [a[j+1], a[j]];
        vizState.frames.push({ array: [...a], active: [j, j+1], comparing: [], sorted: makeSortedIndices(n, i), label: `Swap ${a[j+1]} and ${a[j]}` });
      }
    }
    vizState.frames.push({ array: [...a], active: [], comparing: [], sorted: makeSortedIndices(n, i+1), label: `Pass ${i+1} complete` });
  }
  vizState.frames.push({ array: [...a], active: [], comparing: [], sorted: Array.from({length: n}, (_, i) => i), label: 'Array is sorted!' });
  vizState.current = 0;
}

function makeSortedIndices(n, passesComplete) {
  const indices = [];
  for (let k = 0; k < passesComplete; k++) indices.push(n - 1 - k);
  return indices;
}

function renderArrayFrame(idx) {
  if (idx < 0 || idx >= vizState.frames.length) return;
  vizState.current = idx;
  const frame = vizState.frames[idx];
  const canvas = document.getElementById('arrayVizCanvas');
  canvas.innerHTML = frame.array.map((val, i) => {
    let cls = 'array-box';
    if (frame.active.includes(i)) cls += ' active';
    if (frame.sorted.includes(i)) cls += ' sorted';
    if (frame.comparing.includes(i)) cls += ' comparing';
    return `<div class="array-bar"><div class="${cls}">${val}</div><div class="array-idx">[${i}]</div></div>`;
  }).join('') + `<div style="width:100%;text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px;font-family:var(--font-code);">${frame.label} (${idx+1}/${vizState.frames.length})</div>`;
}

function renderLinkedListDemo(customNodes) {
  const nodes = customNodes || [10, 20, 30, 40, 50];
  const canvas = document.getElementById('linkedVizCanvas');
  canvas.innerHTML = `<div style="display:flex;align-items:center;gap:32px;overflow-x:auto;padding:16px;">` +
    nodes.map((v, i) =>
      `<div style="display:flex;align-items:center;position:relative;">
        <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;background:var(--bg-surface);border:2px solid ${i===0?'var(--accent-cyan)':'var(--border)'};border-radius:var(--radius-md);font-family:var(--font-code);font-weight:600;font-size:18px;${i===0?'box-shadow:0 0 12px rgba(0,212,255,0.2);':''}">${v}</div>
        ${i < nodes.length - 1 ? '<div style="position:absolute;right:-32px;width:32px;text-align:center;color:var(--text-muted);font-size:24px;">→</div>' : '<div style="position:absolute;right:-60px;width:60px;text-align:center;color:var(--text-muted);font-size:14px;">→ null</div>'}
      </div>`
    ).join('') + `</div>`;
}

function renderTreeDemo() {
  const canvas = document.getElementById('treeVizCanvas');
  const w = 380, h = 200;
  const nodes = [
    {val:50,x:w/2,y:30},{val:30,x:w/2-80,y:80},{val:70,x:w/2+80,y:80},
    {val:20,x:w/2-120,y:130},{val:40,x:w/2-40,y:130},{val:60,x:w/2+40,y:130},{val:80,x:w/2+120,y:130}
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];
  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%;">`;
  edges.forEach(([a,b]) => { svg += `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="#2A2D3A" stroke-width="2"/>`; });
  nodes.forEach((n,i) => {
    const r = i===0;
    svg += `<circle cx="${n.x}" cy="${n.y}" r="18" fill="${r?'rgba(0,212,255,0.15)':'var(--bg-surface)'}" stroke="${r?'var(--accent-cyan)':'var(--border)'}" stroke-width="2"/>`;
    svg += `<text x="${n.x}" y="${n.y+4}" text-anchor="middle" fill="var(--text-primary)" font-family="JetBrains Mono" font-size="12" font-weight="600">${n.val}</text>`;
  });
  canvas.innerHTML = svg + '</svg>';
}

function renderRecursionDemo() {
  const canvas = document.getElementById('recursionVizCanvas');
  const frames = [{fn:'fib(5)',args:'n=5',result:'5',active:true},{fn:'fib(4)',args:'n=4',result:'3',active:false},{fn:'fib(3)',args:'n=3',result:'2',active:false},{fn:'fib(2)',args:'n=2',result:'1',active:false},{fn:'fib(1)',args:'n=1',result:'1',active:false}];
  canvas.innerHTML = `<div class="recursion-stack">` +
    frames.map(f => `<div class="recursion-frame ${f.active?'active':''}"><span><span class="fn-name">${f.fn}</span> <span style="color:var(--text-muted)">${f.args}</span></span><span class="fn-result">→ ${f.result}</span></div>`).join('') + `</div>`;
}

function vizGoStart() { renderArrayFrame(0); }
function vizPrev() { if (vizState.current > 0) renderArrayFrame(vizState.current - 1); }
function vizNext() { if (vizState.current < vizState.frames.length - 1) renderArrayFrame(vizState.current + 1); }
function vizGoEnd() { renderArrayFrame(vizState.frames.length - 1); }

function vizTogglePlay() {
  if (vizState.playing) { vizPause(); } else {
    vizState.playing = true;
    document.getElementById('vizPlayBtn').textContent = '⏸';
    const speed = 1600 - parseInt(document.getElementById('vizSpeed').value);
    vizState.interval = setInterval(() => {
      if (vizState.current < vizState.frames.length - 1) renderArrayFrame(vizState.current + 1);
      else vizPause();
    }, speed);
  }
}

function vizPause() {
  vizState.playing = false;
  clearInterval(vizState.interval);
  document.getElementById('vizPlayBtn').textContent = '▶';
}
