/**
 * ProofMe Java judge — compiles and runs user solutions locally via javac/java.
 * Data-driven harness: works for every problem in dsaProblems.js via dsaContracts.js.
 *
 * Exports:
 *   - default async handler(req, res)   — Vite proxy entry point
 *   - wrapJavaSolution(code, kind)      — build a runnable Main.java harness
 *   - buildStdin(tests)                 — convert testCases[].input into stdin
 *   - evaluateOutputs(stdout, tests)    — compare actual vs expected
 *
 * Requires: JDK 17+ on PATH (`javac`, `java`).
 */

import { execFileSync, execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { dsaProblems } from "../src/dsaProblems.js";
import { dsaContracts } from "../src/dsaContracts.js";

/* ============================================================ */
/* Support classes — always emitted                              */
/* ============================================================ */

const SUPPORT_CLASSES = `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`;

/* ============================================================ */
/* Java helper methods                                           */
/* ============================================================ */

const HELPERS = `
    static int[] __posArr = new int[]{0};

    static String[] __tokens() throws Exception {
        StringBuilder sb = new StringBuilder();
        java.io.BufferedReader r = new java.io.BufferedReader(
            new java.io.InputStreamReader(System.in));
        String line;
        while ((line = r.readLine()) != null) {
            sb.append(line).append('\\n');
        }
        return sb.toString().trim().split("\\\\s+");
    }

    static String __tokNext(String[] tok, int[] pos) {
        return tok[pos[0]++];
    }

    static int[] __readIntArrayN(String[] tok, int[] pos, int n) {
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(tok[pos[0]++]);
        return a;
    }

    static int[] __readIntArray(String[] tok, int[] pos) {
        int n = Integer.parseInt(tok[pos[0]++]);
        return __readIntArrayN(tok, pos, n);
    }

    static int[] __readIntArrayMinusOne(String[] tok, int[] pos) {
        int n = Integer.parseInt(tok[pos[0]++]) - 1;
        return __readIntArrayN(tok, pos, n);
    }

    static String __readRestOfLine(String[] tok, int[] pos) {
        StringBuilder sb = new StringBuilder();
        while (pos[0] < tok.length) {
            if (sb.length() > 0) sb.append(' ');
            sb.append(tok[pos[0]++]);
        }
        return sb.toString();
    }

    static String __readPipePart(String[] tok, int[] pos, int part) {
        String s = tok[pos[0]++];
        String[] parts = s.split("\\\\|");
        return part < parts.length ? parts[part] : "";
    }

    static String __readBracketString(String[] tok, int[] pos) {
        String s = tok[pos[0]++];
        return s.equals("EMPTY") ? "" : s;
    }

    static int[][] __readEdgesN(String[] tok, int[] pos, int m) {
        int[][] edges = new int[m][2];
        for (int i = 0; i < m; i++) {
            edges[i][0] = Integer.parseInt(tok[pos[0]++]);
            edges[i][1] = Integer.parseInt(tok[pos[0]++]);
        }
        return edges;
    }

    static int[][] __readEdges(String[] tok, int[] pos) {
        int m = Integer.parseInt(tok[pos[0]++]);
        return __readEdgesN(tok, pos, m);
    }

    static int[] __readPairsStarts(String[] tok, int[] pos) {
        int n = Integer.parseInt(tok[pos[0]++]);
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = Integer.parseInt(tok[pos[0]++]);
            pos[0]++;
        }
        return a;
    }

    static int[] __readPairsEnds(String[] tok, int[] pos) {
        int n = Integer.parseInt(tok[pos[0]++]);
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            pos[0]++;
            a[i] = Integer.parseInt(tok[pos[0]++]);
        }
        return a;
    }

    static int __readCoinsAmount(String[] tok, int[] pos) {
        return Integer.parseInt(tok[pos[0]++]);
    }

    static String __joinInts(int[] a) {
        if (a == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) {
            if (i > 0) sb.append(' ');
            sb.append(a[i]);
        }
        return sb.toString();
    }

    static ListNode __listFrom(int[] a) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int v : a) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String __listToString(ListNode head) {
        StringBuilder sb = new StringBuilder();
        ListNode cur = head;
        boolean first = true;
        while (cur != null) {
            if (!first) sb.append(' ');
            sb.append(cur.val);
            first = false;
            cur = cur.next;
        }
        return sb.toString();
    }

    static TreeNode __treeFrom(int[] a) {
        if (a.length == 0) return null;
        TreeNode[] nodes = new TreeNode[a.length];
        for (int i = 0; i < a.length; i++) nodes[i] = new TreeNode(a[i]);
        for (int i = 0; i < a.length; i++) {
            int l = 2 * i + 1, r = 2 * i + 2;
            if (l < a.length) nodes[i].left = nodes[l];
            if (r < a.length) nodes[i].right = nodes[r];
        }
        return nodes[0];
    }
`;

/* ============================================================ */
/* Code analysis                                                 */
/* ============================================================ */

function splitUserCode(code) {
    const lines = code.split(/\r?\n/);
    const imports = [];
    const bodyLines = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (/^import\s+[\w.*]+\s*;$/.test(trimmed)) imports.push(trimmed);
        else bodyLines.push(line);
    }
    return { imports, body: bodyLines.join("\n") };
}

