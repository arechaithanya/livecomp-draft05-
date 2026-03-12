/* ═══════════════════════════════════════════════════════════
   NEXUS IDE — Application Logic Part 2
   AI Integration, Complexity Analysis, Visualizations
   ═══════════════════════════════════════════════════════════ */

// ── AI Integration ────────────────────────────────────────

function showAILoading() {
  document.getElementById('aiContent').innerHTML = `
    <div class="ai-card">
      <div class="skeleton-line" style="width:60%"></div>
      <div class="skeleton-line" style="width:90%"></div>
      <div class="skeleton-line" style="width:75%"></div>
      <div class="skeleton-line" style="width:85%"></div>
    </div>`;
}

function showAISuccess() {
  document.getElementById('aiContent').innerHTML = `
    <div class="ai-success-card">
      <div class="ai-success-icon">✅</div>
      <div style="font-weight:600;margin-bottom:4px;">Code looks good!</div>
      <div style="font-size:12px;color:var(--text-secondary);">Click "Explain My Logic" for a deep analysis of your program.</div>
    </div>`;
}

async function callClaudeAPI(systemPrompt, userPrompt) {
  const apiKey = localStorage.getItem('nexus_api_key');
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return null;
  } catch (e) {
    console.warn('Claude API call failed:', e);
    return null;
  }
}

async function analyzeError(code, language, errorMessage) {
  showAILoading();

  const systemPrompt = `You are an expert programming tutor. Analyze this compiler error and respond in JSON with fields: errorType, whatHappened, whyItOccurred, howToFix, correctedCodeSnippet. Keep explanations simple enough for a beginner student.`;
  const userPrompt = `Language: ${language}\nError: ${errorMessage}\n\nCode:\n${code}`;

  let result = await callClaudeAPI(systemPrompt, userPrompt);

  if (!result) {
    // Use mock data
    result = getMockErrorAnalysis(errorMessage);
  }

  renderErrorAnalysis(result);
}

function getMockErrorAnalysis(errorMessage) {
  const type = errorMessage.includes('NameError') ? 'NameError' :
    errorMessage.includes('SyntaxError') ? 'SyntaxError' :
    errorMessage.includes('ReferenceError') ? 'ReferenceError' :
    errorMessage.includes('TypeError') ? 'TypeError' : 'CompileError';

  return {
    errorType: type,
    whatHappened: `The compiler encountered a ${type} in your code. This means the program couldn't understand or find something it expected.`,
    whyItOccurred: errorMessage.includes('pritn') ?
      `You typed "pritn" instead of "print". This is a common typo — Python doesn't recognize "pritn" as a valid function name.` :
      errorMessage.includes("':'") ?
      `In Python, function definitions require a colon (:) at the end of the def line. The colon tells Python where the function body begins.` :
      `The code contains a syntax issue that prevents the compiler from processing it. Check for missing brackets, semicolons, or mismatched delimiters.`,
    howToFix: errorMessage.includes('pritn') ?
      `Replace "pritn" with "print" on the indicated line. Double-check spelling of all built-in function names.` :
      `Review the error line carefully. Look for missing punctuation, mismatched brackets, or undeclared variables. Fix the issue and run again.`,
    correctedCodeSnippet: errorMessage.includes('pritn') ?
      `print("Hello, World!")  # Corrected: 'pritn' → 'print'` :
      `# Fix the syntax error on the indicated line\n# Ensure all brackets/braces are matched`
  };
}

function renderErrorAnalysis(data) {
  document.getElementById('aiContent').innerHTML = `
    <div class="ai-card">
      <div class="ai-card-header" style="color:var(--accent-red);">🔴 Error Type: ${escapeHtml(data.errorType)}</div>
      <div class="ai-card-section">
        <strong>📋 What happened:</strong>
        <div>${escapeHtml(data.whatHappened)}</div>
      </div>
      <div class="ai-card-section">
        <strong>💡 Why it occurred:</strong>
        <div>${escapeHtml(data.whyItOccurred)}</div>
      </div>
      <div class="ai-card-section">
        <strong>✅ How to fix it:</strong>
        <div>${escapeHtml(data.howToFix)}</div>
      </div>
      <div class="ai-card-section">
        <strong>📝 Corrected code:</strong>
        <div class="ai-code-block">${escapeHtml(data.correctedCodeSnippet)}</div>
      </div>
    </div>`;
}

