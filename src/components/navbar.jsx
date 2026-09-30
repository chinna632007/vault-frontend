import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt, FaFileAlt, FaUpload, FaHome, FaQuestionCircle, FaWallet, FaStar, FaExclamationTriangle } from "react-icons/fa";

function Navbar({ onMenuToggle, mobileSidebarOpen }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location]);

  const { logout } = useAuth();
  const isAuthPage = ["/", "/login", "/register"].includes(location.pathname);
  const isHomePage = location.pathname === "/" || location.pathname === "/login";

  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
  };

  const isNavActive = (path, matchType) => {
    if (matchType === "exact") return location.pathname === path;
    if (matchType === "startsWith") return location.pathname.startsWith(path);
    if (matchType === "favourite") return location.pathname === "/favourite";
    if (matchType === "documents") return location.pathname === "/documents";
    return false;
  };

  return (
    <>
      <header className={`navbar ${isScrolled ? "scrolled" : ""} ${isAuthPage ? "auth-page" : ""}`}>
        <div className="navbar-container">
          <Link to={isAuthPage ? "/login" : "/dashboard"} className="navbar-logo">
            <div className="logo-wrapper">
              <img src="/docuvault-logo-light.svg" alt="DocuVault logo" className="logo-icon" />
              <span className="logo-text">DocuVault</span>
            </div>
          </Link>

          {!isAuthPage && (
            <>
              <nav className="navbar-nav">
                <Link to="/dashboard" className={`nav-link ${isNavActive("/dashboard", "exact") ? "active" : ""}`}><FaHome /> Dashboard</Link>
                <Link to="/wallet" className={`nav-link ${isNavActive("/wallet", "exact") ? "active" : ""}`}><FaWallet /> Wallet</Link>
                <Link to="/documents" className={`nav-link ${isNavActive("/documents", "documents") ? "active" : ""}`}><FaFileAlt /> Documents</Link>
                <Link to="/upload" className={`nav-link ${isNavActive("/upload", "exact") ? "active" : ""}`}><FaUpload /> Upload</Link>
                <Link to="/favourite" className={`nav-link ${isNavActive("/favourite", "favourite") ? "active" : ""}`}><FaStar /> Favourite</Link>
                <Link to="/help" className={`nav-link ${isNavActive("/help", "exact") ? "active" : ""}`}><FaQuestionCircle /> Help</Link>
              </nav>

              <div className="navbar-actions">
                <div className="profile-dropdown">
                  <button
                    className="profile-btn"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    title="Profile"
                  >
                    <div className="profile-avatar">
                      <FaUser />
                    </div>
                  </button>

                  {isProfileOpen && (
                    <>
                      <div className="dropdown-overlay" onClick={() => setIsProfileOpen(false)} />
                      <div className="dropdown-menu">
                        <Link to="/profile" className="dropdown-item">
                          <FaUser /> Profile
                        </Link>
                        <Link to="/settings" className="dropdown-item">
                          <FaCog /> Settings
                        </Link>
                        <hr className="dropdown-divider" />
                        <button className="dropdown-item logout" onClick={handleLogoutClick}>
                          <FaSignOutAlt /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="mobile-toggle"
                  onClick={onMenuToggle}
                  aria-label="Toggle menu"
                >
                  {mobileSidebarOpen ? <FaTimes /> : <FaBars />}
                </button>
              </div>
            </>
          )}

          {isAuthPage && (
            <div className="auth-nav-links">
              {isHomePage ? (
                <Link to="/register" className="auth-nav-btn">Sign Up</Link>
              ) : (
                <Link to="/login" className="auth-nav-btn">Login</Link>
              )}
            </div>
          )}
        </div>
      </header>

      {showLogoutModal && (
        <div className="confirm-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <FaExclamationTriangle className="confirm-icon" />
            <h3>Logout?</h3>
            <p>Are you sure you want to logout from your account? You will need to login again to access your documents.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete" onClick={handleLogoutConfirm}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;