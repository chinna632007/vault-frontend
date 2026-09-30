# DocuVault — Programming Code Documentation (Line-by-Line)

> A code-level walkthrough of the DocuVault project: how every file is written, what each line does, how the backend and frontend connect, and how every page works. This complements `DOCUMENTATION.md` (which covers what the app is and how to run it).

> **See also:** [`FLOWCHART.md`](./FLOWCHART.md) — a visual flowchart of the entire project, and [`DOCUMENTATION.md`](./DOCUMENTATION.md) for the high-level overview.

### Table of Contents
1. Two Apps Talking to Each Other
2. Project Folder Structure
3. The Backend Code
4. Request Lifecycle
5. The Frontend Core
6. Every Page Explained
7. Mock Mode vs Real Backend
8. End-to-End Trace
9. Glossary & Common Modifications

---

## 1. Two Separate Apps Talking to Each Other

```
 FRONTEND (React in the browser)             BACKEND (Node/Express + MongoDB)
 renders UI · sends HTTP via api.js  ──────►  /auth /documents /trash /stats /wallet /downloads
 asks for JSON + file Blobs ◄──────────────  talks to MongoDB, saves files in uploads/
```

Two flavours: a real backend (set `VITE_API_URL`) and a mock backend (entirely in `localStorage` when `VITE_API_URL` is blank).

---

## 2. Project Folder Structure

```
vault/                         frontend (React/Vite)
├── .env                       VITE_API_URL  (where the backend is)
├── package.json               frontend deps + scripts
├── vite.config.js             dev-server settings
├── index.html                 HTML shell with <div id="root">
├── src/
│   ├── main.jsx               React entry (renders <App/>)
│   ├── App.jsx                all routes + protected/public guards
│   ├── services/api.js        API client + full mock backend
│   ├── context/authcontext    global login/logout state
│   ├── utils/storage.js       GB/MB/KB conversion helpers
│   ├── components/            navbar, sidebar, footer
│   ├── layouts/               authlayout, mainlayout
│   └── pages/                 one folder per screen (.jsx + .css)

Backend/                       backend (separate Node server)
├── .env                       JWT_SECRET, PORT, MONGO_URI
├── package.json               backend deps
├── server.js                  Express entry point
├── config/db.js               MongoDB connection
├── middleware/auth.js         JWT authentication check
├── models/                    User, Document, Trash, Download (Mongoose)
├── controllers/               auth, document, trash, stats, download logic
├── routes/                    auth, documents, trash, stats, wallet, downloads
└── uploads/                   uploaded files stored on disk
```

### The dependencies that matter

**Frontend** (`"type":"module"`, React 19 + Vite 8 + Tailwind 3.4):
```json
"dependencies":{ "axios":"^1.18","react":"^19","react-dom":"^19",
  "react-icons":"^5.7","react-router-dom":"^7.18" },
"devDependencies":{ "vite":"^8.1","tailwindcss":"^3.4",
  "@vitejs/plugin-react":"^6.0","postcss","autoprefixer" }
```
**Backend** (`"type":"commonjs"`, Express 5 + Mongoose 9 + bcryptjs + jsonwebtoken + multer):
```json
"dependencies":{ "bcryptjs","cors","dotenv","express","jsonwebtoken","mongoose","multer" }
```

## 3. The Backend Code

