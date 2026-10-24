import "./login.css";
import { Link } from "react-router-dom";
import { FaEnvelope, FaUserShield } from "react-icons/fa";
import { useState } from "react";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [demoResetUrl, setDemoResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setDemoResetUrl("");
    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: email.trim() });
      setMessage(response.data.message);
      setDemoResetUrl(response.data.demoResetUrl || "");
    } catch (err) {
      setError(err.message || "Could not send a reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left"><div className="brand"><FaUserShield className="brand-icon" /><h1>Recover your vault</h1><p>We’ll send a secure password reset link to the email address on your account. Your documents stay safe.</p></div></div>
      <div className="login-right"><div className="login-card">
        <h2>Forgot password?</h2>
        <p className="subtitle">Enter your registered email address</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><label htmlFor="reset-email">Email</label><div className="input-box"><FaEnvelope /><input id="reset-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div></div>
          {error && <div className="error-message" role="alert">{error}</div>}
          {message && <div className="success-message" role="status">{message}</div>}
          {demoResetUrl && <div className="success-message">Demo mode: <Link to={demoResetUrl}>open the simulated reset link</Link></div>}
          <button className="login-btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <div className="register-link"><Link to="/login">Back to login</Link></div>
      </div></div>
    </div>
  );
}
