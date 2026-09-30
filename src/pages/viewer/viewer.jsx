import "./viewer.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  FaArrowLeft,
  FaDownload,
  FaTrash,
  FaStar,
  FaFileAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaFile,
  FaTag,
  FaFolder,
  FaCalendar,
  FaInfoCircle,
} from "react-icons/fa";

function Viewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favourite, setFavourite] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        const doc = response.data.document;
        if (!doc) {
          setError("Document not found");
          setLoading(false);
          return;
        }
        setDocument(doc);
        setFavourite(doc.favourite || false);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Document not found");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleToggleStar = async () => {
    try {
      const docId = document.id || document._id;
      await api.put(`/documents/${docId}`, {
        favourite: !favourite,
      });
      // Update local state
      setFavourite(!favourite);
      // Refresh document data from backend
      const response = await api.get(`/documents/${id}`);
      if (response.data.document) {
        setDocument(response.data.document);
        setFavourite(response.data.document.favourite || false);
      }
    } catch (err) {
      console.error("Error toggling star:", err);
      alert("Failed to update favourite. Please try again.");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Save reference to the document data
      // (state variable `document` shadows the global DOM `document` object)
      const doc = document;

      // Download the file from backend
      const response = await api.get(`/documents/${doc.id || doc._id}/download`, {
        responseType: "blob",
      });

      // Get filename from response headers (decode URI component since we encode it server-side)
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = doc.name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          try {
            filename = decodeURIComponent(match[1]);
          } catch {
            filename = match[1];
          }
        }
      }

      const contentType = response.headers?.["content-type"] || "application/octet-stream";
      const ext = doc.type || (filename.includes(".") ? filename.split(".").pop() : "txt");
      const fullFilename = filename.includes(".") ? filename : `${filename}.${ext}`;

      // Trigger download — use window.document (NOT the `document` state variable)
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = fullFilename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Record the download (non-blocking — don't fail the download if recording fails)
      await api.post("/downloads", {
        documentId: doc.id || doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
      });

      alert("Document downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      const errorMsg = err.response?.data?.error || "Failed to download document. Please try again.";
      alert(errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/documents/${document.id || document._id}`);
      navigate("/documents");
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="page viewer-page">
        <div className="viewer-loading">
          <FaSpinner className="spinner" />
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="page viewer-page">
        <div className="viewer-error">
          <FaExclamationTriangle />
          <h2>Document Not Found</h2>
          <p>{error || "This document could not be found."}</p>
          <Link to="/documents" className="back-btn">
            <FaArrowLeft /> Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page viewer-page">
      <div className="container viewer-shell">
        <div className="viewer-toolbar">
          <Link to="/documents" className="viewer-back">
            <FaArrowLeft /> Back to Documents
          </Link>
          <div className="viewer-actions">
            <button className="viewer-action" onClick={handleDownload} disabled={downloading} title="Download">
              {downloading ? <FaSpinner className="spinner" /> : <FaDownload />} {downloading ? "Downloading..." : "Download"}
            </button>
            <button
            className={`viewer-action ${favourite ? "active" : ""}`}
            onClick={handleToggleStar}
            title={favourite ? "Unfavourite" : "Favourite"}
            >
              <FaStar /> {favourite ? "Favourite" : "Favourite"}
            </button>
            {deleteConfirm ? (
              <div className="viewer-delete-confirm">
                <span>Delete?</span>
                <button className="confirm-yes" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes"}
                </button>
                <button className="confirm-no" onClick={() => setDeleteConfirm(false)}>No</button>
              </div>
            ) : (
              <button className="viewer-action danger-action" onClick={() => setDeleteConfirm(true)} title="Delete">
                <FaTrash /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="viewer-content">
          <div className="viewer-main">
            <div className="viewer-header">
              <div className="viewer-icon">
                <FaFileAlt />
              </div>
              <div className="viewer-title-section">
                <h1>{document.name}</h1>
                <p className="viewer-meta-line">
                  {document.category} • {document.size} • Uploaded{" "}
                  {document.uploadedAt}
                </p>
              </div>
            </div>

            <div className="viewer-info-grid">
              <div className="info-card">
                <FaInfoCircle className="info-icon" />
                <div>
                  <span className="info-label">File Name</span>
                  <span className="info-value">{document.name}</span>
                </div>
              </div>
              <div className="info-card">
                <FaFile className="info-icon" />
                <div>
                  <span className="info-label">File Type</span>
                  <span className="info-value">
                    {document.type?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="info-card">
                <FaFolder className="info-icon" />
                <div>
                  <span className="info-label">Category</span>
                  <span className="info-value">{document.category}</span>
                </div>
              </div>
              <div className="info-card">
                <FaCalendar className="info-icon" />
                <div>
                  <span className="info-label">Uploaded</span>
                  <span className="info-value">{document.uploadedAt}</span>
                </div>
              </div>
              {document.tags && document.tags.length > 0 && (
                <div className="info-card tags-card">
                  <FaTag className="info-icon" />
                  <div>
                    <span className="info-label">Tags</span>
                    <div className="tags-list">
                      {document.tags.map((tag, idx) => (
                        <span key={idx} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="viewer-sidebar">
            <div className="viewer-sidebar-card">
              <h3>Document Details</h3>
              <ul className="viewer-details-list">
                <li>
                  <strong>Name:</strong>
                  <span className="detail-value">{document.name}</span>
                </li>
                <li>
                  <strong>Type:</strong>
                  <span className="detail-value">
                    {document.type?.toUpperCase()}
                  </span>
                </li>
                <li>
                  <strong>Size:</strong>
                  <span className="detail-value">{document.size}</span>
                </li>
                <li>
                  <strong>Category:</strong>
                  <span className="detail-value">{document.category}</span>
                </li>
                <li>
                  <strong>Uploaded:</strong>
                  <span className="detail-value">{document.uploadedAt}</span>
                </li>
              </ul>
              <div className="viewer-sidebar-actions">
                <button className="sidebar-action-btn" onClick={handleDownload} disabled={downloading}>
                  {downloading ? <FaSpinner className="spinner" /> : <FaDownload />} {downloading ? "Downloading..." : "Download"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Viewer;