import "./help.css";
import { FaQuestionCircle, FaEnvelope, FaPhone, FaBook, FaSearch } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    { q: "How do I upload documents?", a: "Click the Upload button in the sidebar or use the Upload page. You can drag and drop files or click to browse." },
    { q: "Is my data secure?", a: "Yes, we use AES-256 encryption and bank-grade security measures to protect your documents." },
    { q: "How do I recover deleted documents?", a: "Go to the Trash page and click Restore on any document you want to recover." },
    { q: "What file types are supported?", a: "We support PDF, DOC, DOCX, JPG, PNG, and many other common formats." },
    { q: "Can I access my documents on mobile?", a: "Yes, DocuVault is fully responsive and works on all devices." },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page help-page">
      <div className="container">
        <section className="help-header">
          <span className="hero-pill">Help Center</span>
          <h1>How can we help?</h1>
          <p>Find answers to common questions or get in touch with our support team.</p>
          
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <h3><FaQuestionCircle /> {faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="help-contact">
          <h2>Still need help?</h2>
          <div className="contact-options">
            <a className="contact-card">
              <FaEnvelope />
              <h4>Email Support</h4>
              <p>chinna632007@gmail.com</p>
            </a>
            <a className="contact-card">
              <FaPhone />
              <h4>Phone Support</h4>
              <p>9876543210</p>
            </a>
            <Link className="contact-card">
              <FaBook />
              <h4>Documentation</h4>
              <p>Read our guides</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Help;
