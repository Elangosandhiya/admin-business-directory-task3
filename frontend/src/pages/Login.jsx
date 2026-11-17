import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || "/admin/businesses", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          (requestError.response
            ? "Login failed. Check your username and password."
            : "Can't reach the server. Check that the backend is running.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <span className="brand-mark">BD</span>
          <span>Business Directory</span>
        </div>
        <div className="showcase-copy">
          <span className="showcase-eyebrow">ADMIN CONSOLE</span>
          <h1>Your directory.<br />Well managed.</h1>
          <p>Keep business listings accurate, organized, and easy to discover.</p>
        </div>
        <div className="showcase-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="showcase-footnote">A simpler way to manage your local business network.</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <span className="login-eyebrow">ADMINISTRATOR ACCESS</span>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard.</p>

          {error && <div className="alert alert-danger login-alert" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="login-field">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button className="btn btn-primary login-submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>
          <div className="login-security">
            <span className="security-dot" />
            Secure administrator sign-in
          </div>
        </div>
        <div className="login-copyright">Business Directory Admin</div>
      </section>
    </main>
  );
}
