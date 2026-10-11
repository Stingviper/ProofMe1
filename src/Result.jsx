import { ArrowLeft, ArrowRight, CheckCircle2, Home, RotateCcw, Share2, Trophy } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Result.css";

const names = { java:"Java", javascript:"JavaScript", dsa:"Data Structures", sql:"SQL" };

export default function Result() {
  const navigate = useNavigate();
  const { skill="java" } = useParams();
  const [params] = useSearchParams();
  const score = Number(params.get("score") || 0);
  const correct = Number(params.get("correct") || 0);
  const total = Number(params.get("total") || 30);

  const label = score >= 90 ? "Excellent Performance" : score >= 75 ? "Strong Performance" : score >= 60 ? "Good Foundation" : "Keep Practicing";

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); alert("Result link copied!"); }
    catch { alert("Unable to copy the link."); }
  };

  return (
    <div className="result-page">
      <nav className="result-nav">
        <button onClick={() => navigate("/skills")}><ArrowLeft size={18}/> Skills</button>
        <div className="result-logo"><span>✓</span> ProofMe</div>
        <button className="result-share" onClick={share}><Share2 size={16}/> Share</button>
      </nav>

      <main className="result-main">
        <div className="result-label"><CheckCircle2 size={15}/> ASSESSMENT COMPLETE</div>
        <h1>Your skill has been tested.</h1>
        <p className="result-sub">Here is your ProofMe performance summary for {names[skill] || skill}.</p>

        <section className="result-card">
          <div className="score-ring" style={{"--score":`${score * 3.6}deg`}}>
            <div><strong>{score}</strong><span>/100</span></div>
          </div>
          <div className="result-summary">
            <span>PERFORMANCE</span>
            <h2>{label}</h2>
            <p>You answered <strong>{correct}/{total}</strong> questions correctly.</p>
            <div className="result-verified"><CheckCircle2 size={16}/> Result recorded</div>
          </div>
        </section>

        <div className="result-actions">
          <button className="result-secondary" onClick={() => navigate(`/assessment/${skill}`)}><RotateCcw size={16}/> Retake</button>
          <button className="result-primary" onClick={() => navigate("/dashboard")}>View Dashboard <ArrowRight size={17}/></button>
        </div>

        <section className="result-proof">
          <div className="result-proof-icon"><Trophy size={23}/></div>
          <div><span>YOUR PROOF</span><h3>Show your demonstrated skill.</h3><p>Your result is saved to your ProofMe account and can be shown on your public profile.</p></div>
          <button onClick={() => navigate("/profile")}>Public Profile <ArrowRight size={16}/></button>
        </section>

        <button className="result-home" onClick={() => navigate("/")}><Home size={15}/> Back to Home</button>
      </main>
    </div>
  );
}