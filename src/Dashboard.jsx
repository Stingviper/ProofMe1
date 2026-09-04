import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Database, Layers3, LogOut, Share2, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { getSkillResults } from "./lib/data";
import "./Dashboard.css";

const skills = [
  { id: "java", name: "Java", desc: "Practical debugging & coding", icon: Code2 },
  { id: "javascript", name: "JavaScript", desc: "Practical code reasoning", icon: Code2 },
  { id: "dsa", name: "Data Structures", desc: "Algorithms & problem solving", icon: Layers3 },
  { id: "sql", name: "SQL", desc: "Queries & databases", icon: Database },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) { setLoading(false); return; }
      try {
        setLoading(true); setError("");
        const rows = await getSkillResults(user.id);
        if (!active) return;
        const mapped = {};
        (rows || []).forEach((row) => { mapped[row.skill_id] = Number(row.score); });
        setResults(mapped);
      } catch (err) {
        console.error(err);
        if (active) setError("Could not load your saved scores. Please refresh and try again.");
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [user?.id]);

  const tested = skills.filter((s) => results[s.id] !== undefined);
  const overall = tested.length ? Math.round(tested.reduce((a, s) => a + Number(results[s.id]), 0) / tested.length) : 0;
  const best = tested.length ? tested.reduce((a, b) => Number(results[a.id]) >= Number(results[b.id]) ? a : b) : null;
  const displayName = profile?.name || user?.user_metadata?.name || "Developer";
  const username = profile?.username || user?.user_metadata?.username || "";
  const profilePath = profile?.username ? `/profile/${profile.username}` : "/profile";

  async function logout() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-nav-left">
          <button className="nav-plain" onClick={() => navigate("/")}><ArrowLeft size={18} /> Home</button>
        </div>
        <div className="dash-logo"><span>✓</span><strong>ProofMe</strong></div>
        <div className="dash-nav-right">
          {username && <span className="dash-username">@{username}</span>}
          <button className="nav-plain" onClick={() => navigate(profilePath)}><Share2 size={16} /> Public Profile</button>
          <button className="dash-logout-button" onClick={logout} aria-label="Log out"><LogOut size={16} /><span>Log out</span></button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-heading">
          <div>
            <span>DASHBOARD</span>
            <h1>Your ProofMe progress.</h1>
            <p>Welcome back, {displayName}. Your results are synced to your account.</p>
          </div>
          <button onClick={() => navigate("/skills")}>Test a Skill <ArrowRight size={16} /></button>
        </div>

        {error && <div className="dash-empty dash-error"><p>{error}</p><button onClick={() => window.location.reload()}>Refresh</button></div>}

        <section className="dash-stats">
          <div><span>OVERALL SCORE</span><strong>{loading ? "…" : overall}</strong><small>{tested.length ? "Average verified score" : "No scores yet"}</small></div>
          <div><span>SKILLS TESTED</span><strong>{loading ? "…" : tested.length}</strong><small>of {skills.length} available</small></div>
          <div><span>BEST SKILL</span><strong>{loading ? "…" : best ? results[best.id] : "—"}</strong><small>{best ? best.name : "Start your first test"}</small></div>
        </section>

        <section className="dash-section">
          <div className="dash-section-title"><div><span>VERIFIED PERFORMANCE</span><h2>Your skills</h2></div><CheckCircle2 size={20} /></div>
          {loading ? <div className="dash-empty"><p>Loading your saved results…</p></div> : tested.length === 0 ? (
            <div className="dash-empty"><Trophy size={30} /><h3>No verified skills yet</h3><p>Take an assessment to start building your technical profile.</p><button onClick={() => navigate("/skills")}>Start Assessment <ArrowRight size={16} /></button></div>
          ) : (
            <div className="dash-list">{tested.map((skill) => { const Icon = skill.icon; const score = Number(results[skill.id]); return (
              <div className="dash-skill" key={skill.id}>
                <div className="dash-skill-icon"><Icon size={21} /></div>
                <div className="dash-skill-name"><strong>{skill.name}</strong><span>{skill.desc}</span></div>
                <div className="dash-bar"><span style={{ width: `${Math.max(0, Math.min(100, score))}%` }} /></div>
                <strong className="dash-score">{score}</strong>
                <button onClick={() => skill.id === "dsa" ? navigate("/coding/dsa") : navigate(`/assessment/${skill.id}`)}>Retake</button>
              </div>
            ); })}</div>
          )}
        </section>

        <section className="dash-cta"><div><span>YOUR PUBLIC PROOF</span><h2>Turn your results into a profile.</h2><p>Share a clean technical profile that shows what you can demonstrate.</p></div><button onClick={() => navigate(profilePath)}>View Profile <ArrowRight size={17} /></button></section>
      </main>
    </div>
  );
}