/* ============================================================ */
/* Wire → Java type + expression                                 */
/* ============================================================ */

function wireProducesType(w) {
    const from = w.from;
    if (from === "n_then_n_ints" || from === "bound_array" || from === "bound_array_minus_one") return "int[]";
    if (from === "edges" || from === "bound_edges" || from === "bound_edges_src_tgt") return "int[][]";
    if (from === "pairs") return "int[]";
    if (from === "coins_amount") return "int[]";
    if (from === "coins_amount_amount") return "int";
    if (from === "rest_of_line" || from === "bracket_string" || from === "pipe") return "String";
    return "int";
}

/**
 * Convert a wire entry into the Java expression that produces its value.
 * Uses `bindings` map (bind-name → Java var name) for `bound` refs.
 */
function wireExpr(w, bindings) {
    const t = wireProducesType(w);
    const from = w.from;

    switch (from) {
        case "scalar":
            if (t === "String") return "__tokNext(__tok, __posArr)";
            if (t === "long") return "Long.parseLong(__tokNext(__tok, __posArr))";
            if (t === "boolean") return "Boolean.parseBoolean(__tokNext(__tok, __posArr))";
            return "Integer.parseInt(__tokNext(__tok, __posArr))";
        case "n_then_n_ints":
            return "__readIntArray(__tok, __posArr)";
        case "bound_array":
            return `__readIntArrayN(__tok, __posArr, ${bindings["n"] || "0"})`;
        case "bound_array_minus_one":
            return `__readIntArrayN(__tok, __posArr, (${bindings["n"] || "0"}) - 1)`;
        case "bound":
            return bindings[w.bind] || "0";
        case "rest_of_line":
            return "__readRestOfLine(__tok, __posArr)";
        case "pipe":
            return `__readPipePart(__tok, __posArr, ${w.part ?? 0})`;
        case "bracket_string":
            return "__readBracketString(__tok, __posArr)";
        case "edges":
            return "__readEdges(__tok, __posArr)";
        case "bound_edges":
            return `__readEdgesN(__tok, __posArr, ${bindings["m"] || "0"})`;
        case "bound_edges_src_tgt":
            return `__readEdgesN(__tok, __posArr, ${bindings["n_src_tgt"] || "0"})`;
        case "pairs":
            return w.part === "starts" ? "__readPairsStarts(__tok, __posArr)" : "__readPairsEnds(__tok, __posArr)";
        case "coins_amount":
            return "__readIntArray(__tok, __posArr)";
        case "coins_amount_amount":
            return bindings["amount"] || "0";
        default:
            return "0";
    }
}

function resolveWire(contract) {
    if (contract.wire && contract.wire.length > 0) return contract.wire;
    return contract.params.map((p) => {
        if (p.type === "int[]") return { from: "n_then_n_ints", to: "int[]" };
        if (p.type === "int[][]") return { from: "edges", to: "int[][]" };
        if (p.type === "String") return { from: "scalar", to: "String" };
        if (p.type === "long") return { from: "scalar", to: "long" };
        if (p.type === "boolean") return { from: "scalar", to: "boolean" };
        if (p.type === "ListNode") return { from: "n_then_n_ints", to: "ListNode", adapter: "array_to_list" };
        if (p.type === "TreeNode") return { from: "n_then_n_ints", to: "TreeNode", adapter: "array_to_tree" };
        return { from: "scalar", to: "int" };
    });
}

