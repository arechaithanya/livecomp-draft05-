/* ═══════════════════════════════════════════════════════════
   NEXUS IDE — Application Logic
   Part 1: Config, Languages, Editor Setup
   ═══════════════════════════════════════════════════════════ */

// ── Language Config ───────────────────────────────────────
const LANGUAGES = [
  { id: 'python', name: 'Python', monacoId: 'python', color: '#3572A5', version: 'Python 3' },
  { id: 'javascript', name: 'JavaScript', monacoId: 'javascript', color: '#F7DF1E', version: 'ES2022' },
  { id: 'cpp', name: 'C++', monacoId: 'cpp', color: '#00599C', version: 'C++17' },
  { id: 'java', name: 'Java', monacoId: 'java', color: '#ED8B00', version: 'Java 17' },
  { id: 'c', name: 'C', monacoId: 'c', color: '#555555', version: 'C11' },
  { id: 'go', name: 'Go', monacoId: 'go', color: '#00ADD8', version: 'Go 1.21' },
  { id: 'rust', name: 'Rust', monacoId: 'rust', color: '#DEA584', version: 'Rust 1.74' },
  { id: 'kotlin', name: 'Kotlin', monacoId: 'kotlin', color: '#A97BFF', version: 'Kotlin 1.9' },
  { id: 'php', name: 'PHP', monacoId: 'php', color: '#777BB4', version: 'PHP 8.2' }
];

