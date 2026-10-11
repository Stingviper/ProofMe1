import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Crown, Loader2, ExternalLink } from "lucide-react";
import { getLeaderboard } from "./lib/data";
import "./Leaderboard.css";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getLeaderboard(30);
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load leaderboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function rankIcon(rank) {
    if (rank === 1) return <Crown size={18} className="rank-gold" />;
    if (rank === 2) return <Medal size={18} className="rank-silver" />;
    if (rank === 3) return <Medal size={18} className="rank-bronze" />;
    return <span className="rank-num">#{rank}</span>;
  }

  return (
    <div className="lb-page">
      <nav className="lb-nav">
        <button className="lb-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="lb-logo">
          <Trophy size={18} /> ProofMe Rankings
        </div>
        <button className="lb-link" onClick={() => navigate("/coding/dsa")}>
          DSA Lab
        </button>
      </nav>

      <main className="lb-main">
        <header className="lb-hero">
          <span className="lb-eyebrow">GLOBAL LEADERBOARD</span>
          <h1>Top verified DSA scores</h1>
          <p>
            Rankings are based on each developer&apos;s DSA skill score after
            accepted submissions. Climb the board by solving problems in the lab.
          </p>
        </header>

        {loading && (
          <div className="lb-state">
            <Loader2 className="spin" size={22} /> Loading rankings…
          </div>
        )}
        {error && <div className="lb-state lb-error">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="lb-state">
            No ranked solvers yet. Be the first — open the DSA Lab and submit a solution.
          </div>
        )}

        {rows.length > 0 && (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Developer</th>
                  <th>DSA Score</th>
                  <th>Solved ratio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.username + row.rank} className={row.rank <= 3 ? "podium" : ""}>
                    <td>{rankIcon(row.rank)}</td>
                    <td>
                      <strong>{row.name}</strong>
                      <span>@{row.username}</span>
                    </td>
                    <td>
                      <em>{row.score}</em>
                    </td>
                    <td>
                      {row.correct}/{row.total || "—"}
                    </td>
                    <td>
                      <button
                        className="lb-profile-btn"
                        onClick={() => navigate(`/profile/${row.username}`)}
                      >
                        Profile <ExternalLink size={13} />
                      </button>
                    </td>
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
