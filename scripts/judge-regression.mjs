/**
 * Real javac+java integration tests across categories.
 * Multiple valid implementations must pass; wrong ones must fail.
 *
 * Covers: GCD, arrays (sum/max), strings (palindrome), stack
 * (valid brackets), binary search, DP (climb / max subarray),
 * bit manipulation (single number), and linked lists
 * (middle node — ListNode in, ListNode out).
 *
 * Run: node scripts/integration-java-judge.mjs
 * Requires: JDK 17+ on PATH (`javac`, `java`).
 */
import { execFileSync, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import {
  wrapJavaSolution,
  buildStdin,
  evaluateOutputs,
} from "../api/judge.js";
import { dsaProblems } from "../src/dsaProblems.js";
import { dsaContracts } from "../src/dsaContracts.js";

function hasJavac() {
  try {
    execSync("javac -version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function compileAndRun(javaSource, stdin) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "proofme-judge-"));
  try {
    fs.writeFileSync(path.join(dir, "Main.java"), javaSource);
    try {
      execFileSync("javac", ["Main.java"], {
        cwd: dir,
        encoding: "utf8",
        stdio: "pipe",
      });
    } catch (e) {
      return {
        ok: false,
        phase: "compile",
        error: (e.stderr || e.message || "").toString(),
        stdout: "",
      };
    }
    try {
      const stdout = execFileSync("java", ["-cp", dir, "Main"], {
        input: stdin,
        encoding: "utf8",
        timeout: 10000,
      });
      return { ok: true, phase: "run", error: "", stdout };
    } catch (e) {
      return {
        ok: false,
        phase: "runtime",
        error: (e.stderr || e.message || "").toString(),
        stdout: (e.stdout || "").toString(),
      };
    }
  } finally {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
}

function judge(code, kind, tests) {
  const source = wrapJavaSolution(code, kind, tests.length);
  const result = compileAndRun(source, buildStdin(tests));
  if (!result.ok) return { ...result, evaluated: null, source };
  return {
    ...result,
    evaluated: evaluateOutputs(result.stdout, tests),
    source,
  };
}

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("  FAIL:", msg);
    failures++;
  } else console.log("  OK:", msg);
}

console.log("=== Category integration tests ===\n");
if (!hasJavac()) {
  console.error("javac missing");
  process.exit(2);
}

const CASES = [
  {
    category: "Math / GCD",
    kind: "gcd",
    tests: [
      { input: "42 80", expected: "2" },
      { input: "12 18", expected: "6" },
    ],
    valid: [
      `class Solution { public int gcd(int a, int b) { while (b != 0) { int t = a % b; a = b; b = t; } return Math.abs(a); } }`,
      `class Solution { public int gcd(int x, int y) { return y == 0 ? Math.abs(x) : gcd(y, x % y); } }`,
      `class Solution { public int gcd(int a, int b) { a = Math.abs(a); b = Math.abs(b); while (a != b) { if (a > b) a -= b; else b -= a; } return a; } }`,
    ],
    invalid: `class Solution { public int gcd(int a, int b) { return a + b; } }`,
  },
  {
    category: "Arrays / Sum",
    kind: "sum",
    tests: [
      { input: "1 5", expected: "5" },
      { input: "5 1 2 3 4 5", expected: "15" },
      { input: "1 -26", expected: "-26" },
    ],
    valid: [
      `class Solution { public int arraySum(int[] nums) { int s = 0; for (int n : nums) s += n; return s; } }`,
      `class Solution { public int arraySum(int[] a) { int s = 0; for (int i = 0; i < a.length; i++) s += a[i]; return s; } }`,
      `class Solution { public int arraySum(int[] nums) { int i = 0, s = 0; while (i < nums.length) s += nums[i++]; return s; } }`,
    ],
    invalid: `class Solution { public int arraySum(int[] nums) { return nums.length; } }`,
  },
  {
    category: "Arrays / Max",
    kind: "max",
    tests: [
      { input: "3 1 7 3", expected: "7" },
      { input: "1 -5", expected: "-5" },
    ],
    valid: [
      `class Solution { public int findMax(int[] nums) { int m = nums[0]; for (int x : nums) if (x > m) m = x; return m; } }`,
      `class Solution { public int findMax(int[] nums) { int m = nums[0]; for (int i = 1; i < nums.length; i++) m = Math.max(m, nums[i]); return m; } }`,
    ],
    invalid: `class Solution { public int findMax(int[] nums) { int s = 0; for (int x : nums) s += x; return s; } }`,
  },
  {
    category: "Strings / Palindrome",
    kind: "palindrome",
    tests: [
      { input: "radar", expected: "YES" },
      { input: "hello", expected: "NO" },
    ],
    valid: [
      `class Solution { public boolean isPalindrome(String s) { int i = 0, j = s.length() - 1; while (i < j) { if (s.charAt(i++) != s.charAt(j--)) return false; } return true; } }`,
      `class Solution { public boolean isPalindrome(String s) { return s.equals(new StringBuilder(s).reverse().toString()); } }`,
    ],
    invalid: `class Solution { public boolean isPalindrome(String s) { return true; } }`,
  },
  {
    category: "Stack / Valid Parentheses",
    kind: "valid_brackets",
    tests: [
      { input: "()", expected: "YES" },
      { input: "([)]", expected: "NO" },
      { input: "EMPTY", expected: "YES" },
    ],
    valid: [
      `class Solution {
        public boolean isValid(String s) {
          java.util.Deque<Character> st = new java.util.ArrayDeque<>();
          for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
              if (st.isEmpty()) return false;
              char o = st.pop();
              if (c == ')' && o != '(') return false;
              if (c == ']' && o != '[') return false;
              if (c == '}' && o != '{') return false;
            }
          }
          return st.isEmpty();
        }
      }`,
    ],
    invalid: `class Solution { public boolean isValid(String s) { return s.length() % 2 == 0; } }`,
  },
  {
    category: "Binary Search",
    kind: "binary_search",
    tests: [
      { input: "5 3 1 2 3 4 5", expected: "2" },
      { input: "4 9 1 2 3 4", expected: "-1" },
    ],
    valid: [
      `class Solution {
        public int search(int[] nums, int target) {
          int lo = 0, hi = nums.length - 1;
          while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
          }
          return -1;
        }
      }`,
      `class Solution {
        public int search(int[] nums, int target) {
          for (int i = 0; i < nums.length; i++) if (nums[i] == target) return i;
          return -1;
        }
      }`,
    ],
    invalid: `class Solution { public int search(int[] nums, int target) { return 0; } }`,
  },
  {
    category: "DP / Climbing Stairs",
    kind: "climb",
    tests: [
      { input: "2", expected: "2" },
      { input: "3", expected: "3" },
      { input: "5", expected: "8" },
    ],
    valid: [
      `class Solution { public int climbStairs(int n) { if (n <= 2) return n; int a = 1, b = 2; for (int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; } return b; } }`,
      `class Solution { public int climbStairs(int n) { int a = 1, b = 1; for (int i = 0; i < n; i++) { int t = a + b; a = b; b = t; } return a; } }`,
    ],
    invalid: `class Solution { public int climbStairs(int n) { return n; } }`,
  },
  {
    category: "DP / Max Subarray",
    kind: "max_subarray",
    tests: [
      { input: "5 -2 1 -3 4 -1", expected: "4" },
      { input: "3 1 2 3", expected: "6" },
    ],
    valid: [
      `class Solution {
        public int maxSubArray(int[] nums) {
          int best = nums[0], cur = nums[0];
          for (int i = 1; i < nums.length; i++) {
            cur = Math.max(nums[i], cur + nums[i]);
            best = Math.max(best, cur);
          }
          return best;
        }
      }`,
    ],
    invalid: `class Solution { public int maxSubArray(int[] nums) { int s=0; for(int x:nums)s+=x; return s; } }`,
  },
  {
    category: "Bit / Single Number",
    kind: "single_number",
    tests: [
      { input: "5 2 3 2 3 7", expected: "7" },
    ],
    valid: [
      `class Solution { public int singleNumber(int[] nums) { int x = 0; for (int n : nums) x ^= n; return x; } }`,
      `class Solution {
        public int singleNumber(int[] nums) {
          java.util.Map<Integer,Integer> m = new java.util.HashMap<>();
          for (int n : nums) m.put(n, m.getOrDefault(n,0)+1);
          for (var e : m.entrySet()) if (e.getValue() == 1) return e.getKey();
          return 0;
        }
      }`,
    ],
    invalid: `class Solution { public int singleNumber(int[] nums) { return nums[0]; } }`,
  },
  {
    // Linked-list contract: ListNode in, ListNode out.
    // Expected value is the space-separated list of values starting at the
    // returned node — [3,4,5] for [1,2,3,4,5] (odd), [4,5,6] for [1..6] (even).
    category: "Linked List / Middle (ListNode)",
    kind: "middle",
    tests: [
      { input: "5 1 2 3 4 5", expected: "3 4 5" },
      { input: "6 1 2 3 4 5 6", expected: "4 5 6" },
      { input: "1 9", expected: "9" },
    ],
    valid: [
      `class Solution {
        public ListNode middleNode(ListNode head) {
          ListNode slow = head;
          ListNode fast = head;
          while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
          }
          return slow;
        }
      }`,
      `class Solution {
        public ListNode middleNode(ListNode head) {
          int n = 0;
          for (ListNode p = head; p != null; p = p.next) n++;
          ListNode p = head;
          for (int i = 0; i < n / 2; i++) p = p.next;
          return p;
        }
      }`,
      `class Solution {
        public ListNode middleNode(ListNode head) {
          java.util.List<ListNode> nodes = new java.util.ArrayList<>();
          for (ListNode p = head; p != null; p = p.next) nodes.add(p);
          return nodes.get(nodes.size() / 2);
        }
      }`,
    ],
    invalid: `class Solution {
      public ListNode middleNode(ListNode head) { return head; }
    }`,
  },
  {
    // Linked-list reversal: ListNode in, ListNode out.
    category: "Linked List / Reverse (ListNode)",
    kind: "reverse_list",
    tests: [
      { input: "5 1 2 3 4 5", expected: "5 4 3 2 1" },
      { input: "1 7", expected: "7" },
      { input: "3 9 8 7", expected: "7 8 9" },
    ],
    valid: [
      `class Solution {
        public ListNode reverseList(ListNode head) {
          ListNode prev = null;
          ListNode cur = head;
          while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
          }
          return prev;
        }
      }`,
      `class Solution {
        public ListNode reverseList(ListNode head) {
          if (head == null || head.next == null) return head;
          ListNode newHead = reverseList(head.next);
          head.next.next = head;
          head.next = null;
          return newHead;
        }
      }`,
    ],
    invalid: `class Solution {
      public ListNode reverseList(ListNode head) { return head; }
    }`,
  },
  {
    // Linked-list length: ListNode in, int out.
    category: "Linked List / Length (ListNode)",
    kind: "list_length",
    tests: [
      { input: "5 1 2 3 4 5", expected: "5" },
      { input: "1 9", expected: "1" },
      { input: "4 1 2 3 4", expected: "4" },
    ],
    valid: [
      `class Solution {
        public int listLength(ListNode head) {
          int n = 0;
          for (ListNode p = head; p != null; p = p.next) n++;
          return n;
        }
      }`,
      `class Solution {
        public int listLength(ListNode head) {
          return head == null ? 0 : 1 + listLength(head.next);
        }
      }`,
    ],
    invalid: `class Solution { public int listLength(ListNode head) { return 0; } }`,
  },
];

for (const suite of CASES) {
  console.log(`\n[${suite.category}] kind=${suite.kind}`);
  assert(!!dsaContracts[suite.kind], `contract exists for ${suite.kind}`);
  assert(
    dsaProblems.some((p) => p.kind === suite.kind),
    `library has ${suite.kind}`
  );

  for (let i = 0; i < suite.valid.length; i++) {
    const r = judge(suite.valid[i], suite.kind, suite.tests);
    if (!r.ok) {
      console.error("  compile error for valid impl", i, r.error.slice(0, 400));
      console.error(r.source?.slice(0, 800));
      failures++;
      continue;
    }
    assert(
      r.evaluated.accepted,
      `valid #${i} accepted (${r.evaluated.passedCount}/${r.evaluated.totalCount})`
    );
    if (!r.evaluated.accepted) {
      for (const tc of r.evaluated.results.filter((x) => !x.passed)) {
        console.error(`      case ${tc.index}: expected "${tc.expected}", got "${tc.actual}"`);
      }
    }
  }

  const bad = judge(suite.invalid, suite.kind, suite.tests);
  if (!bad.ok) {
    assert(true, "invalid impl failed to compile/run (acceptable rejection)");
  } else {
    assert(!bad.evaluated.accepted, "invalid impl rejected by tests");
  }
}

console.log("\n=== SUMMARY ===");
if (failures === 0) {
  console.log("ALL CATEGORY INTEGRATION TESTS PASSED");
  process.exit(0);
}
console.log("FAILED", failures);
process.exit(1);