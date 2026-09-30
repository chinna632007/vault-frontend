import "./upload.css";
import {
  FaUpload,
  FaFileAlt,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import { useState, useCallback, useEffect } from "react";
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

function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [progress, setProgress] = useState(0);

  // Prevent the browser's default behaviour (opening/downloading the file) when a
  // file is dropped anywhere OUTSIDE the drop zone. Without this, dropping a file
  // elsewhere on the page makes the browser open/download it automatically.
  useEffect(() => {
    const preventBrowserNavigation = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", preventBrowserNavigation);
    window.addEventListener("drop", preventBrowserNavigation);
    return () => {
      window.removeEventListener("dragover", preventBrowserNavigation);
      window.removeEventListener("drop", preventBrowserNavigation);
    };
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setProgress(0);
      setUploadSuccess(false);
      setError("");
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProgress(0);
      setUploadSuccess(false);
      setError("");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (name) => {
    return name.split(".").pop().toLowerCase();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("name", selectedFile.name);
        formData.append("type", getFileType(selectedFile.name));
        formData.append("size", formatFileSize(selectedFile.size));
        formData.append("category", category);
        formData.append("tags", tags.split(",").map((t) => t.trim()).filter((t) => t).join(","));
        // Use real upload progress from the browser instead of a fake timer.
        await api.postFile("/documents", formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setProgress(Math.min(percent, 99));
            }
          },
        });
      setProgress(100);
      setUploadSuccess(true);
      setSelectedFile(null);
      setTags("");
      setCategory("Other");
    } catch (err) {
      setError("File upload failed. Please try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page upload-page">
      <div className="container">
        <section className="page-hero">
          <div>
            <span className="hero-pill">Upload Center</span>
            <h1>Upload documents</h1>
            <p>Add documents to your secure vault.</p>
          </div>
        </section>
        <section className="upload-content">
          <div
            className={`drop-zone ${dragActive ? "active" : ""} ${selectedFile ? "has-file" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input").click()}
          >
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {selectedFile ? (
              <div className="file-preview">
                <FaFileAlt className="preview-icon" />
                <div className="file-details">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">
                    {formatFileSize(selectedFile.size)}
                  </span>
                  <span className="file-type">
                    {getFileType(selectedFile.name).toUpperCase()}
                  </span>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <>
                <FaUpload className="drop-icon" />
                <p className="drop-text">
                  Drag and drop files here, or click to browse
                </p>
                <p className="drop-subtext">
                  Supports PDF, DOC, DOCX, JPG, PNG, and more
                </p>
              </>
            )}
          </div>

          {selectedFile && !uploadSuccess && (
            <div className="upload-form">
              <div className="form-group">
                <label>Category</label>
                <div className="select-wrapper">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. work, contract, 2025"
                />
              </div>
              <div className="upload-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">{Math.round(progress)}%</span>
              </div>
              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="spinner" /> Uploading...
                  </>
                ) : (
                  "Upload Document"
                )}
              </button>
            </div>
          )}

          {uploadSuccess && (
            <div className="success-message">
              <FaCheckCircle />
              <div>
                <h3>Upload successful!</h3>
                <p>Your document has been added to your vault.</p>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </section>
      </div>
    </div>
  );
}

export default Upload;
