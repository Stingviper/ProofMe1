import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Info,
  Play,
  RotateCcw,
  Search,
  Send,
  Trophy,
  XCircle,
  Lightbulb,
  Layers3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { ThemeToggle } from "./ThemeContext";
import { supabase } from "./lib/supabase";
import { saveSkillResult, saveSubmission, getAcceptedSlugs } from "./lib/data";
import { dsaProblems } from "./dsaProblems";
import { dsaTemplates } from "./dsaTemplates";
import { dsaContracts, signatureString } from "./dsaContracts";
import "./CodingChallenge.css";

const TOPIC_ORDER = [
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Binary Search",
  "Trees",
  "Graphs",
  "Heap",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Bit Manipulation",
  "Math",
  "Sorting",
  "Recursion",
];

export default function CodingChallenge() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const problemsByTopic = useMemo(() => {
    const map = {};
    for (const t of TOPIC_ORDER) map[t] = [];
    for (const p of dsaProblems) {
      if (!map[p.topic]) map[p.topic] = [];
      map[p.topic].push(p);
    }
    return map;
  }, []);

  const availableTopics = TOPIC_ORDER.filter(
    (t) => (problemsByTopic[t] || []).length > 0
  );

  const [activeTopic, setActiveTopic] = useState(availableTopics[0] || "Arrays");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedSlug, setSelectedSlug] = useState(
    (problemsByTopic[availableTopics[0]] || dsaProblems)[0]?.slug || ""
  );
  const [code, setCode] = useState(() => {
    const first = (problemsByTopic[availableTopics[0]] || dsaProblems)[0];
    return dsaTemplates[first?.kind] || "";
  });
  const [results, setResults] = useState([]);
  const [execution, setExecution] = useState(null);
  const [judgeError, setJudgeError] = useState("");
  const [judging, setJudging] = useState(false);
  const [language, setLanguage] = useState("java");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [solvedSlugs, setSolvedSlugs] = useState(() => new Set());
  const [view, setView] = useState("list");

  useEffect(() => {
    if (!user?.id) {
      setSolvedSlugs(new Set());
      return;
    }
    let cancelled = false;
    getAcceptedSlugs(user.id)
      .then((set) => {
        if (!cancelled) setSolvedSlugs(set);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const selectedProblem =
    dsaProblems.find((p) => p.slug === selectedSlug) || dsaProblems[0];

  const topicProblems = useMemo(() => {
    const list = problemsByTopic[activeTopic] || [];
    const q = query.trim().toLowerCase();
    return list.filter((problem) => {
      const matchesQuery =
        !q ||
        problem.title.toLowerCase().includes(q) ||
        problem.description.toLowerCase().includes(q);
      const matchesDifficulty =
        difficulty === "All" || problem.difficulty === difficulty;
      return matchesQuery && matchesDifficulty;
    });
  }, [activeTopic, query, difficulty, problemsByTopic]);

  function chooseTopic(topic) {
    setActiveTopic(topic);
    setQuery("");
    setDifficulty("All");
    setView("list");
  }

  function openProblem(problem) {
    setSelectedSlug(problem.slug);
    setLanguage("java");
    setCode(dsaTemplates[problem.kind] || "");
    setResults([]);
    setExecution(null);
    setJudgeError("");
    setStartedAt(Date.now());
    setView("solve");
  }

  function resetCode() {
    if (!selectedProblem) return;
    setCode(dsaTemplates[selectedProblem.kind] || "");
    setResults([]);
    setExecution(null);
    setJudgeError("");
  }

  async function runCode(mode) {
    if (!selectedProblem || judging) return;

    setJudging(true);
    setJudgeError("");
    setResults([]);
    setExecution(null);

    try {
      let token = null;
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token;
      }

      if (language === "java") {
        const required = dsaContracts[selectedProblem.kind]?.method;
        if (required && !new RegExp("\\b" + required + "\\s*\\(").test(code)) {
          setJudgeError(
            `Contract error: missing method "${required}". This problem requires ${signatureString(
              selectedProblem.kind
            )}. Click Reset to load the correct stub.`
          );
          setExecution({ status: "Contract Error" });
          setJudging(false);
          return;
        }
      }

      const response = await fetch("/api/judge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sourceCode: code,
          problem: selectedProblem.slug,
          mode,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Judge request failed.");
      }

      setResults(data.results || []);
      setExecution(data.execution || null);
      if (data.error && !(data.results || []).length) {
        setJudgeError(data.error);
      }
      if (data.warning) {
        setJudgeError((prev) => prev || data.warning);
      }

      if (mode === "submit" && user?.id) {
        await saveSubmission({
          userId: user.id,
          problemSlug: selectedProblem.slug,
          status: data.accepted
            ? "Accepted"
            : String(data.execution?.status || "")
                .toLowerCase()
                .includes("compil")
              ? "Compilation Error"
              : String(data.execution?.status || "")
                  .toLowerCase()
                  .includes("runtime")
                ? "Runtime Error"
                : "Wrong Answer",
          passedCount: data.passedCount || 0,
          totalCount: data.totalCount || 0,
          code,
          runtime: data.execution?.time ?? null,
          memory: data.execution?.memory ?? null,
          solveTimeMs: Date.now() - startedAt,
        });

        if (data.accepted) {
          const score = Math.round(
            ((data.passedCount || 0) / Math.max(1, data.totalCount || 1)) * 100
          );
          await saveSkillResult({
            userId: user.id,
            skillId: "dsa",
            score,
            correct: data.passedCount || 0,
            total: data.totalCount || 0,
          });
          setSolvedSlugs((prev) => new Set(prev).add(selectedProblem.slug));
        }
      }
    } catch (error) {
      console.error(error);
      setJudgeError(
        error?.message ||
          "Unable to reach the Java judge. Check that the API is running."
      );
    } finally {
      setJudging(false);
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = results.length > 0 && passedCount === results.length;
  const failedCases = results.filter((r) => !r.passed);

  const hintText =
    selectedProblem?.hint ||
    "Implement the method body only. Do not change the method signature. Run against the visible examples before submitting.";

  return (
    <div className="coding-page">
      <nav className="coding-nav">
        <button className="coding-back" onClick={() => navigate("/skills")}>
          <ArrowLeft size={17} />
          Back to skills
        </button>

        <div className="coding-logo">
          <div className="coding-logo-icon">
            <CheckCircle2 size={22} />
          </div>
          ProofMe
        </div>

        <div
          className="coding-nav-title"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Trophy size={15} />
            DSA Lab · {dsaProblems.length} problems
          </span>
          <button
            type="button"
            className="coding-back"
            onClick={() => navigate("/leaderboard")}
          >
            Rankings
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <main className="coding-main coding-main-wide">
        <section className="topic-rail">
          <div className="topic-rail-label">TOPICS</div>
          {availableTopics.map((topic) => {
            const count = (problemsByTopic[topic] || []).length;
            return (
              <button
                key={topic}
                className={`topic-chip ${activeTopic === topic ? "active" : ""}`}
                onClick={() => chooseTopic(topic)}
              >
                <span>{topic}</span>
                <em>{count}</em>
              </button>
            );
          })}
        </section>

        {view === "list" && (
          <section className="topic-section">
            <div className="topic-section-header">
              <div>
                <span className="problem-label">
                  {activeTopic.toUpperCase()}
                </span>
                <h1>{activeTopic}</h1>
                <p>
                  {(problemsByTopic[activeTopic] || []).length} problems in this
                  section. Pick one and implement the empty method.
                </p>
              </div>
              <div className="library-count">
                <strong>{(problemsByTopic[activeTopic] || []).length}</strong>
                <span>In section</span>
              </div>
            </div>

            <div className="library-toolbar topic-toolbar">
              <label className="search-box">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search in ${activeTopic}...`}
                />
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>All</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div className="problem-list">
              {topicProblems.map((problem, idx) => (
                <button
                  key={problem.slug}
                  className={`problem-row ${
                    solvedSlugs.has(problem.slug) ? "solved" : ""
                  }`}
                  onClick={() => openProblem(problem)}
                >
                  <span className="problem-number">
                    {solvedSlugs.has(problem.slug) ? (
                      <CheckCircle2 size={16} className="solved-icon" />
                    ) : (
                      String(idx + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="problem-row-main">
                    <strong>{problem.title}</strong>
                    <small>{problem.description}</small>
                  </span>
                  <span
                    className={`difficulty-text ${problem.difficulty.toLowerCase()}`}
                  >
                    {problem.difficulty}
                  </span>
                </button>
              ))}
              {!topicProblems.length && (
                <div className="empty-results">
                  <Search size={25} />
                  <p>No problems match your filters in {activeTopic}.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {view === "solve" && selectedProblem && (
          <section className="leetcode-layout">
            <aside className="leetcode-left">
              <button
                className="coding-back"
                style={{ marginBottom: 16 }}
                onClick={() => setView("list")}
              >
                <ArrowLeft size={16} />
                {selectedProblem.topic}
              </button>

              <div
                className="problem-heading"
                style={{ gridTemplateColumns: "1fr" }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className={`difficulty-badge ${selectedProblem.difficulty.toLowerCase()}`}
                    >
                      {selectedProblem.difficulty}
                    </span>
                    <span className="problem-label">
                      {selectedProblem.topic}
                    </span>
                  </div>
                  <h2 style={{ marginTop: 10 }}>
                    {selectedProblem.id}. {selectedProblem.title}
                  </h2>
                </div>
              </div>

              <p style={{ marginTop: 14, lineHeight: 1.65, color: "#b0b0ba" }}>
                {selectedProblem.description}
              </p>
              <p
                style={{
                  marginTop: 10,
                  lineHeight: 1.65,
                  color: "#8e8e99",
                  fontSize: 14,
                }}
              >
                {selectedProblem.details}
              </p>

              <div className="example-box">
                <strong>Example</strong>
                <div className="example-row">
                  <span>Input</span>
                  <code>{selectedProblem.exampleInput}</code>
                </div>
                <div className="example-row">
                  <span>Output</span>
                  <code>{selectedProblem.exampleOutput}</code>
                </div>
              </div>

              <div className="visible-tests" style={{ marginTop: 16 }}>
                <div className="visible-tests-header">
                  <div>
                    <span>VISIBLE TESTS</span>
                    <strong>Check these before submit</strong>
                  </div>
                  <small>
                    {selectedProblem.testCases?.length || 0} visible ·{" "}
                    {selectedProblem.hiddenTestCases?.length || 0} hidden on
                    Submit
                  </small>
                </div>
                <div className="visible-test-grid">
                  {selectedProblem.testCases.map((test, index) => (
                    <div className="visible-test" key={index}>
                      <span>Test {index + 1}</span>
                      <code>{test.input}</code>
                      <strong>Expected: {test.expected}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="editor-note"
                style={{ marginTop: 16, padding: 14 }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Lightbulb size={16} />
                  <strong>Hint</strong>
                </div>
                <p style={{ marginTop: 8, fontSize: 13, color: "#8e8e99" }}>
                  {hintText}
                </p>
              </div>
            </aside>

            <div className="leetcode-right">
              <div className="editor-section" style={{ marginTop: 0 }}>
                <div className="editor-header">
                  <div className="editor-title">
                    <Code2 size={16} />
                    <select
                      className="language-select"
                      value={language}
                      onChange={(e) => {
                        const lang = e.target.value;
                        setLanguage(lang);
                        if (lang === "java") {
                          setCode(dsaTemplates[selectedProblem.kind] || "");
                        } else if (
                          !code.includes("def ") &&
                          !code.includes("class Solution")
                        ) {
                          setCode(
                            "# Implement the required function for this problem.\n" +
                              "# Example for sum: def array_sum(nums):\n#     return sum(nums)\n"
                          );
                        }
                        setStartedAt(Date.now());
                      }}
                    >
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </select>
                    <span className="language-badge">SOLUTION</span>
                    <span className="judge-live-badge">
                      {language === "java" ? "EMPTY STUB" : "PYTHON"}
                    </span>
                  </div>
                  <button className="reset-code" onClick={resetCode}>
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>
                <div className="editor-container">
                  <Editor
                    height="520px"
                    language={language === "python" ? "python" : "java"}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      tabSize: 4,
                      padding: { top: 14, bottom: 14 },
                    }}
                  />
                </div>
              </div>

              <div className="coding-actions">
                <div className="coding-hint">
                  <Info size={14} />
                  Fill in the method body only. Run = visible tests; Submit = full
                  hidden suite.
                </div>
                <div className="coding-buttons">
                  <button
                    className="run-button"
                    disabled={judging}
                    onClick={() => runCode("run")}
                  >
                    <Play size={16} />
                    {judging ? "Running..." : "Run Code"}
                  </button>
                  <button
                    className="submit-code-button"
                    disabled={judging}
                    onClick={() => runCode("submit")}
                  >
                    <Send size={16} />
                    {judging ? "Judging..." : "Submit"}
                  </button>
                </div>
              </div>

              {judgeError && (
                <div className="compiler-error">
                  <XCircle size={19} />
                  <div>
                    <strong>Judge message</strong>
                    <p>{judgeError}</p>
                  </div>
                </div>
              )}

              {results.length > 0 && (
                <section className="test-results test-results-lg">
                  <div className="test-results-header">
                    <div>
                      <span>EXECUTION RESULT</span>
                      <h2>
                        {passedCount}/{results.length} test cases passed
                      </h2>
                    </div>
                    <div
                      className={`result-status ${
                        allPassed ? "passed" : "failed"
                      }`}
                    >
                      {allPassed ? (
                        <>
                          <CheckCircle2 size={15} />
                          Accepted
                        </>
                      ) : (
                        <>
                          <XCircle size={15} />
                          Not Accepted
                        </>
                      )}
                    </div>
                  </div>

                  {!allPassed && failedCases.length > 0 && (
                    <div className="test-case-list">
                      {failedCases.slice(0, 3).map((result) => (
                        <div
                          className="test-case test-failed"
                          key={result.index}
                        >
                          <div className="test-case-icon">
                            <XCircle size={17} />
                          </div>
                          <div className="test-case-info">
                            <strong>Test Case {result.index}</strong>
                            {result.input != null && result.input !== "" && (
                              <span className="tc-input">
                                Input: {result.input}
                              </span>
                            )}
                            <span>Expected: {result.expected}</span>
                            <span>Actual: {result.actual}</span>
                            {result.message && <span>{result.message}</span>}
                          </div>
                          <div className="test-case-status">FAIL</div>
                        </div>
                      ))}
                      {failedCases.length > 3 && (
                        <p
                          style={{
                            color: "#8f8fa3",
                            fontSize: 13,
                            marginTop: 10,
                            textAlign: "center",
                          }}
                        >
                          …and {failedCases.length - 3} more failed test case
                          {failedCases.length - 3 === 1 ? "" : "s"}.
                        </p>
                      )}
                    </div>
                  )}

                  {execution && (
                    <div className="execution-summary">
                      <span>
                        Status: <strong>{execution.status}</strong>
                      </span>
                      {execution.time && (
                        <span>
                          Runtime: <strong>{execution.time}s</strong>
                        </span>
                      )}
                      {execution.memory && (
                        <span>
                          Memory: <strong>{execution.memory} KB</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {allPassed && (
                    <div className="accepted-message">
                      <div className="accepted-icon">
                        <Trophy size={22} />
                      </div>
                      <div>
                        <strong>Problem accepted.</strong>
                        <p>
                          Your submission passed all {results.length} judge test
                          cases.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
