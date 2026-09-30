 import "./profile.css";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaCog,
  FaFileAlt,
  FaStar,
  FaCalendar,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaSpinner,
  FaWallet,
  FaDownload,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/authcontext";
import { formatMB } from "../../utils/storage";

function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docCount, setDocCount] = useState(0);
  const [favouriteCount, setFavouriteCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
    const [storageData, setStorageData] = useState({ usedMB: 0, totalGB: 10 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, docsRes, statsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/documents"),
          api.get("/stats"),
        ]);
        setUserData(userRes.data.user);
        setDocCount(docsRes.data.documents.length);
        setFavouriteCount(
          docsRes.data.documents.filter((d) => d.favourite).length
        );
        setDownloadCount(statsRes.data.stats.downloads || 0);

        // Calculate real storage usage from document sizes
        const docs = docsRes.data.documents;
        let totalBytes = 0;
        docs.forEach((doc) => {
          if (doc.size) {
            const sizeStr = doc.size.toString().toUpperCase();
            const num = parseFloat(sizeStr) || 0;
            if (sizeStr.includes("GB")) totalBytes += num * 1024 * 1024 * 1024;
            else if (sizeStr.includes("MB")) totalBytes += num * 1024 * 1024;
            else if (sizeStr.includes("KB")) totalBytes += num * 1024;
            else totalBytes += num;
          }
        });
        const usedMB = totalBytes / (1024 * 1024);
        setStorageData({
          usedMB,
                                        totalGB: 10,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="container profile-shell">
          <div className="profile-grid">
            <div className="profile-card main-card">
              <div className="skeleton" style={{ width: 100, height: 100, borderRadius: "50%", margin: "0 auto 20px" }} />
              <div className="skeleton" style={{ width: 160, height: 28, borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 200, height: 20, borderRadius: 8 }} />
            </div>
            <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
            <div className="skeleton" style={{ height: 150, borderRadius: 20 }} />
          </div>
        </div>
      </div>
    );
  }

  const initials = (userData?.username || "U").charAt(0).toUpperCase();

  return (
    <div className="page profile-page">
      <div className="container profile-shell">
        <div className="profile-grid">
          <section className="profile-card main-card">
            <div className="profile-avatar-large">
              {userData?.avatar ? (
                <img src={userData.avatar} alt="User Avatar" />
              ) : (
                <span className="avatar-initials">{initials}</span>
              )}
            </div>
            <h1 className="profile-name">{userData?.username || "User"}</h1>
            {userData?.email && (
              <p className="profile-role">{userData.email}</p>
            )}
            {userData?.company && (
              <p className="profile-company">{userData.company}</p>
            )}
            <Link to="/settings" className="edit-btn">
              <FaCog /> Account Settings
            </Link>
          </section>

          <section className="profile-card details-card">
            <h2>Account Details</h2>
            <ul className="details-list">
              <li>
                <FaEnvelope className="detail-icon" />
                <span>
                  <strong>Email:</strong> {userData?.email}
                </span>
              </li>
              <li>
                <FaUser className="detail-icon" />
                <span>
                  <strong>Username:</strong> {userData?.username}
                </span>
              </li>
              {userData?.phone && (
                <li>
                  <FaPhone className="detail-icon" />
                  <span>
                    <strong>Phone:</strong> {userData.phone}
                  </span>
                </li>
              )}
              {userData?.company && (
                <li>
                  <FaBuilding className="detail-icon company-icon" />
                  <span>
                    <strong>Company:</strong> {userData.company}
                  </span>
                </li>
              )}
              <li>
                <FaCalendar className="detail-icon" />
                <span>
                  <strong>Joined:</strong> {userData?.joinedAt || "N/A"}
                </span>
              </li>
            </ul>
          </section>

          <section className="profile-card stats-card">
            <h2>Activity Overview</h2>
            <div className="activity-stats">
              <div className="activity-stat">
                <FaFileAlt className="activity-icon" />
                <div>
                  <span className="activity-value">{docCount}</span>
                  <span className="activity-label">Documents</span>
                </div>
              </div>
              <div className="activity-stat">
                <FaStar className="activity-icon" />
                <div>
                  <span className="activity-value">{favouriteCount}</span>
                  <span className="activity-label">Favourite</span>
                </div>
              </div>
              <div className="activity-stat">
                <FaDownload className="activity-icon" />
                <div>
                  <span className="activity-value">{downloadCount}</span>
                  <span className="activity-label">Downloads</span>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card storage-card">
            <h2>Storage</h2>
            <div className="storage-details">
              <div className="storage-bar-large">
                <div
                  className="storage-bar-fill-large"
                  style={{
                    width: `${Math.min(
                      (storageData.usedMB / (storageData.totalGB * 1024)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p>
                {formatMB(storageData.usedMB)} used of{" "}
                {storageData.totalGB} GB
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;