import "./settings.css";
import { FaUser, FaLock, FaBell, FaDatabase, FaSave, FaCheck, FaTrash, FaExclamationTriangle, FaDownload, FaFileAlt, FaTimes, FaSpinner, FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/authcontext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import { formatMB, parseSizeToMB } from "../../utils/storage";

function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const [accountData, setAccountData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

 
  // Storage tab state
  const [storageData, setStorageData] = useState({
    storageUsed: user?.storageUsed || 0,
        storageTotal: user?.storageTotal || 10,
  });
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [downloadsLoading, setDownloadsLoading] = useState(false);
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [deleteDownloadId, setDeleteDownloadId] = useState(null);
  const [deletingDownload, setDeletingDownload] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAllDownloads, setDeletingAllDownloads] = useState(false);

  useEffect(() => {
    setAccountData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
    });
  }, [user]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && ["account", "security", "downloads", "storage", "delete"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Fetch downloads when downloads tab is active
  useEffect(() => {
    if (activeTab === "downloads") {
      fetchDownloads();
    }
  }, [activeTab]);

  // Fetch documents, downloads, and stats when storage tab is active
  useEffect(() => {
    if (activeTab === "storage") {
      fetchDocuments();
      fetchDownloads();
      fetchStats();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const response = await api.get("/documents");
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const fetchDownloads = async () => {
    try {
      const response = await api.get("/downloads");
      setDownloads(response.data.downloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDownloadDocument = async (doc) => {
    setDownloadingId(doc.id || doc._id);
    setDownloadMessage("");
    try {
      // Download the actual file from backend API first
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

      setDownloadMessage(`"${doc.name}" downloaded successfully!`);
      setTimeout(() => setDownloadMessage(""), 4000);

      // Record the download (non-blocking — don't fail the download if recording fails)
      api.post("/downloads", {
        documentId: doc.id || doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        category: doc.category,
      }).then(() => fetchDownloads()).catch((err) => console.error("Error recording download:", err));
    } catch (error) {
      console.error("Error downloading document:", error);
      setDownloadMessage("Download failed. Please try again.");
      setTimeout(() => setDownloadMessage(""), 4000);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReDownload = async (dl) => {
    if (!dl.documentId) {
      alert("This download record does not have a linked document.");
      return;
    }
    setDownloadingId(dl.documentId);
    try {
      const doc = { id: dl.documentId, name: dl.name, type: dl.type, size: dl.size, category: dl.category };
      await handleDownloadDocument(doc);
    } catch (error) {
      console.error("Error re-downloading document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenDownloads = () => {
    setShowDownloadsModal(true);
    setDownloadsLoading(true);
    fetchDownloads().finally(() => setDownloadsLoading(false));
  };

  const handleDeleteDownload = async (downloadId) => {
    setDeletingDownload(true);
    try {
      await api.delete(`/downloads/${downloadId}`);
      setDownloads((prev) => prev.filter((d) => (d.id || d._id) !== downloadId));
      setDeleteDownloadId(null);
    } catch (err) {
      console.error("Error deleting download:", err);
      alert("Failed to delete download record.");
    } finally {
      setDeletingDownload(false);
    }
  };

  const handleDeleteAllDownloads = async () => {
    setDeletingAllDownloads(true);
    try {
      await api.delete("/downloads");
      setDownloads([]);
      setShowDeleteAllConfirm(false);
    } catch (err) {
      console.error("Error deleting all downloads:", err);
      alert("Failed to delete download records.");
    } finally {
      setDeletingAllDownloads(false);
    }
  };

  const showSaveMessage = (msg) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) {
      showSaveMessage("Please type your username exactly to confirm deletion.");
      return;
    }
    setSaving(true);
    try {
      await api.delete("/auth/account");
      logout();
      navigate("/login");
    } catch {
      showSaveMessage("Failed to delete account.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      await updateUser(accountData);
      showSaveMessage("Account details updated successfully!");
    } catch (err) {
      if (err.message === "Username already taken") {
        showSaveMessage("This username is already taken. Please choose another one.");
      } else {
        showSaveMessage("Failed to update account details.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      showSaveMessage("Passwords do not match.");
      return;
    }
    if (!securityData.currentPassword || !securityData.newPassword) {
      showSaveMessage("Please fill all password fields.");
      return;
    }
    setSaving(true);
    try {
      await updateUser({ password: securityData.newPassword });
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showSaveMessage("Password updated successfully!");
    } catch {
      showSaveMessage("Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  

  const tabs = [
    { id: "account", label: "Account", icon: <FaUser /> },
    { id: "security", label: "Security", icon: <FaLock /> },
    { id: "downloads", label: "Downloads", icon: <FaDownload /> },
    { id: "storage", label: "Storage", icon: <FaDatabase /> },
    { id: "delete", label: "Delete Account", icon: <FaTrash /> },
  ];

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

  // Parse used storage from stats (e.g., "12.5 MB" or "1.3 GB" -> MB)
  const usedMB = stats?.totalSize ? parseSizeToMB(stats.totalSize) : 0;
        const totalMB = 10 * 1024; // 10 GB limit in MB
  const usedPercent = totalMB > 0 ? Math.min((usedMB / totalMB) * 100, 100) : 0;

  return (
    <div className="page settings-page">
      <div className="container settings-shell">
        <section className="settings-header">
          <div>
            <span className="hero-pill">Settings</span>
            <h1>Account settings</h1>
            <p>Manage your account, security, and preferences.</p>
          </div>
        </section>

        {saveMessage && (
          <div className={`save-message ${saveMessage.includes("successfully") || saveMessage.includes("saved") ? "success" : "error"}`}>
            <FaCheck /> {saveMessage}
          </div>
        )}

        {downloadMessage && (
          <div className={`save-message ${downloadMessage.includes("successfully") || downloadMessage.includes("downloaded") ? "success" : "error"}`}>
            <FaCheck /> {downloadMessage}
          </div>
        )}

        <div className="settings-layout">
          <nav className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeTab === "account" && (
              <section className="settings-card">
                <h2>Account Information</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={accountData.username}
                      onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={accountData.phone}
                      onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      value={accountData.company}
                      onChange={(e) => setAccountData({ ...accountData, company: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="off"
                    />
                  </div>
                  <button className="save-btn" onClick={handleSaveAccount} disabled={saving}>
                    <FaSave /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}

            {activeTab === "delete" && (
              <section className="settings-card danger-zone">
                <h2>Delete Account</h2>
                <div className="settings-form">
                  <p className="danger-text">This will permanently remove your account, all documents, and all data. This action cannot be undone.</p>
                  <div className="form-group">
                    <label>Type your username to confirm</label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder={user?.username || "Username"}
                      autoComplete="off"
                    />
                  </div>
                  <p className="warning-text">Note: After deletion, this username will become available for new registrations.</p>
                  <button className="delete-account-btn" onClick={() => setShowDeleteAccountModal(true)} disabled={saving}>
                    <FaTrash /> {saving ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </section>
            )}

            {activeTab === "security" && (
              <section className="settings-card">
                <h2>Change Password</h2>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      onFocus={(e) => { e.target.setAttribute('readonly', 'true'); setTimeout(() => e.target.removeAttribute('readonly'), 0); }}
                      autoComplete="new-password"
                    />
                  </div>
                  <button className="save-btn" onClick={handleSaveSecurity} disabled={saving}>
                    <FaSave /> {saving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </section>
            )}


            {activeTab === "downloads" && (
              <div className="downloads-section">
                <section className="settings-card">
                  <div className="downloads-tab-header">
                    <div>
                      <h2>Downloaded Files</h2>
                      <p className="settings-card-desc">Files you have downloaded from DocuVault</p>
                    </div>
                    {downloads.length > 0 && !downloadsLoading && (
                      <button className="downloads-delete-all" onClick={() => setShowDeleteAllConfirm(true)} disabled={deletingAllDownloads}>
                        <FaTrash /> Delete All
                      </button>
                    )}
                  </div>
                  {showDeleteAllConfirm && downloads.length > 0 && (
                    <div className="downloads-delete-all-confirm">
                      <FaExclamationTriangle />
                      <span>Delete all {downloads.length} downloaded file(s)? This cannot be undone.</span>
                      <button className="confirm-yes" onClick={handleDeleteAllDownloads} disabled={deletingAllDownloads}>
                        {deletingAllDownloads ? "Deleting..." : "Yes"}
                      </button>
                      <button className="confirm-no" onClick={() => setShowDeleteAllConfirm(false)}>No</button>
                    </div>
                  )}
                  {downloadsLoading ? (
                    <div className="storage-loading">
                      <FaSpinner className="spinner" />
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
                          <div className="download-item-actions">
                           
                            {deleteDownloadId === (dl.id || dl._id) ? (
                              <div className="download-delete-confirm">
                                <button className="confirm-yes" onClick={() => handleDeleteDownload(dl.id || dl._id)} disabled={deletingDownload}>
                                  {deletingDownload ? "Deleting..." : "Yes"}
                                </button>
                                <button className="confirm-no" onClick={() => setDeleteDownloadId(null)}>No</button>
                              </div>
                            ) : (
                              <button className="download-item-delete" title="Delete" onClick={() => setDeleteDownloadId(dl.id || dl._id)}>
                                <FaTrash />
                              </button>
                            )}
                          </div>
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
                </section>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="storage-section">
                {/* Storage Overview Card */}
                <section className="settings-card">
                  <h2>Storage Management</h2>
                  <div className="storage-overview">
                    <div className="storage-bar-container">
                      <div className="storage-bar-header">
                        <div className="storage-bar-info">
                          <h3>Storage Used</h3>
                          <p className="storage-bar-amount">{formatMB(usedMB)}</p>
                        </div>
                        <span className="storage-bar-percentage">{Math.round(usedPercent)}%</span>
                      </div>
                      <div className="storage-bar">
                        <div className="storage-bar-fill" style={{ width: `${usedPercent}%` }} />
                      </div>
                      <div className="storage-bar-footer">
                        <span>{formatMB(usedMB)} used</span>
                        <span>{formatMB(totalMB)} total</span>
                      </div>
                      <p className="storage-usage-detail">
                        {documents.length} document{documents.length !== 1 ? "s" : ""} stored
                      </p>
                    </div>
                  </div>
                </section>

                {/* Download Cards */}
                
                {/* Document List with Download Buttons */}
                <section className="settings-card">
                  <h2>Uploaded Documents</h2>
                  {documentsLoading ? (
                    <div className="storage-loading">
                      <FaSpinner className="spinner" />
                      <p>Loading documents...</p>
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="storage-document-list">
                      {documents.map((doc) => (
                        <div key={doc.id || doc._id} className="storage-document-item">
                          <div className="storage-doc-icon" style={{ backgroundColor: `${getCategoryColor(doc.category)}15`, color: getCategoryColor(doc.category) }}>
                            <FaFileAlt />
                          </div>
                          <div className="storage-doc-info">
                            <span className="storage-doc-name">{doc.name}</span>
                            <span className="storage-doc-meta">{doc.category} • {doc.size}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="storage-empty">
                      <FaFileAlt className="storage-empty-icon" />
                      <p>No documents uploaded yet.</p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Downloads Modal */}
      {showDownloadsModal && (
        <div className="downloads-modal-overlay" onClick={() => { setShowDownloadsModal(false); setShowDeleteAllConfirm(false); }}>
          <div className="downloads-modal" onClick={(e) => e.stopPropagation()}>
            <div className="downloads-modal-header">
              <h2><FaDownload /> Downloaded Files</h2>
              <div className="downloads-modal-header-actions">
                {downloads.length > 0 && (
                  <button className="downloads-delete-all" onClick={() => setShowDeleteAllConfirm(true)} disabled={deletingAllDownloads}>
                    <FaTrash /> Delete All
                  </button>
                )}
                <button className="downloads-modal-close" onClick={() => { setShowDownloadsModal(false); setShowDeleteAllConfirm(false); }}><FaTimes /></button>
              </div>
            </div>
            <div className="downloads-modal-body">
              {showDeleteAllConfirm && downloads.length > 0 && (
                <div className="downloads-delete-all-confirm">
                  <FaExclamationTriangle />
                  <span>Delete all {downloads.length} downloaded file(s)? This cannot be undone.</span>
                  <button className="confirm-yes" onClick={handleDeleteAllDownloads} disabled={deletingAllDownloads}>
                    {deletingAllDownloads ? "Deleting..." : "Yes"}
                  </button>
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
                      {deleteDownloadId === (dl.id || dl._id) ? (
                        <div className="download-delete-confirm">
                          <span>Delete?</span>
                          <button className="confirm-yes" onClick={() => handleDeleteDownload(dl.id || dl._id)} disabled={deletingDownload}>
                            {deletingDownload ? "Deleting..." : "Yes"}
                          </button>
                          <button className="confirm-no" onClick={() => setDeleteDownloadId(null)}>No</button>
                        </div>
                      ) : (
                        <>
                          
                          <button className="download-item-delete" title="Delete" onClick={() => setDeleteDownloadId(dl.id || dl._id)}>
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

      {showDeleteAccountModal && (
        <div className="confirm-overlay" onClick={() => setShowDeleteAccountModal(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <FaExclamationTriangle className="confirm-icon" />
            <h3>Delete Account?</h3>
            <p>This will permanently remove your account, all documents, and all data. This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowDeleteAccountModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete" onClick={() => { setShowDeleteAccountModal(false); handleDeleteAccount(); }}>
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;