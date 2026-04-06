/* ═══════════════════════════════════════════════════════════
   NEXUS IDE — Application Logic
   Part 1: Config, Languages, Editor Setup, Judge0 Execution
   ═══════════════════════════════════════════════════════════ */

// ── Language Config ───────────────────────────────────────
const LANGUAGES = [
  { id: 'python', name: 'Python', monacoId: 'python', color: '#3572A5', version: 'Python 3', judge0Id: 71 },
  { id: 'javascript', name: 'JavaScript', monacoId: 'javascript', color: '#F7DF1E', version: 'ES2022', judge0Id: 63 },
  { id: 'cpp', name: 'C++', monacoId: 'cpp', color: '#00599C', version: 'C++17', judge0Id: 54 },
  { id: 'java', name: 'Java', monacoId: 'java', color: '#ED8B00', version: 'Java 17', judge0Id: 62 },
  { id: 'c', name: 'C', monacoId: 'c', color: '#555555', version: 'C11', judge0Id: 50 },
  { id: 'go', name: 'Go', monacoId: 'go', color: '#00ADD8', version: 'Go 1.21', judge0Id: 60 },
  { id: 'rust', name: 'Rust', monacoId: 'rust', color: '#DEA584', version: 'Rust 1.74', judge0Id: 73 },
  { id: 'kotlin', name: 'Kotlin', monacoId: 'kotlin', color: '#A97BFF', version: 'Kotlin 1.9', judge0Id: 78 },
];

// ── State ─────────────────────────────────────────────────
let currentLang = LANGUAGES[0];
let editor = null;
let vizState = { frames: [], current: -1, playing: false, interval: null };
let dryRunState = { steps: [], currentStep: -1 };

// ── Persistent Analytics (localStorage) ───────────────────
const ANALYTICS_KEY = 'nexus_analytics';

function loadAnalytics() {
  try {
    const data = JSON.parse(localStorage.getItem(ANALYTICS_KEY));
    if (data) return data;
  } catch (e) {}
  return { runs: 0, errors: 0, successes: 0, algosAnalyzed: 0, errorTypes: {}, langUsage: {}, weakAreas: [] };
}

function saveAnalytics(data) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
}

let sessionStats = loadAnalytics();

