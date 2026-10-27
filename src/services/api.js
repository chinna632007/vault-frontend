import axios from "axios";

const defaultApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || ""
});

// JWT token interceptor — sends token in Authorization header
defaultApi.interceptors.request.use((config) => {
    const session = localStorage.getItem("docuvault-session");
    if (session) {
        try {
            const user = JSON.parse(session);
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } catch { }
    }
    return config;
});

// Error interceptor — extracts error message from response body
defaultApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.error) {
            error.message = error.response.data.error;
        }
        return Promise.reject(error);
    }
);

const mockDelay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldUseMock = import.meta.env.VITE_USE_MOCK === "true";

// Read a File/Blob into a base64 data URL, so mock mode can persist the ORIGINAL
// file bytes and later return them on download (mirrors the real backend's disk).
const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });

// Convert a stored base64 data URL back into a Blob with the correct MIME type.
const dataURLToBlob = (dataUrl) => {
    const [meta, b64] = dataUrl.split(",");
    const mime = (meta.match(/data:([^;]+)/) || [])[1] || "application/octet-stream";
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
};

// Format a byte count into a human readable size (mirrors the Upload page).
const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const SESSION_KEY = "docuvault-session";
const USER_DB_KEY = "docuvault-users";

const getStoredSessionUser = () => {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const getStoredUsers = () => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(USER_DB_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveUsers = (users) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
};

const getDocumentsKey = (userId) => `docuvault-documents-${userId}`;
const getTrashKey = (userId) => `docuvault-trash-${userId}`;

const getStoredDocuments = (userId) => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(getDocumentsKey(userId));
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveDocuments = (userId, docs) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getDocumentsKey(userId), JSON.stringify(docs));
};

const getStoredTrash = (userId) => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(getTrashKey(userId));
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveTrash = (userId, items) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(getTrashKey(userId), JSON.stringify(items));
};

const sanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
};

const getCategoryColor = (category) => {
    const colors = {
        "Work": "#2563eb",
        "Legal": "#8b5cf6",
        "Identity": "#10b981",
        "Financial": "#f59e0b",
        "Health": "#ef4444",
        "Education": "#06b6d4",
        "Personal": "#ec4899",
        "Other": "#64748b"
    };
    return colors[category] || "#64748b";
};