/* ============================================================ */
/* Harness builder                                               */
/* ============================================================ */

export function wrapJavaSolution(userCode, kind) {
    const contract = dsaContracts[kind];
    if (!contract) throw new Error(`Unknown kind: ${kind}`);

    const { imports: userImports, body: userBody } = splitUserCode(userCode);
    const wire = resolveWire(contract);
    const params = contract.params;
    const ret = contract.returns;

    // Emit every wire read. Track the var, its Java type, and its bind label.
    const reads = [];
    const wireVars = []; // { varName, type, bind, from }
    const bindings = {}; // bind name → var name (last wins)

    for (let i = 0; i < wire.length; i++) {
        const w = wire[i];
        const varName = `__w${i}`;
        const t = wireProducesType(w);
        let expr = wireExpr(w, bindings);

        if (w.adapter === "array_to_list") expr = `__listFrom(${expr})`;
        else if (w.adapter === "array_to_tree") expr = `__treeFrom(${expr})`;

        reads.push(`        ${t} ${varName} = ${expr};`);
        wireVars.push({ varName, type: t, bind: w.bind, from: w.from });
        if (w.bind) bindings[w.bind] = varName;
    }

    // -------- Match params to wire vars --------
    // Priority:
    //   1. bind label matches param name
    //   2. unused wire var with matching Java type
    //   3. last N wire vars (legacy fallback)
    const usedVarNames = new Set();
    const argNames = new Array(params.length).fill(null);

    // Pass 1: bind-name match
    for (let i = 0; i < params.length; i++) {
        const p = params[i];
        if (bindings[p.name]) {
            argNames[i] = bindings[p.name];
            usedVarNames.add(bindings[p.name]);
        }
    }

    // Pass 2: type match against unused vars
    for (let i = 0; i < params.length; i++) {
        if (argNames[i]) continue;
        const p = params[i];
        const match = wireVars.find(
            (wv) => !usedVarNames.has(wv.varName) && wv.type === p.type
        );
        if (match) {
            argNames[i] = match.varName;
            usedVarNames.add(match.varName);
        }
    }

    // Pass 3: last-N fallback
    for (let i = 0; i < params.length; i++) {
        if (argNames[i]) continue;
        const tailStart = Math.max(0, wireVars.length - params.length);
        const candidate = wireVars[tailStart + i];
        argNames[i] = candidate ? candidate.varName : "0";
    }

    let printStmt;
    if (ret === "int" || ret === "long") printStmt = "        System.out.println(__result);";
    else if (ret === "boolean") printStmt = '        System.out.println(__result ? "YES" : "NO");';
    else if (ret === "String") printStmt = '        System.out.println(__result == null ? "" : __result);';
    else if (ret === "int[]") printStmt = "        System.out.println(__joinInts(__result));";
    else if (ret === "ListNode") printStmt = "        System.out.println(__listToString(__result));";
    else if (ret === "TreeNode") printStmt = '        System.out.println(__result == null ? "" : String.valueOf(__result.val));';
    else printStmt = "        System.out.println(__result);";

    const callStmt = ret === "void"
        ? `        sol.${contract.method}(${argNames.join(", ")});`
        : `        ${ret} __result = sol.${contract.method}(${argNames.join(", ")});`;

    const importBlock = userImports.length ? userImports.join("\n") + "\n" : "";

    return `${importBlock}import java.util.*;
${SUPPORT_CLASSES}
${userBody}

class Main {
${HELPERS}
    public static void main(String[] args) throws Exception {
        String[] __tok = __tokens();
${reads.join("\n")}
        Solution sol = new Solution();
${callStmt}
${printStmt}
    }
}
`;
}

/* ============================================================ */
/* Stdin builder                                                 */
/* ============================================================ */

export function buildStdin(tests) {
    return tests.map((t) => t.input).join("\n") + "\n";
}

/* ============================================================ */
/* Output evaluation                                             */
/* ============================================================ */

