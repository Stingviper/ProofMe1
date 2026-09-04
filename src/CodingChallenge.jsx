import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { ArrowLeft, CheckCircle2, Code2, Info, Play, RotateCcw, Search, Send, Trophy, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { saveSkillResult, saveSubmission } from "./lib/data";
import { dsaProblems } from "./dsaProblems";
import { dsaTemplates } from "./dsaTemplates";
import "./CodingChallenge.css";

const topics = ["All", "Arrays", "Strings", "Linked List", "Stack", "Queue", "Binary Search", "Trees", "Graphs", "Heap", "Dynamic Programming", "Greedy", "Backtracking", "Bit Manipulation", "Math", "Sorting", "Advanced DSA"];
const PAGE_SIZE = 20;

const METHOD_INFO = {
  sum: ["arraySum", "int arraySum(int[] nums)", "Return the sum of all elements in nums."],
  max: ["maxElement", "int maxElement(int[] nums)", "Return the largest element in nums."],
  second_largest: ["secondLargest", "int secondLargest(int[] nums)", "Return the second-largest distinct element."],
  count_even: ["countEven", "int countEven(int[] nums)", "Return how many elements are even."],
  count_target: ["countTarget", "int countTarget(int[] nums, int target)", "Return how many times target appears in nums."],
  reverse: ["reverseArray", "int[] reverseArray(int[] nums)", "Return nums in reverse order."],
  move_zeroes: ["moveZeroes", "int[] moveZeroes(int[] nums)", "Move all zeroes to the end while keeping the relative order of non-zero values."],
  rotate: ["rotate", "int[] rotate(int[] nums, int k)", "Rotate nums to the right by k positions."],
  dedupe_sorted: ["removeDuplicates", "int[] removeDuplicates(int[] nums)", "Remove consecutive duplicates and return the remaining values."],
  missing: ["missingNumber", "int missingNumber(int[] nums)", "nums contains distinct values from 0..n with one value missing. Return the missing value."],
  reverse_string: ["reverseString", "String reverseString(String s)", "Return s reversed."],
  palindrome: ["isPalindrome", "boolean isPalindrome(String s)", "Return true when s reads the same forward and backward."],
  vowels: ["countVowels", "int countVowels(String s)", "Return the number of English vowels in s."],
  word_count: ["countWords", "int countWords(String[] words)", "Return the number of supplied words."],
  unique_chars: ["uniqueCharacters", "String uniqueCharacters(String s)", "Remove repeated characters while preserving first occurrences."],
  anagram: ["isAnagram", "boolean isAnagram(String a, String b)", "Return true when a and b contain the same characters with the same frequencies."],
  valid_brackets: ["isValid", "boolean isValid(String s)", "Return true when every bracket is correctly matched and nested."],
  next_greater: ["nextGreater", "int[] nextGreater(int[] nums)", "For every element, return the first greater value to its right, or -1."],
  remove_adjacent: ["removeAdjacentDuplicates", "String removeAdjacentDuplicates(String s)", "Repeatedly remove adjacent equal characters until stable."],
  lower_bound: ["lowerBound", "int lowerBound(int[] nums, int target)", "Return the first index i where nums[i] >= target."],
  binary_search: ["search", "int search(int[] nums, int target)", "Return the index of target in sorted nums, or -1."],
  sort_asc: ["sortAscending", "int[] sortAscending(int[] nums)", "Return nums sorted in ascending order."],
  sort_desc: ["sortDescending", "int[] sortDescending(int[] nums)", "Return nums sorted in descending order."],
  gcd: ["gcd", "int gcd(int a, int b)", "Return the greatest common divisor of a and b."],
  prime: ["isPrime", "boolean isPrime(int n)", "Return true when n is prime."],
  fib: ["fibonacci", "long fibonacci(int n)", "Return the nth Fibonacci number with F(0)=0 and F(1)=1."],
  digit_sum: ["digitSum", "int digitSum(long n)", "Return the sum of the decimal digits of n."],
  factorial: ["factorial", "long factorial(int n)", "Return n!."],
  power: ["power", "long power(long base, int exponent)", "Return base raised to exponent."],
  single_number: ["singleNumber", "int singleNumber(int[] nums)", "Every value appears twice except one. Return the single value."],
  set_bits: ["countSetBits", "int countSetBits(int n)", "Return the number of 1 bits in n."],
  climb: ["climbStairs", "long climbStairs(int n)", "Return the number of ways to reach step n using 1- or 2-step moves."],
  house_robber: ["houseRobber", "int houseRobber(int[] nums)", "Return the maximum sum of non-adjacent values."],
  min_cost_climb: ["minCostClimbingStairs", "int minCostClimbingStairs(int[] cost)", "Return the minimum cost to reach the top."],
  activity: ["activitySelection", "int activitySelection(int[] start, int[] end)", "Return the maximum number of non-overlapping activities."],
  components: ["countComponents", "int countComponents(int n, int[][] edges)", "Return the number of connected components in an undirected graph."],
  bfs_distance: ["shortestPath", "int shortestPath(int n, int[][] edges, int source, int target)", "Return the shortest unweighted path length, or -1 if unreachable."],
  kth_largest: ["findKthLargest", "int findKthLargest(int[] nums, int k)", "Return the kth-largest element."],
  middle: ["middleElement", "int middleElement(int[] nums)", "Return the left-middle element when the length is even."],
  reverse_list: ["reverseList", "int[] reverseList(int[] head)", "Return the linked-list values in reverse order."],
  max_subarray: ["maxSubArray", "int maxSubArray(int[] nums)", "Return the maximum possible sum of a non-empty contiguous subarray."],
  coin_change: ["coinChange", "int coinChange(int[] coins, int amount)", "Return the minimum number of coins needed to make amount, or -1."],
  lcs: ["longestCommonSubsequence", "int longestCommonSubsequence(String a, String b)", "Return the length of the longest common subsequence."],
  sliding_max: ["maxSlidingWindow", "int[] maxSlidingWindow(int[] nums, int k)", "Return the maximum value in every window of size k."],
  queue_sim: ["simulateQueue", "int[] simulateQueue(int[][] operations)", "Type 1 x enqueues x. Type 2 dequeues and records the removed value."],
  tree_depth: ["maxDepth", "int maxDepth(Integer[] root)", "The array is level-order; null means no node. Return maximum tree depth."],
  tree_level: ["levelOrder", "int[] levelOrder(Integer[] root)", "Return the level-order traversal of the tree, ignoring null positions."],
  subset_count: ["subsetCount", "long subsetCount(int n)", "Return the number of subsets of a set with n elements."],
  prefix_query: ["rangeSum", "long rangeSum(int[] nums, int left, int right)", "Return the inclusive sum from left through right."],
  lis: ["lengthOfLIS", "int lengthOfLIS(int[] nums)", "Return the length of the longest strictly increasing subsequence."],
};

function kindForProblem(problem) {
  return problem?.kind || "sum";
}

function parseDisplay(kind, input) {
  const t = String(input).trim().split(/\s+/).filter(Boolean);
  const nums = (xs) => `[${xs.join(", ")}]`;
  switch (kind) {
    case "sum": case "max": case "second_largest": case "count_even": case "reverse": case "move_zeroes": case "dedupe_sorted": case "missing": case "next_greater": case "sort_asc": case "sort_desc": case "single_number": case "house_robber": case "min_cost_climb": case "middle": case "reverse_list": case "max_subarray": case "lis": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}`; }
    case "count_target": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, target = ${t[1+n]}`; }
    case "rotate": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, k = ${t[1+n]}`; }
    case "reverse_string": case "palindrome": case "vowels": case "unique_chars": case "valid_brackets": case "remove_adjacent": return `s = "${t[0] ?? ""}"`;
    case "word_count": return `words = [${t.slice(1,1+Number(t[0])).map(x=>`"${x}"`).join(", ")}]`;
    case "anagram": case "lcs": return `a = "${t[0] ?? ""}", b = "${t[1] ?? ""}"`;
    case "lower_bound": case "binary_search": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, target = ${t[1+n]}`; }
    case "gcd": return `a = ${t[0]}, b = ${t[1]}`;
    case "prime": case "fib": case "factorial": case "set_bits": case "climb": case "subset_count": return `n = ${t[0]}`;
    case "digit_sum": return `n = ${t[0]}`;
    case "power": return `base = ${t[0]}, exponent = ${t[1]}`;
    case "activity": { const n=Number(t[0]); return `start = ${nums(t.slice(1,1+n))}, end = ${nums(t.slice(1+n,1+2*n))}`; }
    case "components": { const n=Number(t[0]),m=Number(t[1]); const e=[]; for(let i=0,p=2;i<m;i++) e.push(`[${t[p++]}, ${t[p++]}]`); return `n = ${n}, edges = [${e.join(", ")}]`; }
    case "bfs_distance": { const n=Number(t[0]),m=Number(t[1]); const e=[]; let p=2; for(let i=0;i<m;i++) e.push(`[${t[p++]}, ${t[p++]}]`); return `n = ${n}, edges = [${e.join(", ")}], source = ${t[p]}, target = ${t[p+1]}`; }
    case "kth_largest": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, k = ${t[1+n]}`; }
    case "coin_change": { const n=Number(t[0]); return `coins = ${nums(t.slice(1,1+n))}, amount = ${t[1+n]}`; }
    case "sliding_max": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, k = ${t[1+n]}`; }
    case "queue_sim": { const q=Number(t[0]); let p=1,ops=[]; for(let i=0;i<q;i++){const type=t[p++]; if(type==="1") ops.push(`[1, ${t[p++]}]`); else ops.push("[2]");} return `operations = [${ops.join(", ")}]`; }
    case "tree_depth": case "tree_level": { const n=Number(t[0]); return `root = [${t.slice(1,1+n).map(x=>x==="-1"?"null":x).join(", ")}]`; }
    case "prefix_query": { const n=Number(t[0]); return `nums = ${nums(t.slice(1,1+n))}, left = ${t[1+n]}, right = ${t[2+n]}`; }
    default: return input;
  }
}

