import { ArrowRight, CheckCircle2, Code2, Database, Layers3, ShieldCheck, Sparkles, Trophy, LogIn } from "lucide-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import SkillSelection from "./SkillSelection";
import PublicProfile from "./PublicProfile";
import Dashboard from "./Dashboard";
import Assessment from "./Assessment";
import Result from "./Result";
import CodingChallenge from "./CodingChallenge";
import AuthPage from "./auth/AuthPage";
import RequireAuth from "./auth/RequireAuth";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import "./App.css";

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return <div className="landing-page">
    <nav className="landing-navbar">
      <div className="landing-logo"><div className="landing-logo-icon">✓</div><span>ProofMe</span></div>
      <div className="landing-nav-links"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#why-proofme">Why ProofMe?</a></div>
      <button className="landing-nav-button" onClick={() => navigate(user ? "/dashboard" : "/auth?mode=signup")}>{user ? "Dashboard" : "Get Started"}<ArrowRight size={18}/></button>
    </nav>
    <main>
      <section className="landing-hero">
        <div className="landing-hero-content"><div className="landing-eyebrow"><Sparkles size={17}/><span>SKILL VERIFICATION PLATFORM</span></div><h1>Don't just claim<br/>your skills.<br/><span>Prove them.</span></h1><p className="landing-hero-description">ProofMe helps developers demonstrate their technical skills through structured assessments and coding challenges.</p><div className="landing-hero-actions"><button className="landing-primary-button" onClick={()=>navigate(user?"/skills":"/auth?mode=signup")}>{user?"Test Your Skills":"Create Your Proof"}<ArrowRight size={18}/></button><button className="landing-secondary-button" onClick={()=>navigate(user?"/profile":"/auth")}>{user?"View Profile":"Login"}<LogIn size={17}/></button></div></div>
        <div className="landing-visual"><div className="landing-profile-card"><div className="landing-profile-header"><div className="landing-avatar">P</div><div className="landing-profile-identity"><h3>ProofMe User</h3><p>Verified Technical Skills</p></div><div className="landing-profile-verified"><CheckCircle2 size={18}/></div></div><div className="landing-score-card"><div><span className="landing-score-label">OVERALL SKILL SCORE</span><strong>78<small>/100</small></strong></div><Trophy className="landing-score-icon" size={30}/></div><div className="landing-skills"><div className="landing-skill"><div className="landing-skill-icon"><Code2 size={18}/></div><div className="landing-skill-name"><strong>Java</strong><span>Practical debugging & coding</span></div><strong className="landing-skill-score">82</strong></div><div className="landing-skill"><div className="landing-skill-icon"><Layers3 size={18}/></div><div className="landing-skill-name"><strong>Data Structures</strong><span>Algorithms & problem solving</span></div><strong className="landing-skill-score">76</strong></div><div className="landing-skill"><div className="landing-skill-icon"><Code2 size={18}/></div><div className="landing-skill-name"><strong>JavaScript</strong><span>Practical code reasoning</span></div><strong className="landing-skill-score">71</strong></div></div><div className="landing-card-footer"><CheckCircle2 size={16}/><span>Skills verified through ProofMe</span></div></div></div>
      </section>
      <section className="landing-section" id="how-it-works"><div className="landing-section-heading"><span className="landing-section-label">HOW IT WORKS</span><h2>Turn your skills into proof.</h2><p>A simple process that transforms technical knowledge into measurable evidence.</p></div><div className="landing-steps">{[["01","Create an account","Keep your results and progress tied to your own ProofMe profile."],["02","Demonstrate","Complete practical technical assessments or solve coding challenges."],["03","Build Your Proof","Get measurable scores and share your demonstrated technical profile."]].map(([number,title,text])=><div className="landing-step" key={number}><div className="landing-step-number">{number}</div><h3>{title}</h3><p>{text}</p></div>)}</div></section>
      <section className="landing-section" id="features"><div className="landing-section-heading"><span className="landing-section-label">FEATURES</span><h2>Built around demonstrated ability.</h2></div><div className="landing-features"><div className="landing-feature"><div className="landing-feature-icon"><ShieldCheck size={22}/></div><h3>Skill Assessments</h3><p>Practical debugging, output prediction and real development scenarios.</p></div><div className="landing-feature"><div className="landing-feature-icon"><Code2 size={22}/></div><h3>Coding Challenges</h3><p>Practice DSA problems through a professional coding challenge interface.</p></div><div className="landing-feature"><div className="landing-feature-icon"><Trophy size={22}/></div><h3>Performance Scores</h3><p>Convert demonstrated performance into clear skill scores.</p></div><div className="landing-feature"><div className="landing-feature-icon"><Database size={22}/></div><h3>Personal Profiles</h3><p>Each account keeps its own assessments, submissions and public proof.</p></div></div></section>
      <section className="landing-why" id="why-proofme"><div><span className="landing-section-label">WHY PROOFME?</span><h2>Proof, not promises.</h2><p>Resumes tell recruiters what you claim to know. ProofMe gives you a way to demonstrate it.</p></div><button className="landing-primary-button" onClick={()=>navigate(user?"/skills":"/auth?mode=signup")}>Start Proving<ArrowRight size={18}/></button></section>
    </main><footer className="landing-footer"><span>ProofMe</span><span>Technical skill verification platform</span></footer>
  </div>;
}

export default function App(){
  return <AuthProvider><BrowserRouter><Routes><Route path="/" element={<LandingPage/>}/><Route path="/auth" element={<AuthPage/>}/><Route path="/profile/:username" element={<PublicProfile/>}/><Route element={<RequireAuth/>}><Route path="/skills" element={<SkillSelection/>}/><Route path="/assessment/:skill" element={<Assessment/>}/><Route path="/result/:skill" element={<Result/>}/><Route path="/coding/:skill" element={<CodingChallenge/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/profile" element={<PublicProfile/>}/></Route></Routes></BrowserRouter></AuthProvider>;
}
