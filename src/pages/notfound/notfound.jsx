import "./notfound.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaHome, FaSearch } from "react-icons/fa";

function NotFound() {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/wallet";
    }
  };

  const suggestedPages = [
    { path: "/wallet", label: "Wallet", icon: <FaHome /> },
    { path: "/dashboard", label: "Dashboard", icon: <FaSearch /> },
    { path: "/documents", label: "Documents", icon: <FaSearch /> },
    { path: "/help", label: "Help Center", icon: <FaSearch /> },
  ];

  return (
    <div className="page not-found-page">
      <div className="not-found-card">
        <div className="not-found-badge">404</div>
        <h1>Page not found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button className="action-btn primary" onClick={goBack}>
            <FaArrowLeft /> Go Back
          </button>
          <Link to="/wallet" className="action-btn secondary">
            <FaHome /> Go to Wallet
          </Link>
        </div>
        <div className="suggested-pages">
          <h4>You might be looking for:</h4>
          <div className="suggested-links">
            {suggestedPages.map(page => (
              <Link key={page.path} to={page.path} className="suggested-link">
                {page.icon} {page.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
