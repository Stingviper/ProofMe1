import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Loader2, Clock } from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import { getSubmissionHistory } from "./lib/data";
import "./Submissions.css";

const STATUSES = ["All", "Accepted", "Wrong Answer", "Compilation Error", "Runtime Error"];

export default function Submissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getSubmissionHistory(user.id, 100);
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load submissions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    if (status === "All") return rows;
    return rows.filter((r) => r.status === status);
  }, [rows, status]);

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <strong>Submission history</strong>
        <button onClick={() => navigate("/coding/dsa")}>DSA Lab</button>
      </nav>

      <main className="sub-main">
        <header className="sub-hero">
          <h1>Your submissions</h1>
          <p>Every Run/Submit attempt saved to your account, including solve time when available.</p>
          <div className="sub-filters">
            <Filter size={15} />
            {STATUSES.map((s) => (
              <button
                key={s}
                className={status === s ? "active" : ""}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        {loading && (
          <div className="sub-state">
            <Loader2 className="spin" size={20} /> Loading…
          </div>
        )}
        {error && <div className="sub-state err">{error}</div>}
        {!loading && !filtered.length && (
          <div className="sub-state">No submissions match this filter.</div>
        )}

        {filtered.length > 0 && (
          <div className="sub-table-wrap">
            <table className="sub-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Tests</th>
                  <th>Solve time</th>
                  <th>Runtime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>
                      <code>{r.problem_slug}</code>
                    </td>
                    <td className={r.status === "Accepted" ? "ok" : "bad"}>{r.status}</td>
                    <td>
                      {r.passed_count}/{r.total_count}
                    </td>
                    <td>
                      {r.solve_time_ms != null ? (
                        <span className="solve-time">
                          <Clock size={13} /> {(r.solve_time_ms / 1000).toFixed(1)}s
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{r.runtime || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
