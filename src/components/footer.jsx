import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

function Footer({ sidebarOpen = true }) {
  return (
    <footer className={`footer ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/docuvault-logo-light.svg" alt="DocuVault logo" className="footer-logo-img" />
              <span>DocuVault</span>
            </div>
            <p>
              A secure digital document wallet for storing, organizing, and
              managing your important documents.
            </p>
          </div>
          <div className="footer-links">
            <h4>Features</h4>
            <Link to="/upload">Upload</Link>
            <Link to="/documents">Documents</Link>
            <Link to="/favourite">Favourite</Link>
            <Link to="/trash">Trash</Link>
          </div>
          <div className="footer-links">
            <h4>Resources</h4>
            <Link to="/guide">Guide</Link>
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
          </div>
          <div className="footer-social">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DocuVault. All rights reserved.</p>
          <p className="footer-made-with">
            Made for secure document management
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;