// ── Monaco Editor Setup ───────────────────────────────────
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  monaco.editor.defineTheme('nexus-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '4A4F65', fontStyle: 'italic' },
      { token: 'keyword', foreground: '4D9EFF' },
      { token: 'string', foreground: '00FF9D' },
      { token: 'number', foreground: 'FFD166' },
      { token: 'type', foreground: '00D4FF' },
      { token: 'function', foreground: 'E8EAF0' },
      { token: 'variable', foreground: 'E8EAF0' },
      { token: 'operator', foreground: '8B90A4' },
      { token: 'delimiter', foreground: '8B90A4' },
    ],
    colors: {
      'editor.background': '#13151C',
      'editor.foreground': '#E8EAF0',
      'editor.lineHighlightBackground': '#1A1D26',
      'editor.selectionBackground': '#2A2D3A80',
      'editorCursor.foreground': '#00D4FF',
      'editorLineNumber.foreground': '#4A4F65',
      'editorLineNumber.activeForeground': '#8B90A4',
      'editorGutter.background': '#13151C',
      'editor.selectionHighlightBackground': '#4D9EFF20',
      'editorBracketMatch.background': '#4D9EFF30',
      'editorBracketMatch.border': '#4D9EFF',
      'minimap.background': '#0D0F14',
      'scrollbar.shadow': '#00000000',
      'editorOverviewRuler.border': '#2A2D3A',
    }
  });

  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'python',
    theme: 'nexus-dark',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    lineNumbers: 'on',
    minimap: { enabled: true, side: 'right' },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    renderLineHighlight: 'all',
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    formatOnType: true,
    padding: { top: 12 },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    roundedSelection: true,
    contextmenu: true,
    linkedEditing: true,
    placeholder: '// Start writing your code here...',
  });

  editor.onDidChangeCursorPosition(e => {
    document.getElementById('statusCursor').textContent =
      `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });

  window.addEventListener('resize', () => editor.layout());
  new ResizeObserver(() => editor.layout()).observe(document.getElementById('editor'));

  buildLangDropdown();
  updateLangUI();
  initVizDemo();
});

// ── Language Dropdown ─────────────────────────────────────
function buildLangDropdown() {
  const dd = document.getElementById('langDropdown');
  dd.innerHTML = LANGUAGES.map(l =>
    `<div class="lang-option ${l.id === currentLang.id ? 'active' : ''}" onclick="selectLang('${l.id}')">
      <span class="lang-dot" style="background:${l.color}"></span>
      <span>${l.name}</span>
      <span style="margin-left:auto;font-size:11px;color:var(--text-muted)">${l.version}</span>
    </div>`
  ).join('');
}

function toggleLangDropdown() {
  document.getElementById('langDropdown').classList.toggle('open');
}

function selectLang(id) {
  currentLang = LANGUAGES.find(l => l.id === id);
  if (editor) {
    const model = editor.getModel();
    monaco.editor.setModelLanguage(model, currentLang.monacoId);
    // Clear editor completely on language switch
    editor.setValue('');
  }
  updateLangUI();
  toggleLangDropdown();
  clearOutput();
}

function updateLangUI() {
  document.getElementById('langDot').style.background = currentLang.color;
  document.getElementById('langName').textContent = currentLang.name;
  document.getElementById('statusLang').textContent = currentLang.version;
  buildLangDropdown();
}

document.addEventListener('click', e => {
  if (!e.target.closest('.lang-selector')) {
    document.getElementById('langDropdown').classList.remove('open');
  }
});

// ── Right Column Tab Switching ────────────────────────────
function switchRightTab(tab) {
  document.querySelectorAll('.right-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.right-tab-content').forEach(p => p.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  document.getElementById('panel' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');

  // Trigger on-demand complexity analysis when tab is clicked
  if (tab === 'complexity' && editor) {
    analyzeComplexityAI(editor.getValue());
  }
}

// ── Viz Tab Switching ─────────────────────────────────────
function switchVizTab(btn, tabId) {
  const section = document.getElementById('vizSection');
  section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  section.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ── Judge0 Code Execution ─────────────────────────────────
async function runCode() {
  if (!editor) return;
  const code = editor.getValue().trim();
  if (!code) return;

  const rapidApiKey = localStorage.getItem('nexus_rapid_api_key');
  if (!rapidApiKey) {
    openApiKeyModal();
    showOutputError('Please set your RapidAPI Key in Settings (⚙) to run code.');
    return;
  }

  const btn = document.getElementById('runBtn');
  const statusBar = document.getElementById('statusBar');
  const stdin = document.getElementById('stdinInput').value;

  // Set running state
  btn.classList.add('running');
  btn.innerHTML = '⏳ Running...';
  statusBar.className = 'status-bar running';
  document.getElementById('statusState').innerHTML = '<span class="status-dot"></span> Running...';

  // Switch to output tab
  switchRightTab('output');

  // Show loading in output
  document.getElementById('outputContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon spinner">⏳</div>
      <div>Executing via Judge0...</div>
    </div>`;

  sessionStats.runs++;
  // Track language usage
  sessionStats.langUsage = sessionStats.langUsage || {};
  sessionStats.langUsage[currentLang.name] = (sessionStats.langUsage[currentLang.name] || 0) + 1;
  const startTime = performance.now();

  try {
    const res = await fetch('https://judge0-ce.p.rapidapi.com/submissions?wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: currentLang.judge0Id,
        stdin: stdin,
        base64_encoded: false,
      })
    });

    const data = await res.json();
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    const memUsage = data.memory ? (data.memory / 1024).toFixed(1) : '0.0';

    btn.classList.remove('running');
    btn.innerHTML = '▶ Run';

    // Update time/memory stats
    document.getElementById('execTimeBadge').textContent = elapsed + 's';
    document.getElementById('statusTime').textContent = '⏱ ' + elapsed + 's';
    document.getElementById('statusMem').textContent = '🧠 ' + memUsage + 'MB';

    const hasError = data.stderr || data.compile_output;
    const stdout = data.stdout || '';

    if (hasError && !stdout) {
      // Error case
      const errorMsg = data.stderr || data.compile_output || 'Unknown error';
      sessionStats.errors++;
      // Detect and track error type
      const detectedType = detectErrorType(errorMsg, currentLang.name);
      sessionStats.errorTypes = sessionStats.errorTypes || {};
      sessionStats.errorTypes[detectedType] = (sessionStats.errorTypes[detectedType] || 0) + 1;
      // Detect weak areas from error
      const weakArea = detectWeakArea(errorMsg, editor.getValue());
      if (weakArea) {
        sessionStats.weakAreas = sessionStats.weakAreas || [];
        if (!sessionStats.weakAreas.includes(weakArea)) sessionStats.weakAreas.push(weakArea);
      }
      showErrorOutput(errorMsg, elapsed, memUsage);
      statusBar.className = 'status-bar error';
      document.getElementById('statusState').innerHTML = '<span class="status-dot" style="background:var(--accent-red)"></span> Error';

      // Auto-trigger AI error analysis
      analyzeErrorAI(code, currentLang.name, errorMsg);
      switchRightTab('explain');
    } else {
      // Success case
      sessionStats.successes = (sessionStats.successes || 0) + 1;
      showSuccessOutput(stdout || 'Program completed with no output.', elapsed, memUsage);
      statusBar.className = 'status-bar success';
      document.getElementById('statusState').innerHTML = '<span class="status-dot" style="background:var(--accent-green)"></span> Success';

      // Auto-trigger code explanation
      explainCodeAI(code, currentLang.name, stdout);

      setTimeout(() => {
        statusBar.className = 'status-bar';
        document.getElementById('statusState').innerHTML = '<span class="status-dot"></span> Ready';
      }, 3000);
    }

    showExecStats(elapsed, memUsage, data.status ? data.status.id.toString() : '0');
    saveAnalytics(sessionStats);
    updateAnalyticsUI();

  } catch (err) {
    btn.classList.remove('running');
    btn.innerHTML = '▶ Run';
    showOutputError('Network error: ' + err.message + '. Check your RapidAPI key and internet connection.');
    statusBar.className = 'status-bar error';
    document.getElementById('statusState').innerHTML = '<span class="status-dot" style="background:var(--accent-red)"></span> Error';
  }
}

