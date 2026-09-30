import "./privacy.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaLock, FaEye, FaTrash, FaUserShield } from "react-icons/fa";

function Privacy() {
  const sections = [
    { icon: <FaEye />, title: "Information We Collect", content: "We collect information you provide directly, such as your name, email, and documents you upload. We also collect usage data to improve our service." },
    { icon: <FaLock />, title: "How We Use Your Information", content: "We use your information to provide and improve the service, communicate with you, and ensure security. We never sell your personal data." },
    { icon: <FaUserShield />, title: "Data Protection", content: "We implement industry-standard security measures including encryption, access controls, and regular security audits to protect your data." },
    { icon: <FaTrash />, title: "Data Deletion", content: "You can delete your account at any time. Upon deletion, we will remove all your personal data within 30 days." },
    { icon: <FaEye />, title: "Third-Party Sharing", content: "We do not share your personal information with third parties except as required by law or to provide the service (e.g., cloud hosting providers)." },
  ];

  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
        <h1>Privacy Policy</h1>
        <p>Last updated: July 2026</p>
      </div>
      <div className="privacy-content">
        <p>At DocuVault, we take your privacy seriously. This policy explains how we collect, use, and protect your information.</p>
        {sections.map((section, idx) => (
          <div key={idx} className="privacy-section">
            <div className="privacy-section-icon">{section.icon}</div>
            <div>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Privacy;
