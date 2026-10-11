/**
 * ProofMe execution contract schema.
 *
 * Each kind declares how to build a Java harness around the user's Solution:
 *
 *   method    — required method name
 *   params    — [{ name, type }] method-level Java types
 *   returns   — method-level Java return type
 *   wire      — array, one entry per param, describing stdin -> param
 *               (optional; if absent, judge falls back to `stdin` heuristic)
 *   returnWire— how to serialize the return value (optional; inferred from `returns`)
 *   support   — array of shared classes to emit: "ListNode" | "TreeNode"
 *   stdin     — human description (docs only)
 *   output    — human description (docs only)
 *
 * wire entry shapes:
 *   { from: "n_then_n_ints", to: "int[]" }                                  // plain array
 *   { from: "n_then_n_ints", to: "ListNode", adapter: "array_to_list" }     // array -> linked list
 *   { from: "n_then_n_ints", to: "TreeNode", adapter: "array_to_tree" }     // array -> tree
 *   { from: "scalar",        to: "int" }                                    // next single int
 *   { from: "scalar",        to: "String" }                                 // next single token
 *   { from: "rest_of_line",  to: "String" }                                 // rest of line
 *   { from: "pipe",          to: "String", split: true, part: 0|1 }         // "a|b" -> a or b
 *   { from: "edges",         to: "int[][]" }                                // m edge pairs
 *   { from: "pairs",         to: "int[]", part: "starts" | "ends" }         // n start/end pairs -> one array
 *   { from: "coins_amount",  to: "int[]" }                                  // k coins then amount (order fixed by stdin)
 *   { from: "coins_amount",  to: "int" }                                    // amount from the same read
 *   { from: "scalar",        to: "int", bind: "n" }                         // remember as __bound_n for later reads
 *   { from: "bound",         to: "int", bind: "n" }                         // read a previously-bound value
 *   { from: "edges",         to: "int[][]", bind: "n" }                     // n m then m edges; binds n
 *   { from: "edges_src_tgt", to: "int[][]", bind: "n_src_tgt" }             // n m src tgt then m edges
 *   { from: "bound",         to: "int", bind: "m" }                         // from edges read
 *   { from: "bound",         to: "int", bind: "src" }
 *   { from: "bound",         to: "int", bind: "target" }
 *   { from: "bracket_string",to: "String" }                                 // bracket token or EMPTY
 *
 * returnWire (optional):
 *   "join_spaces"  (default for int[])
 *   "yes_no"       (default for boolean)
 *   "list_node"    (default for ListNode)
 *   "raw"          (default for int, long, String)
 */

