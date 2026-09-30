import "./trash.css";
import { FaTrash, FaUndo, FaExclamationTriangle } from "react-icons/fa";
import { useState, useEffect } from "react";
import api from "../../services/api";

// How long (in days) items stay in the trash before being auto-deleted.
const TRASH_RETENTION_DAYS = 30;

/** Days left before an item is auto-permanently-deleted from trash. */
const getDaysRemaining = (deletedAt) => {
  if (!deletedAt) return TRASH_RETENTION_DAYS;
  const msElapsed = Date.now() - new Date(deletedAt).getTime();
  const daysElapsed = Math.floor(msElapsed / (24 * 60 * 60 * 1000));
  return TRASH_RETENTION_DAYS - daysElapsed;
};

function Trash() {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);

  const fetchTrashItems = async () => {
    try {
      const response = await api.get("/trash");
      setTrashItems(response.data.items);
    } catch (error) {
      console.error("Error fetching trash items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.post("/trash/restore", { id });
      setTrashItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error restoring item:", error);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await api.delete(`/trash/${id}/permanent`);
      setTrashItems(items => items.filter(item => item.id !== id));
      setPermanentDeleteId(null);
    } catch (error) {
      console.error("Error permanently deleting:", error);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await api.delete("/trash/empty");
      setTrashItems([]);
      setShowConfirm(false);
    } catch (error) {
      console.error("Error emptying trash:", error);
    }
  };

  if (loading) {
    return (
      <div className="page trash-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading trash...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page trash-page">
      <div className="container">
        <section className="page-hero">
          <div>
            <span className="hero-pill">Recycle Bin</span>
            <h1>Trash</h1>
            <p>Manage your deleted documents. Items are kept for 30 days.</p>
          </div>
          {trashItems.length > 0 && (
            <button className="empty-trash-btn" onClick={() => setShowConfirm(true)}>
              <FaTrash /> Empty Trash
            </button>
          )}
          <div className="auto-delete-notice">
            <FaExclamationTriangle className="notice-icon" />
            <span>
              Items in trash are <strong>automatically and permanently deleted after 30 days</strong>.
              Restore anything you need before then.
            </span>
          </div>
        </section>
        <section className="trash-content">
          {trashItems.length > 0 ? (
            <div className="trash-grid">
              {trashItems.map((item) => {
                const daysLeft = getDaysRemaining(item.deletedAt);
                const isExpiringSoon = daysLeft <= 7;
                const isExpired = daysLeft <= 0;
                return (
                  <div key={item.id} className={`trash-item ${isExpiringSoon ? "expiring-soon" : ""} ${isExpired ? "expired" : ""}`.trim()}>
                    <div className="trash-item-header">
                      <FaTrash className="trash-icon" />
                      <h3>{item.name}</h3>
                    </div>
                    <p className="trash-meta">{item.category} • Deleted {formatDate(item.deletedAt)}</p>
                    <div className={`trash-days-badge ${isExpired ? "expired" : isExpiringSoon ? "warning" : "safe"}`}>
                      <FaExclamationTriangle className="days-icon" />
                      <span>
                        {isExpired ? "Expired — auto-delete pending" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                      </span>
                    </div>
                    <div className="trash-actions">
                      <button className="restore-btn" onClick={() => handleRestore(item.id)}>
                        <FaUndo /> Restore
                      </button>
                      <button className="permanent-delete-btn" onClick={() => setPermanentDeleteId(item.id)} title="Delete permanently">
                        <FaTrash /> Delete Permanently
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <FaTrash className="empty-icon" />
              <h3>Trash is empty</h3>
              <p>Your trash is empty. Deleted documents will appear here if you remove them from your vault.</p>
            </div>
          )}
        </section>

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <FaExclamationTriangle className="confirm-icon" />
              <h3>Empty Trash?</h3>
              <p>This will permanently delete all {trashItems.length} items. This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="confirm-delete" onClick={handleEmptyTrash}>Empty Trash</button>
              </div>
            </div>
          </div>
        )}

        {permanentDeleteId && (
          <div className="confirm-overlay" onClick={() => setPermanentDeleteId(null)}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <FaExclamationTriangle className="confirm-icon" />
              <h3>Delete Permanently?</h3>
              <p>This document will be permanently deleted. This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="confirm-cancel" onClick={() => setPermanentDeleteId(null)}>Cancel</button>
                <button className="confirm-delete" onClick={() => handlePermanentDelete(permanentDeleteId)}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default Trash;