import "./login.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FaUserShield, FaUser, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/authcontext";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const resetToken = searchParams.get("token");
  const isResetMode = Boolean(resetToken);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [demoResetUrl, setDemoResetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const registrationSuccess = location.state?.registrationSuccess;
  const passwordResetSuccess = location.state?.passwordResetSuccess;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const user = await login(formData.username.trim(), formData.password.trim());
      if (user) navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setNotice("");
    setDemoResetUrl("");
    const username = formData.username.trim();
    if (!username) {
      setError("Enter your username first. We’ll send the reset link to the email registered to your account.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", { username });
      setNotice(response.data.message);
      setDemoResetUrl(response.data.demoResetUrl || "");
    } catch (err) {
      setError(err.message || "Could not send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token: resetToken, password: newPassword });
      navigate("/login", { replace: true, state: { passwordResetSuccess: true } });
    } catch (err) {
      setError(err.message || "This reset link is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <FaUserShield className="brand-icon" />
          <h1>{isResetMode ? "Create a New Password" : "DocuVault Secure Login"}</h1>
          <p>{isResetMode ? "Choose a new password to access your secure document vault." : "Sign in to access your secure document wallet and manage documents safely."}</p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>{isResetMode ? "Create new password" : "Welcome Back"}</h2>
          <p className="subtitle">{isResetMode ? "Choose a password with at least 8 characters" : "Login to your account"}</p>

          {!isResetMode ? (
            <>
              {registrationSuccess && <div className="success-message">Registration complete. Use your new credentials to sign in.</div>}
              {passwordResetSuccess && <div className="success-message">Password updated. Sign in with your new password.</div>}
              {notice && <div className="success-message" role="status">{notice}</div>}
              {demoResetUrl && <div className="success-message">Demo mode only: <Link to={demoResetUrl}>open the simulated reset link</Link></div>}
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="input-group">
                  <label htmlFor="login-username">Username</label>
                  <div className="input-box">
                    <FaUser />
                    <input id="login-username" type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required autoComplete="username" />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-box">
                    <FaLock />
                    <input id="login-password" type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required autoComplete="current-password" />
                    <button className="eye" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                {error && <div className="error-message" role="alert">{error}</div>}
                <button className="login-btn" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
              </form>
              <div className="register-link forgot-password-action">
                <button type="button" onClick={handleForgotPassword} disabled={loading}>{loading ? "Please wait..." : "Forgot password?"}</button>
              </div>
              <div className="register-link">Don&apos;t have an account?<Link to="/register"> Register</Link></div>
            </>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label htmlFor="new-password">New password</label>
                <div className="input-box"><FaLock /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></div>
              </div>
              <div className="input-group">
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="input-box"><FaLock /><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
              <button className="login-btn" type="submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</button>
              <div className="register-link"><Link to="/login">Back to login</Link></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