function normalize(s) {
    return String(s ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .replace(/[ \t]+/g, " ");
}

function answersEqual(a, b) {
    const x = normalize(a);
    const y = normalize(b);
    if (x === y) return true;
    const nx = Number(x), ny = Number(y);
    if (!Number.isNaN(nx) && !Number.isNaN(ny) && x !== "" && y !== "") return nx === ny;
    return false;
}

export function evaluateOutputs(stdout, tests) {
    const lines = normalize(stdout).split("\n").filter((l) => l.length > 0);
    const results = [];
    for (let i = 0; i < tests.length; i++) {
        const actual = lines[i] ?? "";
        const expected = normalize(tests[i].expected);
        const passed = answersEqual(actual, expected);
        results.push({
            index: i + 1,
            passed,
            input: tests[i].input,
            expected: tests[i].expected,
            actual: actual || "(no output)",
            message: passed ? "" : `expected "${expected}", got "${actual}"`,
        });
    }
    return results;
}

/* ============================================================ */
/* Compile & run                                                 */
/* ============================================================ */

function compileAndRun(javaSource, stdin) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "proofme-judge-"));
    try {
        fs.writeFileSync(path.join(dir, "Main.java"), javaSource, "utf8");

        try {
            execFileSync("javac", ["Main.java"], {
                cwd: dir,
                encoding: "utf8",
                stdio: "pipe",
                timeout: 20000,
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
                timeout: 15000,
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

function hasJavac() {
    try {
        execSync("javac -version", { stdio: "pipe" });
        return true;
    } catch {
        return false;
    }
}

/* ============================================================ */
/* HTTP handler                                                  */
/* ============================================================ */

export default async function handler(req, res) {
    const send = (code, body) => {
        if (!res.headersSent) {
            res.statusCode = code;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(body));
        }
    };

    if (req.method === "OPTIONS") return send(204, {});
    if (req.method !== "POST") return send(405, { error: "Method not allowed" });

    const body = req.body || {};
    const { sourceCode, problem: slug, mode = "run", language = "java" } = body;

    if (!sourceCode) return send(400, { error: "Missing sourceCode." });
    if (!slug) return send(400, { error: "Missing problem slug." });
    if (language !== "java") return send(400, { error: "Only Java is supported by this judge." });

    if (!hasJavac()) {
        return send(500, {
            error: "javac not found on PATH. Install a JDK (e.g. `brew install openjdk@17`).",
            results: [],
            execution: { status: "Judge unavailable" },
            accepted: false,
            passedCount: 0,
            totalCount: 0,
        });
    }

    const problem = dsaProblems.find((p) => p.slug === slug);
    if (!problem) return send(404, { error: `Unknown problem: ${slug}` });

    const contract = dsaContracts[problem.kind];
    if (!contract) return send(500, { error: `No contract for kind "${problem.kind}".` });

    const isSubmit = mode === "submit";
    const visible = problem.testCases || [];
    const hidden = isSubmit ? problem.hiddenTestCases || [] : [];
    const allTests = [...visible, ...hidden];

    const src = wrapJavaSolution(sourceCode, problem.kind);

    const results = [];
    let compileError = "";
    let runtimeError = "";
    let totalTimeMs = 0;

    for (let i = 0; i < allTests.length; i++) {
        const test = allTests[i];
        const stdin = test.input + "\n";

        const t0 = Date.now();
        const run = compileAndRun(src, stdin);
        totalTimeMs += Date.now() - t0;

        if (!run.ok && run.phase === "compile") {
            compileError = run.error;
            break;
        }
        if (!run.ok && run.phase === "runtime") {
            runtimeError = run.error;
            results.push({
                index: i + 1,
                passed: false,
                input: test.input,
                expected: test.expected,
                actual: run.stdout.trim() || "(no output)",
                message: run.error.split("\n")[0] || "Runtime error",
            });
            break;
        }

        const [evaluated] = evaluateOutputs(run.stdout, [test]);
        results.push(evaluated);
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = allTests.length;
    const accepted = passedCount === totalCount && totalCount > 0;

    const response = {
        results,
        accepted,
        passedCount,
        totalCount,
        execution: {
            status: compileError
                ? "Compilation Error"
                : runtimeError
                ? "Runtime Error"
                : accepted
                ? "Accepted"
                : "Wrong Answer",
            time: (totalTimeMs / 1000).toFixed(3),
            memory: null,
        },
    };

    if (compileError) response.error = compileError;
    else if (runtimeError) response.error = runtimeError;

    return send(200, response);
}