const STARTER_CODE = {
  python: `# NEXUS IDE — Python Bubble Sort Demo
def bubble_sort(arr):
    """Sort an array using Bubble Sort algorithm."""
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

# Test the algorithm
data = [64, 34, 25, 12, 22, 11, 90]
print("Original array:", data)
result = bubble_sort(data.copy())
print("Sorted array:", result)
print(f"Array length: {len(data)} elements")
`,
  javascript: `// NEXUS IDE — JavaScript Binary Search Demo
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1; // Not found
}

// Test the algorithm
const sortedArray = [2, 5, 8, 12, 16, 23, 38, 45, 67, 91];
const target = 23;
const index = binarySearch(sortedArray, target);
console.log(\`Array: [\${sortedArray.join(', ')}]\`);
console.log(\`Target: \${target}\`);
console.log(\`Found at index: \${index}\`);
`,
  cpp: `// NEXUS IDE — C++ Fibonacci (Recursive) Demo
#include <iostream>
#include <vector>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    int terms = 10;
    cout << "Fibonacci Sequence (first " << terms << " terms):" << endl;
    
    for (int i = 0; i < terms; i++) {
        cout << fibonacci(i);
        if (i < terms - 1) cout << ", ";
    }
    cout << endl;
    
    cout << "fibonacci(10) = " << fibonacci(10) << endl;
    return 0;
}
`,
  java: `// NEXUS IDE — Java Linked List Traversal Demo
public class Main {
    static class Node {
        int data;
        Node next;
        Node(int d) { data = d; next = null; }
    }
    
    static class LinkedList {
        Node head;
        
        void append(int data) {
            Node newNode = new Node(data);
            if (head == null) { head = newNode; return; }
            Node curr = head;
            while (curr.next != null) curr = curr.next;
            curr.next = newNode;
        }
        
        void printList() {
            Node curr = head;
            while (curr != null) {
                System.out.print(curr.data + " -> ");
                curr = curr.next;
            }
            System.out.println("null");
        }
    }
    
    public static void main(String[] args) {
        LinkedList list = new LinkedList();
        int[] values = {10, 20, 30, 40, 50};
        for (int v : values) list.append(v);
        
        System.out.println("Linked List Traversal:");
        list.printList();
        System.out.println("Total nodes: " + values.length);
    }
}
`,
  c: `// NEXUS IDE — C Selection Sort Demo
#include <stdio.h>

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx])
                minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}

int main() {
    int arr[] = {29, 10, 14, 37, 13};
    int n = sizeof(arr) / sizeof(arr[0]);
    printf("Original: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    selectionSort(arr, n);
    printf("\\nSorted:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`,
  go: `// NEXUS IDE — Go Quick Sort Demo
package main

import "fmt"

func quickSort(arr []int) []int {
    if len(arr) <= 1 { return arr }
    pivot := arr[len(arr)/2]
    var left, middle, right []int
    for _, v := range arr {
        if v < pivot { left = append(left, v) }
        if v == pivot { middle = append(middle, v) }
        if v > pivot { right = append(right, v) }
    }
    result := quickSort(left)
    result = append(result, middle...)
    result = append(result, quickSort(right)...)
    return result
}

func main() {
    data := []int{38, 27, 43, 3, 9, 82, 10}
    fmt.Println("Original:", data)
    sorted := quickSort(data)
    fmt.Println("Sorted:  ", sorted)
}
`,
  rust: `// NEXUS IDE — Rust Insertion Sort Demo
fn insertion_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 1..n {
        let key = arr[i];
        let mut j = i;
        while j > 0 && arr[j - 1] > key {
            arr[j] = arr[j - 1];
            j -= 1;
        }
        arr[j] = key;
    }
}

fn main() {
    let mut data = vec![12, 11, 13, 5, 6];
    println!("Original: {:?}", data);
    insertion_sort(&mut data);
    println!("Sorted:   {:?}", data);
}
`,
  kotlin: `// NEXUS IDE — Kotlin Merge Sort Demo
fun mergeSort(arr: List<Int>): List<Int> {
    if (arr.size <= 1) return arr
    val mid = arr.size / 2
    val left = mergeSort(arr.subList(0, mid))
    val right = mergeSort(arr.subList(mid, arr.size))
    return merge(left, right)
}

fun merge(left: List<Int>, right: List<Int>): List<Int> {
    var i = 0; var j = 0
    val result = mutableListOf<Int>()
    while (i < left.size && j < right.size) {
        if (left[i] <= right[j]) result.add(left[i++])
        else result.add(right[j++])
    }
    result.addAll(left.subList(i, left.size))
    result.addAll(right.subList(j, right.size))
    return result
}

fun main() {
    val data = listOf(38, 27, 43, 3, 9, 82, 10)
    println("Original: $data")
    println("Sorted:   \${mergeSort(data)}")
}
`,
  php: `<?php
// NEXUS IDE — PHP Heap Sort Demo
function heapSort(&\$arr) {
    \$n = count(\$arr);
    for (\$i = intdiv(\$n, 2) - 1; \$i >= 0; \$i--)
        heapify(\$arr, \$n, \$i);
    for (\$i = \$n - 1; \$i > 0; \$i--) {
        [\$arr[0], \$arr[\$i]] = [\$arr[\$i], \$arr[0]];
        heapify(\$arr, \$i, 0);
    }
}

function heapify(&\$arr, \$n, \$i) {
    \$largest = \$i;
    \$l = 2 * \$i + 1;
    \$r = 2 * \$i + 2;
    if (\$l < \$n && \$arr[\$l] > \$arr[\$largest]) \$largest = \$l;
    if (\$r < \$n && \$arr[\$r] > \$arr[\$largest]) \$largest = \$r;
    if (\$largest != \$i) {
        [\$arr[\$i], \$arr[\$largest]] = [\$arr[\$largest], \$arr[\$i]];
        heapify(\$arr, \$n, \$largest);
    }
}

\$data = [12, 11, 13, 5, 6, 7];
echo "Original: " . implode(', ', \$data) . "\\n";
heapSort(\$data);
echo "Sorted:   " . implode(', ', \$data) . "\\n";
?>`
};

// ── State ─────────────────────────────────────────────────
let currentLang = LANGUAGES[0];
let editor = null;
let sessionStats = { runs: 0, errors: 0, totalDebugTime: 0, algosAnalyzed: 0 };
let vizState = { frames: [], current: -1, playing: false, interval: null };
let testCaseCount = 0;

