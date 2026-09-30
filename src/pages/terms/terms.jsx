import "./terms.css";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function Terms() {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By accessing or using DocuVault, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services." },
    { title: "2. Description of Service", content: "DocuVault provides a secure digital document storage and management platform. We reserve the right to modify, suspend, or discontinue the service at any time without notice." },
    { title: "3. User Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. We are not liable for any loss or damage arising from your failure to protect your account." },
    { title: "4. Acceptable Use", content: "You agree not to use the service for any unlawful purpose, to upload malicious content, to attempt to breach our security, or to interfere with the proper functioning of the platform." },
    { title: "5. Data Security", content: "We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security." },
    { title: "6. Privacy", content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices." },
    { title: "7. Termination", content: "We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties." },
    { title: "8. Limitation of Liability", content: "DocuVault shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses." },
    { title: "9. Changes to Terms", content: "We reserve the right to update these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance." },
    { title: "10. Contact", content: "If you have any questions about these Terms, please contact us at legal@docuvault.com." },
  ];

  return (
    <div className="page terms-page">
      <div className="container">
        <section className="terms-header">
          <Link to="/" className="back-link"><FaArrowLeft /> Back</Link>
          <h1>Terms of Service</h1>
          <p>Last updated: July 2026</p>
        </section>
        <section className="terms-content">
          {sections.map((section) => (
            <div key={section.title} className="terms-section">
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Terms;
