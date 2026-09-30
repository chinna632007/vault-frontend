import "./dashboard.css";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaUpload,
  FaFileAlt,
  FaCog,
  FaSpinner,
  FaStar,
  FaFileAlt as FaFileAltSolid,
  FaWallet,
  FaDownload,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/authcontext";
import { formatStorageSize, parseSizeToMB } from "../../utils/storage";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);
  const [deleteDownloadConfirm, setDeleteDownloadConfirm] = useState(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, documentsResponse] = await Promise.all([
          api.get("/stats"),
          api.get("/documents"),
        ]);
        setStats(statsResponse.data.stats);
        const sortedDocs = documentsResponse.data.documents.sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        setRecentDocuments(sortedDocs.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Downloads modal handlers
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
      setStats((prev) => prev ? { ...prev, downloads: 0 } : prev);
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error("Error deleting all downloads:", err);
    }
  };

  const handleDeleteDownload = async (id) => {
    try {
      await api.delete(`/downloads/${id}`);
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      setStats((prev) => prev ? { ...prev, downloads: Math.max(0, (prev.downloads || 0) - 1) } : prev);
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
      <div className="page dashboard-page">
        <div className="container dashboard-shell">
          <div className="hero-card">
            <div className="hero-copy">
              <div className="skeleton" style={{ width: 120, height: 28, borderRadius: 999, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: 280, height: 36, borderRadius: 12, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 400, height: 20, borderRadius: 8, marginBottom: 24 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <div className="skeleton" style={{ width: 140, height: 44, borderRadius: 14 }} />
                <div className="skeleton" style={{ width: 140, height: 44, borderRadius: 14 }} />
              </div>
            </div>
            <div className="hero-side-card">
              <div className="skeleton" style={{ width: 140, height: 20, borderRadius: 8, marginBottom: 16 }} />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: 16, borderRadius: 8, marginBottom: 10 }} />
              ))}
            </div>
          </div>
          <div className="quick-actions">
            <div className="skeleton" style={{ width: 160, height: 24, borderRadius: 8, marginBottom: 8 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 20 }} />
            ))}
          </div>
          <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="container dashboard-shell">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="hero-pill">Digital Document Wallet</span>
            <h1>Welcome back, {user?.username}!</h1>
            <p>Your documents are safe and organized. Manage them from one secure place.</p>
            <div className="hero-actions">
              <Link to="/upload" className="primary-btn">
                <FaUpload /> Upload now
              </Link>
              <Link to="/documents" className="secondary-btn">
                <FaFileAlt /> Open Library
              </Link>
            </div>
          </div>
          <div className="hero-side-card">
            <h3>Today's Overview</h3>
            <ul>
              <li>Total Documents: {stats?.totalDocuments ?? 0}</li>
              <li>Items in trash: {stats?.trash || 0}</li>
              <li>Document categories: {stats?.categories || 0}</li>
            </ul>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/upload" className="quick-action-card">
              <div className="quick-action-icon upload"><FaUpload /></div>
              <div>
                <h4>Upload</h4>
                <p>Add new files</p>
              </div>
            </Link>
            <Link to="/documents" className="quick-action-card">
              <div className="quick-action-icon docs"><FaFileAlt /></div>
              <div>
                <h4>Documents</h4>
                <p>Browse library</p>
              </div>
            </Link>
            <div className="quick-action-card" style={{ cursor: "pointer" }} onClick={handleOpenDownloads}>
              <div className="quick-action-icon downloads"><FaDownload /></div>
              <div>
                <h4>Downloads</h4>
                <p>View downloaded files</p>
              </div>
            </div>
            <Link to="/settings" className="quick-action-card">
              <div className="quick-action-icon settings"><FaCog /></div>
              <div>
                <h4>Settings</h4>
                <p>Account settings</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="stats-grid">
          <Link to="/documents" className="stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon docs"><FaFileAlt /></div>
            <div className="stat-info">
              <h2>{stats?.totalDocuments ?? 0}</h2>
              <p>Documents stored</p>
            </div>
          </Link>
          <Link to="/favourite" className="stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon favourite"><FaStar /></div>
            <div className="stat-info">
              <h2>{stats?.favourite ?? 0}</h2>
              <p>Favourite</p>
            </div>
          </Link>
          <div className="stat-card" style={{ cursor: "pointer" }} onClick={handleOpenDownloads}>
            <div className="stat-icon downloads"><FaDownload /></div>
            <div className="stat-info">
              <h2>{stats?.downloads ?? 0}</h2>
              <p>Downloads</p>
            </div>
          </div>
          <Link to="/settings?tab=storage" className="stat-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-icon storage"><FaWallet /></div>
            <div className="stat-info">
              <h2>{formatStorageSize(stats?.totalSize)}</h2>
              <p>Storage used</p>
              <div className="stat-mini-bar">
                <div className="stat-mini-bar-fill" style={{ width: `${Math.min((parseSizeToMB(stats?.totalSize) / (10 * 1024)) * 100, 100)}%` }} />
              </div>
            </div>
          </Link>
        </section>

        <section className="dashboard-grid">
          <div className="panel-card">
            <div className="panel-header">
              <h2>Recent documents</h2>
              <Link to="/documents" className="panel-link">
                View all <FaArrowRight />
              </Link>
            </div>
            <div className="activity-list">
              {recentDocuments.length > 0 ? (
                <ul>
                  {recentDocuments.map((doc) => (
                    <li key={doc.id}>
                      <Link to={`/viewer/${doc.id}`} className="doc-link">
                        <span className="doc-name">{doc.name}</span>
                        <span className="doc-meta">{doc.category} • {doc.size}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <FaFileAltSolid className="empty-icon" />
                  <h3>No recent documents</h3>
                  <p>Upload your first document to get started.</p>
                  <Link to="/upload" className="primary-btn">Upload document</Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Downloads Modal */}
      {showDownloadsModal && (
        <div className="downloads-modal-overlay" onClick={handleCloseDownloads}>
          <div className="downloads-modal" onClick={(e) => e.stopPropagation()}>
            <div className="downloads-modal-header">
              <h2><FaDownload /> Downloaded Files</h2>
              <div className="downloads-modal-header-actions">
                {downloads.length > 0 && (
                  <button className="downloads-delete-all" onClick={() => setShowDeleteAllConfirm(true)}>
                    <FaTrash /> Delete All
                  </button>
                )}
                <button className="downloads-modal-close" onClick={handleCloseDownloads}><FaTimes /></button>
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
                      <div className="download-item-icon" style={{ backgroundColor: `${getCategoryColor(dl.category)}15`, color: getCategoryColor(dl.category) }}>
                        <FaFileAlt />
                      </div>
                      <div className="download-item-info">
                        <span className="download-item-name">{dl.name}</span>
                        <span className="download-item-meta">{dl.category} • {dl.size} • {dl.downloadedAt}</span>
                      </div>
                      {deleteDownloadConfirm === (dl.id || dl._id) ? (
                        <div className="download-delete-confirm">
                          <span>Delete?</span>
                          <button className="confirm-yes" onClick={() => handleDeleteDownload(dl.id || dl._id)}>Yes</button>
                          <button className="confirm-no" onClick={() => setDeleteDownloadConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <>

                          <button className="download-item-delete" title="Delete" onClick={() => setDeleteDownloadConfirm(dl.id || dl._id)}>
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

function getCategoryColor(category) {
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
}

export default Dashboard;