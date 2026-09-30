import "./about.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt, FaUsers, FaLock, FaRocket, FaHeart } from "react-icons/fa";

function About() {
  const features = [
    { icon: <FaShieldAlt />, title: "Bank-Grade Security", desc: "Your documents are encrypted end-to-end with AES-256 encryption." },
    { icon: <FaUsers />, title: "Easy Organization", desc: "Organize documents with categories, tags, and favorites for quick access." },
    { icon: <FaLock />, title: "Privacy First", desc: "We never sell your data. Your documents stay yours." },
    { icon: <FaRocket />, title: "Lightning Fast", desc: "Access your documents from anywhere, on any device, instantly." },
  ];

  return (
    <div className="page about-page">
      <div className="container">
        <section className="about-hero">
          <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
          <h1>About Us</h1>
          <p>Securing your documents, empowering your workflow.</p>
        </section>

        <section className="about-features">
          <h2>Why DocuVault?</h2>
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
        </section>

        <section className="about-mission">
          <div className="mission-card">
            <FaHeart className="mission-icon" />
            <h2>Our Mission</h2>
            <p>We believe everyone deserves secure, simple access to their important documents. Whether you're a freelancer managing contracts, a family organizing medical records, or a business handling compliance documents, DocuVault is built to keep your files safe and accessible.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
