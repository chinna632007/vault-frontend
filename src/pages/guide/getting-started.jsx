import "./getting-started.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaUserPlus, FaUpload, FaFileAlt, FaStar, FaDownload, FaTrash, FaCog } from "react-icons/fa";

function GettingStarted() {
  const steps = [
    { title: "Create Account", desc: "Sign up with your email and create a password to get started."},
    { title: "Upload Documents", desc: "Drag and drop or browse to upload your first documents to your vault."},
    { title: "Organize", desc: "Use categories, tags, and stars to keep your documents organized." },
    { title: "Favourite Documents", desc: "Favourite important documents for quick access anytime."},
    { title: "Download Files", desc: "Download your documents anytime and access them offline." },
    { title: "Manage Trash", desc: "View and restore deleted documents from the trash folder."},
    { title: "Settings", desc: "Customize your account settings and storage preferences."},
  ];

  return (
    <div className="getting-started-page">
      <div className="getting-started-header">
        <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
        <h1>Getting Started</h1>
        <p>Follow these simple steps to set up your DocuVault account and start managing documents.</p>
      </div>
      <div className="steps-list">
        {steps.map((step, idx) => (
          <div key={idx} className="step-row">
            <div className="step-badge">{idx + 1}</div>
           
            <div className="step-row-text">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GettingStarted;