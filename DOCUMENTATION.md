# DocuVault — Complete Project Documentation

> **DocuVault — Digital Document Wallet** — A full‑stack web app for securely storing, organizing, and managing digital documents. Written for beginners — explains every part of the project.

> **See also:** [`FLOWCHART.md`](./FLOWCHART.md) — a visual flowchart of the entire project, plus [`CODE_DOCUMENTATION.md`](./CODE_DOCUMENTATION.md) for the line-by-line code walkthrough.

---

## Table of Contents

1. [What Is DocuVault?](#1-what-is-docuvault)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure (At a Glance)](#3-project-structure-at-a-glance)
4. [Prerequisites](#4-prerequisites--what-you-need-to-install)
5. [Setup & Installation](#5-setup--installation--how-to-prepare)
6. [How to Run the Project](#6-how-to-run-the-project--working-the-entire-project)
7. [Frontend Walkthrough](#7-frontend-walkthrough--every-file-explained)
8. [Backend Walkthrough](#8-backend-walkthrough--every-file-explained)
9. [How It All Works Together](#9-how-it-all-works-together-data-flow)
10. [API Reference](#10-api-reference)
11. [Features & Pages Guide](#11-features--pages-guide)
12. [Mock Mode vs Real Backend](#12-mock-mode-vs-real-backend)
13. [Building for Production](#13-building-for-production)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What Is DocuVault?

**DocuVault** is a **Digital Document Wallet**. It lets users sign up, log in, upload files (PDF, DOCX, XLSX, images, etc.), organize them with categories and tags, star favourites, search, view, download, delete to trash (with restore), and track statistics on a dashboard/wallet page. There are also public informational pages (guide, help, pricing, about, terms, privacy).

The project has **two parts**:
- A **frontend** — a React single-page application (everything you see in the browser).
- A **backend** — a Node.js/Express API server + MongoDB database that stores users, documents, and uploaded files.

There is also a **mock mode** built into the frontend: if no backend URL is configured, the app runs entirely in the browser using `localStorage`, so you can try every feature without installing a backend or database.

---

## 2. Technology Stack

**Frontend** (root folder): React 19, Vite 8 (dev server + bundler), Tailwind CSS 3.4 (styling), Axios 1.18 (HTTP calls), React Router DOM 7 (navigation), React Icons 5.7 (icons), ESLint 10 / PostCSS 8.5 (code quality).

**Backend** (`Backend/` folder): Node.js runtime, Express 5 (web framework), Mongoose 9 (MongoDB object modeling), bcryptjs 3 (password hashing), jsonwebtoken 9 (JWT auth), multer 2 (file uploads), cors 2.8 (cross-origin), dotenv 17 (env vars).

**Database**: MongoDB (local or Atlas cloud). Default: `mongodb://localhost:27017/docuvault`.

---

## 3. Project Structure (At a Glance)

```
vault/
├── .env                      ← Frontend config (VITE_API_URL)
├── package.json              ← Frontend deps & scripts
├── vite.config.js            ← Vite dev-server config
├── tailwind.config.cjs       ← Tailwind config
├── index.html                ← Page shell (mounts React to #root)
├── src/                      ← ALL frontend source
│   ├── main.jsx              ← React entry point
│   ├── App.jsx               ← Routes + route guards
│   ├── services/api.js       ← API client + mock layer
│   ├── context/authcontext   ← Global login/logout state
│   ├── components/           ← navbar, sidebar, footer
│   ├── layouts/              ← authlayout, mainlayout
│   └── pages/                ← Every screen
├── dist/                     ← Built production files
├── Backend/
│   ├── package.json
│   ├── server.js             ← Express entry point
│   ├── .env                  ← JWT_SECRET, PORT
│   ├── config/db.js          ← MongoDB connection
│   ├── middleware/auth.js    ← JWT verification
│   ├── models/               ← Mongoose schemas
│   ├── controllers/          ← Business logic
│   ├── routes/               ← API endpoints
│   ├── data/                 ← Seed/fallback JSON
│   └── uploads/              ← Uploaded files
└── task_progress             ← Development checklist
```

---

## 4. Prerequisites — What You Need to Install

| Requirement | Minimum | Why |
|---|---|---|
| **Node.js** | 18.x+ | Runs frontend (Vite) and backend (Node scripts). |
| **npm** | 10.x (comes with Node) | Downloads packages. |
| **Git** | any recent | (Optional) to clone the project. |
| **MongoDB** | 5.x+ | Required **only** for the real backend. Use local MongoDB or free **MongoDB Atlas** cloud. |

**Check what you have:** Open a terminal and run:
```bash
node -v   # should print v18.x or higher
npm -v    # should print 10.x or higher
```
If `node` is not recognized, download it from [nodejs.org](https://nodejs.org) (LTS version).

> **Tip:** You can run the whole project in **mock mode** without MongoDB or the backend (see [Section 12](#12-mock-mode-vs-real-backend)).

---

## 5. Setup & Installation — How to Prepare

### Step 1 — Get the project files
```bash
git clone <repo-url>
cd C:\Users\ADMIN\Documents\project\vault\vault
```

### Step 2 — Install frontend dependencies
```bash
npm install
```
This downloads React, Vite, Tailwind, Axios, etc. into `node_modules/`.

### Step 3 — Configure the frontend (root `.env`)
The root `.env` file contains one line:
```
VITE_API_URL=http://10.177.81.22:3000
```
- **Real backend**: set to your backend URL (e.g. `http://localhost:3000`).
- **Mock mode**: leave blank (`VITE_API_URL=`) → app runs entirely in the browser with `localStorage`.

### Step 4 — Set up the backend (only for real backend)
```bash
cd Backend
npm install
```
The `Backend/.env` file contains:
```
JWT_SECRET=docuvault-secret-key-2024
PORT=3000
# MONGO_URI=mongodb://localhost:27017/docuvault  (default if omitted)
```
- `JWT_SECRET`: a secret string used to sign (encrypt) login tokens. Change it to something random in production.
- `PORT`: the port the backend listens on (default 3000).
- `MONGO_URI`: (optional) full MongoDB connection string. Defaults to a local MongoDB at `mongodb://localhost:27017/docuvault`.

### Step 5 — Run MongoDB (only for real backend)
Start MongoDB locally:
```bash
mongod
```
Or sign up for a free **MongoDB Atlas** cluster, create a database user, get the connection string, and put it in `Backend/.env` as `MONGO_URI`.

---

## 6. How to Run the Project — Working the Entire Project

### Option A — Mock mode (frontend only, no backend needed)
The fastest way to try everything.

1. Edit the root `.env` so `VITE_API_URL` is empty:
```
VITE_API_URL=
```
2. Start the dev server:
```bash
npm run dev
```
3. Open the URL printed in the terminal (usually `http://localhost:3000/`).
4. The app runs entirely in the browser. All "data" is stored in your browser's `localStorage`. Register a new account and start using it right away — no server, no database required.

### Option B — Real backend + MongoDB
Use this when you want a persistent, multi-user backend.

1. **Start MongoDB** (locally or Atlas).
2. **Install & start the backend:**
```bash
cd Backend
npm start
```
You should see: `DocuVault backend running on http://localhost:3000`
3. **Point the frontend to the backend** — edit the root `.env`:
```
VITE_API_URL=http://localhost:3000
```
4. **Start the frontend** (in a separate terminal):
```bash
cd C:\Users\ADMIN\Documents\project\vault\vault
npm run dev
```
5. Open `http://localhost:3000` in your browser and log in.

### Useful scripts

| Command | Where | What it does |
|---|---|---|
| `npm run dev` | root | Starts frontend dev server with hot reload. |
| `npm run build` | root | Creates optimized production build in `dist/`. |
| `npm run preview` | root | Serves the production build locally. |
| `npm start` | root | Same as `npm run dev`. |
| `npm start` | Backend/ | Starts the backend API server. |
| `node test-download.js` | Backend/ | Standalone script that pings the download endpoint. |

---

## 7. Frontend Walkthrough — Every File Explained

The frontend code lives in `src/`. It is a **React** application bundled by **Vite**.

### 7a. Entry Point & Configuration

**`index.html`** *(project root)* — The single HTML page. Vite serves this at runtime. It contains a `<div id="root">` where React mounts, and links the `tailwind.css` stylesheet + the JS entry script.

**`src/main.jsx`** — The JavaScript entry point. It:
1. Imports React & ReactDOM.
2. Wraps the app in `<BrowserRouter>` (enables React Router navigation).
3. Mounts `<App />` into the `#root` div using `createRoot`.
4. Imports `./tailwind.css` and `./styles/global.css` (global styles).

**`src/App.jsx`** — The heart of frontend routing. Key concepts:
- **`AuthProvider`** wraps everything — provides login/logout state globally via React Context.
- **`Routes` / `Route`** (from React Router) define every URL.
- **`ProtectRoute`** — a small helper component: if the user is not logged in, it redirects to `/login`. While still checking auth state it shows "Loading...".
- **Auth routes** (`/login`, `/register`): use `AuthLayout` (minimal navbar). Show a "Sign Up / Login" button top-right.
- **Public info routes** (`/guide/*`, `/pricing`, `/about`, `/terms`, `/help`): use `MainLayout`. No login required.
- **Protected routes** (`/wallet`, `/dashboard`, `/documents`, `/upload`, `/profile`, `/settings`, `/favourite`, `/trash`, `/viewer/:id`): use `MainLayout` + `ProtectRoute`. Login required.
- `Navigate` redirects `/` → `/login`. A `*` route renders `NotFound` (404).

**`vite.config.js`** — Vite dev-server config. `host: true` lets other network devices access the dev server. `allowedHosts` permits a specific ngrok tunnel domain.

**`tailwind.config.cjs`** — Tells Tailwind which folders contain class names (`./src/**/*.{js,jsx}`, `./public/index.html`). Also defines custom colours (primary blue, green, amber, red, purple, cyan), font sizes, border radii, shadows, and keyframe animations (fade-in, dropdown-fade-in). These are reused across the CSS and JSX.

### 7b. Core Logic (Services, Context, Utils)

**`src/services/api.js`** — The most important helper. It has two modes:
1. **Real API mode**: When `VITE_API_URL` is set, it uses **Axios** to call the backend. A *request interceptor* automatically adds the JWT token (`Authorization: Bearer <token>`) from `localStorage` to every request. A *response interceptor* pulls the `error` message out of the backend's JSON error bodies.
2. **Mock mode**: When `VITE_API_URL` is NOT set, it uses an in-browser mock that reads/writes data in `localStorage`. It simulates every backend endpoint (login, register, documents CRUD, trash, downloads, stats, wallet) so the full app works without a server. It even stores uploaded file bytes so downloads return the real file content.

The exported `api` object exposes methods: `get`, `post`, `postFile`, `put`, `delete` — all pages use these instead of calling Axios directly, which is why the same pages work in both real and mock mode.

**`src/context/authcontext.jsx`** — A React Context holding the **current user** state. Exposes:
- `user` — the logged-in user object (or `null`).
- `loading` — `true` while checking the saved session on first load.
- `login(username, password)` — calls `POST /auth/login`, then saves the user + token to `localStorage` under key `docuvault-session`.
- `register(userData)` — calls `POST /auth/register`.
- `logout()` — calls `/auth/logout`, then clears `localStorage` and redirects to `/login`.
- `updateUser(data)` — calls `PUT /auth/me`, merges result into local state.
- `isAuthenticated` — Boolean convenience value.

**Session persistence:** On page load, the context reads `localStorage["docuvault-session"]`. If a session is there, the user is considered logged in (this is why you stay logged in after refreshing the page).

**`src/utils/storage.js`** — Three small helpers for consistent storage formatting across pages:
- `parseSizeToMB(str)` — e.g. `"1336 MB"` → `1336`.
- `formatMB(mb)` — e.g. `1336` → `"1.30 GB"`.
- `formatStorageSize(str)` — combines both (parse then format).

### 7c. Shared UI Components

**`src/components/navbar.jsx`** — The top navigation bar. It shows:
- The **DocuVault logo** (a shield icon) — links to dashboard (logged in) or login.
- **Nav links** (Dashboard, Wallet, Documents, Upload, Favourite, Help) — only shown when logged in.
- A **profile dropdown** (click avatar → Profile / Settings / Logout).
- A **logout confirmation modal**.
- A **mobile hamburger menu** button (toggles sidebar on small screens).
- Adds a shadow on scroll. On auth pages (`/login`, `/register`) it shows a "Sign Up / Login" button instead of the full nav.

**`src/components/sidebar.jsx`** — The left vertical menu (desktop) or slide-in drawer (mobile). Contains:
- Main menu: Dashboard, Wallet, Documents, Upload, Favourite, Trash.
- Account links: Profile, Settings, Guide.
- A **Logout** button (with confirmation modal).
- A **storage usage bar** at the bottom that calls `GET /stats` to show storage used (e.g. "5 / 10 GB").
- Active-state highlighting for the current page.

**`src/components/footer.jsx`** — The page footer. Contains the DocuVault logo + tagline, and quick links grouped into: Features (Upload, Documents, Favourite, Trash), Resources (Guide, About, Help), Legal (Terms, Privacy). Ends with a copyright line.

### 7d. Layout Components

**`src/layouts/authlayout.jsx`** — A simple wrapper used only on `/login` and `/register`. Renders the Navbar (in auth mode) + an `<Outlet>` where the form appears.

**`src/layouts/mainlayout.jsx`** — The main app shell used by all protected + public info pages. Includes the full Navbar (with hamburger), a collapsible Sidebar (desktop) or slide-in drawer (mobile), a toggle button to collapse/expand the sidebar, an `<Outlet>` for page content, and the Footer. Manages `sidebarOpen` and `mobileSidebarOpen` state, and locks body scroll when the mobile drawer is open.

### 7e. Pages — Every Screen Explained

Each page lives in `src/pages/<name>/` with a `.jsx` (logic) + `.css` (styles) file.

**`pages/login/login.jsx`** — The sign-in screen. Fields: Username + Password (with an eye-toggle to show/hide password). On submit it calls `login()` from the auth context. On success it navigates to `/dashboard`. Shows a success banner if you just registered. Has a "Don't have an account? Register" link.

**`pages/register/register.jsx`** — The sign-up screen. Fields: Username, Email, Password, Confirm Password. Validates: all fields filled, passwords match, password ≥ 6 chars. On success, shows a success message and redirects to login after 1.5s. Has a "Already have an account? Login" link.

**`pages/dashboard/dashboard.jsx`** — The main overview page after login.
- Calls `GET /stats` and `GET /documents` in parallel on load.
- Shows **stat cards** (clickable): Documents count, Favourites, Downloads, Storage used (with mini progress bar).
- Shows **recent documents** (last 5, newest first) as a list with quick-view links.
- Shows **quick action buttons**: Upload, View Documents.
- Has a **Downloads modal** (click the Downloads stat) listing all download records with delete/delete-all options and confirmation steps.

**`pages/wallet/wallet.jsx`** — A wallet/insights overview. Calls `GET /wallet`. Shows: total documents, total storage size, number of categories, favourites, downloads, a category breakdown (coloured), recent documents, and a "last backup" date. Includes the same Downloads modal as Dashboard. Scrolls to top on navigation.

**`pages/documents/documents.jsx`** — The document library.
- **Search** bar (filters by name and tags in real time).
- **Category filter** dropdown (Work, Legal, Identity, Financial, Health, Education, Personal, Other, All).
- **Favourite filter** toggle (show only starred docs).
- URL search params sync with filters (so links/bookmarks keep filters).
- Each document card: name, category (coloured), size, tags, star, action buttons (View, Favourite/Star, Rename, Delete).
- **Rename** inline (edit name, save with check or cancel with X).
- **Delete** moves the document to Trash (with "Move to trash?" confirmation).
- Empty state with a link to Upload.

**`pages/favourite/favourite.jsx`** — Like Documents but **always filters to `favourite=true`**. Same UI and actions. Empty state encourages starring documents.

**`pages/upload/upload.jsx`** — The file upload page.
- A **drag-and-drop zone** (selected file shows name, size, type). Also supports clicking to browse (hidden file input).
- Prevents the browser from navigating away when dropping files outside the zone.
- Below: a **Category** dropdown and a **Tags** text box (comma-separated).
- A **progress bar** and "Uploading..." spinner during upload.
- On success: green check + "Upload successful!" message.
- Supported types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, images, etc.

**`pages/viewer/viewer.jsx`** — Opens at `/viewer/:id`. Shows a single document:
- **Preview** — tries `sendFile` for viewable types; falls back to a message for non-viewable types.
- **Info cards**: file name, type, category, upload date, tags.
- **Sidebar** with document details and a Download button.
- A **star** (favourite) toggle and a **Delete** button (with confirmation modal).
- Download uses `responseType: "blob"` and triggers a browser download with the correct filename + content-type.

**`pages/trash/trash.jsx`** — The recycle bin. Lists all deleted documents (`GET /trash`). Each item shows name, category, and "Deleted on" date, plus a **"Days left" badge** (green = plenty of time, yellow = expiring soon within 7 days, red = already expired / auto-delete pending). Actions: **Restore** (moves back to Documents), **Delete Permanently** (removes forever, with confirmation), and an **Empty Trash** button at top (deletes everything, with confirmation). An **auto-delete policy banner** reminds users that items are automatically and permanently deleted after 30 days. Empty state when trash is empty.

**`pages/profile/profile.jsx`** — Shows the user's profile. Calls `GET /auth/me`, `GET /documents`, and `GET /stats` in parallel. Displays: a profile card (avatar/initials, username, link to edit), Account Details (email, username, phone, company, join date), Activity Overview (documents, favourites, downloads counts), and a Storage bar (calculated precisely from document sizes). Shows loading skeletons while data loads.

**`pages/settings/settings.jsx`** — A **tabbed** settings page. Tabs: Account, Security, Storage, Downloads, Delete Account.
- **Account**: edit username, email, phone, company; notification toggles; Save calls `PUT /auth/me`.
- **Security**: current/new password fields.
- **Storage**: documents list + storage stats + per-document download links.
- **Downloads**: download records with delete options (same modal as dashboard).
- **Delete Account**: type your username to confirm, then calls `DELETE /auth/account` (deletes user + all documents + all files).

**Public (no login required) pages:**

**`pages/help/help.jsx`** — Help center with a FAQ section (5 questions) and contact options (email: chinna632007@gmail.com, phone: 9876543210, documentation link).

**`pages/pricing/pricing.jsx`** — Three plans: **Free** ($0), **Pro** ($9/month, "Most Popular"), **Enterprise** ($29/month). Each lists features. The CTA buttons link to `/register`.

**`pages/about/about.jsx`** — About Us page. Lists why DocuVault (Bank-Grade Security, Easy Organization, Privacy First, Lightning Fast) and a mission statement.

**`pages/terms/terms.jsx`** — Terms of Service with 10 numbered legal sections.

**`pages/notfound/notfound.jsx`** — 404 page. Shows "404 Page not found", a back button, a "Go to Wallet" link, and suggested pages.

**Guide pages (`pages/guide/`):**
- **`guide.jsx`** — Guide home; a grid of guide cards linking to Getting Started, Features, Security, FAQ, Privacy, About.
- **`getting-started.jsx`** — A 7-step walkthrough to set up the account.
- **`features.jsx`** — 7 features (Easy Upload, Smart Search, Favorites & Tags, Easy Export, Encryption, Cloud Backup, Mobile Access).
- **`security.jsx`** — 5 security features (End-to-End Encryption, 2FA, Document Verification, Secure Backups, Access Controls).
- **`faq.jsx`** — 7 FAQs.
- **`privacy.jsx`** — Privacy Policy with 5 sections.

### 7f. Styling

Every page imports its own `.css` file (e.g. `login.css`, `dashboard.css`). Shared component styles are in `src/styles/global.css`, which defines CSS variables (colours, shadows, border-radius, header height, sidebar width). The Tailwind config mirrors these as custom values. **Both Tailwind utility classes and plain CSS classes** are used for layout and appearance.

---

## 8. Backend Walkthrough — Every File Explained

The backend lives in the **`Backend/`** folder. It is a **Node.js + Express** server using **MongoDB (via Mongoose)**.

### 8a. Server Entry Point

**`Backend/server.js`** — The app's main file. Start it with `npm start` (or `node server.js`). It:
1. Loads environment variables via `dotenv` (`require("dotenv").config()`).
2. Creates an Express `app`.
3. Sets `PORT` (from `.env` or default 3000).
4. **Connects to MongoDB** by calling `connectDB()` from `config/db.js`.
5. Adds **CORS** middleware (with `exposedHeaders` so the frontend can read `Content-Disposition` / `Content-Type` for downloads).
6. Adds `express.json()` to parse JSON request bodies.
7. Adds a **request-logging middleware** that prints every request (method, URL, timestamp, body with passwords redacted) and the response status + duration.
8. Serves static files from the `uploads/` folder (`express.static`) so uploaded files are downloadable.
9. Mounts the routers: `/auth`, `/documents`, `/trash`, `/stats`, `/wallet`, `/downloads`.
10. Defines a **health check** at `GET /` → `{ message: "DocuVault Backend API is running" }`.
11. Registers a **global error handler** that logs the full error (name, message, stack) and returns a 500 response.
12. Calls `app.listen(PORT, "0.0.0.0", ...)` to start listening.

### 8b. Configuration

**`Backend/config/db.js`** — `connectDB()` async function. Calls `mongoose.connect()` with `MONGO_URI` (or the default `mongodb://localhost:27017/docuvault`). Logs "MongoDB connected successfully" or, on failure, logs the error and calls `process.exit(1)` (stops the server).

**`Backend/.env`** — Environment variables for the backend:
```
JWT_SECRET=docuvault-secret-key-2024
PORT=3000
```
Set `MONGO_URI` here if you use Atlas. The `.gitignore` keeps `.env` private (never committed to Git).

**`Backend/package.json`** — Backend dependencies and the `start` script (`node server.js`).

### 8c. Authentication Middleware

**`Backend/middleware/auth.js`** — Exports `authenticateToken`. This middleware protects routes. It:
1. Reads the `Authorization` header (`Bearer <token>`), and also supports a `token` query parameter (used for download/view links opened in a new tab).
2. If no token → returns `401 Access token required`.
3. Verifies the JWT with `jwt.verify()` using `JWT_SECRET`.
4. On success → sets `req.user` (with `{ id, username }`) and calls `next()` (route continues).
5. On failure → returns `403 Invalid or expired token`.
Every protected route imports and uses this middleware.

### 8d. Database Models

The `models/` folder defines **Mongoose schemas** (the structure of each MongoDB collection). Each document gets `_id` (MongoDB's default), `createdAt`/`updatedAt` (from `timestamps: true`), and a **virtual `id`** (a string version of `_id`, included in JSON output).

**`Backend/models/User.js`** — The `users` collection. Fields:
- `username` (String, required, unique)
- `email` (String, required, unique)
- `password` (String, required — **hashed** with bcrypt before saving)
- `phone` (String, default "")
- `plan` (String, default "Free")
- `avatar` (String, default null)
- `company` (String, default "")
- `storageUsed` (Number, default 0)
- `storageTotal` (Number, default 10)
- `joinedAt` (String, default today's date)
**`Backend/models/Document.js`** — The `documents` collection. Fields:
- `userId` (ObjectId → ref User, required)
- `name`, `type` (default "pdf"), `size` (default "0 KB")
- `category` (default "Other"; values: Work, Legal, Identity, Financial, Health, Education, Personal, Other)
- `uploadedAt` (default today)
- `favourite` (Boolean, default false)
- `tags` (array of strings)
- `verified` (Boolean, default false)
- `filePath` (String — filename on disk)

**`Backend/models/Trash.js`** — The `trashes` collection. Same fields as Document, plus `deletedAt` (when it was deleted). Deleted documents are moved here (not permanently removed) so they can be restored. Items older than 30 days are **permanently deleted automatically** by the server's scheduled cleanup job (`cleanupExpiredTrash` in `trashController.js`).

**`Backend/models/Download.js`** — The `downloads` collection. Records of each download event:
- `userId` (ObjectId → ref User, required)
- `documentId` (ObjectId → ref Document, nullable)
- `name`, `type`, `size`, `category` (a snapshot of the document's metadata at download time)
- `downloadedAt` (Date, default now)

### 8e. Controllers

Controllers live in `Backend/controllers/`. Each exports **handler functions** that process a request and send a response. Every handler wraps its logic in `try/catch` and logs `[OK]`/`[FAIL]` status messages to the console.

**`Backend/controllers/authController.js`** contains:
- `generateToken(user)` — signs a JWT with `{ id, username }` and 7-day expiry.
- `sanitizeUser(user)` — removes the password field before sending user data to the client.
- `escapeRegex(str)` — escapes regex special chars in user input (for safe case-insensitive searches).
- **`register`** (`POST /auth/register`) — validates username/email/password, checks for existing user (case-insensitive on both username and email), hashes the password with bcrypt (salt round 10), saves the user, returns `{ user, token, message }`.
- **`login`** (`POST /auth/login`) — looks up user by username (case-insensitive), compares the password with bcrypt, returns `{ user, token }`.
- **`getMe`** (`GET /auth/me`) — returns the current user (without password).
- **`updateProfile`** (`PUT /auth/me`) — validates the body, checks username uniqueness if changed, hashes a new password if provided, updates the user, returns `{ user, message }`.
- **`logout`** (`POST /auth/logout`) — returns `{ success: true }` (stateless JWT logout; actual session clearing is handled on the frontend by deleting the token).
- **`deleteAccount`** (`DELETE /auth/account`) — deletes the user, deletes all the user's documents (and their files from disk), and deletes all trash items.

**`Backend/controllers/documentController.js`** contains:
- `getCategoryColor(category)` — maps a category name to a hex colour.
- `resolveFilePath(filePath)` — resolves a stored filename to the absolute uploads path using just the basename (handles stale/absolute paths safely).
- `deleteFileFromDisk(filePath)` — deletes a file from disk if it exists (never throws on missing).
- **`getDocuments`** (`GET /documents`) — lists the user's documents with optional `category`, `search`, and `favourite` filters (query params). Returns `{ documents, total }`.
- **`getDocument`** (`GET /documents/:id`) — returns a single document.
- **`createDocument`** (`POST /documents`) — handles a single Multer file upload (`upload.single("file")`), saves the file to `uploads/`, and creates a Document record with name/type/size/category/tags. Returns `{ document, message }`.
- **`updateDocument`** (`PUT /documents/:id`) — updates fields (e.g. `favourite`, `name`) using `$set`. Returns `{ document, message }`.
- **`deleteDocument`** (`DELETE /documents/:id`) — moves the document to Trash (creates a Trash record), deletes the file from disk, and removes the Document record.
- **`downloadDocument`** (`GET /documents/:id/download`) — streams the file back with the correct `Content-Type` and `Content-Disposition` headers. If the file is missing, it returns a text file with the document's metadata.
- **`viewDocument`** (`GET /documents/:id/view`) — returns the file via `sendFile`, or metadata preview JSON if the file is missing.

**`Backend/controllers/trashController.js`** contains:
- `resolveFilePath(filePath)` — same basename-based path resolver.
- `TRASH_RETENTION_DAYS = 30` — how many days items stay in trash before being auto-deleted.
- **`getTrash`** (`GET /trash`) — lists the user's trash items.
- **`restoreTrash`** (`POST /trash/restore`) — takes `{ id }`, removes the item from Trash, recreates it as a Document, and returns `{ success, message }`.
- **`emptyTrash`** (`DELETE /trash/empty`) — deletes all trash items and their files from disk.
- **`permanentDelete`** (`DELETE /trash/:id/permanent`) — deletes one trash item and its file from disk.
- **`cleanupExpiredTrash`** (scheduled job, not a route) — permanently deletes every trash item whose `deletedAt` is older than `TRASH_RETENTION_DAYS` (30 days), removing each file from disk too. This is the automatic "30-day" cleanup.

**`Backend/controllers/downloadController.js`** contains:
- **`getDownloads`** (`GET /downloads`) — lists the user's download records (with optional `search` filter).
- **`createDownload`** (`POST /downloads`) — records a new download (used after a file is downloaded).
- **`deleteDownload`** (`DELETE /downloads/:id`) — deletes one download record.
- **`deleteAllDownloads`** (`DELETE /downloads`) — clears all of the user's download records.

**`Backend/controllers/statsController.js`** contains:
- `parseSizeToMB(sizeStr)` — converts a size string to MB.
- `getCategoryColor(category)` — maps a category to a colour.
- **`getStats`** (`GET /stats`) — dashboard statistics: totalDocuments, totalSize, categories count, favourite count, downloads count, trash count, recent activity (uploads in the last 7 days).
- **`getWallet`** (`GET /wallet`) — wallet overview: totalDocuments, totalSize, categories count, favourite count, downloads count, category breakdown (with colours), recent documents (last 5), lastBackup date.

### 8f. Routes

Routes live in `Backend/routes/`. Each file creates an Express `router`, maps URL paths to controller methods, applies the `authenticateToken` middleware, and is mounted on the server in `server.js`.

**`Backend/routes/auth.js`** — Authentication endpoints:
| Method | Path | Auth | Controller |
|---|---|---|---|
| POST | `/auth/register` | No | `authController.register` |
| POST | `/auth/login` | No | `authController.login` |
| GET | `/auth/me` | Yes | `authController.getMe` |
| PUT | `/auth/me` | Yes | `authController.updateProfile` |
| POST | `/auth/logout` | No | `authController.logout` |
| DELETE | `/auth/account` | Yes | `authController.deleteAccount` |

**`Backend/routes/documents.js`** — Document endpoints. Also sets up Multer (`upload.single("file")`) for the POST route:
| Method | Path | Auth | Controller |
|---|---|---|---|
| GET | `/documents` | Yes | `documentController.getDocuments` |
| POST | `/documents` | Yes | `documentController.createDocument` (file upload) |
| GET | `/documents/:id/download` | Yes | `documentController.downloadDocument` |
| GET | `/documents/:id/view` | Yes | `documentController.viewDocument` |
| GET | `/documents/:id` | Yes | `documentController.getDocument` |
| PUT | `/documents/:id` | Yes | `documentController.updateDocument` |
| DELETE | `/documents/:id` | Yes | `documentController.deleteDocument` |

**`Backend/routes/trash.js`** — Trash endpoints:
| Method | Path | Auth | Controller |
|---|---|---|---|
| GET | `/trash` | Yes | `trashController.getTrash` |
| POST | `/trash/restore` | Yes | `trashController.restoreTrash` |
| DELETE | `/trash/empty` | Yes | `trashController.emptyTrash` |
| DELETE | `/trash/:id/permanent` | Yes | `trashController.permanentDelete` |

**`Backend/routes/downloads.js`** — Download-history endpoints:
| Method | Path | Auth | Controller |
|---|---|---|---|
| GET | `/downloads` | Yes | `downloadController.getDownloads` |
| POST | `/downloads` | Yes | `downloadController.createDownload` |
| DELETE | `/downloads` | Yes | `downloadController.deleteAllDownloads` |
| DELETE | `/downloads/:id` | Yes | `downloadController.deleteDownload` |

**`Backend/routes/stats.js`** — Statistics:
| Method | Path | Auth | Controller |
|---|---|---|---|
| GET | `/stats` | Yes | `statsController.getStats` |

**`Backend/routes/wallet.js`** — Wallet overview:
| Method | Path | Auth | Controller |
|---|---|---|---|
| GET | `/wallet` | Yes | `statsController.getWallet` |

### 8g. Data Files & Uploads

**`Backend/data/users.json`** — Seed data: a sample user (`chinn`) with a pre-hashed bcrypt password. (The seed password hash starts with `$2b$10$A0pcY...` — the plaintext is not stored here.)

**`Backend/data/documents.json`** — Seed data: two sample documents (MAIL.docx, a student performance Excel sheet) owned by the sample user.

**`Backend/data/trash.json`** — Seed data: an empty trash array.

**`Backend/uploads/`** — The folder where Multer saves uploaded files (named with a timestamp + original extension). A `.gitkeep` keeps the folder in Git even when empty. The `.gitignore` ignores the file contents so uploads aren't committed.

**`Backend/test-download.js`** — A standalone Node script that sends a test GET request to `/documents/:id/download` with a dummy Bearer token, to verify the download endpoint is reachable.

---

## 9. How It All Works Together (Data Flow)

Here is the step-by-step journey of a typical user action — **uploading a document** — to show how the frontend, backend, and database cooperate:

1. **User selects a file** on the Upload page → a `FormData` object is built (file + name, type, size, category, tags).
2. **`api.postFile("/documents", formData)`** is called.
3. Since the frontend `.env` has `VITE_API_URL` set, the **Axios interceptor** adds the JWT `Authorization: Bearer <token>` header automatically (token was saved to `localStorage` at login).
4. The request hits **`POST /documents`** on the backend (`Backend/routes/documents.js`).
5. The **`authenticateToken`** middleware verifies the JWT. If valid, `req.user` is set and the request continues.
6. **Multer** (`upload.single("file")`) saves the file to `Backend/uploads/` with a timestamped name and puts `req.file` on the request.
7. **`documentController.createDocument`** reads the file info + body fields, builds a Mongoose `Document` (linked to `req.user.id`), and saves it to MongoDB (`documents` collection).
8. The backend responds `{ document, message: "Document uploaded successfully" }`.
9. The **Axios response interceptor** sees a 201, passes it through. The Upload page shows the success message.
10. On the Dashboard/Documents pages, `GET /documents` fetches all the user's documents from MongoDB, and the new file appears in the list.

**Login flow (for reference):**
1. User enters username + password and clicks Login.
2. `api.post("/auth/login", { username, password })` → frontend Axios adds no auth header (it's a login request).
3. `authController.login` looks up the user (case-insensitive), compares the bcrypt-hashed password.
4. On success it returns `{ user, token }`. The **authContext** saves the user + token to `localStorage["docuvault-session"]`.
5. On subsequent requests, the **Axios request interceptor** reads that token and attaches it to the `Authorization` header.

**Important note on mock mode:** If `VITE_API_URL` is blank, the API calls never leave the browser. Instead, `api.js`'s `mockRequest` function simulates every endpoint using `localStorage`. So the same page code works against either the real backend or the mock. This is how the app can be previewed without installing MongoDB.

---

## 10. API Reference

All requests are sent to the base URL in `VITE_API_URL` (default `http://localhost:3000`). Protected endpoints require `Authorization: Bearer <JWT token>`.

### Auth

| Method | Endpoint | Body | Success (2xx) |
|---|---|---|---|
| POST | `/auth/register` | `{ username, email, password, phone? }` | `{ user, token, message }` |
| POST | `/auth/login` | `{ username, password }` | `{ user, token }` |
| GET | `/auth/me` | — | `{ user }` |
| PUT | `/auth/me` | `{ username?, email?, phone?, company?, password?, notifications? }` | `{ user, message }` |
| POST | `/auth/logout` | — | `{ success: true }` |
| DELETE | `/auth/account` | — | `{ success, message }` |

### Documents

| Method | Endpoint | Body | Success |
|---|---|---|---|
| GET | `/documents` | query: `category`, `search`, `favourite` | `{ documents, total }` |
| POST | `/documents` (multipart) | file + `name`, `type`, `size`, `category`, `tags` | `{ document, message }` |
| GET | `/documents/:id` | — | `{ document }` |
| GET | `/documents/:id/download` | — | (file stream / blob) |
| GET | `/documents/:id/view` | — | (file stream / blob) |
| PUT | `/documents/:id` | any of: `name`, `favourite`, `category`, `tags`, etc. | `{ document, message }` |
| DELETE | `/documents/:id` | — | `{ success, message }` |

### Trash

| Method | Endpoint | Body | Success |
|---|---|---|---|
| GET | `/trash` | — | `{ items }` |
| POST | `/trash/restore` | `{ id }` | `{ success, message }` |
| DELETE | `/trash/:id/permanent` | — | `{ success, message }` |
| DELETE | `/trash/empty` | — | `{ success, message }` |

> **Auto-deletion:** In addition to these routes, a background job (`cleanupExpiredTrash`) permanently deletes every trash item older than **30 days**, running once on server startup and then every hour. The Trash page reflects this with a "days left" badge and a policy notice.

### Downloads

| Method | Endpoint | Body | Success |
|---|---|---|---|
| GET | `/downloads` | query: `search` | `{ downloads }` |
| POST | `/downloads` | `{ documentId, name, type, size, category }` | `{ download }` |
| DELETE | `/downloads/:id` | — | `{ success, message }` |
| DELETE | `/downloads` | — | `{ success, message }` |

### Stats & Wallet

| Method | Endpoint | Body | Success |
|---|---|---|---|
| GET | `/stats` | — | `{ stats: { totalDocuments, totalSize, categories, favourite, downloads, trash, recentActivity } }` |
| GET | `/wallet` | — | `{ wallet: { totalDocuments, totalSize, categories, favourite, downloads, categoryBreakdown, recentDocuments, lastBackup } }` |

### Health Check
- `GET /` → `{ message: "DocuVault Backend API is running" }`

---

## 11. Features & Pages Guide

This is a quick tour of what each page does in the running app.

### Getting started (first time)
1. Go to the app URL (e.g. `http://localhost:3000`).
2. You land on **Login** (or click "Sign Up" to go to **Register**).
3. Register a new account (username, email, password ≥ 6 chars, confirm password).
4. After registering you're redirected to Login. Log in with your new credentials.

### Navigating the app
Once logged in, you see:
- A **sidebar** (left) with: Dashboard, Wallet, Documents, Upload, Favourite, Trash, Profile, Settings, Guide.
- A **navbar** (top) with quick links and a profile dropdown (Profile / Settings / Logout).
- A **footer** (bottom) with quick links.

### Core workflow
1. **Upload a document** → go to **Upload**, drag a file or click to browse, pick a Category, add Tags, click "Upload Document".
2. **See it listed** → go to **Documents** or **Dashboard**. Use search or category filters.
3. **Star it** → click the star icon to add to favourites (shows up on the **Favourite** page).
4. **View it** → click the eye icon or the document name → opens the **Viewer** page.
5. **Download it** → on the Viewer page (or via the download icon) → the file downloads to your computer.
6. **Rename it** → on Documents/Favourite, click the pencil icon, edit the name, press check.
7. **Delete it** → click the trash icon → confirm "Move to trash?" → it moves to the **Trash** page.
8. **Restore it** → on the Trash page, click **Restore**.
9. **Delete forever** → on the Trash page, click the trash icon → confirm "Delete Permanently?".
10. **Or leave it** → items you don't restore are **automatically and permanently deleted after 30 days** (the Trash page shows a "days left" badge and a policy notice for this).

### Other pages
- **Wallet** — a visual summary of all your documents grouped by category, with a storage progress bar.
- **Profile** — your account details, activity counts, and storage usage.
- **Settings** — tabs: Account (edit info), Security (change password), Notifications, Storage, Downloads, Delete Account.
- **Help** — FAQ + contact info (no login needed).
- **Pricing** — Free / Pro / Enterprise plans (no login needed).
- **Guide** → Getting Started, Features, Security, FAQ, Privacy (all public, no login needed).
- **About** — company mission (public).
- **Terms of Service** — legal terms (public).
- Visiting any unknown URL shows the **404 Not Found** page.

---

## 12. Mock Mode vs Real Backend

The frontend's `src/services/api.js` has a built-in **mock layer**. The decision is made here:

```js
const shouldUseMock = !import.meta.env.VITE_API_URL;
```

- **Mock mode** (`VITE_API_URL` is empty/not set): Every API call is intercepted in the browser. Data is stored in `localStorage` under keys like `docuvault-session`, `docuvault-users`, `docuvault-documents-<userId>`, `docuvault-trash-<userId>`, `docuvault-downloads-<userId>`. This lets the entire app work with zero server setup. Uploaded file bytes are stored in memory so downloads still return the real file.
- **Real mode** (`VITE_API_URL` is set to e.g. `http://localhost:3000`): Every call goes to the real Express + MongoDB backend via Axios, with JWT authentication handled by interceptors.

**When to use which:**
- Use **mock mode** for quick demos, learning the UI, or frontend development without a backend.
- Use **real mode** for production, real persistence, multi-user testing, or when you need the backend's file storage.

**Switching between them:** Just set or clear `VITE_API_URL` in the root `.env` file, then restart the dev server (`npm run dev`).

### Seed data (real backend)

The `Backend/data/*.json` files contain sample seed data. The sample user is:
- **Username:** `chinn`
- **Password:** stored as a bcrypt hash in `users.json`; in mock mode you simply register a new account.

---

## 13. Building for Production

To create an optimized production build of the frontend:

```bash
npm run build
```

This runs Vite's build and outputs files into the **`dist/`** folder (`dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`). These are static files you can serve with any static-file server (nginx, Apache, GitHub Pages, Vercel, Netlify, etc.).

To preview the production build locally:

```bash
npm run preview
```

### Production environment variables

In production the frontend needs `VITE_API_URL` to point to your deployed backend:

```
VITE_API_URL=https://your-backend.example.com
```

> **Note:** Vite only exposes environment variables that start with `VITE_` to client-side code. This is why the variable is named `VITE_API_URL` (not `API_URL`).

### Backend in production

- Set a strong, random `JWT_SECRET` in `Backend/.env` (the default is fine for local dev only).
- Use a real MongoDB (Atlas is recommended for production).
- Run the backend with a process manager like `pm2` so it restarts on crashes:
  ```bash
  cd Backend
  npx pm2 start server.js --name docuvault-backend
  ```
- Place uploaded files on persistent storage and back them up.

---

## 14. Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `node: command not found` | Node.js not installed | Download from [nodejs.org](https://nodejs.org) (LTS), then restart terminal. |
| `npm ERR!` during `npm install` | Network or old npm | Run `npm install` again; try `npm cache clean --force` then `npm install`. |
| Frontend "Network Error" / 401 on API calls | Backend not running or URL wrong | Make sure `Backend\` `npm start` is running and `.env` URL is correct. |
| `MongoDB connection error` in backend | MongoDB not running | Start `mongod`, or set `MONGO_URI` to an Atlas connection string in `Backend/.env`. |
| Files don't download / `Content-Disposition` hidden | CORS not exposing headers | Backend already sets `exposedHeaders: ["Content-Disposition","Content-Type"]` — don't remove it. |
| Upload shows success but file missing | Uploads folder issue | Check `Backend/uploads/` exists and is writable. |
| App stays on "Loading…" after code change | Old browser cache | Hard-refresh (`Ctrl+F5`) or restart the dev server. |
| Tailwind styles not appearing | `tailwind.css` not imported | Confirm `main.jsx` imports it and `tailwind.config.cjs` lists `./src/**/*.{js,jsx}` in `content`. |

---

## Appendix A — Quick Reference Cheat Sheet

**Frontend commands (run in project root):**
```bash
npm install          # install frontend deps
npm run dev          # start dev server (hot reload)
npm run build        # production build -> dist/
npm run preview      # preview production build
```

**Backend commands (run in Backend/):**
```bash
npm install          # install backend deps
npm start            # start the API server
node test-download.js # ping the download endpoint
```

**Key environment variables:**
| File | Variable | Example | Purpose |
|---|---|---|---|
| `.env` (root) | `VITE_API_URL` | `http://localhost:3000` | Backend base URL (empty = mock mode) |
| `Backend/.env` | `JWT_SECRET` | `docuvault-secret-key-2024` | Signs/verifies login tokens |
| `Backend/.env` | `PORT` | `3000` | Backend listen port |
| `Backend/.env` | `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |

**LocalStorage keys (mock mode):**
| Key | Stores |
|---|---|
| `docuvault-session` | Current logged-in user + token |
| `docuvault-users` | All registered users |
| `docuvault-documents-<userId>` | The user's documents |
| `docuvault-trash-<userId>` | The user's trash items |
| `docuvault-downloads-<userId>` | The user's download records |

---

*End of documentation.*






















