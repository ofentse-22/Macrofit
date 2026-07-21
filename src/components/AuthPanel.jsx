import { useState } from "react";

function AuthIllustration() {
  return (
    <div className="auth-illustration" aria-hidden="true">
      <div className="illustration-orb orb-one" />
      <div className="illustration-orb orb-two" />
      <svg viewBox="0 0 220 160" className="illustration-svg">
        <rect x="32" y="48" width="156" height="84" rx="24" className="illustration-card" />
        <path d="M72 96h18" className="illustration-line" />
        <path d="M96 84l16 16 28-28" className="illustration-line success-line" />
        <circle cx="154" cy="74" r="20" className="illustration-circle" />
        <path d="M148 74h12M154 68v12" className="illustration-line" />
        <path d="M58 76c8-22 20-32 36-32" className="illustration-arc" />
      </svg>
    </div>
  );
}

export default function AuthPanel() {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(() => {
    try {
      const savedUser = localStorage.getItem("fitTrackUser");
      return savedUser ? JSON.parse(savedUser).email : "";
    } catch {
      return "";
    }
  });
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("fitTrackUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

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

  const displayName = user?.fullName?.trim()?.split(" ")[0] || "there";
  const isSuccessMessage = /success|welcome|back|logged out/i.test(message);

  if (user) {
    return (
      <section className="auth-panel feature-panel">
        <div className="auth-shell">
          <div className="auth-hero">
            <span className="auth-badge">Your account</span>
            <h2>Welcome back, {displayName}!</h2>
            <p>Your progress, plans, and training rhythm are waiting for you.</p>
            <AuthIllustration />
          </div>

          <div className="auth-card-grid">
            <div className="auth-panel-card">
              <h3>Profile snapshot</h3>
              <div className="profile-info">
                <div className="profile-row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="profile-row">
                  <span>Member since</span>
                  <strong>{new Date(user.joinedAt).toLocaleDateString()}</strong>
                </div>
                <div className="profile-row">
                  <span>Last active</span>
                  <strong>{new Date(user.lastActive).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            <div className="auth-panel-card accent-card">
              <h3>What to do next</h3>
              <ul className="auth-benefits">
                <li>Review your latest workouts</li>
                <li>Update your body measurements</li>
                <li>Pick a fresh training template</li>
              </ul>
              <button className="primary-button" onClick={logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-panel feature-panel">
      <div className="auth-shell">
        <div className="auth-hero">
          <span className="auth-badge">FitTrack account</span>
          <h2>Keep every workout in one place</h2>
          <p>Sign in to save your progress and pick up where you left off on any device.</p>
          <AuthIllustration />

          <div className="auth-highlights">
            <div className="auth-highlight">
              <span>⚡</span>
              <p>Fast sign in</p>
            </div>
            <div className="auth-highlight">
              <span>📈</span>
              <p>Track progress</p>
            </div>
            <div className="auth-highlight">
              <span>🏋️</span>
              <p>Stay consistent</p>
            </div>
          </div>
        </div>

        <div className="auth-form-card">
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-toggle">
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log in</button>
              <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign up</button>
            </div>

            {mode === "signup" && (
              <label className="auth-field">
                <span>Full name</span>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
            )}

            <label className="auth-field">
              <span>Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input required type="password" minLength="6" placeholder="At least 6 characters" autoComplete="current-password" />
            </label>

            <button className="primary-button" type="submit">
              {mode === "login" ? "Log in" : "Create account"}
            </button>

            {message && <p className={`form-message ${isSuccessMessage ? "success" : ""}`}>{message}</p>}
          </form>
        </div>
      </div>
    </section>
  );
}