// ── Monaco Editor Setup ───────────────────────────────────
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  // Define custom dark theme
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
    value: STARTER_CODE.python,
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
  });

  // Track cursor position
  editor.onDidChangeCursorPosition(e => {
    document.getElementById('statusCursor').textContent =
      `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });

  // Auto-resize
  window.addEventListener('resize', () => editor.layout());
  new ResizeObserver(() => editor.layout()).observe(document.getElementById('editor'));

  // Build language dropdown
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
    editor.setValue(STARTER_CODE[currentLang.id] || `// ${currentLang.name} code here\n`);
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

// Close dropdown on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.lang-selector')) {
    document.getElementById('langDropdown').classList.remove('open');
  }
});

// ── Panel Toggle ──────────────────────────────────────────
function togglePanel(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

// ── Tab Switching ─────────────────────────────────────────
function switchTab(btn, tabId) {
  const parent = btn.closest('.panel-body') || btn.closest('.panel');
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function switchVizTab(btn, tabId) {
  const section = document.getElementById('vizSection');
  section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  section.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ── Panel State Transitions (Run button) ─────────────────
function showPostRunState() {
  // Hide right input panel with fade-out
  const rightInput = document.getElementById('rightInputPanel');
  rightInput.classList.add('panel-fadeout');
  setTimeout(() => {
    rightInput.style.display = 'none';
    rightInput.classList.remove('panel-fadeout');
  }, 200);

  // Show AI panel and Complexity panel with slide-in
  setTimeout(() => {
    document.getElementById('aiPanel').style.display = 'flex';
    document.getElementById('complexityPanel').style.display = 'flex';
    document.getElementById('backToInputBtn').style.display = 'flex';
    // Re-add animation class
    document.getElementById('aiPanel').classList.remove('panel-slide');
    document.getElementById('complexityPanel').classList.remove('panel-slide');
    void document.getElementById('aiPanel').offsetWidth; // force reflow
    document.getElementById('aiPanel').classList.add('panel-slide');
    document.getElementById('complexityPanel').classList.add('panel-slide');
  }, 250);
}

function showPreRunState() {
  // Show right input panel
  document.getElementById('rightInputPanel').style.display = 'flex';
  // Hide AI and Complexity panels
  document.getElementById('aiPanel').style.display = 'none';
  document.getElementById('complexityPanel').style.display = 'none';
  document.getElementById('backToInputBtn').style.display = 'none';
}

function updateAnalyticsUI() {
  document.getElementById('statRuns').textContent = sessionStats.runs;
  document.getElementById('statErrors').textContent = sessionStats.errors;
  document.getElementById('statAvgDebug').textContent =
    sessionStats.runs ? (sessionStats.totalDebugTime / sessionStats.runs).toFixed(1) + 's' : '0s';
  document.getElementById('statAlgos').textContent = sessionStats.algosAnalyzed;
}

// ── API Key Modal ─────────────────────────────────────────
function openApiKeyModal() {
  const modal = document.getElementById('apiKeyModal');
  modal.classList.add('open');
  const saved = localStorage.getItem('nexus_api_key') || '';
  document.getElementById('apiKeyInput').value = saved;
}

function closeApiKeyModal() {
  document.getElementById('apiKeyModal').classList.remove('open');
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) localStorage.setItem('nexus_api_key', key);
  closeApiKeyModal();
}

function clearApiKey() {
  localStorage.removeItem('nexus_api_key');
  document.getElementById('apiKeyInput').value = '';
  closeApiKeyModal();
}

// ── Test Cases ────────────────────────────────────────────
function addTestCase() {
  testCaseCount++;
  const list = document.getElementById('testCaseList');
  const card = document.createElement('div');
  card.className = 'test-case-card';
  card.innerHTML = `
    <div class="test-case-header">
      <span>Test Case #${testCaseCount}</span>
      <button class="btn" style="padding:2px 8px;font-size:11px;" onclick="this.closest('.test-case-card').remove()">✕</button>
    </div>
    <textarea class="input-textarea" placeholder="Input..." rows="2" style="margin-bottom:6px;"></textarea>
    <textarea class="input-textarea" placeholder="Expected output..." rows="2" style="margin-bottom:6px;"></textarea>
    <button class="btn" style="font-size:11px;" onclick="runTestCase(this)">▶ Run This Case</button>
  `;
  list.appendChild(card);
}

function runTestCase(btn) {
  const card = btn.closest('.test-case-card');
  const areas = card.querySelectorAll('textarea');
  document.getElementById('stdinInput').value = areas[0].value;
  runCode();
}

// ── File Upload ───────────────────────────────────────────
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById('stdinInput').value = reader.result;
    switchTab(document.querySelector('.tab-btn'), 'manualTab');
  };
  reader.readAsText(file);
}

