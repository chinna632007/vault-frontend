import "./documents.css";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaStar,
  FaTrash,
  FaEye,
  FaPlus,
  FaFileAlt,
  FaFilter,
  FaTimes,
  FaSpinner,
  FaEdit,
  FaCheck,
  FaDownload,
} from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

const CATEGORIES = [
  "Work",
  "Legal",
  "Identity",
  "Financial",
  "Health",
  "Education",
  "Personal",
  "Other",
];

function Documents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [favouriteFilter, setFavouriteFilter] = useState(
    searchParams.get("favourite") === "true"
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || "all"
  );
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState("");

  // Clear filters when navigating from sidebar
  useEffect(() => {
    if (location.state?.clearFilters) {
      setSearchTerm("");
      setFavouriteFilter(false);
      setCategoryFilter("all");
      setSearchParams({});
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setSearchParams]);

  // Sync state with URL search params when they change
  useEffect(() => {
    if (!location.state?.clearFilters) {
      setSearchTerm(searchParams.get("search") || "");
      setFavouriteFilter(searchParams.get("favourite") === "true");
      setCategoryFilter(searchParams.get("category") || "all");
    }
  }, [searchParams, location.state]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (favouriteFilter) params.append("favourite", "true");
      if (categoryFilter && categoryFilter !== "all")
        params.append("category", categoryFilter);
      const response = await api.get(`/documents?${params.toString()}`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, favouriteFilter, categoryFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const params = new URLSearchParams();
    if (val) params.append("search", val);
    if (favouriteFilter) params.append("favourite", "true");
    if (categoryFilter !== "all") params.append("category", categoryFilter);
    setSearchParams(params);
  };

  const toggleFavourite = async (doc) => {
    try {
      const docId = doc.id || doc._id;
      const newFavouriteStatus = !doc.favourite;

      // Update the document via API
      const response = await api.put(`/documents/${docId}`, { favourite: newFavouriteStatus });

      // Verify the update was successful
      if (response.data?.document) {
        // Update local state with the response from server
        setDocuments((docs) =>
          docs.map((d) => ((d.id || d._id) === docId ? { ...d, favourite: newFavouriteStatus } : d))
        );
      } else {
        // If response doesn't contain document, refresh the list
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Error updating favourite:", error);
      alert("Failed to update favourite. Please try again.");
      // Refresh on error to ensure consistency
      await fetchDocuments();
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((docs) => docs.filter((d) => (d.id || d._id) !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const startRename = (doc, e) => {
    e.stopPropagation();
    setRenamingId(doc.id || doc._id);
    setNewName(doc.name);
  };

  const handleRename = async (doc, e) => {
    e.stopPropagation();
    if (!newName.trim()) return;
    try {
      const docId = doc.id || doc._id;
      await api.put(`/documents/${docId}`, { name: newName.trim() });
      setDocuments((docs) =>
        docs.map((d) => ((d.id || d._id) === docId ? { ...d, name: newName.trim() } : d))
      );
      setRenamingId(null);
      setNewName("");
    } catch (error) {
      console.error("Error renaming document:", error);
    }
  };

  const cancelRename = (e) => {
    if (e) e.stopPropagation();
    setRenamingId(null);
    setNewName("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFavouriteFilter(false);
    setCategoryFilter("all");
    setSearchParams({});
  };

  return (
    <div className="page documents-page">
      <div className="container documents-shell">
        <section className="page-hero">
          <div>
            <span className="hero-pill">Document Library</span>
            <h1>Your document vault</h1>
            <p>Browse, search, and manage your documents.</p>
          </div>
          <Link to="/upload" className="upload-btn">
            <FaPlus /> Upload document
          </Link>
        </section>

        <section className="document-filters">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button
            className={`star-filter-btn ${favouriteFilter ? "active" : ""}`}
            onClick={() => setFavouriteFilter(!favouriteFilter)}
          >
            <FaStar /> Favourite
          </button>
        </section>

        <section className="category-filters">
          <div className="category-scroll">
            <button
              className={`category-btn ${categoryFilter === "all" ? "active" : ""}`}
              onClick={() => setCategoryFilter("all")}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${categoryFilter === cat.toLowerCase() ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat.toLowerCase())}
              >
                {cat}
              </button>
            ))}
          </div>
          {(categoryFilter !== "all" || favouriteFilter || searchTerm) && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FaTimes /> Clear filters
            </button>
          )}
        </section>

        <section className="documents-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="document-grid">
              {documents.map((doc) => (
                <div key={doc.id || doc._id} className="document-card" onClick={() => navigate(`/viewer/${doc.id || doc._id}`)} style={{ cursor: "pointer" }}>
                  <div className="doc-card-header">
                    <div
                      className="doc-icon"
                      style={{
                        backgroundColor: `${getCategoryColor(doc.category)}15`,
                        color: getCategoryColor(doc.category),
                      }}
                    >
                      <FaFileAlt />
                    </div>
                    <div className="doc-info">
                      {renamingId === doc.id ? (
                        <div className="rename-inline" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="rename-input"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(doc, e);
                              if (e.key === 'Escape') cancelRename(e);
                            }}
                          />
                          <button className="rename-confirm-btn" onClick={(e) => handleRename(doc, e)} title="Save">
                            <FaCheck />
                          </button>
                          <button className="rename-cancel-btn" onClick={(e) => cancelRename(e)} title="Cancel">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <h3 className="doc-name">{doc.name}</h3>
                      )}
                      <span
                        className="doc-category-badge"
                        style={{
                          backgroundColor: `${getCategoryColor(doc.category)}15`,
                          color: getCategoryColor(doc.category),
                        }}
                      >
                        {doc.category}
                      </span>
                    </div>
                  </div>
                  <div className="doc-meta">
                    <span>{doc.size}</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="doc-tags">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="doc-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="doc-actions">
                    <Link
                      to={`/viewer/${doc.id || doc._id}`}
                      className="doc-action-btn view"
                      title="View"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEye />
                    </Link>

                      <button
                        className={`doc-action-btn ${doc.favourite ? "favourite" : "star"}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavourite(doc); }}
                        title={doc.favourite ? "Unfavourite" : "Favourite"}
                      >
                      <FaStar />
                    </button>
                    <button
                      className="doc-action-btn rename"
                      onClick={(e) => startRename(doc, e)}
                      title="Rename"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="doc-action-btn delete"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(doc.id || doc._id); }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {deleteConfirm === (doc.id || doc._id) && (
                    <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                      <p>Move to trash?</p>
                      <div className="delete-confirm-actions">
                        <button
                          className="confirm-yes"
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc.id || doc._id); }}
                        >
                          Yes
                        </button>
                        <button
                          className="confirm-no"
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaFileAlt className="empty-icon" />
              <h3>No documents found</h3>
              <p>
                Try adjusting your search or filters, or upload a new document.
              </p>
              <Link to="/upload" className="primary-btn">
                Upload document
              </Link>
            </div>
          )}
        </section>
      </div>
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

export default Documents;