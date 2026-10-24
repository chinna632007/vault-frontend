import "./login.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaUserShield } from "react-icons/fa";
import { useState } from "react";
import api from "../../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters long.");
    if (password !== confirmPassword) return setError("The passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login", { replace: true, state: { passwordResetSuccess: true } });
    } catch (err) {
      setError(err.message || "This password reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left"><div className="brand"><FaUserShield className="brand-icon" /><h1>Keep your vault secure</h1><p>Choose a new password to regain access to your account and documents.</p></div></div>
      <div className="login-right"><div className="login-card">
        <h2>Create new password</h2>
        <p className="subtitle">Use at least 8 characters</p>
        {!token ? <div className="error-message" role="alert">This password reset link is invalid or expired.</div> : (
          <form onSubmit={handleSubmit}>
            <div className="input-group"><label htmlFor="new-password">New password</label><div className="input-box"><FaLock /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div></div>
            <div className="input-group"><label htmlFor="confirm-password">Confirm new password</label><div className="input-box"><FaLock /><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div></div>
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
          </form>
        )}
        <div className="register-link"><Link to="/login">Back to login</Link></div>
      </div></div>
    </div>
  );
}
