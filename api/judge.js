import TESTS from "./dsa-tests.js";
import { dsaProblems } from "../src/dsaProblems.js";

const JUDGE0_URL = "https://ce.judge0.com";
const JAVA_LANGUAGE_ID = 62;

const METHODS = {
  sum: { name: "arraySum", args: ([a]) => `new int[]{${a.join(",")}}` },
  max: { name: "maxElement", args: ([a]) => `new int[]{${a.join(",")}}` },
  second_largest: { name: "secondLargest", args: ([a]) => `new int[]{${a.join(",")}}` },
  count_even: { name: "countEven", args: ([a]) => `new int[]{${a.join(",")}}` },
  count_target: { name: "countTarget", args: ([a, t]) => `new int[]{${a.join(",")}}, ${t}` },
  reverse: { name: "reverseArray", args: ([a]) => `new int[]{${a.join(",")}}` },
  move_zeroes: { name: "moveZeroes", args: ([a]) => `new int[]{${a.join(",")}}` },
  rotate: { name: "rotate", args: ([a, k]) => `new int[]{${a.join(",")}}, ${k}` },
  dedupe_sorted: { name: "removeDuplicates", args: ([a]) => `new int[]{${a.join(",")}}` },
  missing: { name: "missingNumber", args: ([a]) => `new int[]{${a.join(",")}}` },
  reverse_string: { name: "reverseString", args: ([s]) => quote(s) },
  palindrome: { name: "isPalindrome", args: ([s]) => quote(s) },
  vowels: { name: "countVowels", args: ([s]) => quote(s) },
  word_count: { name: "countWords", args: ([a]) => `new String[]{${a.map(quote).join(",")}}` },
  unique_chars: { name: "uniqueCharacters", args: ([s]) => quote(s) },
  anagram: { name: "isAnagram", args: ([a,b]) => `${quote(a)}, ${quote(b)}` },
  valid_brackets: { name: "isValid", args: ([s]) => quote(s) },
  next_greater: { name: "nextGreater", args: ([a]) => `new int[]{${a.join(",")}}` },
  remove_adjacent: { name: "removeAdjacentDuplicates", args: ([s]) => quote(s) },
  lower_bound: { name: "lowerBound", args: ([a,t]) => `new int[]{${a.join(",")}}, ${t}` },
  binary_search: { name: "search", args: ([a,t]) => `new int[]{${a.join(",")}}, ${t}` },
  sort_asc: { name: "sortAscending", args: ([a]) => `new int[]{${a.join(",")}}` },
  sort_desc: { name: "sortDescending", args: ([a]) => `new int[]{${a.join(",")}}` },
  gcd: { name: "gcd", args: ([a,b]) => `${a}, ${b}` },
  prime: { name: "isPrime", args: ([n]) => `${n}` },
  fib: { name: "fibonacci", args: ([n]) => `${n}` },
  digit_sum: { name: "digitSum", args: ([n]) => `${n}L` },
  factorial: { name: "factorial", args: ([n]) => `${n}` },
  power: { name: "power", args: ([b,e]) => `${b}L, ${e}` },
  single_number: { name: "singleNumber", args: ([a]) => `new int[]{${a.join(",")}}` },
  set_bits: { name: "countSetBits", args: ([n]) => `${n}` },
  climb: { name: "climbStairs", args: ([n]) => `${n}` },
  house_robber: { name: "houseRobber", args: ([a]) => `new int[]{${a.join(",")}}` },
  min_cost_climb: { name: "minCostClimbingStairs", args: ([a]) => `new int[]{${a.join(",")}}` },
  activity: { name: "activitySelection", args: ([s,e]) => `new int[]{${s.join(",")}}, new int[]{${e.join(",")}}` },
  components: { name: "countComponents", args: ([n, edges]) => `${n}, new int[][]{${edges.map(edge => `{${edge[0]},${edge[1]}}`).join(",")}}` },
  bfs_distance: { name: "shortestPath", args: ([n, edges, src, target]) => `${n}, new int[][]{${edges.map(edge => `{${edge[0]},${edge[1]}}`).join(",")}}, ${src}, ${target}` },
  kth_largest: { name: "findKthLargest", args: ([a,k]) => `new int[]{${a.join(",")}}, ${k}` },
  middle: { name: "middleElement", args: ([a]) => `new int[]{${a.join(",")}}` },
  reverse_list: { name: "reverseList", args: ([a]) => `new int[]{${a.join(",")}}` },
  max_subarray: { name: "maxSubArray", args: ([a]) => `new int[]{${a.join(",")}}` },
  coin_change: { name: "coinChange", args: ([coins, amount]) => `new int[]{${coins.join(",")}}, ${amount}` },
  lcs: { name: "longestCommonSubsequence", args: ([a,b]) => `${quote(a)}, ${quote(b)}` },
  sliding_max: { name: "maxSlidingWindow", args: ([a,k]) => `new int[]{${a.join(",")}}, ${k}` },
  queue_sim: { name: "simulateQueue", args: ([ops]) => `new int[][]{${ops.map(op => `{${op[0]}${op.length > 1 ? "," + op[1] : ""}}`).join(",")}}` },
  tree_depth: { name: "maxDepth", args: ([tree]) => `new Integer[]{${tree.map(v => v === -1 ? "null" : v).join(",")}}` },
  tree_level: { name: "levelOrder", args: ([tree]) => `new Integer[]{${tree.map(v => v === -1 ? "null" : v).join(",")}}` },
  subset_count: { name: "subsetCount", args: ([n]) => `${n}` },
  prefix_query: { name: "rangeSum", args: ([a,l,r]) => `new int[]{${a.join(",")}}, ${l}, ${r}` },
  lis: { name: "lengthOfLIS", args: ([a]) => `new int[]{${a.join(",")}}` },
};

