import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { useState, useEffect } from "react";
import api from "../services/api";
import { formatStorageSize, parseSizeToMB } from "../utils/storage";
import {
  FaHome,
  FaFileAlt,
  FaUpload,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaTrash,
  FaStar,
  FaCompass,
  FaWallet,
  FaDownload,
  FaExclamationTriangle,
} from "react-icons/fa";


function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [storagePercent, setStoragePercent] = useState(0);
  const [storageUsed, setStorageUsed] = useState("0 MB");

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await api.get("/stats");
        const totalSize = response.data.stats?.totalSize || "0 MB";
        const usedMB = parseSizeToMB(totalSize);
                                const totalGB = 10;
        const percent = Math.min((usedMB / (totalGB * 1024)) * 100, 100);
        setStoragePercent(Math.round(percent * 10) / 10);
        setStorageUsed(formatStorageSize(totalSize));
      } catch (err) {
        console.error("Error fetching storage:", err);
      }
    };
    if (user) fetchStorage();
  }, [user, location.pathname]);

  const navItems = [
    { path: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { path: "/wallet", icon: <FaWallet />, label: "Wallet" },
    { path: "/documents", icon: <FaFileAlt />, label: "Documents" },
    { path: "/upload", icon: <FaUpload />, label: "Upload" },
    { path: "/favourite", icon: <FaStar />, label: "Favourite" },
    { path: "/trash", icon: <FaTrash />, label: "Trash" },
  ];

  const handleDocumentsClick = (path) => {
    if (path === "/documents") {
      // Clear favourite filter when navigating to documents
      navigate("/documents", { replace: true, state: { clearFilters: true } });
    }
    // Favourite page is now a dedicated route, no special handling needed
    if (onNavigate) onNavigate();
  };

  const bottomItems = [
    { path: "/profile", icon: <FaUser />, label: "Profile" },
    { path: "/settings", icon: <FaCog />, label: "Settings" },
    { path: "/guide", icon: <FaCompass />, label: "Guide" },
  ];

  const isActive = (path) => {
    if (path === "/documents") {
      // Documents is active only when on the documents page (not viewer, not favourite)
      return location.pathname === "/documents" && !location.pathname.startsWith("/viewer");
    }
    if (path === "/favourite") {
      // Favourite is active only when on the dedicated favourite page
      return location.pathname === "/favourite";
    }
    if (path === "/settings") return location.pathname.startsWith("/settings");
    if (path === "/guide") return location.pathname.startsWith("/guide");
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (onNavigate) onNavigate();
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/docuvault-logo.svg" alt="DocuVault logo" className="sidebar-brand-icon" />
          <span className="sidebar-brand-text">DocuVault</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Main Menu</span>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleDocumentsClick(item.path)}
                className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Account</span>
            {bottomItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onNavigate && onNavigate()}
                className={`sidebar-link ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </Link>
            ))}
            <button className="sidebar-link logout-link" onClick={() => setShowLogoutModal(true)}>
              <span className="sidebar-link-icon"><FaSignOutAlt /></span>
              <span className="sidebar-link-label">Logout</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/settings?tab=storage" className="sidebar-storage-link">
            <div className="sidebar-storage">
              <div className="storage-info">
                <span>Storage Used</span>
                <span>{storagePercent}%</span>
              </div>
              <div className="storage-bar">
                <div className="storage-bar-fill" style={{ width: `${storagePercent}%` }} />
              </div>
              <div className="storage-amount">{storageUsed}</div>
            </div>
          </Link>
        </div>
      </aside>

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
              <button className="confirm-delete" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