// ── Compiler Simulation ──────────────────────────────────
function runCode() {
  if (!editor) return;
  const code = editor.getValue();
  const btn = document.getElementById('runBtn');
  const statusBar = document.getElementById('statusBar');

  // Set running state
  btn.classList.add('running');
  btn.innerHTML = '⏳ Running...';
  statusBar.className = 'status-bar running';
  document.getElementById('statusState').innerHTML = '<span class="status-dot"></span> Running...';

  // Clear markers
  monaco.editor.setModelMarkers(editor.getModel(), 'compiler', []);

  const startTime = performance.now();
  sessionStats.runs++;

  setTimeout(() => {
    const elapsed = ((performance.now() - startTime + Math.random() * 80) / 1000).toFixed(3);
    const memUsage = (Math.random() * 4 + 0.5).toFixed(1);
    const result = simulateCompilation(code, currentLang.id);

    btn.classList.remove('running');
    btn.innerHTML = '▶ Run';

    if (result.error) {
      sessionStats.errors++;
      sessionStats.totalDebugTime += parseFloat(elapsed);
      showErrorOutput(result, elapsed, memUsage);
      statusBar.className = 'status-bar error';
      document.getElementById('statusState').innerHTML = '<span class="status-dot" style="background:var(--accent-red)"></span> Error';

      // Set editor markers
      if (result.line) {
        monaco.editor.setModelMarkers(editor.getModel(), 'compiler', [{
          severity: monaco.MarkerSeverity.Error,
          message: result.message,
          startLineNumber: result.line,
          startColumn: 1,
          endLineNumber: result.line,
          endColumn: 100,
        }]);
      }

      showPostRunState();
      analyzeError(code, currentLang.name, result.message);
    } else {
      showSuccessOutput(result.output, elapsed, memUsage);
      statusBar.className = 'status-bar success';
      document.getElementById('statusState').innerHTML = '<span class="status-dot" style="background:var(--accent-green)"></span> Success';
      showPostRunState();
      showAISuccess();
      setTimeout(() => {
        statusBar.className = 'status-bar';
        document.getElementById('statusState').innerHTML = '<span class="status-dot"></span> Ready';
      }, 3000);
    }

    // Update stats
    document.getElementById('execTimeBadge').textContent = elapsed + 's';
    document.getElementById('statusTime').textContent = '⏱ ' + elapsed + 's';
    document.getElementById('statusMem').textContent = '🧠 ' + memUsage + 'MB';
    updateAnalyticsUI();
    analyzeComplexity(code);
    if (!result.error) runVisualizer(code);

  }, 600 + Math.random() * 400);
}