### 3.1 `Backend/server.js` — the server entry point
Loads config → builds Express → connects MongoDB → middleware → routes → listens.
```js
require("dotenv").config();          // Backend/.env → process.env (PORT, JWT_SECRET, MONGO_URI)
const express = require("express");  // web framework
const cors = require("cors");        // allow the browser frontend to call this API
const path = require("path");        // join file paths
const connectDB = require("./config/db");
const User = require("./models/User");
const trashController = require("./controllers/trashController");
const app = express();
const PORT = process.env.PORT || 3000;
const TRASH_CLEANUP_INTERVAL = 60 * 60 * 1000; // run the trash auto-cleanup every hour
```
After the DB connects, enforce the 10 GB storage limit, run the trash auto-cleanup once, then schedule it hourly so trashed items older than 30 days are permanently deleted:
```js
connectDB().then(async () => {
  const result = await User.updateMany({ storageTotal:{ $ne:10 } },{ $set:{storageTotal:10} });
  console.log(`[OK] Storage limit set to 10 GB (updated ${result.modifiedCount||0} user(s))`);
  await trashController.cleanupExpiredTrash();             // purge expired trash on startup
  setInterval(() => trashController.cleanupExpiredTrash(), // ...then every hour
    TRASH_CLEANUP_INTERVAL);
});
```
Middleware (runs in order on every request):
```js
app.use(cors({ exposedHeaders:["Content-Disposition","Content-Type"] })); // let browser read download filename
app.use(express.json());   // parse JSON bodies → req.body
app.use((req,res,next) => {                 // request logger
  const start = Date.now();
  console.log(`\n>>> ${req.method} ${req.url} - ${new Date().toISOString()}`);
  if (req.body && Object.keys(req.body).length) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "[REDACTED]";
    console.log("    Body:", JSON.stringify(logBody,null,2));
  }
  res.on("finish", () => console.log(`<<< ${req.method} ${req.url} - ${res.statusCode} - ${Date.now()-start}ms`));
  next();
});
app.use(express.static(path.join(__dirname,"uploads"))); // serve uploaded files as static URLs
```
Mount routers, plus a health check and global error handler:
```js
app.use("/auth", require("./routes/auth"));
app.use("/documents", require("./routes/documents"));
app.use("/trash", require("./routes/trash"));
app.use("/stats", require("./routes/stats"));
app.use("/wallet", require("./routes/wallet"));
app.use("/downloads", require("./routes/downloads"));
app.get("/", (req,res) => res.json({ message:"DocuVault Backend API is running" }));
app.use((err,req,res,next) => { console.error("[FAIL] Unhandled error:",err); res.status(500).json({error:"Internal server error"}); });
app.listen(PORT,"0.0.0.0", () => console.log(`DocuVault backend running on http://localhost:${PORT}`));
// 0.0.0.0 = listen on all interfaces so other devices can reach the server
```

### 3.2 `Backend/config/db.js`
```js
const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/docuvault");
    console.log("MongoDB connected successfully");
  } catch (err) { console.error("MongoDB connection error:",err.message); process.exit(1); }
};
module.exports = connectDB;
```
`mongoose.connect(url)` opens the DB; if it throws, `process.exit(1)` stops the server immediately.

### 3.3 `Backend/models/User.js` (and Document / Trash / Download)
```js
const userSchema = new mongoose.Schema({
  username: { type:String, required:true, unique:true },
  email:    { type:String, required:true, unique:true },
  password: { type:String, required:true },
  phone:    { type:String, default:"" },
  plan:     { type:String, default:"Free" },
  avatar:   { type:String, default:null },
  company:  { type:String, default:"" },
  storageUsed:  { type:Number, default:0 },
  storageTotal: { type:Number, default:10 },   // 10 GB cap
  joinedAt: { type:String, default:()=>new Date().toISOString().split("T")[0] },
},{ timestamps:true });   // auto adds createdAt / updatedAt
```
Mongo's `_id` is an object; the frontend wants a string, so a virtual adds `id` and `toJSON:{virtuals:true}` includes it:
```js
userSchema.virtual("id").get(function(){ return this._id.toString(); });
userSchema.set("toJSON",{ virtuals:true });
module.exports = mongoose.model("User", userSchema);
```
Document/Trash/Download follow the same pattern. Key Document fields: `userId` (owner), `name`, `type`, `size`, `category`, `uploadedAt`, `favourite`, `tags`, `verified`, `filePath` (filename on disk). Every document is scoped to `userId`, which is why users only ever see their own files.


### 3.4 `Backend/middleware/auth.js`
Runs before protected handlers; stops the request if no valid JWT.
```js
const jwt = require("jsonwebtoken");
const authenticateToken = (req,res,next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];   // "Bearer <token>" → part 2
  if (!token && req.query.token) token = req.query.token; // fallback for ?token= links
  if (!token) return res.status(401).json({error:"Access token required"});
  jwt.verify(token, process.env.JWT_SECRET || "docuvault-secret-key-2024",(err,decoded)=>{
    if (err) return res.status(403).json({error:"Invalid or expired token"});
    req.user = decoded;   // {id, username, exp}
    next();
  });
};
module.exports = { authenticateToken };
```
At login the backend signs a token with `jwt.sign({id,username},SECRET,{expiresIn:"7d"})`. The browser stores it and sends it as `Authorization: Bearer <token>`; here we verify the signature and trust `req.user.id` to scope all DB queries.

### 3.5 `Backend/controllers/authController.js`
Helpers at the top:
```js
const generateToken = (user)=> jwt.sign({id:user.id,username:user.username},
  process.env.JWT_SECRET||"docuvault-secret-key-2024",{expiresIn:"7d"});   // 7-day token
