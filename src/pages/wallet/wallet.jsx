import "./wallet.css";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { formatStorageSize } from "../../utils/storage";
import {
  FaUpload,
  FaFileAlt,
  FaStar,
  FaArrowRight,
  FaFolder,
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaHdd,
  FaCog,
  FaDownload,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

const parseSizeToMB = (sizeStr) => {
  if (!sizeStr) return 0;
  const s = sizeStr.toString().toUpperCase();
  const num = parseFloat(s) || 0;
  if (s.includes("GB")) return num * 1024;
  if (s.includes("MB")) return num;
  if (s.includes("KB")) return num / 1024;
  return num / (1024 * 1024);
};

const formatMB = (mb) => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(mb * 1024).toFixed(0)} KB`;
};

function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();

  // Downloads modal state
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);
  const [deleteDownloadConfirm, setDeleteDownloadConfirm] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await api.get("/wallet");
        setWallet(response.data.wallet);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        setError("Unable to load wallet data.");
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const getTotalMB = () => {
    if (!wallet) return 0;
    if (wallet.totalMB !== undefined && wallet.totalMB !== null) {
      return wallet.totalMB;
    }
    return parseSizeToMB(wallet.totalSize);
  };

    const getTotalLimit = () => {
    if (!wallet) return 10240;
    return wallet.totalLimit || 10240;
  };

  const handleOpenDownloads = async () => {
    setShowDownloadsModal(true);
    setDownloadsLoading(true);
    try {
      const response = await api.get("/downloads");
      setDownloads(response.data.downloads);
    } catch (err) {
      console.error("Error fetching downloads:", err);
    } finally {
      setDownloadsLoading(false);
    }
  };

  const handleCloseDownloads = () => {
    setShowDownloadsModal(false);
    setDeleteDownloadConfirm(null);
    setShowDeleteAllConfirm(false);
  };

  const handleDeleteAllDownloads = async () => {
    try {
      await api.delete("/downloads");
      setDownloads([]);
      setWallet((prev) =>
        prev ? { ...prev, downloads: 0 } : prev
      );
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error("Error deleting all downloads:", err);
    }
  };

  const handleDeleteDownload = async (id) => {
    try {
      await api.delete(`/downloads/${id}`);
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      setWallet((prev) =>
        prev ? { ...prev, downloads: Math.max(0, (prev.downloads || 0) - 1) } : prev
      );
      setDeleteDownloadConfirm(null);
    } catch (err) {
      console.error("Error deleting download:", err);
    }
  };

  const downloadFile = async (doc) => {
    try {
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

      // Trigger download
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Record the download (non-blocking)
      api.post("/downloads", {
        documentId: doc.id || doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
      }).then(() => console.log("Download recorded")).catch((err) => console.error("Error recording download:", err));

      return true;
    } catch (err) {
      console.error("Download error:", err);
      return false;
    }
  };

  const handleReDownload = async (dl) => {
    if (!dl.documentId) {
      alert("This download record does not have a linked document.");
      return;
    }
    setDownloadingId(dl.documentId);
    const doc = { id: dl.documentId, name: dl.name, type: dl.type, size: dl.size, category: dl.category };
    const success = await downloadFile(doc);
    if (!success) {
      alert("Failed to download document. Please try again.");
    }
    setDownloadingId(null);
  };

  if (loading) {
    return (
      <div className="page wallet-page">
        <div className="container">
          <div className="wallet-loading">
            <div className="loading-spinner" />
            <p>Loading your secure vault...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !wallet) {
    return (
      <div className="page wallet-page">
        <div className="container">
          <div className="wallet-error">
            <FaExclamationTriangle />
            <p>{error || "Unable to load wallet data."}</p>
            <Link to="/upload" className="primary-btn">Upload Your First Document</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page wallet-page">
      <div className="container wallet-shell">
        <section className="wallet-hero">
          <div className="wallet-hero-content">
            <div className="wallet-brand">
              <div className="wallet-logo">
                <img src="/docuvault-logo-light.svg" alt="DocuVault" className="wallet-logo-img" />
              </div>
              <div>
                <span className="hero-pill">Digital Document Wallet</span>
                <h1>Your Secure Vault</h1>
                <p>
                  Manage, verify, and protect your important documents in one
                  place.
                </p>
              </div>
            </div>
            <div className="wallet-hero-actions">
              <Link to="/upload" className="primary-btn">
                <FaUpload /> Upload Document
              </Link>
              <Link to="/documents" className="secondary-btn">
                <FaFileAlt /> View Library
              </Link>
            </div>
          </div>
        </section>

        <section className="wallet-stats-grid">
          <Link to="/documents" className="wallet-stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon total">
              <FaFileAlt />
            </div>
            <div className="stat-details">
              <h3>{wallet.totalDocuments}</h3>
              <p>Total Documents</p>
            </div>
          </Link>
          <Link to="/settings?tab=storage" className="wallet-stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon storage">
              <FaHdd />
            </div>
            <div className="stat-details">
              <h3>{formatStorageSize(wallet.totalSize)}</h3>
              <p>Storage Used <span className="storage-manage-link"></span></p>
            </div>
          </Link>
          <Link to="/favourite" className="wallet-stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon favourite">
              <FaStar />
            </div>
            <div className="stat-details">
              <h3>{wallet.favourite || 0}</h3>
              <p>Favourite</p>
            </div>
          </Link>
          <div
            className="wallet-stat-card"
            style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
            onClick={handleOpenDownloads}
          >
            <div className="stat-icon downloads">
              <FaDownload />
            </div>
            <div className="stat-details">
              <h3>{wallet.downloads || 0}</h3>
              <p>Downloads</p>
            </div>
          </div>
        </section>

        <section className="wallet-grid">
          <div className="wallet-panel categories-panel">
            <div className="panel-header">
              <h2>
                <FaFolder /> Categories
              </h2>
              <span className="panel-badge">
                {wallet.categories} categories
              </span>
            </div>
            <div className="categories-list">
              {wallet.categoryBreakdown && wallet.categoryBreakdown.length > 0 ? (
                wallet.categoryBreakdown.map((cat, index) => (
                  <div key={index} className="category-item">
                    <div
                      className="category-color"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="category-details">
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">
                        {cat.count} documents
                      </span>
                    </div>
                    <div className="category-bar">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${(cat.count / (wallet.totalDocuments || 1)) * 100}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-text">No categories yet. Upload documents to see them here.</p>
              )}
            </div>
          </div>

          <div className="wallet-panel recent-panel">
            <div className="panel-header">
              <h2>
                <FaClock /> Recent Documents
              </h2>
              <Link to="/documents" className="panel-link">
                View all <FaArrowRight />
              </Link>
            </div>
            <div className="recent-list">
              {wallet.recentDocuments && wallet.recentDocuments.length > 0 ? (
                wallet.recentDocuments.map((doc) => (
                  <Link
                    key={doc._id || doc.id}
                    to={`/viewer/${doc._id || doc.id}`}
                    className="recent-item"
                  >
                    <div
                      className="recent-icon"
                      style={{
                        backgroundColor: `${getCategoryColor(doc.category)}15`,
                        color: getCategoryColor(doc.category),
                      }}
                    >
                      <FaFileAlt />
                    </div>
                    <div className="recent-info">
                      <span className="recent-name">{doc.name}</span>
                      <span className="recent-meta">
                        {doc.category} • {doc.size} • {doc.uploadedAt}
                      </span>
                    </div>
                    {doc.favourite && <FaStar className="recent-star" />}
                  </Link>
                ))
              ) : (
                <p className="empty-text">No recent documents. Upload your first document!</p>
              )}
            </div>
          </div>
        </section>

        <section className="wallet-quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/upload" className="action-card">
              <div className="action-icon upload">
                <FaUpload />
              </div>
              <div className="action-content">
                <h4>Upload Document</h4>
                <p>Add new files to your vault</p>
              </div>
              <FaArrowRight className="action-arrow" />
            </Link>
            <Link to="/documents" className="action-card">
              <div className="action-icon browse">
                <FaFileAlt />
              </div>
              <div className="action-content">
                <h4>Browse Library</h4>
                <p>Search and manage documents</p>
              </div>
              <FaArrowRight className="action-arrow" />
            </Link>
            <div
              className="action-card"
              style={{ cursor: "pointer" }}
              onClick={handleOpenDownloads}
            >
              <div className="action-icon downloads">
                <FaDownload />
              </div>
              <div className="action-content">
                <h4>Downloads</h4>
                <p>View downloaded files</p>
              </div>
              <FaArrowRight className="action-arrow" />
            </div>
            <Link to="/settings?tab=storage" className="action-card">
              <div className="action-icon security">
                <FaCog />
              </div>
              <div className="action-content">
                <h4>Storage Manager</h4>
                <p>Manage storage and categories</p>
              </div>
              <FaArrowRight className="action-arrow" />
            </Link>
          </div>
        </section>
      </div>

      {/* Downloads Modal */}
      {showDownloadsModal && (
        <div className="downloads-modal-overlay" onClick={handleCloseDownloads}>
          <div className="downloads-modal" onClick={(e) => e.stopPropagation()}>
            <div className="downloads-modal-header">
              <h2>
                <FaDownload /> Downloaded Files
              </h2>
              <div className="downloads-modal-header-actions">
                {downloads.length > 0 && (
                  <button className="downloads-delete-all" onClick={() => setShowDeleteAllConfirm(true)}>
                    <FaTrash /> Delete All
                  </button>
                )}
                <button className="downloads-modal-close" onClick={handleCloseDownloads}>
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="downloads-modal-body">
              {showDeleteAllConfirm && downloads.length > 0 && (
                <div className="downloads-delete-all-confirm">
                  <FaExclamationTriangle />
                  <span>Delete all {downloads.length} downloaded file(s)? This cannot be undone.</span>
                  <button className="confirm-yes" onClick={handleDeleteAllDownloads}>Yes</button>
                  <button className="confirm-no" onClick={() => setShowDeleteAllConfirm(false)}>No</button>
                </div>
              )}
              {downloadsLoading ? (
                <div className="downloads-loading">
                  <div className="loading-spinner" />
                  <p>Loading downloads...</p>
                </div>
              ) : downloads.length > 0 ? (
                <div className="downloads-list">
                  {downloads.map((dl) => (
                    <div key={dl.id || dl._id} className="download-item">
                      <div
                        className="download-item-icon"
                        style={{
                          backgroundColor: `${getCategoryColor(dl.category)}15`,
                          color: getCategoryColor(dl.category),
                        }}
                      >
                        <FaFileAlt />
                      </div>
                      <div className="download-item-info">
                        <span className="download-item-name">{dl.name}</span>
                        <span className="download-item-meta">
                          {dl.category} • {dl.size} • {dl.downloadedAt}
                        </span>
                      </div>
                      {deleteDownloadConfirm === (dl.id || dl._id) ? (
                        <div className="download-delete-confirm">
                          <span>Delete?</span>
                          <button
                            className="confirm-yes"
                            onClick={() => handleDeleteDownload(dl.id || dl._id)}
                          >
                            Yes
                          </button>
                          <button
                            className="confirm-no"
                            onClick={() => setDeleteDownloadConfirm(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>

                          <button
                            className="download-item-delete"
                            title="Delete"
                            onClick={() => setDeleteDownloadConfirm(dl.id || dl._id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="downloads-empty">
                  <FaDownload className="downloads-empty-icon" />
                  <h3>No downloads yet</h3>
                  <p>Files you download will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getCategoryColor = (category) => {
  const colors = {
    Work: "#2563eb",
    Legal: "#8b5cf6",
    Identity: "#10b981",
    Financial: "#f59e0b",
    Health: "#ef4444",
    Education: "#06b6d4",
    Personal: "#ec4899",
    Other: "#64748b",
  };
  return colors[category] || "#64748b";
};

export default Wallet;