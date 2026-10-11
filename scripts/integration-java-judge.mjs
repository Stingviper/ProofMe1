/**
 * ProofMe judge regression suite (no Judge0 required).
 * Validates: contracts, templates, test expected values, stdout splitting,
 * harness generation, and shared support classes (ListNode / TreeNode).
 *
 * Run: node scripts/judge-regression.mjs
 */
import { dsaProblems } from "../src/dsaProblems.js";
import { dsaContracts, signatureString } from "../src/dsaContracts.js";
import { dsaTemplates } from "../src/dsaTemplates.js";
import { wrapJavaSolution } from "../api/judge.js";

function normalizeAnswer(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .replace(/[ \t]+/g, " ");
}

function splitStdoutLines(stdout) {
  const normalized = String(stdout ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.map((l) => normalizeAnswer(l));
}

function answersEqual(actual, expected) {
  const a = normalizeAnswer(actual);
  const e = normalizeAnswer(expected);
  if (a === e) return true;
  if (a !== "" && e !== "" && !Number.isNaN(Number(a)) && !Number.isNaN(Number(e))) {
    return Number(a) === Number(e);
  }
  return false;
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  }
}

console.log("=== ProofMe Judge Regression ===\n");

const kinds = [...new Set(dsaProblems.map((p) => p.kind))];
console.log(`Problems: ${dsaProblems.length}`);
console.log(`Kinds: ${kinds.length}`);
console.log(`Contracts: ${Object.keys(dsaContracts).length}`);
console.log(`Templates: ${Object.keys(dsaTemplates).length}`);

// 1. Every kind has contract + template
for (const k of kinds) {
  assert(!!dsaContracts[k], `missing contract for kind ${k}`);
  assert(!!dsaTemplates[k], `missing template for kind ${k}`);
  if (dsaContracts[k]) {
    assert(!!dsaContracts[k].method, `contract ${k} missing method`);
    assert(Array.isArray(dsaContracts[k].params), `contract ${k} missing params`);
    assert(!!dsaContracts[k].returns, `contract ${k} missing returns`);
  }
  if (dsaTemplates[k] && dsaContracts[k]) {
    assert(
      dsaTemplates[k].includes(dsaContracts[k].method),
      `template for ${k} missing method name ${dsaContracts[k].method}`
    );
  }
}

// 2. Every problem has tests
let testCount = 0;
for (const p of dsaProblems) {
  const vis = p.testCases || [];
  const hid = p.hiddenTestCases || [];
  assert(vis.length >= 1, `${p.slug} has no visible tests`);
  for (const tc of [...vis, ...hid]) {
    assert(tc.input != null, `${p.slug} test missing input`);
    assert(
      tc.expected != null && String(tc.expected).trim() !== "",
      `${p.slug} empty expected`
    );
    testCount++;
  }
}
console.log(`Test cases audited: ${testCount}`);

// 3. Stdout split never merges multi-case output into one actual
{
  const lines = splitStdoutLines("5\n18\n-26\n");
  assert(lines.length === 3, "split should yield 3 lines");
  assert(answersEqual(lines[0], "5"), "line0");
  assert(answersEqual(lines[1], "18"), "line1");
  assert(answersEqual(lines[2], "-26"), "line2");
  const one = splitStdoutLines("5 18 -26");
  assert(
    one.length === 1,
    "space-separated is a single line (correct behavior)"
  );
}

// 4. Representative multi-impl acceptance is about RESULTS not source
{
  const sumCases = [
    { input: "1 5", expected: "5" },
    { input: "1 18", expected: "18" },
    { input: "5 1 2 3 4 5", expected: "15" },
  ];
  const stdout = "5\n18\n15\n";
  const lines = splitStdoutLines(stdout);
  sumCases.forEach((tc, i) => {
    assert(answersEqual(lines[i], tc.expected), `sum case ${i}`);
  });
}

// 5. Category representatives present
const reps = {
  sum: "Arrays",
  gcd: "Math",
  binary_search: "Binary Search",
  palindrome: "Strings",
  valid_brackets: "Stack",
  queue_sim: "Queue",
  middle: "Linked List",
  tree_depth: "Trees",
  components: "Graphs",
  max_subarray: "DP",
  climb: "DP/Recursion",
  activity: "Greedy",
  kth_largest: "Heap",
};
for (const k of Object.keys(reps)) {
  assert(
    dsaProblems.some((p) => p.kind === k),
    `representative kind ${k} (${reps[k]}) missing from library`
  );
}