const mockRequest = async (url, method = "get", data = null, config = {}) => {
    await mockDelay();

    const sessionUser = getStoredSessionUser();
    const currentUserId = sessionUser?.id;

    if (url.includes("/auth/login")) {
        const { username, password } = data || {};
        const users = getStoredUsers();
        const storedUser = users.find((user) => user.username === username && user.password === password);

        if (storedUser) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeUser(storedUser)));
            return { data: { user: sanitizeUser(storedUser), token: "demo-token" } };
        }

        throw new Error("Invalid username or password");
    }

    if (url.includes("/auth/register")) {
        const users = getStoredUsers();
        const existingUsername = users.find((user) => user.username === data?.username);
        if (existingUsername) {
            throw new Error("Username already taken");
        }

        const user = {
            id: Date.now(),
            username: data?.username || "newuser",
            email: data?.email || "user@example.com",
            phone: data?.phone || "",
            password: data?.password || "",
            plan: "Free",
            avatar: null,
            company: "",
            storageUsed: 0,
                        storageTotal: 10,
            joinedAt: new Date().toISOString().split("T")[0]
           
        };
        saveUsers([...users, user]);
        localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeUser(user)));
        return { data: { user: sanitizeUser(user), message: "Registration successful" } };
    }

    // --- MOCK / DEMO ONLY — no real backend available ---
    if (url.includes("/auth/forgot-password")) {
        // Simulates a backend that could not send the reset email.
        const demoToken = "demo-token-" + Math.random().toString(36).slice(2, 12);
        return {
            data: {
                demo: true,
                message: "Demo mode: email could not be sent. Use the simulated reset link below.",
                resetUrl: `${window.location.origin}/reset-password?token=${demoToken}`,
            },
        };
    }
    if (url.includes("/auth/reset-password")) {
        // Simulates a successful password reset (no real token validation offline).
        return { data: { message: "Demo mode: password reset simulated successfully." } };
    }

    if (url.includes("/auth/me") && method === "put") {
        const users = getStoredUsers();
        if (!sessionUser) throw new Error("Not authenticated");

        // Check if username is being changed and if it's already taken
        if (data.username && data.username !== sessionUser.username) {
            const existingUsername = users.find((user) => user.username === data.username && user.id !== sessionUser.id);
            if (existingUsername) {
                throw new Error("Username already taken");
            }
        }

        const idx = users.findIndex(u => u.id === sessionUser.id);
        if (idx >= 0) {
            users[idx] = { ...users[idx], ...data };
            saveUsers(users);
            localStorage.setItem(SESSION_KEY, JSON.stringify(sanitizeUser(users[idx])));
        }
        return { data: { user: { ...sessionUser, ...data }, message: "Profile updated" } };
    }

    if (url.includes("/auth/me")) {
        return { data: { user: sanitizeUser(getStoredSessionUser()) } };
    }

    if (url.includes("/auth/logout")) {
        localStorage.removeItem(SESSION_KEY);
        return { data: { success: true } };
    }

    if (url.includes("/auth/account") && method === "delete") {
        if (!sessionUser) throw new Error("Not authenticated");
        const users = getStoredUsers();
        const updatedUsers = users.filter(u => u.id !== sessionUser.id);
        saveUsers(updatedUsers);
        localStorage.removeItem(SESSION_KEY);
        const docsKey = getDocumentsKey(sessionUser.id);
        const trashKey = getTrashKey(sessionUser.id);
        localStorage.removeItem(docsKey);
        localStorage.removeItem(trashKey);
        return { data: { success: true, message: "Account deleted successfully" } };
    }

    // Download document file
    if (url.match(/\/documents\/[^/]+\/download$/) && method === "get") {
        const docs = getStoredDocuments(currentUserId);
        const id = url.split("/").filter(s => s && !["documents", "download"].includes(s)).pop();
        const doc = docs.find(d => d.id.toString() === id);
        if (!doc) throw new Error("Document not found");

        // Return the ORIGINAL uploaded file bytes when they were stored, so the
        // downloaded file shows the real document (matches the real backend).
        if (doc.fileData) {
            const blob = dataURLToBlob(doc.fileData);
            return {
                data: blob,
                headers: {
                    "content-type": blob.type,
                    "content-disposition": `attachment; filename="${encodeURIComponent(doc.name)}"`
                }
            };
        }

        const content = [
            `Document Name: ${doc.name}`,
            `Type: ${doc.type}`,
            `Size: ${doc.size}`,
            `Category: ${doc.category}`,
            `Uploaded: ${doc.uploadedAt}`,
            `Tags: ${(doc.tags || []).join(", ")}`,
            `\nNote: Mock mode - original file content is not available.`,
        ].join("\n");
        return {
            data: new Blob([content], { type: "text/plain" }),
            headers: {
                "content-type": "text/plain",
                "content-disposition": `attachment; filename="${doc.name}.txt"`
            }
        };
    }

    if (url.includes("/documents") && method === "get") {
        const docs = getStoredDocuments(currentUserId);
        const params = new URLSearchParams(url.split("?")[1] || "");
        const category = params.get("category");
        const search = params.get("search")?.toLowerCase();
        const favourite = params.get("favourite");

        let filtered = [...docs];
        if (category && category !== "all") {
            filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            filtered = filtered.filter(d => d.name.toLowerCase().includes(search) || d.tags.some(t => t.includes(search)));
        }
        if (favourite === "true") {
            filtered = filtered.filter(d => d.favourite);
        }
        return { data: { documents: filtered, total: filtered.length } };
    }

    if (url.includes("/documents") && method === "post") {
        const docs = getStoredDocuments(currentUserId);

        // Capture the actually-uploaded file bytes so mock downloads can return
        // the ORIGINAL document (mirrors multer saving to disk on the real backend).
        const file = data?.get ? data.get("file") : null;
        let fileData = null;
        let realName = data?.name || "Untitled Document";
        let realType = data?.type || "pdf";
        let realSize = data?.size || "0 KB";
        if (file && typeof file !== "string") {
            try {
                fileData = await fileToDataURL(file);
                realName = file.name || realName;
                realType = (file.name.split(".").pop() || realType).toLowerCase();
                realSize = formatSize(file.size);
            } catch (e) {
                console.error("Failed to store file bytes in mock mode:", e);
            }
        }

        const newDoc = {
            id: Date.now(),
            name: realName,
            type: realType,
            size: realSize,
            category: data?.category || "Other",
            uploadedAt: new Date().toISOString().split("T")[0],
            favourite: false,
            tags: data?.tags || [],
            verified: false,
            fileData,
        };
        saveDocuments(currentUserId, [...docs, newDoc]);
        return { data: { document: newDoc, message: "Document uploaded successfully" } };
    }

    if (url.match(/\/documents\/[^/]+\/?$/) && method === "put") {
        const docs = getStoredDocuments(currentUserId);
        const id = url.split("/").filter(s => s && s !== "documents").pop();
        const updated = docs.map(d => d.id.toString() === id ? { ...d, ...data } : d);
        saveDocuments(currentUserId, updated);
        return { data: { document: updated.find(d => d.id.toString() === id), message: "Document updated" } };
    }

    if (url.match(/\/documents\/[^/]+\/?$/) && method === "delete") {
        const docs = getStoredDocuments(currentUserId);
        const id = url.split("/").filter(s => s && s !== "documents").pop();
        const deleted = docs.find(d => d.id.toString() === id);
        saveDocuments(currentUserId, docs.filter(d => d.id.toString() !== id));
        if (deleted) {
            const trash = getStoredTrash(currentUserId);
            // Drop the stored file bytes when a document is deleted, so the original
            // file is removed from the server (mirrors deleteFileFromDisk on the backend).
            const { fileData, ...rest } = deleted;
            saveTrash(currentUserId, [...trash, { ...rest, deletedAt: new Date().toISOString() }]);
        }
        return { data: { success: true, message: "Document moved to trash" } };
    }

    if (url.includes("/trash") && method === "get") {
        // Auto-delete items older than 30 days (mirrors the backend's cleanup task)
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const freshTrash = getStoredTrash(currentUserId).filter(
            (item) => new Date(item.deletedAt) >= cutoff
        );
        if (freshTrash.length !== getStoredTrash(currentUserId).length) {
            saveTrash(currentUserId, freshTrash);
        }
        return { data: { items: freshTrash } };
    }

    if (url.includes("/trash/restore") && method === "post") {
        const trash = getStoredTrash(currentUserId);
        const id = data?.id;
        const restored = trash.find(t => t.id === id);
        saveTrash(currentUserId, trash.filter(t => t.id !== id));
        if (restored) {
            const docs = getStoredDocuments(currentUserId);
            saveDocuments(currentUserId, [...docs, { ...restored, deletedAt: undefined }]);
        }
        return { data: { success: true, message: "Document restored" } };
    }

    if (url.includes("/trash/empty") && method === "delete") {
        saveTrash(currentUserId, []);
        return { data: { success: true, message: "Trash emptied" } };
    }

    if (url.match(/\/trash\/[^/]+\/permanent$/) && method === "delete") {
        const trash = getStoredTrash(currentUserId);
        const id = url.split("/").filter(s => s && !["trash", "permanent"].includes(s)).pop();
        // Permanently delete the item — the doc record (and any stored file bytes)
        // are removed, so the file no longer exists on the "server".
        saveTrash(currentUserId, trash.filter(t => t.id.toString() !== id));
        return { data: { success: true, message: "Document permanently deleted" } };
    }

    // Downloads endpoints
    if (url.includes("/downloads")) {
        const downloadKey = `docuvault-downloads-${currentUserId}`;
        const getDownloads = () => {
            try {
                const stored = localStorage.getItem(downloadKey);
                return stored ? JSON.parse(stored) : [];
            } catch { return []; }
        };
        const saveDownloads = (items) => {
            localStorage.setItem(downloadKey, JSON.stringify(items));
        };

        if (method === "get") {
            return { data: { downloads: getDownloads() } };
        }

        if (method === "post") {
            const downloads = getDownloads();
            const newDownload = {
                id: Date.now(),
                documentId: data?.documentId || null,
                name: data?.name || "Unknown Document",
                type: data?.type || "pdf",
                size: data?.size || "0 KB",
                category: data?.category || "Other",
                downloadedAt: new Date().toISOString().split("T")[0],
            };
            saveDownloads([newDownload, ...downloads]);
            return { data: { download: newDownload } };
        }

        if (url.match(/\/downloads\/\d+/) && method === "delete") {
            const id = parseInt(url.split("/").pop());
            const downloads = getDownloads();
            saveDownloads(downloads.filter(d => d.id !== id));
            return { data: { success: true, message: "Download record deleted" } };
        }

        if (url.replace(/\/+$/, "").endsWith("/downloads") && method === "delete") {
            saveDownloads([]);
            return { data: { success: true, message: "All download records deleted" } };
        }
    }

    if (url.includes("/stats")) {
        const docs = getStoredDocuments(currentUserId);
        const trash = getStoredTrash(currentUserId);
        const categories = [...new Set(docs.map(d => d.category))];

        // Calculate unique downloaded documents
        let downloadCount = 0;
        try {
            const storedDownloads = localStorage.getItem(`docuvault-downloads-${currentUserId}`);
            if (storedDownloads) {
                const downloads = JSON.parse(storedDownloads);
                const uniqueDocIds = new Set(downloads.map(d => d.documentId).filter(Boolean));
                downloadCount = uniqueDocIds.size;
            }
        } catch (e) {
            downloadCount = 0;
        }

        return {
            data: {
                stats: {
                    totalDocuments: docs.length,
                    totalSize: docs.reduce((acc, d) => {
                        const size = parseFloat(d.size) || 0;
                        return acc + (d.size.includes("MB") ? size : size / 1024);
                    }, 0).toFixed(1) + " MB",
                    categories: categories.length,
                    favourite: docs.filter(d => d.favourite).length,
                    downloads: downloadCount,
                    trash: trash.length,
                    recentActivity: docs.filter(d => {
                        const uploaded = new Date(d.uploadedAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return uploaded >= weekAgo;
                    }).length
                }
            }
        };
    }

    if (url.includes("/wallet")) {
        const docs = getStoredDocuments(currentUserId);
        const categories = [...new Set(docs.map(d => d.category))];
        const categoryBreakdown = categories.map(cat => ({
            name: cat,
            count: docs.filter(d => d.category === cat).length,
            color: getCategoryColor(cat)
        }));
        const recentDocs = [...docs].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5);
        return {
            data: {
                wallet: {
                    totalDocuments: docs.length,
                    totalSize: docs.reduce((acc, d) => {
                        const size = parseFloat(d.size) || 0;
                        return acc + (d.size.includes("MB") ? size : size / 1024);
                    }, 0).toFixed(1) + " MB",
                    categories: categories.length,
                    favourite: docs.filter(d => d.favourite).length,
                    downloads: (() => {
                      try {
                        const stored = localStorage.getItem(`docuvault-downloads-${currentUserId}`);
                        return stored ? JSON.parse(stored).length : 0;
                      } catch { return 0; }
                    })(),
                    categoryBreakdown,
                    recentDocuments: recentDocs,
                    lastBackup: new Date().toISOString().split("T")[0]
                }
            }
        };
    }

    return { data: { success: true, data } };
};

const api = {
    async get(url, config = {}) {
        if (shouldUseMock) return mockRequest(url, "get", null, config);
        return defaultApi.get(url, config);
    },
    async post(url, data) {
        if (shouldUseMock) return mockRequest(url, "post", data);
        return defaultApi.post(url, data);
    },
    async postFile(url, formData, config = {}) {
        if (shouldUseMock) return mockRequest(url, "post", formData);
        // Do NOT set Content-Type manually — axios/browser must append the multipart
        // boundary so multer can parse the file on the server.
        return defaultApi.post(url, formData, config);
    },
    async put(url, data) {
        if (shouldUseMock) return mockRequest(url, "put", data);
        return defaultApi.put(url, data);
    },
    async delete(url) {
        if (shouldUseMock) return mockRequest(url, "delete");
        return defaultApi.delete(url);
    }
};

export default api;