export default function CodingChallenge() {
  const { skill = "dsa" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query,setQuery]=useState(""); const [topic,setTopic]=useState("All"); const [difficulty,setDifficulty]=useState("All"); const [page,setPage]=useState(1);
  const [selectedSlug,setSelectedSlug]=useState(dsaProblems[0]?.slug || "");
  const selectedProblem=dsaProblems.find(p=>p.slug===selectedSlug)||dsaProblems[0];
  const selectedKind=kindForProblem(selectedProblem); const starter=dsaTemplates[selectedKind] || "class Solution {\n    // Write your solution here\n}";
  const [code,setCode]=useState(starter); const [results,setResults]=useState([]); const [execution,setExecution]=useState(null); const [judgeError,setJudgeError]=useState(""); const [judging,setJudging]=useState(false);
  const filteredProblems=useMemo(()=>{const q=query.trim().toLowerCase();return dsaProblems.filter(p=>(!q||p.title.toLowerCase().includes(q)||p.description.toLowerCase().includes(q)||p.topic.toLowerCase().includes(q))&&(topic==="All"||p.topic===topic)&&(difficulty==="All"||p.difficulty===difficulty));},[query,topic,difficulty]);
  const pageCount=Math.max(1,Math.ceil(filteredProblems.length/PAGE_SIZE)); const visibleProblems=filteredProblems.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  function chooseProblem(problem){setSelectedSlug(problem.slug);setCode(dsaTemplates[kindForProblem(problem)]||starter);setResults([]);setExecution(null);setJudgeError("");window.setTimeout(()=>document.getElementById("active-problem")?.scrollIntoView({behavior:"smooth",block:"start"}),40);}
  function resetCode(){setCode(dsaTemplates[selectedKind]||starter);setResults([]);setExecution(null);setJudgeError("");}
  async function runCode(mode){if(!selectedProblem||judging)return;setJudging(true);setJudgeError("");setResults([]);setExecution(null);try{const response=await fetch("/api/judge",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sourceCode:code,problem:selectedProblem.slug,mode})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Judge request failed.");setResults(data.results||[]);setExecution(data.execution||null);if(mode==="submit"&&user?.id){await saveSubmission({userId:user.id,problemSlug:selectedProblem.slug,status:data.accepted?"Accepted":String(data.execution?.status||"").toLowerCase().includes("compil")?"Compilation Error":String(data.execution?.status||"").toLowerCase().includes("runtime")?"Runtime Error":"Wrong Answer",passedCount:data.passedCount||0,totalCount:data.totalCount||0,code,runtime:data.execution?.time??null,memory:data.execution?.memory??null});if(data.accepted)await saveSkillResult({userId:user.id,skillId:"dsa",score:Math.round(((data.passedCount||0)/Math.max(1,data.totalCount||1))*100),correct:data.passedCount||0,total:data.totalCount||0});}}catch(error){console.error(error);setJudgeError(error?.message||"Unable to reach the Java judge.");}finally{setJudging(false);}}
  const passedCount=results.filter(r=>r.passed).length; const allPassed=results.length>0&&passedCount===results.length; const method=METHOD_INFO[selectedKind] || [];
  return <div className="coding-page">
    <nav className="coding-nav"><button className="coding-back" onClick={()=>navigate("/skills")}><ArrowLeft size={17}/>Back to skills</button><div className="coding-logo"><div className="coding-logo-icon"><CheckCircle2 size={22}/></div>ProofMe</div><div className="coding-nav-title"><Trophy size={15}/>DSA Coding Lab</div></nav>
    <main className="coding-main">
      <section className="problem-library-hero"><div><span className="problem-label">DSA CODING LIBRARY</span><h1>Solve it your way.</h1><p>LeetCode-style problems: choose a real problem by name, read the full statement and examples, implement the required method in <strong>class Solution</strong>, then run and submit.</p></div><div className="library-count"><strong>{dsaProblems.length}</strong><span>Problems</span></div></section>
      <section className="problem-library"><div className="library-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search problems..."/></label><select value={topic} onChange={e=>{setTopic(e.target.value);setPage(1)}}>{topics.map(x=><option key={x}>{x}</option>)}</select><select value={difficulty} onChange={e=>{setDifficulty(e.target.value);setPage(1)}}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></div><div className="library-meta"><span>Showing {filteredProblems.length?((page-1)*PAGE_SIZE+1):0}-{Math.min(page*PAGE_SIZE,filteredProblems.length)} of {filteredProblems.length}</span><span>Choose any problem</span></div><div className="problem-list">{visibleProblems.map(p=><button key={p.slug} className={`problem-row ${p.slug===selectedProblem.slug?"selected":""}`} onClick={()=>chooseProblem(p)}><span className="problem-number">#{String(p.id).padStart(4,"0")}</span><span className="problem-row-main"><strong>{p.title}</strong><small>{p.topic} · {p.description}</small></span><span className={`difficulty-text ${p.difficulty.toLowerCase()}`}>{p.difficulty}</span></button>)}{!visibleProblems.length&&<div className="empty-results"><Search size={25}/><p>No problems match your filters.</p></div>}</div><div className="pagination"><button disabled={page<=1} onClick={()=>setPage(v=>v-1)}>Previous</button><span>Page {page} of {pageCount}</span><button disabled={page>=pageCount} onClick={()=>setPage(v=>v+1)}>Next</button></div></section>
      {selectedProblem&&<section className="problem-card" id="active-problem"><div className="problem-heading"><div className="problem-icon"><Code2 size={23}/></div><div><span className="problem-label">{selectedProblem.topic}</span><h2>{selectedProblem.title}</h2><div className="active-problem-meta">Java · Method-based execution</div></div><span className="difficulty-badge">{selectedProblem.difficulty}</span></div><p className="problem-description">{method[2]||selectedProblem.description}</p><div className="function-contract"><div><span>FUNCTION</span><code>{method[1]||"class Solution"}</code></div><div><span>RETURN</span><strong>Use the method return value. Do not write a main method.</strong></div></div><div className="example-box"><strong>Example</strong><div className="example-row"><span>Input</span><code>{parseDisplay(selectedKind,selectedProblem.testCases[0]?.input||"")}</code></div><div className="example-row"><span>Output</span><code>{selectedProblem.testCases[0]?.expected}</code></div></div><div className="visible-tests"><div className="visible-tests-header"><div><span>VISIBLE TESTS</span><strong>Test your method before submitting</strong></div><small>3 visible · hidden tests on submit</small></div><div className="visible-test-grid">{selectedProblem.testCases.map((test,index)=><div className="visible-test" key={index}><span>Test {index+1}</span><code>{parseDisplay(selectedKind,test.input)}</code><strong>Expected: {test.expected}</strong></div>)}</div></div><div className="editor-note"><Info size={13}/><span>Write only <strong>class Solution</strong>. ProofMe calls your method for each test case, just like an online judge. No Scanner, no input loop, and no main method are required.</span></div><div className="editor-section"><div className="editor-header"><div className="editor-title"><Code2 size={16}/><span className="language-label">Java</span><span className="language-badge">OPENJDK 13</span><span className="judge-live-badge">LIVE JUDGE</span></div><button className="reset-code" onClick={resetCode}><RotateCcw size={14}/>Reset</button></div><div className="editor-container"><Editor height="480px" language="java" theme="vs-dark" value={code} onChange={v=>setCode(v||"")} options={{minimap:{enabled:false},fontSize:14,automaticLayout:true,scrollBeyondLastLine:false,tabSize:4,padding:{top:14,bottom:14}}}/></div></div><div className="coding-actions"><div className="coding-hint"><Info size={14}/>Run = 3 visible tests · Submit = all hidden tests</div><div className="coding-buttons"><button className="run-button" disabled={judging} onClick={()=>runCode("run")}><Play size={16}/>{judging?"Running...":"Run Code"}</button><button className="submit-code-button" disabled={judging} onClick={()=>runCode("submit")}><Send size={16}/>{judging?"Judging...":"Submit"}</button></div></div>{judgeError&&<div className="compiler-error"><XCircle size={19}/><div><strong>Judge Error</strong><p>{judgeError}</p></div></div>}{results.length>0&&<section className="test-results"><div className="test-results-header"><div><span>EXECUTION RESULT</span><h2>{passedCount}/{results.length} test cases passed</h2></div><div className={`result-status ${allPassed?"passed":"failed"}`}>{allPassed?<><CheckCircle2 size={15}/>Accepted</>:<><XCircle size={15}/>Not Accepted</>}</div></div><div className="test-case-list">{results.map(r=><div className={`test-case ${r.passed?"test-passed":"test-failed"}`} key={r.index}><div className="test-case-icon">{r.passed?<CheckCircle2 size={17}/>:<XCircle size={17}/>}</div><div className="test-case-info"><strong>Test Case {r.index}</strong><span>Expected: {r.expected} · Actual: {r.actual}</span>{r.message&&<span>{r.message}</span>}</div><div className="test-case-status">{r.passed?"PASS":"FAIL"}</div></div>)}</div>{execution&&<div className="execution-summary"><span>Status: <strong>{execution.status}</strong></span>{execution.time&&<span>Runtime: <strong>{execution.time}s</strong></span>}{execution.memory&&<span>Memory: <strong>{execution.memory} KB</strong></span>}</div>}{allPassed&&<div className="accepted-message"><div className="accepted-icon"><Trophy size={22}/></div><div><strong>Accepted.</strong><p>Your method passed every judge test. The submission is saved to your ProofMe account.</p></div></div>}</section>}<div className="coding-disclaimer"><small>Submissions run in an isolated Judge0 environment. Do not submit passwords, API keys, or other sensitive information.</small></div></section>}
    </main></div>;
}
