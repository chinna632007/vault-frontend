import "./security.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaLock, FaShieldAlt, FaUserShield, FaCertificate, FaDatabase } from "react-icons/fa";

function Security() {
  const features = [
    { icon: <FaLock />, title: "End-to-End Encryption", desc: "All documents are encrypted with AES-256 before leaving your device. Only you can decrypt them." },
    { icon: <FaUserShield />, title: "Two-Factor Authentication", desc: "Add an extra layer of protection with 2FA. We support TOTP apps and SMS verification." },
    { icon: <FaCertificate />, title: "Document Verification", desc: "Verify the integrity of your documents with our built-in verification system." },
    { icon: <FaDatabase />, title: "Secure Backups", desc: "Your data is backed up across multiple secure locations with redundancy." },
    { icon: <FaShieldAlt />, title: "Access Controls", desc: "Granular permissions let you control who can view or edit your documents." },
  ];

  return (
    <div className="security-page">
      <div className="security-header">
        <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
        <h1>Security</h1>
        <p>DocuVault is built with security as the foundation, not an afterthought.</p>
      </div>
      <div className="security-features">
        {features.map((feature, idx) => (
          <div key={idx} className="security-feature-card">
            <div className="security-feature-icon">{feature.icon}</div>
            <div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Security;
