import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import UserProfile from "./UserProfile";

export default function AuthPanel() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupProfile, setSignupProfile] = useState({ gender: "", age: "", height_cm: "", weight_kg: "" });
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (error) setMessage({ type: "error", text: "Unable to connect to the account service. Please try again shortly." });
      setUser(data.user ?? null);
      setIsLoading(false);
    };
    loadUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const switchMode = (nextMode) => { setMode(nextMode); setMessage(null); };

  const handleAuth = async (event) => {
    event.preventDefault();
    setMessage(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return setMessage({ type: "error", text: "Enter your email address and password." });
    if (mode === "signup" && password.length < 6) return setMessage({ type: "error", text: "Use a password with at least 6 characters." });
    if (mode === "signup" && !fullName.trim()) return setMessage({ type: "error", text: "Enter your name to create an account." });
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const profile = { gender: signupProfile.gender || null, age: Number(signupProfile.age) || null, height_cm: Number(signupProfile.height_cm) || null, weight_kg: Number(signupProfile.weight_kg) || null };
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password, options: { data: { full_name: fullName.trim(), profile } } });
        if (error) throw error;
        if (data.session && data.user) {
          setUser(data.user);
          setMessage({ type: "success", text: "Your account is ready to use." });
        } else {
          setMessage({ type: "success", text: "Account created. Check your email to confirm it, then log in." });
          setMode("login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        setUser(data.user);
        setMessage({ type: "success", text: "Logged in successfully." });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Authentication failed. Please try again." });
    } finally { setIsSubmitting(false); }
  };

  const logout = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signOut();
    if (error) setMessage({ type: "error", text: error.message });
    else { setUser(null); setPassword(""); setMessage({ type: "success", text: "You have been logged out." }); }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="auth-panel auth-loading">Loading your account…</div>;

  if (user) {
    return <section className="auth-panel" aria-labelledby="account-heading"><div className="auth-shell">
      <div className="auth-hero"><span className="auth-badge">Account active</span><h2 id="account-heading">Welcome back, {user.user_metadata?.full_name || "Athlete"}.</h2><p>Your workout progress and account details are ready whenever you are.</p><div className="auth-highlights"><div className="auth-highlight"><span>✓</span><p>Secure sign-in</p></div><div className="auth-highlight"><span>↗</span><p>Track progress</p></div></div></div>
      <div className="auth-card-grid"><div className="auth-panel-card"><h3>Account details</h3><div className="profile-info"><div className="profile-row"><span>Name</span><strong>{user.user_metadata?.full_name || "Not set"}</strong></div><div className="profile-row"><span>Email</span><strong>{user.email}</strong></div></div></div><div className="auth-panel-card accent-card"><h3>Session</h3><p className="auth-session-copy">You are securely signed in on this device.</p><button type="button" onClick={logout} disabled={isSubmitting}>{isSubmitting ? "Logging out…" : "Log out"}</button></div></div>
    </div><UserProfile /></section>;
  }

  return <section className="auth-panel" aria-labelledby="auth-heading"><div className="auth-shell">
    <div className="auth-hero"><span className="auth-badge">FitLab account</span><h2 id="auth-heading">Make every workout count.</h2><p>Sign in to keep your fitness routine connected and ready for your next session.</p><ul className="auth-benefits"><li>Keep your training in one place</li><li>Load workouts from any signed-in device</li><li>Build consistent habits over time</li></ul></div>
    <div className="auth-form-card"><div className="auth-toggle" aria-label="Account action"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} aria-pressed={mode === "login"}>Log in</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} aria-pressed={mode === "signup"}>Create account</button></div>
      <form className="auth-form" onSubmit={handleAuth} noValidate>{mode === "signup" && <label className="auth-field"><span>Full name</span><input type="text" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" required /></label>}<label className="auth-field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label className="auth-field"><span>Password</span><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength={mode === "signup" ? 6 : undefined} required /></label><button type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>{message && <p className={`form-message ${message.type === "success" ? "success" : ""}`} role="status">{message.text}</p>}</form>
    </div>
  </div></section>;
}
