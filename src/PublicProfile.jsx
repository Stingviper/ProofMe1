import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Share2,
  Trophy,
  Loader2,
} from "lucide-react";
import { getPublicProfile } from "./lib/data";
import { useAuth } from "./auth/AuthContext";
import "./PublicProfile.css";

const LABELS = {
  java: "Java",
  javascript: "JavaScript",
  sql: "SQL",
  dsa: "DSA",
};

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { profile: myProfile } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) {
      if (myProfile?.username) {
        navigate(`/profile/${myProfile.username}`, { replace: true });
      } else {
        setLoading(false);
        setError("Username is required. Open your profile from the dashboard after signing in.");
      }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicProfile(username);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.message || "Profile not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, myProfile?.username, navigate]);

  const scores = data?.results || {};
  const entries = Object.entries(scores);
  const overall = entries.length
    ? Math.round(
        entries.reduce((a, [, v]) => a + (typeof v === "object" ? v.score : v), 0) /
          entries.length
      )
    : 0;

  async function copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copy this profile link:", url);
    }
  }

  return (
    <div className="pp-page">
      <nav className="pp-nav">
        <button onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Home
        </button>
        <div className="pp-brand">
          <CheckCircle2 size={18} /> ProofMe
        </div>
        <button className="pp-share" onClick={copyLink}>
          {copied ? (
            <>
              <CheckCircle2 size={15} /> Copied
            </>
          ) : (
            <>
              <Copy size={15} /> Copy profile link
            </>
          )}
        </button>
      </nav>

      <main className="pp-main">
        {loading && (
          <div className="pp-state">
            <Loader2 className="spin" size={22} /> Loading profile…
          </div>
        )}
        {error && <div className="pp-state err">{error}</div>}
        {data && (
          <>
            <header className="pp-hero">
              <div className="pp-avatar">
                {(data.profile.name || "P")[0].toUpperCase()}
              </div>
              <div>
                <h1>{data.profile.name}</h1>
                <p>@{data.profile.username}</p>
                <div className="pp-badges">
                  <span>
                    <Trophy size={14} /> Overall {overall}
                  </span>
                  <span>
                    <CheckCircle2 size={14} /> {data.solvedCount || 0} problems solved
                  </span>
                  <span>
                    <Share2 size={14} /> Public verified profile
                  </span>
                </div>
              </div>
            </header>

            <section className="pp-card">
              <h2>Verified skills</h2>
              {entries.length === 0 ? (
                <p className="pp-muted">No skill scores published yet.</p>
              ) : (
                <ul className="pp-skills">
                  {entries.map(([id, v]) => {
                    const score = typeof v === "object" ? v.score : v;
                    return (
                      <li key={id}>
                        <div className="pp-skill-top">
                          <strong>{LABELS[id] || id}</strong>
                          <em>{score}%</em>
                        </div>
                        <div className="pp-bar">
                          <i style={{ width: `${score}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="pp-cta">
              <p>Want your own verified skill page?</p>
              <button onClick={() => navigate("/auth?mode=signup")}>
                Create a ProofMe profile
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
