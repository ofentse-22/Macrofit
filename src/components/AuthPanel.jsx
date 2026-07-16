import { useState, useEffect } from "react";

export default function AuthPanel() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("fitTrackUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setEmail(JSON.parse(savedUser).email);
    }
  }, []);

  const submit = (e) => {
    e.preventDefault();
    
    const newUser = {
      fullName: fullName || user?.fullName || "Fitness Enthusiast",
      email: email,
      joinedAt: user?.joinedAt || new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    localStorage.setItem("fitTrackUser", JSON.stringify(newUser));
    setUser(newUser);
    setMessage(mode === "login" ? "Welcome back!" : "Account created successfully!");
  };

  const logout = () => {
    localStorage.removeItem("fitTrackUser");
    setUser(null);
    setMessage("Logged out successfully.");
  };

  if (user) {
    return (
      <section className="auth-panel feature-panel">
        <div className="auth-intro">
          <p className="eyebrow">Account</p>
          <h2>Welcome back, {user.fullName.split(" ")[0]}!</h2>
        </div>

        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {new Date(user.joinedAt).toLocaleDateString()}</p>
          <p><strong>Last active:</strong> {new Date(user.lastActive).toLocaleDateString()}</p>
        </div>

        <button className="primary-button" onClick={logout} style={{ marginTop: "20px" }}>
          Log Out
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel feature-panel">
      <div className="auth-intro">
        <p className="eyebrow">FitTrack Account</p>
        <h2>Keep your training in one place</h2>
        <p>Sign in to save your workout plan and progress on this device.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <div className="auth-toggle">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button>
        </div>

        {mode === "signup" && (
          <label>
            Full name
            <input 
              required 
              type="text" 
              placeholder="Your name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
        )}

        <label>
          Email address
          <input 
            required 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="name@example.com" 
          />
        </label>

        <label>
          Password
          <input required type="password" minLength="6" placeholder="At least 6 characters" />
        </label>

        <button className="primary-button" type="submit">
          {mode === "login" ? "Log in" : "Create account"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </section>
  );
}