function simulateCompilation(code, lang) {
  // Check for common syntax errors
  const errors = [];

  // Python errors
  if (lang === 'python') {
    if (/\bpritn\b/.test(code)) errors.push({ line: findLine(code, 'pritn'), message: "NameError: name 'pritn' is not defined. Did you mean 'print'?", type: 'NameError' });
    if (/def\s+\w+\s*\([^)]*\)\s*[^:]\s*$/m.test(code)) errors.push({ line: findLineRegex(code, /def\s+\w+/), message: "SyntaxError: expected ':'", type: 'SyntaxError' });
    if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) errors.push({ line: code.split('\n').length, message: "SyntaxError: unexpected EOF while parsing (unmatched parenthesis)", type: 'SyntaxError' });
  }

  // JavaScript errors
  if (lang === 'javascript') {
    if (/\bconsoel\b/.test(code)) errors.push({ line: findLine(code, 'consoel'), message: "ReferenceError: consoel is not defined", type: 'ReferenceError' });
    // Don't flag unmatched braces strictly if they are part of a valid array like [1, 2]
    const strippedCode = code.replace(/['"`].*?['"`]/g, '').replace(/\/\/.*$/gm, '');
    if ((strippedCode.match(/\{/g) || []).length !== (strippedCode.match(/\}/g) || []).length) {
       errors.push({ line: code.split('\n').length, message: "SyntaxError: Unexpected end of input (missing closing brace)", type: 'SyntaxError' });
    }
  }

  // C++ errors
  if (lang === 'cpp' || lang === 'c') {
    if (lang === 'cpp' && /\bcout\b/.test(code)) {
      const hasIostream = /#include\s*<(iostream|bits\/stdc\+\+\.h)>/.test(code);
      const hasUsingStd = /using\s+namespace\s+std/.test(code) || /\bstd::cout\b/.test(code);
      if (!hasIostream) {
        errors.push({ line: findLine(code, 'cout'), message: "error: 'cout' was not declared in this scope (missing #include <iostream>)", type: 'CompileError' });
      } else if (!hasUsingStd) {
        errors.push({ line: findLine(code, 'cout'), message: "error: 'cout' was not declared in this scope. Did you forget 'using namespace std;'?", type: 'CompileError' });
      }
    }
    if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) errors.push({ line: code.split('\n').length, message: "error: expected '}' at end of input", type: 'SyntaxError' });
  }

  // Java errors
  if (lang === 'java') {
    if (/System\.out\.pritnln/.test(code)) errors.push({ line: findLine(code, 'pritnln'), message: "error: cannot find symbol: method pritnln(String)", type: 'CompileError' });
  }

  // General checks
  if (/\bwhile\s*\(\s*true\s*\)/.test(code) && !/break/.test(code)) errors.push({ line: findLine(code, 'while'), message: "Warning: Potential infinite loop detected (while(true) without break)", type: 'Warning' });

  if (errors.length > 0) {
    return { error: true, ...errors[0] };
  }

  // Generate mock output
  return { error: false, output: generateMockOutput(code, lang) };
}

function findLine(code, text) {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text)) return i + 1;
  }
  return 1;
}

function findLineRegex(code, regex) {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) return i + 1;
  }
  return 1;
}

