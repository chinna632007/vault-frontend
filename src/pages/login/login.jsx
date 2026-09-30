import "./login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../../context/authcontext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
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

            {error && <div className="error-message">{error}</div>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

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
