import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Loader2,
  Trophy,
  Target,
  Activity,
  Share2,
} from "lucide-react";
import { useAuth } from "./auth/AuthContext";
import { ThemeToggle } from "./ThemeContext";
import {
  getSkillResults,
  getAcceptedSlugs,
  getRecentSubmissions,
} from "./lib/data";
import { dsaProblems } from "./dsaProblems";
import "./Dashboard.css";

const PROBLEM_TITLE_BY_SLUG = Object.fromEntries(
  dsaProblems.map((p) => [p.slug, p.title])
);

const SKILL_META = [
  { id: "java", label: "Java", path: "/assessment/java" },
  { id: "javascript", label: "JavaScript", path: "/assessment/javascript" },
  { id: "sql", label: "SQL", path: "/assessment/sql" },
  { id: "dsa", label: "DSA Lab", path: "/coding/dsa" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [skills, setSkills] = useState({});
  const [solved, setSolved] = useState(new Set());
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [s, a, r] = await Promise.all([
          getSkillResults(user.id),
          getAcceptedSlugs(user.id),
          getRecentSubmissions(user.id, 6),
        ]);
        if (!cancelled) {
          setSkills(s);
          setSolved(a);
          setRecent(r);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const scores = SKILL_META.map((m) => {
    const v = skills[m.id];
    const score = typeof v === "object" ? v?.score ?? 0 : v ?? 0;
    return { ...m, score: Number(score) || 0 };
  });
  const overall = scores.length
    ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
    : 0;

  const topicProgress = useMemo(() => {
    const byTopic = {};
    for (const p of dsaProblems) {
      if (!byTopic[p.topic]) byTopic[p.topic] = { total: 0, solved: 0 };
      byTopic[p.topic].total += 1;
      if (solved.has(p.slug)) byTopic[p.topic].solved += 1;
    }
    return Object.entries(byTopic)
      .map(([topic, v]) => ({
        topic,
        ...v,
        pct: v.total ? Math.round((v.solved / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct || b.solved - a.solved)
      .slice(0, 8);
  }, [solved]);

  const username = profile?.username || "user";

  return (
    <div className="dash-page">
      <nav className="dash-nav">
        <div className="dash-logo">
          <div className="dash-logo-mark">
            <CheckCircle2 size={22} />
          </div>
          ProofMe
        </div>

        <div className="dash-nav-right">
          <Link to="/leaderboard" className="dash-nav-link">
            <Trophy size={15} /> Leaderboard
          </Link>
          <Link to="/submissions" className="dash-nav-link">
            <Activity size={15} /> Submissions
          </Link>
          <Link to={`/profile/${username}`} className="dash-nav-link">
            <Share2 size={15} /> Public profile
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="dash-nav-button"
            onClick={() => signOut?.()}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="dash-main">
        <header className="dash-heading">
          <div>
            <span>YOUR COMMAND CENTER</span>
            <h1>
              Welcome back
              {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
            </h1>
            <p>
              Track verified skills, DSA progress, and recent submissions — then
              share a public proof link with recruiters.
            </p>
          </div>
          <Link to="/skills" className="dash-heading-cta">
            Practice skills <ArrowRight size={16} />
          </Link>
        </header>

        {loading ? (
          <div className="dash-empty">
            <Loader2 className="spin" size={22} /> Loading your stats…
          </div>
        ) : (
          <>
            <section className="dash-stats">
              <div>
                <span>Overall score</span>
                <strong>{overall}</strong>
              </div>
              <div>
                <span>DSA problems solved</span>
                <strong>{solved.size}</strong>
                <small>of {dsaProblems.length}</small>
              </div>
              <div>
                <span>Skills verified</span>
                <strong>{scores.filter((s) => s.score > 0).length}</strong>
                <small>of {SKILL_META.length}</small>
              </div>
              <div>
                <span>Next step</span>
                <Link to="/coding/dsa" className="dash-stat-cta">
                  Open DSA Lab <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            <section className="dash-section">
              <div className="dash-section-title">
                <div>
                  <span>SKILL SCORES</span>
                  <h2>Your skills</h2>
                </div>
                <Target size={20} />
              </div>
              <div className="dash-list">
                {scores.map((s) => (
                  <div className="dash-skill" key={s.id}>
                    <div className="dash-skill-icon">
                      <Target size={22} />
                    </div>
                    <div className="dash-skill-name">
                      <strong>{s.label}</strong>
                      <span>Verified score</span>
                    </div>
                    <div className="dash-bar">
                      <span style={{ width: `${s.score}%` }} />
                    </div>
                    <div className="dash-score">{s.score}%</div>
                    <Link to={s.path} className="dash-skill-cta">
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="dash-section">
              <div className="dash-section-title">
                <div>
                  <span>TOPIC PROGRESS</span>
                  <h2>By topic</h2>
                </div>
                <Code2 size={20} />
              </div>
              <div className="dash-list">
                {topicProgress.map((t) => (
                  <div className="dash-skill" key={t.topic}>
                    <div className="dash-skill-icon">
                      <Code2 size={22} />
                    </div>
                    <div className="dash-skill-name">
                      <strong>{t.topic}</strong>
                      <span>
                        {t.solved}/{t.total} solved
                      </span>
                    </div>
                    <div className="dash-bar">
                      <span style={{ width: `${t.pct}%` }} />
                    </div>
                    <div className="dash-score">{t.pct}%</div>
                    <div />
                  </div>
                ))}
                {!topicProgress.some((t) => t.solved > 0) && (
                  <div className="dash-empty">
                    <Code2 size={22} />
                    <h3>Nothing solved yet</h3>
                    <p>Solve problems in the DSA Lab to fill this chart.</p>
                    <Link to="/coding/dsa" className="dash-empty-cta">
                      Open DSA Lab <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="dash-section">
              <div className="dash-section-title">
                <div>
                  <span>RECENT ACTIVITY</span>
                  <h2>Submissions</h2>
                </div>
                <Activity size={20} />
              </div>
              {recent.length === 0 ? (
                <div className="dash-empty">
                  <Activity size={22} />
                  <h3>No submissions yet</h3>
                  <p>Run or submit code in the DSA Lab to see activity here.</p>
                  <Link to="/coding/dsa" className="dash-empty-cta">
                    Open DSA Lab <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="dash-list">
                  {recent.map((r, i) => (
                    <div className="dash-skill" key={i}>
                      <div className="dash-skill-icon">
                        <Code2 size={22} />
                      </div>
                      <div className="dash-skill-name">
                        <strong>
                          {PROBLEM_TITLE_BY_SLUG[r.problem_slug] ||
                            r.problem_slug}
                        </strong>
                        <span>{r.status}</span>
                      </div>
                      <div className="dash-bar">
                        <span
                          style={{
                            width: `${Math.round(
                              (r.passed_count /
                                Math.max(1, r.total_count)) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="dash-score">
                        {r.passed_count}/{r.total_count}
                      </div>
                      <div />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dash-cta">
              <div>
                <span>SHARE YOUR PROOF</span>
                <h2>Your public profile is ready.</h2>
                <p>
                  Send recruiters a verified link with your skill scores and
                  solved problems — no signup required to view it.
                </p>
              </div>
              <Link to={`/profile/${username}`} className="dash-cta-button">
                <Share2 size={16} /> Open public profile
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}