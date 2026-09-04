import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import "./Auth.css";

export default function AuthPage() {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.");
      return;
    }

    if (mode === "signup" && (!name.trim() || !username.trim())) {
      setError("Name and username are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim(), username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate("/dashboard", { replace: true });
        } else {
          setMessage("Account created. Check your email to confirm your account, then log in.");
          setMode("login");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        const from = location.state?.from || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-back"><ArrowLeft size={18}/> Home</Link>
        <div className="auth-logo"><span>✓</span> ProofMe</div>
        <div className="auth-nav-label"><CheckCircle2 size={16}/> Secure account</div>
      </nav>

      <main className="auth-main">
        <section className="auth-card">
          <div className="auth-card-label">{mode === "signup" ? "CREATE YOUR PROOF" : "WELCOME BACK"}</div>
          <h1>{mode === "signup" ? "Build your verified profile." : "Sign in to ProofMe."}</h1>
          <p>{mode === "signup" ? "Save assessments, coding submissions and your shareable technical profile to your account." : "Your scores and coding progress are synced to your personal ProofMe account."}</p>

          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setError("");}}>Login</button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setError("");}}>Sign Up</button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && <>
              <label><span>Name</span><div className="auth-input"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name"/></div></label>
              <label><span>Username</span><div className="auth-input"><span className="at">@</span><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="your_username" autoComplete="username"/></div></label>
            </>}
            <label><span>Email</span><div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
            <label><span>Password</span><div className="auth-input"><LockKeyhole size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} required/></div></label>

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-message">{message}</div>}

            <button className="auth-submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Login"}
              {!busy && <ArrowRight size={17}/>} 
            </button>
          </form>

          <div className="auth-security"><LockKeyhole size={15}/> Authentication is handled by Supabase. ProofMe never stores raw passwords.</div>
        </section>

        <aside className="auth-side">
          <span>WHY AN ACCOUNT?</span>
          <h2>Your proof follows you.</h2>
          <div className="auth-benefit"><CheckCircle2 size={18}/><div><strong>Personal dashboard</strong><p>Keep your scores and progress separate from every other user.</p></div></div>
          <div className="auth-benefit"><CheckCircle2 size={18}/><div><strong>Saved coding progress</strong><p>Accepted DSA submissions are tied to your account.</p></div></div>
          <div className="auth-benefit"><CheckCircle2 size={18}/><div><strong>Shareable profile</strong><p>Show recruiters the technical skills you have actually demonstrated.</p></div></div>
        </aside>
      </main>
    </div>
  );
}