function quote(value) {
  return JSON.stringify(String(value));
}

function tokens(input) {
  return String(input).trim().split(/\s+/).filter(Boolean);
}

function ints(values) {
  return values.map(Number);
}

function parseCase(kind, input) {
  const t = tokens(input);
  switch (kind) {
    case "sum": case "max": case "second_largest": case "count_even": case "reverse":
    case "move_zeroes": case "dedupe_sorted": case "missing": case "next_greater":
    case "sort_asc": case "sort_desc": case "single_number": case "house_robber":
    case "min_cost_climb": case "middle": case "reverse_list":
    case "max_subarray": case "lis": {
      const n = Number(t[0]);
      return [ints(t.slice(1, 1 + n))];
    }
    case "count_target": {
      const n = Number(t[0]); return [ints(t.slice(1, 1+n)), Number(t[1+n])];
    }
    case "rotate": {
      const n = Number(t[0]); return [ints(t.slice(1, 1+n)), Number(t[1+n])];
    }
    case "reverse_string": case "palindrome": case "vowels": case "unique_chars":
    case "valid_brackets": case "remove_adjacent": return [t[0] ?? ""];
    case "word_count": { const n=Number(t[0]); return [t.slice(1,1+n)]; }
    case "anagram": case "lcs": return [t[0] ?? "", t[1] ?? ""];
    case "lower_bound": case "binary_search": case "prefix_query": {
      const n=Number(t[0]); const a=ints(t.slice(1,1+n));
      return kind === "prefix_query" ? [a,Number(t[1+n]),Number(t[2+n])] : [a,Number(t[1+n])];
    }
    case "gcd": return [Number(t[0]),Number(t[1])];
    case "prime": case "fib": case "factorial": case "set_bits": case "climb": case "subset_count": return [Number(t[0])];
    case "digit_sum": return [Number(t[0])];
    case "power": return [Number(t[0]),Number(t[1])];
    case "activity": { const n=Number(t[0]); return [ints(t.slice(1,1+n)),ints(t.slice(1+n,1+2*n))]; }
    case "components": { const n=Number(t[0]),m=Number(t[1]); let edges=[]; let p=2; for(let i=0;i<m;i++) edges.push([Number(t[p++]),Number(t[p++])]); return [n,edges]; }
    case "bfs_distance": { const n=Number(t[0]),m=Number(t[1]); let edges=[]; let p=2; for(let i=0;i<m;i++) edges.push([Number(t[p++]),Number(t[p++])]); return [n,edges,Number(t[p]),Number(t[p+1])]; }
    case "kth_largest": { const n=Number(t[0]); return [ints(t.slice(1,1+n)),Number(t[1+n])]; }
    case "coin_change": { const n=Number(t[0]); return [ints(t.slice(1,1+n)),Number(t[1+n])]; }
    case "sliding_max": { const n=Number(t[0]); return [ints(t.slice(1,1+n)),Number(t[1+n])]; }
    case "queue_sim": { const q=Number(t[0]); let ops=[]; let p=1; for(let i=0;i<q;i++){const type=Number(t[p++]); if(type===1) ops.push([1,Number(t[p++])]); else ops.push([2]);} return [ops]; }
    case "tree_depth": case "tree_level": { const n=Number(t[0]); return [ints(t.slice(1,1+n))]; }
    default: throw new Error(`Unsupported DSA problem kind: ${kind}`);
  }
}