export const dsaContracts = {
  // ---------------------------------------------------------------- Arrays
  sum: {
    method: "arraySum",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  max: {
    method: "findMax",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  min: {
    method: "findMin",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  second_largest: {
    method: "secondLargest",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  count_even: {
    method: "countEven",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  count_target: {
    method: "countTarget",
    params: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returns: "int",
    stdin: "n target then n integers",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "target" },
      { from: "bound_array", to: "int[]", bind: "n" },
    ],
  },
  reverse: {
    method: "reverseArray",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n integers",
    output: "space-separated integers",
  },
  move_zeroes: {
    method: "moveZeroes",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n integers",
    output: "space-separated integers",
  },
  rotate: {
    method: "rotate",
    params: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returns: "int[]",
    stdin: "n k then n integers",
    output: "space-separated integers",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "k" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "k" },
    ],
  },
  missing: {
    method: "missingNumber",
    params: [
      { name: "nums", type: "int[]" },
      { name: "n", type: "int" },
    ],
    returns: "int",
    stdin: "n then n-1 integers",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "bound_array_minus_one", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "n" },
    ],
  },
  two_sum_exists: {
    method: "twoSumExists",
    params: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returns: "boolean",
    stdin: "n target then n integers",
    output: "YES or NO",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "target" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "target" },
    ],
  },
  max_subarray: {
    method: "maxSubArray",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  prefix_query: {
    method: "rangeSum",
    params: [
      { name: "nums", type: "int[]" },
      { name: "left", type: "int" },
      { name: "right", type: "int" },
    ],
    returns: "int",
    stdin: "n then n integers then L R",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "scalar", to: "int", bind: "L" },
      { from: "scalar", to: "int", bind: "R" },
    ],
  },
  dedupe_sorted: {
    method: "removeDuplicates",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n sorted integers",
    output: "space-separated integers",
  },
  sort_asc: {
    method: "sortAscending",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n integers",
    output: "space-separated integers",
  },
  sort_desc: {
    method: "sortDescending",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n integers",
    output: "space-separated integers",
  },

  // --------------------------------------------------------------- Strings
  palindrome: {
    method: "isPalindrome",
    params: [{ name: "s", type: "String" }],
    returns: "boolean",
    stdin: "one token",
    output: "YES or NO",
  },
  reverse_string: {
    method: "reverseString",
    params: [{ name: "s", type: "String" }],
    returns: "String",
    stdin: "one token",
    output: "string",
  },
  vowels: {
    method: "countVowels",
    params: [{ name: "s", type: "String" }],
    returns: "int",
    stdin: "one token",
    output: "single integer",
  },
  word_count: {
    method: "wordCount",
    params: [{ name: "s", type: "String" }],
    returns: "int",
    stdin: "rest of line",
    output: "single integer",
    wire: [{ from: "rest_of_line", to: "String" }],
  },
  unique_chars: {
    method: "uniqueChars",
    params: [{ name: "s", type: "String" }],
    returns: "int",
    stdin: "one token",
    output: "single integer",
  },
  anagram: {
    method: "isAnagram",
    params: [
      { name: "a", type: "String" },
      { name: "b", type: "String" },
    ],
    returns: "boolean",
    stdin: "a|b token",
    output: "YES or NO",
    wire: [
      { from: "pipe", to: "String", part: 0 },
      { from: "pipe", to: "String", part: 1 },
    ],
  },
  valid_brackets: {
    method: "isValid",
    params: [{ name: "s", type: "String" }],
    returns: "boolean",
    stdin: "bracket string or EMPTY",
    output: "YES or NO",
    wire: [{ from: "bracket_string", to: "String" }],
  },

  // -------------------------------------------------------- Binary search
  binary_search: {
    method: "search",
    params: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returns: "int",
    stdin: "n target then n sorted integers",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "target" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "target" },
    ],
  },
  lower_bound: {
    method: "lowerBound",
    params: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returns: "int",
    stdin: "n target then n sorted integers",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "target" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "target" },
    ],
  },

  // ----------------------------------------------------------------- Math
  gcd: {
    method: "gcd",
    params: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
    ],
    returns: "int",
    stdin: "a b",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int" },
      { from: "scalar", to: "int" },
    ],
  },
  prime: {
    method: "isPrime",
    params: [{ name: "n", type: "int" }],
    returns: "boolean",
    stdin: "one integer",
    output: "YES or NO",
  },
  fib: {
    method: "fib",
    params: [{ name: "n", type: "int" }],
    returns: "int",
    stdin: "one integer",
    output: "single integer",
  },
  digit_sum: {
    method: "digitSum",
    params: [{ name: "n", type: "int" }],
    returns: "int",
    stdin: "one integer",
    output: "single integer",
  },
  factorial: {
    method: "factorial",
    params: [{ name: "n", type: "int" }],
    returns: "long",
    stdin: "one integer",
    output: "single integer",
  },
  power: {
    method: "power",
    params: [
      { name: "a", type: "int" },
      { name: "b", type: "int" },
    ],
    returns: "long",
    stdin: "a b",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int" },
      { from: "scalar", to: "int" },
    ],
  },

  // ------------------------------------------------------ Bit manipulation
  single_number: {
    method: "singleNumber",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  set_bits: {
    method: "hammingWeight",
    params: [{ name: "n", type: "int" }],
    returns: "int",
    stdin: "one integer",
    output: "single integer",
  },

  // ------------------------------------------------------------------- DP
  climb: {
    method: "climbStairs",
    params: [{ name: "n", type: "int" }],
    returns: "int",
    stdin: "one integer",
    output: "single integer",
  },
  lis: {
    method: "lengthOfLIS",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  house_robber: {
    method: "rob",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
  },
  coin_change: {
    method: "coinChange",
    params: [
      { name: "coins", type: "int[]" },
      { name: "amount", type: "int" },
    ],
    returns: "int",
    stdin: "k amount then k coins",
    output: "single integer",
    wire: [
      { from: "coins_amount", to: "int[]" },
      { from: "coins_amount_amount", to: "int" },
    ],
  },

  // --------------------------------------------------------------- Greedy
  activity: {
    method: "activitySelection",
    params: [
      { name: "starts", type: "int[]" },
      { name: "ends", type: "int[]" },
    ],
    returns: "int",
    stdin: "n then n start end pairs",
    output: "single integer",
    wire: [
      { from: "pairs", to: "int[]", part: "starts" },
      { from: "pairs", to: "int[]", part: "ends" },
    ],
  },

  // ---------------------------------------------------------- Linked lists
  middle: {
    method: "middleNode",
    params: [{ name: "head", type: "ListNode" }],
    returns: "ListNode",
    stdin: "n then n integers",
    output: "space-separated values from the returned node",
    support: ["ListNode"],
    wire: [
      { from: "n_then_n_ints", to: "ListNode", adapter: "array_to_list" },
    ],
  },
  reverse_list: {
    method: "reverseList",
    params: [{ name: "head", type: "ListNode" }],
    returns: "ListNode",
    stdin: "n then n integers",
    output: "space-separated values from the returned node",
    support: ["ListNode"],
    wire: [
      { from: "n_then_n_ints", to: "ListNode", adapter: "array_to_list" },
    ],
  },
  list_length: {
    method: "listLength",
    params: [{ name: "head", type: "ListNode" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
    support: ["ListNode"],
    wire: [
      { from: "n_then_n_ints", to: "ListNode", adapter: "array_to_list" },
    ],
  },

  // ------------------------------------------------------------- Queues/stacks
  queue_sim: {
    method: "processQueue",
    params: [{ name: "ops", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n ops",
    output: "space-separated integers",
  },
  next_greater: {
    method: "nextGreaterElements",
    params: [{ name: "nums", type: "int[]" }],
    returns: "int[]",
    stdin: "n then n integers",
    output: "space-separated integers",
  },

  // ------------------------------------------------------------------ Trees
  tree_depth: {
    method: "treeHeight",
    params: [{ name: "root", type: "TreeNode" }],
    returns: "int",
    stdin: "n then n values",
    output: "single integer",
    support: ["TreeNode"],
    wire: [
      { from: "n_then_n_ints", to: "TreeNode", adapter: "array_to_tree" },
    ],
  },
  tree_max: {
    method: "treeMax",
    params: [{ name: "root", type: "TreeNode" }],
    returns: "int",
    stdin: "n then n integers",
    output: "single integer",
    support: ["TreeNode"],
    wire: [
      { from: "n_then_n_ints", to: "TreeNode", adapter: "array_to_tree" },
    ],
  },

  // ------------------------------------------------------------------ Graphs
  components: {
    method: "countComponents",
    params: [
      { name: "n", type: "int" },
      { name: "edges", type: "int[][]" },
    ],
    returns: "int",
    stdin: "n m then m edges",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "edges", to: "int[][]", bind: "m" },
      { from: "bound", to: "int", bind: "n" },
    ],
  },
  bfs_distance: {
    method: "bfsDistance",
    params: [
      { name: "n", type: "int" },
      { name: "edges", type: "int[][]" },
      { name: "src", type: "int" },
      { name: "target", type: "int" },
    ],
    returns: "int",
    stdin: "n m src target then m edges",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "m" },
      { from: "scalar", to: "int", bind: "src" },
      { from: "scalar", to: "int", bind: "target" },
      { from: "bound_edges", to: "int[][]", bind: "m" },
      { from: "bound", to: "int", bind: "n" },
      { from: "bound", to: "int", bind: "src" },
      { from: "bound", to: "int", bind: "target" },
    ],
  },

  // ------------------------------------------------------------------- Heap
  kth_largest: {
    method: "findKthLargest",
    params: [
      { name: "nums", type: "int[]" },
      { name: "k", type: "int" },
    ],
    returns: "int",
    stdin: "n k then n integers",
    output: "single integer",
    wire: [
      { from: "scalar", to: "int", bind: "n" },
      { from: "scalar", to: "int", bind: "k" },
      { from: "bound_array", to: "int[]", bind: "n" },
      { from: "bound", to: "int", bind: "k" },
    ],
  },

  // ---------------------------------------------------------- Backtracking
  subset_count: {
    method: "subsetCount",
    params: [{ name: "n", type: "int" }],
    returns: "int",
    stdin: "one integer",
    output: "single integer",
  },
};

export function signatureString(kind) {
  const c = dsaContracts[kind];
  if (!c) return "";
  const args = c.params.map((p) => `${p.type} ${p.name}`).join(", ");
  return `${c.returns} ${c.method}(${args})`;
}

export function assertContractsConsistent() {
  const problems = [];
  for (const [kind, c] of Object.entries(dsaContracts)) {
    if (!c.method) problems.push(`${kind}: missing method`);
    if (!Array.isArray(c.params)) problems.push(`${kind}: missing params`);
    if (!c.returns) problems.push(`${kind}: missing returns`);
    if (c.wire && c.wire.length !== c.params.length) {
      problems.push(
        `${kind}: wire length ${c.wire.length} != params length ${c.params.length}`
      );
    }
  }
  return problems;
}