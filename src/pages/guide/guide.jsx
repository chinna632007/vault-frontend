import "./guide.css";
import { FaArrowLeft, FaRocket, FaStar, FaShieldAlt, FaQuestionCircle, FaLock, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

function Guide() {
  const guides = [
    { icon: <FaRocket />, title: "Getting Started", desc: "Learn the basics of DocuVault in 5 minutes.", link: "/guide/getting-started" },
    { icon: <FaStar />, title: "Features", desc: "Explore all the powerful features DocuVault offers.", link: "/guide/features" },
    { icon: <FaShieldAlt />, title: "Security", desc: "Understand how we keep your documents safe.", link: "/guide/security" },
    { icon: <FaQuestionCircle />, title: "FAQ", desc: "Answers to commonly asked questions.", link: "/guide/faq" },
    { icon: <FaLock />, title: "Privacy Policy", desc: "How we handle your data and privacy.", link: "/guide/privacy" },
    { icon: <FaInfoCircle />, title: "About", desc: "Learn more about DocuVault and our mission.", link: "/about" },
  ];

  return (
    <div className="guide-page">
      <div className="guide-header">
        <Link to="/dashboard" className="back-link"><FaArrowLeft /> Back to Dashboard</Link>
        <h1>DocuVault Guide</h1>
        <p>Everything you need to know to get the most out of DocuVault.</p>
      </div>
      <div className="guide-grid">
        {guides.map((guide, index) => (
          <Link key={index} to={guide.link} className="guide-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="guide-card-icon">{guide.icon}</div>
            <h3>{guide.title}</h3>
            <p>{guide.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Guide;