function renderJava() {
  return `\nstatic String out(int[] a){ if(a==null)return "null"; StringBuilder b=new StringBuilder(); for(int i=0;i<a.length;i++){if(i>0)b.append(' ');b.append(a[i]);} return b.toString(); }
static String out(long x){return String.valueOf(x);}
static String out(int x){return String.valueOf(x);}
static String out(boolean x){return x?"YES":"NO";}
static String out(String x){return x==null?"null":x;}
`;
}

function buildRunner(sourceCode, slug, tests) {
  const problemKind = tests.__kind;
  const meta = METHODS[problemKind];
  if (!meta) throw new Error(`No LeetCode-style harness for ${problemKind}.`);

  let solution = String(sourceCode || "")
    .replace(/^\s*package\s+[^;]+;\s*/m, "")
    .replace(/^\s*import\s+[^;]+;\s*$/gm, "")
    .replace(/public\s+class\s+Solution\b/g, "class Solution");

  if (!/\bclass\s+Solution\b/.test(solution)) {
    throw new Error("Your code must contain a class Solution.");
  }

  const calls = tests.map((test) => {
    const args = meta.args(parseCase(problemKind, test.input));
    return `System.out.println(out(s.${meta.name}(${args})));`;
  }).join("\n");

  return `import java.util.*;\n\n${solution}\n\npublic class Main {${renderJava()}\npublic static void main(String[] args) throws Exception {\nSolution s = new Solution();\n${calls}\n}\n}`;
}

function normalize(value) {
  return String(value ?? "").trim().replace(/\r/g, "").replace(/\s+/g, " ");
}

async function judge(sourceCode, slug, mode) {
  const allTests = TESTS[slug];
  if (!allTests) return { error: "Problem not found in the server-side DSA library." };

  const kind = slugToKind(slug);
  const tests = mode === "run" ? allTests.slice(0, 3) : allTests;
  const tagged = Object.assign([...tests], { __kind: kind });

  let runner;
  try { runner = buildRunner(sourceCode, slug, tagged); }
  catch (error) { return { error: error.message }; }

  const response = await fetch(`${JUDGE0_URL}/submissions/?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language_id: JAVA_LANGUAGE_ID,
      source_code: runner,
      cpu_time_limit: 2,
      wall_time_limit: 5,
      memory_limit: 128000,
    }),
  });

  const submission = await response.json();
  if (!response.ok) return { error: submission.error || "Judge0 rejected the submission." };

  const statusId = submission.status?.id;
  const status = submission.status?.description || "Unknown";
  if (statusId !== 3) {
    const detail = submission.compile_output || submission.stderr || submission.message || "No additional error details.";
    const isCompile = statusId === 6 || status === "Compilation Error";
    return {
      results: tests.map((test,index)=>({index:index+1,passed:false,expected:String(test.expected),actual:isCompile?"Compilation Error":"Not executed",message:detail})),
      accepted:false,passedCount:0,totalCount:tests.length,
      execution:{status,time:submission.time,memory:submission.memory,detail}
    };
  }

  const lines = String(submission.stdout ?? "").trim().split(/\r?\n/).map(normalize);
  const results = tests.map((test,index)=>({
    index:index+1,
    passed:lines[index] === normalize(test.expected),
    expected:String(test.expected),
    actual:lines[index] ?? ""
  }));
  const passedCount = results.filter(r=>r.passed).length;

  return {
    results, accepted:passedCount===tests.length, passedCount, totalCount:tests.length,
    execution:{status:passedCount===tests.length?"Accepted":"Wrong Answer",time:submission.time,memory:submission.memory,detail:submission.stderr||""}
  };
}

function slugToKind(slug) {
  const problem = dsaProblems.find((item) => item.slug === slug);
  if (!problem?.kind) throw new Error("Unknown DSA problem.");
  return problem.kind;
}

export async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS"){res.statusCode=204;res.end();return;}
  if(req.method!=="POST"){res.statusCode=405;res.setHeader("Content-Type","application/json");res.end(JSON.stringify({error:"Method not allowed."}));return;}
  try{
    const body=req.body||{};
    if(!body.sourceCode||!body.problem){res.statusCode=400;res.setHeader("Content-Type","application/json");res.end(JSON.stringify({error:"sourceCode and problem are required."}));return;}
    const result=await judge(body.sourceCode,body.problem,body.mode==="run"?"run":"submit");
    res.statusCode=result.error?400:200;res.setHeader("Content-Type","application/json");res.end(JSON.stringify(result));
  }catch(error){res.statusCode=500;res.setHeader("Content-Type","application/json");res.end(JSON.stringify({error:error?.message||"Unexpected judge server error."}));}
}
export default handler;
export { buildRunner, parseCase, METHODS, slugToKind };
