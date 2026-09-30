import "./features.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaSearch, FaStar, FaShieldAlt, FaDownload, FaLock, FaCloudUploadAlt, FaMobileAlt } from "react-icons/fa";

function Features() {
  const features = [
    { icon: <FaUpload />, title: "Easy Upload", desc: "Drag and drop files or browse to upload. Support for PDF, DOC, images, and more." },
    { icon: <FaSearch />, title: "Smart Search", desc: "Find any document instantly with full-text search, filters, and tags." },
    { icon: <FaStar />, title: "Favorites & Tags", desc: "Star important documents and organize with custom tags for quick access." },
    { icon: <FaDownload />, title: "Easy Export", desc: "Download documents anytime in their original format." },
    { icon: <FaLock />, title: "Encryption", desc: "All documents are encrypted at rest and in transit using AES-256." },
    { icon: <FaCloudUploadAlt />, title: "Cloud Backup", desc: "Your documents are securely backed up with redundancy across multiple locations." },
    { icon: <FaMobileAlt />, title: "Mobile Access", desc: "Access your documents from anywhere, on any device, anytime." },
  ];

  return (
    <div className="features-page">
      <div className="features-header">
        <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
        <h1>Features</h1>
        <p>Discover what makes DocuVault the best choice for secure document management.</p>
      </div>
      <div className="features-list">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-row">
            <div className="feature-row-icon">{feature.icon}</div>
            <div className="feature-row-text">
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Features;
