import { useState } from "react";

export default function AuthPanel() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const user = { email, joinedAt: new Date().toISOString() };
    localStorage.setItem("fitTrackUser", JSON.stringify(user));
    setMessage(mode === "login" ? "You are signed in on this device." : "Your account has been created on this device.");
  };

  return <section className="auth-panel feature-panel"><div className="auth-intro"><p className="eyebrow">FitTrack account</p><h2>Keep your training in one place</h2><p>Sign in to save your workout plan and progress on this device.</p></div><form className="auth-form" onSubmit={submit}><div className="auth-toggle"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button></div>{mode === "signup" && <label>Full name<input required type="text" placeholder="Your name" /></label>}<label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label><label>Password<input required type="password" minLength="6" placeholder="At least 6 characters" /></label><button className="primary-button" type="submit">{mode === "login" ? "Log in" : "Create account"}</button>{message && <p className="form-message">{message}</p>}</form></section>;
}
