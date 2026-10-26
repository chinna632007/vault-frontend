import "./reset-password.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaUserShield } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/authcontext";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill out both password fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check both fields.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, formData.password);
      setMessage(
        "Your password has been reset successfully. You can now log in with your new password."
      );
      setLoading(false);
    } catch (err) {
      setError(
        err.message ||
          "Invalid or expired reset token. Please request a new password reset."
      );
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <FaUserShield className="brand-icon" />
          <h1>Set a New Password</h1>
          <p>
            Create a new password for your DocuVault account. This link is
            single-use and expires after 30 minutes.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2>Reset Password</h2>
          <p className="subtitle">Choose a strong new password</p>

          {!token && (
            <div className="error-message">
              Invalid or missing reset link. Please request a new one.
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {token && (
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group">
                <label>New password</label>
                <div className="input-box">
                  <FaLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm password</label>
                <div className="input-box">
                  <FaLock />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                  />
                  <span
                    className="eye"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          {message && (
            <div className="login-link">
              <Link to="/login">Go back to sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
