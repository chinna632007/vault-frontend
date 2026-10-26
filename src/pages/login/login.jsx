import "./login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/authcontext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, forgotPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [demo, setDemo] = useState(null);
  const [error, setError] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const registrationSuccess = location.state?.registrationSuccess;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(formData.username.trim(), formData.password.trim());
      if (user) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleResetUsernameChange = (e) => {
    setResetUsername(e.target.value);
    setResetError("");
    setResetMessage("");
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
    setResetError("");
    setResetMessage("");
  };

  const isValidEmail = (email) => {
    // Must have valid format with correct domain after @ (e.g., name@gmail.com)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    const trimmedUsername = resetUsername.trim();
    const trimmedEmail = resetEmail.trim();

    if (!trimmedUsername) {
      setResetError("Username is required.");
      return;
    }
    if (!trimmedEmail) {
      setResetError("Email address is required.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setResetError("Please enter a valid email address (e.g., name@gmail.com).");
      return;
    }

    setResetLoading(true);
    try {
      const data = await forgotPassword({ username: trimmedUsername, email: trimmedEmail });
      if (data.demo && data.resetUrl) {
        // Demo mode (SMTP not configured) — show simulated link
        setDemo(data);
        setResetMessage(
          "Demo mode: email not configured. Use the simulated reset link below (demo only — email was not sent)."
        );
      } else {
        // Production mode — reset link was sent by email
        setResetMessage(
          "If an account exists with that username and email, a password reset link has been sent. Please check your inbox."
        );
      }
    } catch (err) {
      setResetError(
        err.message || "Could not send reset link. Please try again later."
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <FaUserShield className="brand-icon" />
          <h1>DocuVault Secure Login</h1>
          <p>
            Sign in to access your secure document wallet and manage
            documents safely.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your account</p>
          {registrationSuccess && (
            <div className="success-message">
              Registration complete. Use your new credentials to sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {!showForgot && (
              <>
                <div className="input-group">
                  <label>Username</label>
                  <div className="input-box">
                    <FaUser />
                      <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-box">
                    <FaLock />
                      <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="off"
                    />
                    <span
                      className="eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>

                {!showForgot && error && <div className="error-message">{error}</div>}
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </>
            )}
          </form>

        {showForgot ? (
          <div className="forgot-panel">
            <h3>Forgot Password</h3>
            <p>
              Enter your registered username and email address to receive a
              reset link.
            </p>
            {resetMessage && <div className="success-message">{resetMessage}</div>}
            {resetError && <div className="error-message">{resetError}</div>}
            <form onSubmit={handleSendResetLink} autoComplete="off">
              <div className="input-group">
                <label>Username</label>
                <div className="input-box">
                  <FaUser />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={resetUsername}
                    onChange={handleResetUsernameChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Email address</label>
                <div className="input-box">
                  <FaEnvelope />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={handleResetEmailChange}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <button
                className="login-btn"
                type="submit"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <div className="forgot-back">
              <button
                type="button"
                className="back-btn"
                onClick={() => {
                  setShowForgot(false);
                  setResetUsername("");
                  setResetEmail("");
                  setResetError("");
                  setResetMessage("");
                }}
              >
                Back to login
              </button>
            </div>
          </div>
        ) : (
          <div className="forgot-link">
            Forgot your password?{" "}
            <button
              type="button"
              className="forgot-btn"
              onClick={() => {
                setShowForgot(true);
                setResetUsername("");
                setResetEmail("");
                setResetError("");
                setResetMessage("");
              }}
            >
              Reset it
            </button>
          </div>
        )}

          <div className="register-link">
            Don't have an account?
            <Link to="/register"> Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
