import "./faq.css";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaQuestionCircle } from "react-icons/fa";

function FAQ() {
  const faqs = [
    { q: "What is DocuVault?", a: "DocuVault is a secure digital document wallet that helps you store, organize, and manage your important documents safely." },
    { q: "Is DocuVault free?", a: "Yes, DocuVault is free to use with 10GB storage included for all users." },
    { q: "How secure is my data?", a: "We use AES-256 encryption, secure servers, and industry best practices to keep your data safe. We also offer two-factor authentication." },
    { q: "What happens if I delete a document?", a: "Deleted documents go to Trash and can be restored within 30 days. After that, they are permanently deleted." },
    { q: "Do you support all file types?", a: "We support PDF, DOC, DOCX, JPG, PNG, TXT, and many more. Binary files and executables are not supported." },
    { q: "Can I access DocuVault on mobile?", a: "Yes, DocuVault is fully responsive and works on all devices including phones and tablets." },
    { q: "How can I get more storage?", a: "Contact our support team for information about additional storage options." },
  ];

  return (
    <div className="faq-page">
      <div className="faq-header">
        <Link to="/guide" className="back-link"><FaArrowLeft /> Back to Guide</Link>
        <h1>Frequently Asked Questions</h1>
        <p>Find quick answers to the most common questions about DocuVault.</p>
      </div>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <h3><FaQuestionCircle /> {faq.q}</h3>
            <p>{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