// ── Output Display ────────────────────────────────────────
function showSuccessOutput(output, time, mem) {
  const el = document.getElementById('outputContent');
  const lines = output.split('\n').map(l =>
    `<div class="output-line"><span class="output-time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="output-success">${escapeHtml(l)}</span></div>`
  ).join('');
  el.innerHTML = lines;
}

function showErrorOutput(errorMsg, time, mem) {
  const el = document.getElementById('outputContent');
  const lines = errorMsg.split('\n').map(l =>
    `<div class="output-line"><span class="output-time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="output-error">${escapeHtml(l)}</span></div>`
  ).join('');
  el.innerHTML = lines;
}

function showOutputError(msg) {
  document.getElementById('outputContent').innerHTML = `
    <div class="output-line"><span class="output-time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="output-error">❌ ${escapeHtml(msg)}</span></div>`;
}

function showExecStats(time, mem, exit) {
  document.getElementById('execStats').style.display = 'flex';
  document.getElementById('statTime').textContent = time + 's';
  document.getElementById('statMem').textContent = mem + ' MB';
  document.getElementById('statExit').textContent = exit;
}

function clearOutput() {
  document.getElementById('outputContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚡</div>
      <div>Click <strong>▶ Run</strong> to execute your code</div>
    </div>`;
  document.getElementById('execStats').style.display = 'none';
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// ── Analytics Engine ──────────────────────────────────────

const ERROR_COLORS = [
  'var(--accent-red)', 'var(--accent-yellow)', 'var(--accent-blue)',
  'var(--accent-cyan)', 'var(--accent-green)', '#a855f7', '#f97316'
];

const PRACTICE_MAP = {
  'Syntax': [
    { title: 'Fix the Syntax', desc: 'Practice basic language syntax and formatting', diff: 'Easy' },
    { title: 'Code Formatting Quiz', desc: 'Identify and fix common syntax mistakes', diff: 'Easy' }
  ],
  'Type': [
    { title: 'Type Casting Challenge', desc: 'Convert between data types correctly', diff: 'Easy' },
    { title: 'Type Safety Exercise', desc: 'Avoid implicit type coercion bugs', diff: 'Medium' }
  ],
  'Index/Range': [
    { title: 'Array Bounds Practice', desc: 'Handle array indices and edge cases', diff: 'Easy' },
    { title: 'Off-by-One Errors', desc: 'Fix common loop boundary mistakes', diff: 'Medium' }
  ],
  'Name/Reference': [
    { title: 'Variable Scope Quiz', desc: 'Understand variable scoping rules', diff: 'Easy' },
    { title: 'Identifier Challenge', desc: 'Properly declare and reference variables', diff: 'Easy' }
  ],
  'Logic': [
    { title: 'Logic Gate Puzzles', desc: 'Practice conditional and boolean logic', diff: 'Medium' },
    { title: 'Edge Case Handling', desc: 'Handle corner cases in algorithms', diff: 'Medium' }
  ],
  'Runtime': [
    { title: 'Exception Handling', desc: 'Learn to handle runtime exceptions gracefully', diff: 'Medium' },
    { title: 'Null/Undefined Checks', desc: 'Prevent null pointer and undefined errors', diff: 'Easy' }
  ],
  'Memory': [
    { title: 'Recursion Depth', desc: 'Optimize recursive calls to avoid stack overflow', diff: 'Hard' },
    { title: 'Memory Management', desc: 'Understand memory allocation patterns', diff: 'Hard' }
  ]
};

function detectErrorType(errorMsg, language) {
  const msg = errorMsg.toLowerCase();
  if (msg.includes('syntaxerror') || msg.includes('syntax error') || msg.includes('expected') || msg.includes('unexpected token') || msg.includes('missing') || msg.includes('unterminated')) return 'Syntax';
  if (msg.includes('typeerror') || msg.includes('type error') || msg.includes('cannot convert') || msg.includes('incompatible type') || msg.includes('cast')) return 'Type';
  if (msg.includes('nameerror') || msg.includes('referenceerror') || msg.includes('undeclared') || msg.includes('not defined') || msg.includes('undefined reference') || msg.includes('cannot find symbol')) return 'Name/Reference';
  if (msg.includes('indexerror') || msg.includes('index out') || msg.includes('arrayindexoutofbounds') || msg.includes('out of range') || msg.includes('segmentation fault')) return 'Index/Range';
  if (msg.includes('valueerror') || msg.includes('invalid') || msg.includes('illegal argument')) return 'Logic';
  if (msg.includes('runtime') || msg.includes('exception') || msg.includes('nullpointer') || msg.includes('nullptr') || msg.includes('null reference')) return 'Runtime';
  if (msg.includes('memory') || msg.includes('stack overflow') || msg.includes('recursion') || msg.includes('heap')) return 'Memory';
  if (msg.includes('timeout') || msg.includes('time limit')) return 'Timeout';
  return 'Other';
}

function detectWeakArea(errorMsg, code) {
  const msg = errorMsg.toLowerCase();
  const src = code.toLowerCase();
  if (msg.includes('recursion') || msg.includes('stack overflow') || /def\s+\w+.*\1|function\s+\w+/.test(src) && msg.includes('maximum')) return 'Recursion';
  if (msg.includes('index') || msg.includes('out of range') || msg.includes('bounds')) return 'Arrays';
  if (/linked|node|next/.test(src) && (msg.includes('null') || msg.includes('none'))) return 'Linked Lists';
  if (/tree|root|child|bst/.test(src)) return 'Trees';
  if (msg.includes('pointer') || msg.includes('segmentation') || msg.includes('nullptr')) return 'Pointers';
  if (msg.includes('syntax') || msg.includes('expected') || msg.includes('unexpected')) return 'Syntax Basics';
  if (/sort|bubble|merge|quick/.test(src)) return 'Sorting';
  if (/graph|bfs|dfs|dijkstra/.test(src)) return 'Graphs';
  return null;
}

function updateAnalyticsUI() {
  // Session stats
  document.getElementById('statRuns').textContent = sessionStats.runs || 0;
  document.getElementById('statErrors').textContent = sessionStats.errors || 0;
  const successes = sessionStats.successes || 0;
  const runs = sessionStats.runs || 0;
  document.getElementById('statSuccessRate').textContent = runs ? Math.round((successes / runs) * 100) + '%' : '—';
  document.getElementById('statAlgos').textContent = sessionStats.algosAnalyzed || 0;

  // Error frequency chart
  const errorTypes = sessionStats.errorTypes || {};
  const errorChart = document.getElementById('errorChart');
  const sortedErrors = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);

  if (sortedErrors.length === 0) {
    errorChart.innerHTML = `<div class="empty-state" style="min-height:120px;padding:16px;"><div class="empty-state-icon" style="font-size:24px;">📊</div><div style="font-size:12px;color:var(--text-muted);">No errors tracked yet</div></div>`;
  } else {
    const maxCount = sortedErrors[0][1];
    errorChart.innerHTML = sortedErrors.map(([type, count], i) => {
      const pct = Math.max(15, (count / maxCount) * 100);
      const color = ERROR_COLORS[i % ERROR_COLORS.length];
      return `<div class="bar-row"><span class="bar-label">${escapeHtml(type)}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color};">${count}</div></div></div>`;
    }).join('');
  }

  // Language usage
  const langUsage = sessionStats.langUsage || {};
  const langChart = document.getElementById('langUsageChart');
  const sortedLangs = Object.entries(langUsage).sort((a, b) => b[1] - a[1]);

  if (sortedLangs.length === 0) {
    langChart.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">No runs yet</div>';
  } else {
    const maxLang = sortedLangs[0][1];
    langChart.innerHTML = sortedLangs.map(([lang, count]) => {
      const pct = Math.max(15, (count / maxLang) * 100);
      const langObj = LANGUAGES.find(l => l.name === lang);
      const color = langObj ? langObj.color : 'var(--text-muted)';
      return `<div class="bar-row"><span class="bar-label">${escapeHtml(lang)}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color};">${count}</div></div></div>`;
    }).join('');
  }

  // Weak areas
  const weakAreas = sessionStats.weakAreas || [];
  const weakContainer = document.getElementById('weakAreasContainer');
  if (weakAreas.length === 0) {
    weakContainer.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">Run some code to detect weak areas</div>';
  } else {
    const tagColors = ['tag-red', 'tag-yellow', 'tag-blue'];
    weakContainer.innerHTML = weakAreas.map((area, i) =>
      `<span class="tag-pill ${tagColors[i % tagColors.length]}">${escapeHtml(area)}</span>`
    ).join('');
  }

  // Practice recommendations based on error types
  const practiceContainer = document.getElementById('practiceContainer');
  const relevantPractice = [];
  for (const [errType] of sortedErrors.slice(0, 3)) {
    const practices = PRACTICE_MAP[errType] || PRACTICE_MAP['Logic'];
    relevantPractice.push(...practices);
  }

  if (relevantPractice.length === 0) {
    practiceContainer.innerHTML = '<div style="color:var(--text-muted);font-size:12px;">Practice suggestions appear based on your errors</div>';
  } else {
    const unique = relevantPractice.filter((p, i, arr) => arr.findIndex(q => q.title === p.title) === i).slice(0, 4);
    const diffColors = { 'Easy': 'rgba(0,255,157,0.1);color:var(--accent-green)', 'Medium': 'rgba(255,209,102,0.1);color:var(--accent-yellow)', 'Hard': 'rgba(255,77,106,0.1);color:var(--accent-red)' };
    practiceContainer.innerHTML = unique.map(p =>
      `<div class="practice-card"><div class="practice-card-title">${escapeHtml(p.title)}</div><div class="practice-card-desc">${escapeHtml(p.desc)}</div><span class="practice-card-tag" style="background:${diffColors[p.diff] || diffColors['Easy']}">${p.diff}</span></div>`
    ).join('');
  }
}

