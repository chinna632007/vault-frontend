import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/authcontext";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const fieldMap = { pwd: 'password', cpwd: 'confirmPassword' };
    const fieldName = fieldMap[name] || name;
    setFormData({ ...formData, [fieldName]: value });
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields to create your DocuVault account.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check both fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      if (err.message === "Username already taken") {
        setError("This username is already taken. Please choose another one.");
      } else {
        setError("Registration failed. Please try again with valid information.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page register-page">
      <div className="register-left">
        <div className="brand">
          <FaUserShield className="brand-icon" />
          <h1>DocuVault Secure Registration</h1>
          <p>
            Create an account to store, organize, and protect your important documents safely.
          </p>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2>Create Account</h2>
          <p className="subtitle">Register to get started</p>
          {success && (
            <div className="success-message">
              Account created successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
            {error && <div className="error-message">{error}</div>}
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
              <label>Email</label>
              <div className="input-box">
                <FaEnvelope />
                  <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
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
                  name="pwd"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={(e) => { e.target.autocomplete = 'off'; }}
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
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
              <label>Confirm Password</label>
              <div className="input-box">
                <FaLock />
                  <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="cpwd"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={(e) => { e.target.autocomplete = 'off'; }}
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                />
                <span
                  className="eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <button className="register-btn" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="register-link">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