// 6. Signature strings non-empty
for (const k of kinds) {
  assert(
    signatureString(k).includes(dsaContracts[k].method),
    `signatureString ${k}`
  );
}

// 7. Linked-list support classes are emitted when the contract declares them
{
  const listKinds = kinds.filter(
    (k) => (dsaContracts[k]?.support || []).includes("ListNode")
  );
  assert(
    listKinds.length > 0,
    "at least one kind declares ListNode support (middle / reverse_list / list_length)"
  );
  for (const k of listKinds) {
    const src = wrapJavaSolution(
      `class Solution { public ListNode noop(ListNode head) { return head; } }`,
      k,
      1
    );
    assert(
      /class\s+ListNode\s*\{/.test(src),
      `harness for ${k} must emit a ListNode class`
    );
    assert(
      /__buildList\s*\(/.test(src),
      `harness for ${k} must build a ListNode from stdin`
    );
    assert(
      /\bhead\b/.test(src),
      `harness for ${k} must reference the 'head' argument`
    );
  }
}

// 8. Tree support classes are emitted when the contract declares them
{
  const treeKinds = kinds.filter(
    (k) => (dsaContracts[k]?.support || []).includes("TreeNode")
  );
  assert(
    treeKinds.length > 0,
    "at least one kind declares TreeNode support (tree_depth / tree_max)"
  );
  for (const k of treeKinds) {
    const src = wrapJavaSolution(
      `class Solution { public int noop(TreeNode root) { return 0; } }`,
      k,
      1
    );
    assert(
      /class\s+TreeNode\s*\{/.test(src),
      `harness for ${k} must emit a TreeNode class`
    );
    assert(
      /__buildTree\s*\(/.test(src),
      `harness for ${k} must build a TreeNode from stdin`
    );
  }
}

// 9. Harness must not reference undefined nums for non-array contracts
{
  const gcdSrc = wrapJavaSolution(
    `class Solution { public int gcd(int a, int b) { return b==0?a:gcd(b,a%b);} }`,
    "gcd",
    1
  );
  const main = gcdSrc.slice(gcdSrc.indexOf("class Main"));
  assert(!/\bnums\b/.test(main), "GCD Main harness must not reference nums");
  assert(/sol\.gcd\(/.test(main), "GCD harness calls sol.gcd");

  const sumSrc = wrapJavaSolution(
    `class Solution { public int arraySum(int[] nums) { int s=0; for(int x:nums)s+=x; return s;} }`,
    "sum",
    1
  );
  const sumMain = sumSrc.slice(sumSrc.indexOf("class Main"));
  assert(/int\[\]\s+__a/.test(sumMain), "Sum harness defines an int[] arg");
  assert(/sol\.arraySum\(/.test(sumMain), "Sum harness calls arraySum");
  assert(
    !/\bnums\b/.test(sumMain),
    "Sum Main harness must not reference bare nums"
  );
}

// 10. Every kind has a resolvable arg plan (no unknown stdin plans)
{
  const { default: _unused } = await import("../api/judge.js");
  // If a contract has no wire array and no recognized stdin, wrapJavaSolution
  // must still produce *some* source rather than throwing on load. We only
  // check that generating source for every kind does not throw.
  for (const k of kinds) {
    try {
      const stub = `class Solution { public ${dsaContracts[k].returns} ${dsaContracts[k].method}(${dsaContracts[k].params
        .map((p) => `${p.type} ${p.name}`)
        .join(", ")}) { ${dsaContracts[k].returns === "void" ? "" : "return " + defaultReturn(dsaContracts[k].returns) + ";"} } }`;
      wrapJavaSolution(stub, k, 1);
    } catch (e) {
      assert(false, `wrapJavaSolution threw for kind ${k}: ${e.message}`);
    }
  }
}

function defaultReturn(t) {
  if (t === "boolean") return "false";
  if (t === "int") return "0";
  if (t === "long") return "0L";
  if (t === "String") return '""';
  if (t === "int[]") return "new int[0]";
  if (t === "ListNode") return "null";
  if (t === "TreeNode") return "null";
  return "null";
}

console.log("\n=== RESULT ===");
if (failed === 0) {
  console.log("ALL CHECKS PASSED");
  console.log(
    JSON.stringify(
      {
        problemsAudited: dsaProblems.length,
        kinds: kinds.length,
        contractsValid: Object.keys(dsaContracts).length,
        testCases: testCount,
        unsupportedKinds: [],
        status: "OK",
      },
      null,
      2
    )
  );
  process.exit(0);
} else {
  console.log(`FAILED: ${failed} assertions`);
  process.exit(1);
}