async function explainLogic() {
  if (!editor) return;
  const code = editor.getValue();
  showAILoading();
  sessionStats.algosAnalyzed++;
  updateAnalyticsUI();

  const systemPrompt = `You are an expert CS educator. Analyze this code and respond in JSON with fields: programSummary, algorithmDetected, stepByStepLogic (array of strings), timeComplexity, spaceComplexity, optimizationSuggestions (array of strings). Keep language educational and clear.`;
  const userPrompt = `Language: ${currentLang.name}\n\nCode:\n${code}`;

  let result = await callClaudeAPI(systemPrompt, userPrompt);

  if (!result) {
    result = getMockLogicExplanation(code);
  }

  renderLogicExplanation(result);
}

function getMockLogicExplanation(code) {
  const isBubbleSort = /bubble.?sort/i.test(code) || (/for.*range.*n/i.test(code) && /swap/i.test(code));
  const isBinarySearch = /binary.?search/i.test(code) || (/left.*right/i.test(code) && /mid/i.test(code));
  const isFibonacci = /fibonacci|fib\(/i.test(code);
  const isLinkedList = /linked.?list|node.*next/i.test(code);

  if (isBubbleSort) return {
    programSummary: "This program implements the Bubble Sort algorithm to sort an array of integers in ascending order.",
    algorithmDetected: "Bubble Sort",
    stepByStepLogic: [
      "1. Start with an unsorted array of n elements",
      "2. Outer loop iterates n times (one pass per element)",
      "3. Inner loop compares adjacent elements pairwise",
      "4. If left element > right element, swap them",
      "5. After each pass, the largest unsorted element \"bubbles\" to its correct position",
      "6. Optimization: if no swaps occur in a pass, array is sorted — exit early"
    ],
    timeComplexity: "O(n²)", spaceComplexity: "O(1)",
    optimizationSuggestions: [
      "Use Merge Sort or Quick Sort for O(n log n) average case",
      "For nearly sorted arrays, Insertion Sort performs better",
      "Consider Tim Sort (Python's built-in) for real-world applications"
    ]
  };

  if (isBinarySearch) return {
    programSummary: "This program implements Binary Search to efficiently find a target value in a sorted array.",
    algorithmDetected: "Binary Search",
    stepByStepLogic: [
      "1. Initialize left pointer to start, right pointer to end of array",
      "2. Calculate mid index as average of left and right",
      "3. If arr[mid] equals target, return mid (found!)",
      "4. If arr[mid] < target, search right half (left = mid + 1)",
      "5. If arr[mid] > target, search left half (right = mid - 1)",
      "6. Repeat until left > right (element not found, return -1)"
    ],
    timeComplexity: "O(log n)", spaceComplexity: "O(1)",
    optimizationSuggestions: [
      "Already optimal for sorted array search",
      "Consider interpolation search for uniformly distributed data",
      "For frequent lookups, use a hash map for O(1) average"
    ]
  };

  if (isFibonacci) return {
    programSummary: "This program generates Fibonacci numbers using recursion.",
    algorithmDetected: "Recursive Fibonacci",
    stepByStepLogic: [
      "1. Base case: if n ≤ 1, return n directly",
      "2. Recursive case: return fib(n-1) + fib(n-2)",
      "3. Each call branches into two sub-problems",
      "4. Results propagate up through the call stack"
    ],
    timeComplexity: "O(2ⁿ)", spaceComplexity: "O(n)",
    optimizationSuggestions: [
      "Use memoization (top-down DP) to reduce to O(n)",
      "Use iterative approach with two variables for O(1) space",
      "Matrix exponentiation can achieve O(log n) time"
    ]
  };

  return {
    programSummary: "This program processes data using standard programming constructs.",
    algorithmDetected: "Custom Logic",
    stepByStepLogic: [
      "1. Program initializes required data structures",
      "2. Core logic processes input data",
      "3. Results are computed and displayed"
    ],
    timeComplexity: "Varies", spaceComplexity: "Varies",
    optimizationSuggestions: ["Consider profiling to identify bottlenecks", "Review data structure choices for efficiency"]
  };
}

function renderLogicExplanation(data) {
  const steps = (data.stepByStepLogic || []).map(s => `<div style="padding:3px 0;color:var(--text-primary)">${escapeHtml(s)}</div>`).join('');
  const tips = (data.optimizationSuggestions || []).map(s => `<div style="padding:2px 0;color:var(--text-secondary)">• ${escapeHtml(s)}</div>`).join('');

  document.getElementById('aiContent').innerHTML = `
    <div class="ai-card">
      <div class="ai-card-header" style="color:var(--accent-cyan);">🧠 ${escapeHtml(data.algorithmDetected || 'Analysis')}</div>
      <div class="ai-card-section">
        <strong>📋 Summary:</strong>
        <div>${escapeHtml(data.programSummary)}</div>
      </div>
      <div class="ai-card-section">
        <strong>🔄 Step-by-step logic:</strong>
        ${steps}
      </div>
      <div class="ai-card-section" style="display:flex;gap:16px;">
        <div><strong>⏱ Time:</strong> <span class="complexity-value complexity-yellow">${escapeHtml(data.timeComplexity)}</span></div>
        <div><strong>💾 Space:</strong> <span class="complexity-value complexity-blue">${escapeHtml(data.spaceComplexity)}</span></div>
      </div>
      ${tips ? `<div class="ai-card-section"><strong>💡 Optimization tips:</strong>${tips}</div>` : ''}
    </div>`;
}

// ── Complexity Analyzer ───────────────────────────────────
function analyzeComplexity(code) {
  const analysis = detectComplexity(code);
  renderComplexity(analysis);
}

function detectComplexity(code) {
  const hasNestedLoops = /for.*\n[\s\S]*?for|while.*\n[\s\S]*?while/i.test(code);
  const hasRecursion = /def\s+(\w+)[\s\S]*?\1\s*\(|function\s+(\w+)[\s\S]*?\2\s*\(/i.test(code);
  const hasSingleLoop = /for\s|while\s/i.test(code);
  const isBubbleSort = /bubble.?sort/i.test(code);
  const isBinarySearch = /binary.?search/i.test(code) || (/left.*right/i.test(code) && /mid/i.test(code));
  const isMergeSort = /merge.?sort/i.test(code);
  const isQuickSort = /quick.?sort/i.test(code);
  const isFibonacci = /fibonacci|fib\(/i.test(code);

  let best = 'O(n)', avg = 'O(n)', worst = 'O(n)', space = 'O(1)';
  let detected = 'Linear scan', detail = 'Single pass through data';
  let tip = '';

  if (isBubbleSort) {
    best = 'O(n)'; avg = 'O(n²)'; worst = 'O(n²)'; space = 'O(1)';
    detected = 'Bubble Sort'; detail = 'Nested loop structure with adjacent element comparison';
    tip = '💡 This O(n²) sort can be replaced with Merge Sort for O(n log n) performance.';
  } else if (isBinarySearch) {
    best = 'O(1)'; avg = 'O(log n)'; worst = 'O(log n)'; space = 'O(1)';
    detected = 'Binary Search'; detail = 'Divide-and-conquer search on sorted data';
  } else if (isMergeSort) {
    best = 'O(n log n)'; avg = 'O(n log n)'; worst = 'O(n log n)'; space = 'O(n)';
    detected = 'Merge Sort'; detail = 'Recursive divide-and-conquer sorting';
  } else if (isQuickSort) {
    best = 'O(n log n)'; avg = 'O(n log n)'; worst = 'O(n²)'; space = 'O(log n)';
    detected = 'Quick Sort'; detail = 'Partition-based recursive sorting';
    tip = '💡 Use randomized pivot to avoid worst-case O(n²) on sorted input.';
  } else if (isFibonacci && hasRecursion) {
    best = 'O(2ⁿ)'; avg = 'O(2ⁿ)'; worst = 'O(2ⁿ)'; space = 'O(n)';
    detected = 'Recursive Fibonacci'; detail = 'Exponential branching without memoization';
    tip = '💡 Add memoization to reduce from O(2ⁿ) to O(n) time complexity.';
  } else if (hasNestedLoops) {
    best = 'O(n)'; avg = 'O(n²)'; worst = 'O(n²)'; space = 'O(1)';
    detected = 'Nested Loop Pattern'; detail = 'Two nested iteration structures detected';
    tip = '💡 Consider if the inner loop can be replaced with a hash set for O(n) performance.';
  } else if (hasRecursion) {
    best = 'O(n)'; avg = 'O(n)'; worst = 'O(n)'; space = 'O(n)';
    detected = 'Recursive Algorithm'; detail = 'Recursive function call pattern detected';
  } else if (hasSingleLoop) {
    best = 'O(n)'; avg = 'O(n)'; worst = 'O(n)'; space = 'O(1)';
    detected = 'Linear Algorithm'; detail = 'Single iteration through data';
  } else {
    best = 'O(1)'; avg = 'O(1)'; worst = 'O(1)'; space = 'O(1)';
    detected = 'Constant Time'; detail = 'No significant iteration detected';
  }

  return { best, avg, worst, space, detected, detail, tip };
}

function getComplexityClass(val) {
  if (val.includes('1') || val.includes('log')) return 'complexity-green';
  if (val.includes('n²') || val.includes('2ⁿ')) return 'complexity-red';
  return 'complexity-yellow';
}

function renderComplexity(a) {
  document.getElementById('complexityContent').innerHTML = `
    <div class="complexity-grid">
      <div class="complexity-card">
        <div class="complexity-label">⏱ Best Case</div>
        <div class="complexity-value ${getComplexityClass(a.best)}">${a.best}</div>
      </div>
      <div class="complexity-card">
        <div class="complexity-label">⏱ Average Case</div>
        <div class="complexity-value ${getComplexityClass(a.avg)}">${a.avg}</div>
      </div>
      <div class="complexity-card">
        <div class="complexity-label">⏱ Worst Case</div>
        <div class="complexity-value ${getComplexityClass(a.worst)}">${a.worst}</div>
      </div>
      <div class="complexity-card">
        <div class="complexity-label">💾 Space</div>
        <div class="complexity-value ${getComplexityClass(a.space)}">${a.space}</div>
      </div>
    </div>
    <div class="complexity-detection">🔍 Detected: <strong>${a.detected}</strong> | ${a.detail}</div>
    ${a.tip ? `<div class="complexity-tip">${a.tip}</div>` : ''}`;
}

// ── Visualization Engine ──────────────────────────────────

function initVizDemo() {
  // Hide viz section initially
  document.getElementById('vizSection').style.display = 'none';
}

function runVisualizer(code) {
  const analysis = detectComplexity(code);
  const section = document.getElementById('vizSection');
  
  // Try to parse an array from the manual input panel first
  let arr = null;
  const stdinVal = document.getElementById('stdinInput').value;
  if (stdinVal.trim() !== '') {
    // Try to find numbers separated by spaces, commas, or newlines
    const nums = stdinVal.replace(/[\[\]{}]/g, '').split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (nums.length > 2 && nums.length <= 30) {
      arr = nums;
    }
  }

  // If manual input doesn't have an array, fallback to parsing from the code
  if (!arr) {
    arr = [64, 34, 25, 12, 22, 11, 90]; // ultimate fallback
    const arrMatch = code.match(/\[([\d\s,-]+)\]/) || code.match(/\{([\d\s,-]+)\}/);
    if (arrMatch && arrMatch[1]) {
      const nums = arrMatch[1].split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (nums.length > 2 && nums.length <= 20) {
        arr = nums;
      }
    }
  }

  // Determine what to show based on code contents
  if (analysis.detected.includes('Sort') || code.includes('bubble') || code.includes('sort')) {
    section.style.display = 'block';
    generateBubbleSortFrames(arr);
    renderArrayFrame(0);
    // Switch to Array tab
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Array'));
    if (tabBtn) switchVizTab(tabBtn, 'vizArray');
  } 
  else if (analysis.detected.includes('Search') || code.includes('binary')) {
    section.style.display = 'block';
    // Just show the array static for search
    vizState.frames = [{ array: [...arr].sort((a,b)=>a-b), active: [], comparing: [], sorted: [], label: 'Sorted Array for Search' }];
    renderArrayFrame(0);
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Array'));
    if (tabBtn) switchVizTab(tabBtn, 'vizArray');
  }
  else if (code.includes('Node') || code.includes('Linked') || code.includes('next')) {
    section.style.display = 'block';
    renderLinkedListDemo(arr);
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Linked List'));
    if (tabBtn) switchVizTab(tabBtn, 'vizLinked');
  }
  else if (code.includes('Tree') || code.includes('root') || code.includes('child')) {
    section.style.display = 'block';
    renderTreeDemo();
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Tree'));
    if (tabBtn) switchVizTab(tabBtn, 'vizTree');
  }
  else if (analysis.detected.includes('Recursi') || code.includes('fib')) {
    section.style.display = 'block';
    renderRecursionDemo();
    const tabBtn = Array.from(section.querySelectorAll('.tab-btn')).find(b => b.textContent.includes('Recursion'));
    if (tabBtn) switchVizTab(tabBtn, 'vizRecursion');
  } else {
    // Hide if no visualizable data structure/algorithm detected
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

// -- Linked List Visualization --
function renderLinkedListDemo(customNodes) {
  const nodes = customNodes || [10, 20, 30, 40, 50];
  const canvas = document.getElementById('linkedVizCanvas');
  canvas.innerHTML = `<div style="display:flex;align-items:center;gap:32px;overflow-x:auto;padding:16px;">` +
    nodes.map((v, i) =>
      `<div style="display:flex;align-items:center;position:relative;">
        <div style="width:72px;height:72px;display:flex;align-items:center;justify-content:center;background:var(--bg-surface);border:2px solid ${i===0 ? 'var(--accent-cyan)' : 'var(--border)'};border-radius:var(--radius-md);font-family:var(--font-code);font-weight:600;font-size:18px;${i===0 ? 'box-shadow:0 0 12px rgba(0,212,255,0.2);' : ''}">${v}</div>
        ${i < nodes.length - 1 ? '<div style="position:absolute;right:-32px;width:32px;text-align:center;color:var(--text-muted);font-size:24px;">→</div>' : '<div style="position:absolute;right:-60px;width:60px;text-align:center;color:var(--text-muted);font-size:14px;">→ null</div>'}
      </div>`
    ).join('') + `</div>
    <div style="width:100%;text-align:center;font-size:12px;color:var(--text-muted);margin-top:24px;">Head pointer at node 10</div>`;
}

// -- Tree Visualization --
function renderTreeDemo() {
  const canvas = document.getElementById('treeVizCanvas');
  const w = 380; const h = 200;
  const nodes = [
    { val: 50, x: w/2, y: 30 },
    { val: 30, x: w/2-80, y: 80 },
    { val: 70, x: w/2+80, y: 80 },
    { val: 20, x: w/2-120, y: 130 },
    { val: 40, x: w/2-40, y: 130 },
    { val: 60, x: w/2+40, y: 130 },
    { val: 80, x: w/2+120, y: 130 },
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]];

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%;">`;

  edges.forEach(([a,b]) => {
    svg += `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="#2A2D3A" stroke-width="2"/>`;
  });

  nodes.forEach((n, i) => {
    const isRoot = i === 0;
    svg += `<circle cx="${n.x}" cy="${n.y}" r="18" fill="${isRoot ? 'rgba(0,212,255,0.15)' : 'var(--bg-surface)'}" stroke="${isRoot ? 'var(--accent-cyan)' : 'var(--border)'}" stroke-width="2"/>`;
    svg += `<text x="${n.x}" y="${n.y+4}" text-anchor="middle" fill="var(--text-primary)" font-family="JetBrains Mono" font-size="12" font-weight="600">${n.val}</text>`;
  });

  svg += '</svg>';
  canvas.innerHTML = svg + `<div style="width:100%;text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px;">Binary Search Tree — In-order: 20, 30, 40, 50, 60, 70, 80</div>`;
}

// -- Graph Visualization --
function renderGraphDemo() {
  const canvas = document.getElementById('graphVizCanvas');
  const w = 380; const h = 200;
  const nodes = [
    { id: 'A', x: 60, y: 50 }, { id: 'B', x: 160, y: 30 },
    { id: 'C', x: 260, y: 50 }, { id: 'D', x: 100, y: 130 },
    { id: 'E', x: 220, y: 140 }, { id: 'F', x: 320, y: 120 }
  ];
  const edges = [[0,1],[0,3],[1,2],[1,4],[2,5],[3,4],[4,5]];
  const colors = ['var(--accent-cyan)', 'var(--accent-blue)', 'var(--accent-green)', 'var(--accent-yellow)', 'var(--accent-red)', '#a855f7'];

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%;">`;

  edges.forEach(([a,b]) => {
    svg += `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="#2A2D3A" stroke-width="1.5"/>`;
  });

  nodes.forEach((n, i) => {
    svg += `<circle cx="${n.x}" cy="${n.y}" r="20" fill="rgba(0,0,0,0.3)" stroke="${colors[i]}" stroke-width="2"/>`;
    svg += `<text x="${n.x}" y="${n.y+4}" text-anchor="middle" fill="${colors[i]}" font-family="JetBrains Mono" font-size="13" font-weight="700">${n.id}</text>`;
  });

  svg += '</svg>';
  canvas.innerHTML = svg + `<div style="width:100%;text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px;">Undirected Graph — 6 vertices, 7 edges</div>`;
}

// -- Recursion Stack Visualization --
function renderRecursionDemo() {
  const canvas = document.getElementById('recursionVizCanvas');
  const frames = [
    { fn: 'fib(5)', args: 'n=5', result: '5', active: true },
    { fn: 'fib(4)', args: 'n=4', result: '3', active: false },
    { fn: 'fib(3)', args: 'n=3', result: '2', active: false },
    { fn: 'fib(2)', args: 'n=2', result: '1', active: false },
    { fn: 'fib(1)', args: 'n=1', result: '1', active: false },
  ];

  canvas.innerHTML = `<div class="recursion-stack">` +
    frames.map(f =>
      `<div class="recursion-frame ${f.active ? 'active' : ''}">
        <span><span class="fn-name">${f.fn}</span> <span style="color:var(--text-muted)">${f.args}</span></span>
        <span class="fn-result">→ ${f.result}</span>
      </div>`
    ).join('') +
    `</div>
    <div style="width:100%;text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px;">Call Stack — fib(5) recursive tree</div>`;
}

// -- Visualization Controls --
function vizGoStart() { renderArrayFrame(0); }

function vizPrev() {
  if (vizState.current > 0) renderArrayFrame(vizState.current - 1);
}

function vizNext() {
  if (vizState.current < vizState.frames.length - 1) renderArrayFrame(vizState.current + 1);
}

function vizGoEnd() { renderArrayFrame(vizState.frames.length - 1); }

function vizTogglePlay() {
  if (vizState.playing) {
    vizPause();
  } else {
    vizState.playing = true;
    document.getElementById('vizPlayBtn').textContent = '⏸';
    const speed = 1600 - parseInt(document.getElementById('vizSpeed').value);
    vizState.interval = setInterval(() => {
      if (vizState.current < vizState.frames.length - 1) {
        renderArrayFrame(vizState.current + 1);
      } else {
        vizPause();
      }
    }, speed);
  }
}

function vizPause() {
  vizState.playing = false;
  clearInterval(vizState.interval);
  document.getElementById('vizPlayBtn').textContent = '▶';
}

// ── Keyboard Shortcuts ────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
});