function generateMockOutput(code, lang) {
  const outputs = [];
  const stdinVal = document.getElementById('stdinInput').value.trim();

  // Helper to parse arrays from stdin
  const parseStdinArray = (defaultArr) => {
    if (stdinVal) {
      const nums = stdinVal.replace(/[\[\]{}]/g, '').split(/[\s,]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      if (nums.length > 0) return nums;
    }
    return defaultArr;
  };

  if (lang === 'python') {
    const prints = code.match(/print\s*\((.+)\)/g) || [];
    if (prints.length) {
      if (code.includes('bubble_sort') || code.includes('sort')) {
        const arr = parseStdinArray([64, 34, 25, 12, 22, 11, 90]);
        outputs.push(`Original array: [${arr.join(', ')}]`);
        const sorted = [...arr].sort((a,b) => a-b);
        outputs.push(`Sorted array: [${sorted.join(', ')}]`);
        outputs.push(`Array length: ${arr.length} elements`);
      } else {
        prints.forEach(() => outputs.push('Output: [program result]'));
      }
    }
  } else if (lang === 'javascript') {
    if (code.includes('binarySearch') || code.includes('Binary')) {
      const arr = parseStdinArray([2, 5, 8, 12, 16, 23, 38, 45, 67, 91]);
      const sorted = [...arr].sort((a,b) => a-b);
      const target = sorted[Math.floor(sorted.length / 2)] || 23;
      outputs.push(`Array: [${sorted.join(', ')}]`);
      outputs.push(`Target: ${target}`);
      outputs.push(`Found at index: ${Math.floor(sorted.length / 2)}`);
    } else {
      outputs.push('[Program output]');
    }
  } else if (lang === 'cpp') {
    if (code.includes('fibonacci') || code.includes('Fibonacci')) {
      let terms = 10;
      if (stdinVal) {
        const parsed = parseInt(stdinVal.trim());
        if (!isNaN(parsed) && parsed > 0 && parsed < 100) terms = parsed;
      }
      outputs.push(`Fibonacci Sequence (first ${terms} terms):`);
      let a = 0, b = 1, fibs = [];
      for (let i = 0; i < terms; i++) {
        fibs.push(a);
        let temp = a + b;
        a = b;
        b = temp;
      }
      outputs.push(fibs.join(', '));
      outputs.push(`fibonacci(${terms}) = ${fibs[fibs.length - 1]}`);
    } else {
      outputs.push('[Program output]');
    }
  } else if (lang === 'java') {
    if (code.includes('LinkedList') || code.includes('linked')) {
      const arr = parseStdinArray([10, 20, 30, 40, 50]);
      outputs.push('Linked List Traversal:');
      outputs.push(arr.join(' -> ') + ' -> null');
      outputs.push(`Total nodes: ${arr.length}`);
    } else {
      outputs.push('[Program output]');
    }
  } else {
    outputs.push(`[${currentLang.name} program executed successfully]`);
  }

  if (outputs.length === 0) outputs.push('Program completed with no output.');
  return outputs.join('\n');
}

// ── Output Display ────────────────────────────────────────
function showSuccessOutput(output, time, mem) {
  const el = document.getElementById('outputContent');
  const lines = output.split('\n').map(l =>
    `<div class="output-line"><span class="output-time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="output-success">${escapeHtml(l)}</span></div>`
  ).join('');
  el.innerHTML = lines;
  showExecStats(time, mem, '0');
}

function showErrorOutput(result, time, mem) {
  const el = document.getElementById('outputContent');
  el.innerHTML = `
    <div class="output-line"><span class="output-time">${new Date().toLocaleTimeString().slice(0,5)}</span><span class="output-error">❌ ${escapeHtml(result.message)}</span></div>
    ${result.line ? `<div class="output-line"><span class="output-time"></span><span class="output-info">   at line ${result.line}</span></div>` : ''}
  `;
  showExecStats(time, mem, '1');
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

// ── Other Controls ────────────────────────────────────────
function pauseExec() { /* stub for demo */ }
function stepExec() { /* stub for demo */ }
function resetAll() {
  if (editor) editor.setValue(STARTER_CODE[currentLang.id] || '');
  clearOutput();
  showPreRunState();
  document.getElementById('aiContent').innerHTML = `
    <div class="ai-success-card">
      <div class="ai-success-icon">✨</div>
      <div style="font-weight:600;margin-bottom:4px;">Write some code to get started</div>
      <div style="font-size:12px;color:var(--text-secondary);">AI analysis will appear here after you run your code</div>
    </div>`;
  document.getElementById('complexityContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div>Run your code to analyze complexity</div>
    </div>`;
  monaco.editor.setModelMarkers(editor.getModel(), 'compiler', []);
  document.getElementById('vizSection').style.display = 'none';
}