function resetAnalytics() {
  sessionStats = { runs: 0, errors: 0, successes: 0, algosAnalyzed: 0, errorTypes: {}, langUsage: {}, weakAreas: [] };
  saveAnalytics(sessionStats);
  updateAnalyticsUI();
}

// ── API Key Modal ─────────────────────────────────────────
function openApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  modal.classList.add('open');
  document.getElementById('rapidApiKeyInput').value = localStorage.getItem('nexus_rapid_api_key') || '';
}

function closeApiKeyModal() {
  document.getElementById('apiKeyModal').classList.remove('open');
}

function saveApiKeys() {
  const rapidKey = document.getElementById('rapidApiKeyInput').value.trim();
  if (rapidKey) localStorage.setItem('nexus_rapid_api_key', rapidKey);
  closeApiKeyModal();
}

function clearApiKeys() {
  localStorage.removeItem('nexus_rapid_api_key');
  document.getElementById('rapidApiKeyInput').value = '';
  closeApiKeyModal();
}

// ── Reset ─────────────────────────────────────────────────
function resetAll() {
  if (editor) editor.setValue('');
  clearOutput();
  document.getElementById('aiContent').innerHTML = `
    <div class="ai-success-card">
      <div class="ai-success-icon">✨</div>
      <div style="font-weight:600;margin-bottom:4px;">Write some code to get started</div>
      <div style="font-size:12px;color:var(--text-secondary);">AI analysis will appear here after you run your code</div>
    </div>`;
  document.getElementById('complexityContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div>Click <strong>📊 Complexity</strong> tab to analyze your code</div>
    </div>`;
  document.getElementById('dryRunContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <div>Click <strong>🔍 Dry Run</strong> in the topbar to trace execution</div>
    </div>`;
  dryRunState = { steps: [], currentStep: -1 };
  document.getElementById('vizSection').style.display = 'none';
  switchRightTab('output');
}

// ── Keyboard Shortcuts ────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
});