const sanitizeUser = (u)=>{ const o=u.toObject?u.toObject():u; delete o.password; return o; };  // never send password
const escapeRegex = (s)=>String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); // safe user input in RegExp
```
- **`register`** (`POST /auth/register`): require username/email/password → 400 if missing → case-insensitive duplicate check → `bcrypt.hash(password,10)` → `new User({...}).save()` → `201 {user, token}`.
- **`login`** (`POST /auth/login`): find user (case-insensitive) → `bcrypt.compare(password,user.password)` → generate token → `{user, token}`; bad credentials → `401`.
- **`getMe`** (`GET /auth/me`): `findById(req.user.id).select("-password")`, force `storageTotal=10`, return `{user}`.
- **`updateProfile`** (`PUT /auth/me`): if username changes, check it is not taken by another user (`_id:{$ne:req.user.id}`); hash a new password if sent; `findByIdAndUpdate(req.user.id,{$set:updates},{new:true})` → return the updated user.
- **`logout`** (`POST /auth/logout`): returns `{success:true}` — JWT is stateless, the frontend simply deletes the token.
- **`deleteAccount`** (`DELETE /auth/account`): delete the user → find their documents+trash → delete each real file from `uploads/` (`fs.unlinkSync`) → `deleteMany` documents + trash → full cleanup.

### 3.6 `Backend/controllers/documentController.js`
Helpers: `getCategoryColor` (category→hex), `resolveFilePath` (`path.join(__dirname,"..","uploads",path.basename(filePath))` — always basenames the stored path so stale absolute paths never break lookups/deletes), `deleteFileFromDisk`.
- **`getDocuments`** (`GET /documents?category=&search=&favourite=`): query `{userId}` plus optional filters → `find().sort({createdAt:-1})` → `{documents,total}`.
- **`getDocument`** (`GET /documents/:id`): `findOne({_id,userId})` → 404 if missing.
- **`createDocument`** (`POST`, multer): `file=req.file`; require it → build name/type/size; store only `path.basename(file.path)`; parse tags (string→split by comma) → `new Document().save()` → `201`.
- **`updateDocument`** (`PUT /documents/:id`): `findOneAndUpdate({_id,userId},{$set:req.body})` — toggles favourite or renames.
- **`deleteDocument`** (`DELETE /documents/:id`) — "move to trash": find+delete the doc → copy all fields into a new **Trash** record + `deletedAt` → delete the file from disk → return "Document moved to trash".
- **`downloadDocument`** (`GET /documents/:id/download`): validate ObjectId → find scoped doc → resolve disk path → if the file exists set `Content-Type` (pdf→application/pdf, etc.) + `Content-Disposition: attachment; filename="..."` and `res.sendFile`; fallback returns the metadata as a `.txt`.
- **`viewDocument`** (`GET /documents/:id/view`): `res.sendFile` if the file exists (opens in browser), else a JSON preview.

### 3.7 `Backend/controllers/stats/downloads/trash`
`statsController.parseSizeToMB` converts `"2.5 MB"`/`"512 KB"`/`"3 GB"` to MB so sizes add up.
- **`getStats`** (`GET /stats`): totalDocuments, totalSize (sum MB), categories count, favourite count, downloads (distinct documentId count), trash count, recentActivity (uploaded within the last 7 days).
- **`getWallet`** (`GET /wallet`): same as stats + `categoryBreakdown` (name/count/color) + `recentDocuments` (5 newest) + `lastBackup`.
- **`trashController`**: `getTrash` (list) → `restoreTrash` (`POST /restore`: move Trash→Document) → `emptyTrash` (delete files from disk + `deleteMany`) → `permanentDelete` (one row + its file). `cleanupExpiredTrash` is a **scheduled** background job (not a route) that permanently deletes every `Trash` record whose `deletedAt` is older than `TRASH_RETENTION_DAYS` (30 days), removing the file from disk too; it runs once on server startup and then every hour via `setInterval` in `server.js`.
- **`downloadController`**: `getDownloads` (list, optional search) → `createDownload` (record a download) → `deleteDownload` → `deleteAllDownloads`.

### 3.8 `Backend/routes/*`
A router links a URL + HTTP method to a controller (with `authenticateToken` for protected ones). The key one, **`routes/documents.js`**, builds multer:
```js
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{ const up=path.join(__dirname,"..","uploads");
    fs.mkdirSync(up,{recursive:true}); cb(null,up); },                // create folder if missing
  filename:(req,file,cb)=>cb(null, Date.now()+path.extname(file.originalname)) // e.g. 1786118551040.docx
});
const upload = multer({storage});
router.get("/", authenticateToken, documentController.getDocuments);
router.post("/", authenticateToken, upload.single("file"), documentController.createDocument);
router.get("/:id/download", authenticateToken, documentController.downloadDocument);
router.get("/:id/view", authenticateToken, documentController.viewDocument);
router.get("/:id", authenticateToken, documentController.getDocument);
router.put("/:id", authenticateToken, documentController.updateDocument);
router.delete("/:id", authenticateToken, documentController.deleteDocument);
```
`routes/auth.js`, `trash.js`, `stats.js`, `wallet.js`, `downloads.js` use the same `router.<method>(path, authenticateToken, controller.fn)` pattern.

---

## 4. Request Lifecycle (example: `GET /documents`)

```
Frontend api.get("/documents")
   │  api.js adds  Authorization: Bearer <JWT>
   ▼
Express matches /documents → routes/documents.js
   ▼
Middleware chain (in order):
   1. cors()  2. express.json()  3. request logger  4. authenticateToken
   ↳ 4: verifies JWT → req.user = {id,...}  (fails → 401/403, stops)
   ↳ 5. documentController.getDocuments runs
   ▼
Controller: builds {userId}, Document.find(query).sort(...) → res.json({documents,total})
   ▼
JSON → api.js → page sets React state → UI re-renders
```
Every endpoint follows the same flow: **route → auth middleware (JWT) → controller → Mongo → JSON → React state → screen.**
## 5. The Frontend Core (React / Vite)

### 5.1 `src/main.jsx` — React entry point
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./tailwind.css";
import "./styles/global.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter><App /></BrowserRouter>
);
```
`createRoot` (React 19) mounts into `<div id="root">` (from `index.html`); `BrowserRouter` gives every component routing.

### 5.2 `src/App.jsx` — the route table
Two route guards then the `<Routes>` table:
```jsx
function ProtectedRoute({children}) {
  const {user,loading} = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;   // not logged in → /login
}
```
- **AuthLayout** group: `/login`, `/register` (Navbar only).
- **MainLayout public**: `/guide/*`, `/pricing`, `/about`, `/terms`, `/help`.
- **MainLayout protected**: `/` (→ redirect `/login`), `/wallet`, `/dashboard`, `/documents`, `/upload`, `/profile`, `/settings`, `/favourite`, `/trash`, `/viewer/:id` — each wrapped in `<ProtectedRoute>`.
- `path="*"` → `<NotFound />` (404).

### 5.3 `src/services/api.js` — the network layer (+ mock mode)
```js
const defaultApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" });
defaultApi.interceptors.request.use((config)=>{        // attach the JWT to every request
  const session = localStorage.getItem("docuvault-session");
  if (session){ const u = JSON.parse(session); if (u?.token) config.headers.Authorization = `Bearer ${u.token}`; }
  return config;
});
defaultApi.interceptors.response.use(r=>r, (error)=>{ if (error.response?.data?.error) error.message = error.response.data.error; return Promise.reject(error); });
const shouldUseMock = !import.meta.env.VITE_API_URL;   // blank URL → fake backend
const api = {
  get(url,c){ return shouldUseMock ? mockRequest(url,"get",null,c) : defaultApi.get(url,c); },
  post(url,d){ return shouldUseMock ? mockRequest(url,"post",d) : defaultApi.post(url,d); },
  postFile(url,fd,c){ return shouldUseMock ? mockRequest(url,"post",fd) : defaultApi.post(url,fd,c); }, // keep multipart boundary
  put(url,d){ return shouldUseMock ? mockRequest(url,"put",d) : defaultApi.put(url,d); },
  delete(url){ return shouldUseMock ? mockRequest(url,"delete") : defaultApi.delete(url); },
};
export default api;
```
Every page imports this `api`. `postFile` is separate so the browser can set the `multipart/form-data` boundary for file uploads.

### 5.4 `src/context/authcontext.jsx` — global auth state
```jsx
const AuthContext = createContext();
const SESSION_KEY = "docuvault-session";
export function AuthProvider({children}) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);     // block render until we check localStorage
  useEffect(()=>{ const u = localStorage.getItem(SESSION_KEY); if(u) setUser(JSON.parse(u)); setLoading(false); },[]);
```
- `login(user,pw)` → `api.post("/auth/login")` → stores `{...user,token}` in localStorage.
- `register(userData)` → `api.post("/auth/register")`.
- `logout()` → clears localStorage, `setUser(null)`, `window.location.href="/login"`.
- `updateUser(data)` → `api.put("/auth/me")` → merges the result into state.
Exposes `user`, `loading`, `login`, `register`, `logout`, `updateUser`, `isAuthenticated`.

### 5.5 `src/layouts/` and `src/components/`
**mainlayout.jsx**: `sidebarOpen` + `mobileSidebarOpen`; closes the mobile menu on route change and locks `document.body.style.overflow` while it is open. Renders Navbar → Sidebar → `<main><Outlet/></main>` → Footer, plus a toggle button (chevrons) that collapses the sidebar.
**authlayout.jsx**: Navbar + `<Outlet/>` only (login/register get no sidebar/footer).
**navbar.jsx**: scroll shadow, profile dropdown, logout-confirm modal; on auth pages shows a Sign Up/Login button instead of the main navigation.
**sidebar.jsx**: nav groups + a Logout button; the storage bar fetches `/stats`, converts `totalSize` to MB, divides by `10*1024`, and shows a percentage + coloured bar. `isActive()` handles active states (Documents only on `/documents`, not `/viewer`).
**footer.jsx**: static brand + links + `© {new Date().getFullYear()}`.

### 5.6 `src/utils/storage.js`
Shared size helpers (used by sidebar/profile/settings/dashboard): `parseSizeToMB` (GB×1024 / MB / KB), `formatMB` (≥1024→GB, ≥1→MB, else KB), `formatStorageSize` (compose the two). Keeps storage display consistent everywhere (1 GB = 1024 MB).
## 6. Every Page Explained

General rule for authenticated pages: call `api.*` (auto-attaches the JWT) → Express runs `authenticateToken` → controller hits MongoDB → JSON returns → page sets state → React re-renders.

### `/login`
1. Inputs live in `formData` (`{username, password}`), updated by `handleInputChange`.
2. On submit, `handleSubmit` calls `login(username, password)` from the auth context.
3. Context calls `api.post("/auth/login")` → backend bcrypt-checks the password → returns a JWT.
4. Token + user are stored in localStorage (`docuvault-session`).
5. On success → navigate to `/dashboard`; on failure → show the error.
6. The eye icon toggles `showPassword` (`type="password"` ↔ `type="text"`).

### `/register`
1. Collects `username, email, password, confirmPassword`. `handleInputChange` maps inputs named `pwd`/`cpwd` to `password`/`confirmPassword` via a `fieldMap`.
2. Client validation: all fields present, passwords match, password ≥ 6 chars.
3. `autocomplete="new-password"` + `data-lpignore="true"` stop stale autofill.
4. Calls `register({...})` → `api.post("/auth/register")` → backend hashes password + saves.
5. On success: success banner, then after 1 s redirect to `/login`.

### `/dashboard`
`useEffect` fetches two endpoints in parallel:
```js
const [statsR, docsR] = await Promise.all([ api.get("/stats"), api.get("/documents") ]);
setStats(statsR.data.stats); setRecentDocuments(docsR.data.documents.sort(by newest).slice(0,5));
```
Shows a hero, 4 stat cards (Documents / Favourite / Downloads / Storage), and "Recent documents".
- **Downloads** stat opens an inline modal calling `GET /downloads` with single-delete + "Delete All".
- Clicking a doc → `/viewer/:id`.
- `downloadFile(doc)`: `GET /documents/:id/download` with `responseType:"blob"` → `window.URL.createObjectURL` link; then posts to `/downloads` to record history (non-blocking).

### `/wallet`
Calls `GET /wallet` → `statsController.getWallet` returns totals, `categoryBreakdown` (name/count/color for a bar chart), and `recentDocuments` (5 newest). Draws a storage progress bar (used of 10 GB). `window.scrollTo(0,0)` on mount. Note: `wallet.jsx` keeps its own copies of `parseSizeToMB`/`formatMB` (duplicated from `utils/storage.js`); the downloads modal mirrors the dashboard's.

### `/documents` (library / browser)
URL ↔ state synced via `useSearchParams`:
```js
const [searchParams,setSearchParams] = useSearchParams();
const searchTerm = searchParams.get("search")||"";
const categoryFilter = searchParams.get("category")||"all";
const [favouriteFilter, setFavouriteFilter] = useState(searchParams.get("favourite")==="true");
```
`fetchDocuments` (a `useCallback` depending on the filters) rebuilds query params → `GET /documents?${params}`; the `useEffect` re-runs when filters change, so every filter re-fetches. Per-card actions:
- **click card** → `navigate(/viewer/${id})`
- **star** → `toggleFavourite` → `PUT /documents/:id {favourite}` (updates UI immediately)
- **rename (✎)** → inline input → `PUT /documents/:id {name}`
- **delete (🗑)** → 2-button "Move to trash?" confirm → `api.delete(/documents/:id)` (backend moves it to Trash)
- "Clear filters" resets state + URL params. Empty list → "Upload document" CTA.

### `/favourite`
Same code as Documents but always sends `favourite=true` and client-filters again (`.filter(d=>d.favourite)`). Un-starring removes the doc immediately so the list stays in sync; on error it refreshes.

### `/upload` (drag & drop uploader)
State: `selectedFile`, `uploading`, `progress`, `category` (default "Other"), `tags`.
- Window-level `dragover`/`drop` listeners prevent the browser from opening a file dropped outside the zone.
- The zone listens to `dragenter`/`dragover`/`dragleave` to toggle `dragActive`.
- `handleUpload` builds `FormData` (`file, name, type, size, category, tags`) → `api.postFile("/documents", formData)` (multipart, browser sets boundary). On success shows a green check banner; `progress` drives the bar.
### `/viewer/:id`
`useParams()` reads `id`; loads `GET /documents/${id}` into `document` state. Two-column layout: **preview** + **details sidebar**.
- Top bar: back arrow, doc name, **star** button (`PUT` favourite), **download** button (blob flow), **delete** button (confirm modal).
- Preview: images render from a `GET .../view` blob (`<img src>`); text-like types fetch the view endpoint and render as text; otherwise a file icon.
- Sidebar lists Name/Type/Size/Category/Uploaded/Tags + a Download button.
- Note the deliberate `const doc = document;` line — the state var `document` shadows the global `document`, so download code uses `window.document`/`window.URL` explicitly.

### `/trash` (recycle bin)
`GET /trash` on load (in mock mode this also drops any item older than 30 days); per item:
- **Restore** → `POST /trash/restore {id}` (backend moves Trash→Document; item removed from list).
- **Delete Permanently** → confirm modal → `DELETE /trash/:id/permanent` (row + file from disk).
- **Empty Trash** → confirm modal → `DELETE /trash/empty` (files from disk + `deleteMany`).
Each item shows a **"Days left" badge** computed from `deletedAt` via `getDaysRemaining` (`30 − daysElapsed`): green (`safe`) for >7 days, yellow (`warning`) for ≤7 days, and red (`expired`) at zero — the card also gets an `expiring-soon`/`expired` border class. An **auto-delete policy banner** reminds users that items are permanently deleted after 30 days (`TRASH_RETENTION_DAYS`). Empty state shows "Trash is empty". `formatDate` uses `toLocaleDateString`.

### `/profile`
`Promise.all` of `GET /auth/me`, `GET /documents`, `GET /stats`. Walks every doc `size` → bytes → MB for the storage bar. Shows avatar/name, Account Details (email/username/phone/company/joined), Activity Overview (docs/favourites/downloads), and a Storage bar (used of 10 GB, via shared `formatMB`). Skeleton placeholders while loading.

### `/settings` (tabbed)
Reads `?tab=account|security|downloads|storage|delete` from the URL and syncs `activeTab`.
- **Account**: edit username/email/phone/company → `PUT /auth/me`; the auth context's `updateUser` refreshes Navbar/Sidebar; duplicate username → 400.
- **Security**: `current/new/confirm` password; validate match + length, then `PUT /auth/me` (backend hashes).
- **Storage**: lists docs + downloads + stats; links to `/upload`.
- **Downloads**: list `/downloads`; delete single, "Delete All", or re-download (blob flow).
- **Delete account**: final-warning input matches username → modal → `DELETE /auth/account` (backend removes user + all files + all DB rows) → `logout()`.

### Public / informational pages (no login)
`/guide` — grid of cards → `/guide/getting-started`, `/features`, `/security`, `/faq`, `/privacy`, `/about`. `/pricing`, `/about`, `/terms`, `/help` are static JSX articles. They follow the template: `import "./x.css"`; `import { Link } from "react-router-dom"`; `function Name(){ return <div className="page">…</div> }` → `export default Name`. `/notfound` (`path="*"`): `goBack()` uses `window.history.length`, else `/wallet`, plus suggested links.
## 7. Mock Mode vs Real Backend

Both live in `src/services/api.js`. The switch:
```js
const shouldUseMock = !import.meta.env.VITE_API_URL;   // blank URL → fake backend in localStorage
```
The frontend `.env` currently has `VITE_API_URL=http://10.177.81.22:3000` (real backend). Leave it blank to run mock mode.

### Mock mode — `mockRequest(url, method, data)`
When `shouldUseMock` is true, every `api.*` call routes to `mockRequest`, a big `if/else` chain keyed on the URL. Each user's data is isolated in localStorage namespaced by the session user id:

| URL | Method | Mock behaviour |
|---|---|---|
| `/auth/login` | post | match username+password from `docuvault-users` (plain text in mock only!) → set session, `token:"demo-token"` |
| `/auth/register` | post | duplicate check, push to `docuvault-users`, set session |
| `/auth/me` | get/put | return / update stored session user |
| `/auth/logout` | post | remove the session key |
| `/auth/account` | delete | remove user + `docuvault-documents-<id>` + `docuvault-trash-<id>` keys |
| `/documents` | get | read `docuvault-documents-<id>`, filter by category/search/favourite |
| `/documents` | post | read file bytes via `FileReader` → base64, store the doc (so downloads return the original file) |
| `/documents/:id` | put/delete | update one doc / **move to trash** (copies to `docuvault-trash-<id>`) |
| `/documents/:id/download` | get | return the stored base64 as a real `Blob` → real file download |
| `/documents/:id/view` | get | return the blob so images/text render inline |
| `/trash` | get | read `docuvault-trash-<id>`, dropping any item older than 30 days (mimics the backend's auto-cleanup) |
| `/trash/restore` | post | move a trash row back into documents |
| `/trash/empty` | delete | clear the trash key |
| `/stats` | get | recompute counts from documents/trash arrays |
| `/wallet` | get | same as stats + `categoryBreakdown` + `recentDocuments` |
| `/downloads` | get/post/delete | manage `docuvault-downloads-<id>` |

> **Security note:** mock mode stores passwords in plain text. That is acceptable for a demo only — never do this in the real backend (which uses bcrypt).

### Real mode
Every method calls the real Axios instance (`defaultApi.<method>`). The request interceptor attaches the JWT; Express's `authenticateToken` verifies it; the real controllers hit MongoDB and return JSON. The page code is identical in both modes.

---

## 8. End-to-End Trace — "Upload a document"

1. Open `/upload`, pick a PDF → `selectedFile` state.
2. Pick category "Work", tags `contract, 2025`, click Upload.
3. `handleUpload` builds a `FormData` (`file`, `name`, `type`, `size`, `category`, `tags`) and calls `api.postFile("/documents", formData)`.
4. `api.js`: `VITE_API_URL` is set → `defaultApi.post("/documents", formData)`.
5. Axios request interceptor adds `Authorization: Bearer <JWT>`.
6. Express → `routes/documents.js` → `authenticateToken` verifies the JWT → `upload.single("file")` (multer saves the file to `Backend/uploads/1786118551040.pdf`) → `documentController.createDocument`.
7. The controller saves a `Document` row in MongoDB (`filePath: "1786118551040.pdf"`).
8. Returns `201 {document, message:"Document uploaded successfully"}`.
9. The Upload page shows the green success banner.
10. The new doc now appears in `/documents` (which fetches the list) and counts toward the dashboard stats on the next load.

In **mock mode** steps 4–8 happen inside `mockRequest`: file bytes are read into a base64 string stored under `localStorage['docuvault-documents-<id>']`, and the same `{document, message}` shape is returned — so the page never needs to know which mode is active.

---

## 9. Glossary & Common Modifications

**Glossary**
- **JWT** — signed string proving "this user is logged in"; stored in localStorage, sent as `Authorization: Bearer <token>`.
- **Middleware** — code that runs between a request arriving and its handler (e.g. `authenticateToken`).
- **Controller** — the function that does the work (DB query, file save) for a route.
- **Model** — a Mongoose schema + collection wrapper (`User`, `Document`, …).
- **Route / Router** — maps a URL path to a controller.
- **Multer** — Express middleware that parses `multipart/form-data` file uploads.
- **Context** — React's way to share state (here, the logged-in user).
- **ProtectedRoute / PublicRoute** — wrappers that redirect users away from protected pages (and vice-versa).
- **Outlet** — react-router placeholder where a child route's content renders inside a layout.
- **Mock mode** — fake backend in `api.js` using `localStorage`, used when no `VITE_API_URL` is set.

**To modify**
| Want to change… | Edit |
|---|---|
| Add a page | create `src/pages/YourPage/yourpage.jsx` (+`.css`) → add a `<Route>` in `App.jsx` → add a `<Link>` in `sidebar.jsx`/`navbar.jsx` |
| Add a backend endpoint | add a route in `routes/*.js` → add a function in `controllers/*.js` → wire it (use `authenticateToken` for protected routes) |
| Change the storage limit | `STORAGE_LIMIT_GB` in `authController.js`, the `server.js` enforcement block, and the hardcoded `10` in `sidebar.jsx`/`settings.jsx` |
| Add a category colour | update `getCategoryColor` in every file that keeps its own copy (`documentController.js`, `statsController.js`, and frontend `dashboard`/`documents`/`favourite`/`wallet`/`viewer`) |
| Change JWT expiry | `expiresIn: "7d"` in `authController.generateToken` |
| Rename the app | the string `DocuVault`, the project `name` in both `package.json` files, `title` in `index.html`, the env values |

> ✅ You now have a complete, code-level walkthrough of every file in the DocuVault project and how all of them work together across all pages. For the original high-level overview, read `DOCUMENTATION.md` in this same folder.
