# Project Flowchart - Document Vault Application (UML Style)

## 1. COMPONENT DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    React/Vite SPA (localhost:3000)                    │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐    │  │
│  │  │ App Component (Router)                                      │    │  │
│  │  │  ├─ AuthLayout (Auth Pages)                                │    │  │
│  │  │  │   ├─ LoginComponent                                     │    │  │
│  │  │  │   └─ RegisterComponent                                  │    │  │
│  │  │  │                                                          │    │  │
│  │  │  └─ MainLayout (Application Pages)                         │    │  │
│  │  │      ├─ Navbar                                             │    │  │
│  │  │      ├─ Sidebar                                            │    │  │
│  │  │      ├─ Protected Pages                                    │    │  │
│  │  │      │   ├─ Dashboard (📊)                                │    │  │
│  │  │      │   ├─ Documents (📄)                                │    │  │
│  │  │      │   ├─ Upload (⬆️)                                   │    │  │
│  │  │      │   ├─ Favourite (⭐)                                │    │  │
│  │  │      │   ├─ Viewer (👁️)                                  │    │  │
│  │  │      │   ├─ Trash (🗑️)                                   │    │  │
│  │  │      │   ├─ Wallet (💰)                                  │    │  │
│  │  │      │   ├─ Profile (👤)                                 │    │  │
│  │  │      │   └─ Settings (⚙️)                                │    │  │
│  │  │      ├─ Public Pages                                       │    │  │
│  │  │      │   ├─ Guide (📖)                                    │    │  │
│  │  │      │   ├─ About (ℹ️)                                    │    │  │
│  │  │      │   ├─ Pricing (💳)                                  │    │  │
│  │  │      │   ├─ Terms (📋)                                    │    │  │
│  │  │      │   └─ Help (🆘)                                     │    │  │
│  │  │      └─ Footer                                             │    │  │
│  │  └─────────────────────────────────────────────────────────────┘    │  │
│  │                                                                       │  │
│  │  ┌──────────────────────┐      ┌──────────────────────────────┐    │  │
│  │  │  AuthContext         │      │  API Service (axios)         │    │  │
│  │  │  ◆ user              │      │  ◆ baseURL: localhost:3000   │    │  │
│  │  │  ◆ token             │      │  ◆ interceptors              │    │  │
│  │  │  ◆ loading           │      │  ◆ headers: {Auth}           │    │  │
│  │  │                      │      │                              │    │  │
│  │  │  + login()           │      │  + request()                 │    │  │
│  │  │  + register()        │      │  + response()                │    │  │
│  │  │  + logout()          │      │  + handleError()             │    │  │
│  │  │  + setUser()         │      │                              │    │  │
│  │  └──────────────────────┘      └──────────────────────────────┘    │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ LocalStorage (docuvault-session)                              │  │  │
│  │  │ ◆ user: {username, email, id, token}                         │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       │ HTTP/HTTPS (CORS enabled)    │
                       └──────────────┬──────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER (Node.js)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │            Express.js Server (localhost:3000)                        │  │
│  │                       server.js                                      │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │ Middleware Stack                                            │   │  │
│  │  │  1. CORS Handler                                           │   │  │
│  │  │  2. JSON Parser (express.json)                             │   │  │
│  │  │  3. Request Logger                                         │   │  │
│  │  │  4. Auth Middleware (JWT Verification)                     │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │  │
│  │  │ Route: /auth     │  │ Route: /documents│  │ Route: /downloads│  │  │
│  │  │ (Public)         │  │ (Protected)      │  │ (Protected)      │  │  │
│  │  │                  │  │                  │  │                  │  │  │
│  │  │ • POST /login    │  │ • GET /all       │  │ • GET /:id       │  │  │
│  │  │ • POST /register │  │ • POST /create   │  │   (stream file)  │  │  │
│  │  │ • POST /logout   │  │ • PUT /:id       │  │                  │  │  │
│  │  │                  │  │ • DELETE /:id    │  │ Calls:           │  │  │
│  │  │ Calls:           │  │                  │  │ ├─ Verify owner  │  │  │
│  │  │ ├─ validate()    │  │ Calls:           │  │ ├─ Retrieve file │  │  │
│  │  │ ├─ hashPassword()│  │ ├─ checkQuota()  │  │ ├─ Log download  │  │  │
│  │  │ ├─ generateJWT() │  │ ├─ validateFile()│  │ └─ Stream data   │  │  │
│  │  │ └─ returnToken() │  │ ├─ saveFile()    │  │                  │  │  │
│  │  └──────────────────┘  │ ├─ createRecord()│  └──────────────────┘  │  │
│  │                        │ └─ updateQuota() │                        │  │
│  │  ┌──────────────────┐  └──────────────────┘  ┌──────────────────┐  │  │
│  │  │ Route: /stats    │                        │ Route: /trash    │  │  │
│  │  │ (Protected)      │  ┌──────────────────┐  │ (Protected)      │  │  │
│  │  │                  │  │ Route: /wallet   │  │                  │  │  │
│  │  │ • GET /          │  │ (Protected)      │  │ • GET /all       │  │  │
│  │  │   calcStats()    │  │                  │  │ • PUT /:id       │  │  │
│  │  │   ├─ storage used│  │ • GET /balance   │  │   (restore)      │  │  │
│  │  │   ├─ file count  │  │ • GET /quota     │  │ • DELETE /:id    │  │  │
│  │  │   └─ total docs  │  │                  │  │   (permanent)    │  │  │
│  │  │                  │  │ Calls:           │  │                  │  │  │
│  │  │                  │  │ ├─ getBalance()  │  │ Calls:           │  │  │
│  │  │                  │  │ └─ getQuota()    │  │ ├─ getTrash()    │  │  │
│  │  └──────────────────┘  └──────────────────┘  │ ├─ restore()     │  │  │
│  │                                              │ └─ hardDelete()  │  │  │
│  │                                              └──────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐  │  │
│  │  │ Background Tasks (Scheduled)                                 │  │  │
│  │  │                                                              │  │  │
│  │  │ ◆ TrashScheduler (every 1 hour)                             │  │  │
│  │  │   └─ cleanupExpiredTrash()                                  │  │  │
│  │  │      ├─ Find items: expiresAt < NOW                         │  │  │
│  │  │      ├─ Delete from Trash collection                        │  │  │
│  │  │      ├─ Delete file from /uploads                           │  │  │
│  │  │      └─ Update User storageUsed                             │  │  │
│  │  │                                                              │  │  │
│  │  │ ◆ StorageLimit Enforcer (on startup)                        │  │  │
│  │  │   └─ Enforce 10GB limit per user                            │  │  │
│  │  │                                                              │  │  │
│  │  └──────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
┌──────────────────────────┐  ┌──────────────────────┐  ┌────────────────────┐
│   DATA LAYER             │  │  FILE SYSTEM         │  │  DATABASE CONFIG   │
│   (MongoDB)              │  │  (Backend/uploads/)  │  │                    │
├──────────────────────────┤  ├──────────────────────┤  ├────────────────────┤
│ Collections:             │  │ Directory Structure: │  │ config/db.js       │
│                          │  │                      │  │                    │
│ ◆ users                  │  │ uploads/             │  │ ◆ Connection Pool  │
│   ├─ username            │  │  ├─ [user_id]/       │  │ ◆ Error Handling   │
│   ├─ password (hashed)   │  │  │   ├─ [doc_id]/    │  │ ◆ Timeouts         │
│   ├─ email               │  │  │   │   └─ file.ext │  │                    │
│   ├─ storageTotal: 10GB  │  │  │   └─ [doc_id]/    │  │                    │
│   ├─ storageUsed         │  │  └─ ...              │  │                    │
│   ├─ createdAt           │  │                      │  │                    │
│   └─ updatedAt           │  │ Max Size:            │  │                    │
│                          │  │ • Per User: 10GB     │  │                    │
│ ◆ documents              │  │ • Per File: varies   │  │                    │
│   ├─ title               │  │                      │  │                    │
│   ├─ description         │  │                      │  │                    │
│   ├─ fileSize            │  │                      │  │                    │
│   ├─ fileType (MIME)     │  │                      │  │                    │
│   ├─ filePath            │  │                      │  │                    │
│   ├─ userId (FK)         │  │                      │  │                    │
│   ├─ isFavourite         │  │                      │  │                    │
│   ├─ isPrivate           │  │                      │  │                    │
│   ├─ createdAt           │  │                      │  │                    │
│   └─ updatedAt           │  │                      │  │                    │
│                          │  │                      │  │                    │
│ ◆ downloads              │  │                      │  │                    │
│   ├─ documentId (FK)     │  │                      │  │                    │
│   ├─ userId (FK)         │  │                      │  │                    │
│   ├─ downloadedAt        │  │                      │  │                    │
│   ├─ fileHash            │  │                      │  │                    │
│   └─ downloadCount       │  │                      │  │                    │
│                          │  │                      │  │                    │
│ ◆ trash                  │  │                      │  │                    │
│   ├─ documentId (FK)     │  │                      │  │                    │
│   ├─ userId (FK)         │  │                      │  │                    │
│   ├─ deletedAt           │  │                      │  │                    │
│   ├─ expiresAt (+30 days)│  │                      │  │                    │
│   └─ originalPath        │  │                      │  │                    │
└──────────────────────────┘  └──────────────────────┘  └────────────────────┘
```

---

## 2. CLASS DIAGRAM

```
┌──────────────────────┐                    ┌──────────────────────────┐
│       User           │                    │     Document             │
├──────────────────────┤                    ├──────────────────────────┤
│ - username: string   │──────────── 1:N ──│ - title: string          │
│ - password: string   │                    │ - description: string    │
│ - email: string      │                    │ - fileSize: number       │
│ - storageTotal: num  │                    │ - fileType: string       │
│ - storageUsed: num   │                    │ - filePath: string       │
│ - createdAt: date    │                    │ - userId: ObjectId (FK)  │
│ - updatedAt: date    │                    │ - isFavourite: boolean   │
├──────────────────────┤                    │ - isPrivate: boolean     │
│ + login()            │                    │ - createdAt: date        │
│ + register()         │                    │ - updatedAt: date        │
│ + logout()           │                    ├──────────────────────────┤
│ + updateProfile()    │                    │ + create()               │
│ + getStats()         │                    │ + update()               │
│ + updateStorage()    │                    │ + delete()               │
└──────────────────────┘                    │ + toggleFavourite()      │
         △                                  └──────────────────────────┘
         │                                           △
         │ owns                                      │ has
         │                                           │
         └───────────────────────────────────────────┘
                                              

┌──────────────────────────┐        ┌──────────────────────────┐
│      Download            │        │         Trash            │
├──────────────────────────┤        ├──────────────────────────┤
│ - documentId: ObjectId   │        │ - documentId: ObjectId   │
│ - userId: ObjectId (FK)  │        │ - userId: ObjectId (FK)  │
│ - downloadedAt: date     │        │ - deletedAt: date        │
│ - fileHash: string       │        │ - expiresAt: date        │
│ - downloadCount: number  │        │ - originalPath: string   │
├──────────────────────────┤        ├──────────────────────────┤
│ + recordDownload()       │        │ + moveToTrash()          │
│ + getDownloadStats()     │        │ + restore()              │
└──────────────────────────┘        │ + permanentDelete()      │
         △                          │ + isExpired()            │
         │                          └──────────────────────────┘
         │ references
         │
    ┌────┴─────────────────────────────────┐
    │         Document                      │
    │     (relationship through            │
    │      documentId foreign key)         │
    └──────────────────────────────────────┘


CONTROLLER CLASSES:
─────────────────────────────────────────────────────────────────

┌─────────────────────────────────┐
│   authController                │
├─────────────────────────────────┤
│ + login(username, password)     │
│ + register(userData)            │
│ + logout()                      │
│ - validateCredentials()         │
│ - hashPassword()                │
│ - generateJWT()                 │
└─────────────────────────────────┘

┌──────────────────────────────────┐
│   documentController             │
├──────────────────────────────────┤
│ + getAll(userId)                 │
│ + getById(docId, userId)         │
│ + create(docData, file, userId)  │
│ + update(docId, updates)         │
│ + delete(docId, userId)          │
│ + toggleFavourite(docId)         │
│ - checkStorageQuota()            │
│ - validateFile()                 │
│ - saveFile()                     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   downloadController             │
├──────────────────────────────────┤
│ + getFile(docId, userId)         │
│ - verifyOwnership()              │
│ - retrieveFile()                 │
│ - logDownload()                  │
│ - streamFile()                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   trashController                │
├──────────────────────────────────┤
│ + getTrash(userId)               │
│ + restore(trashId)               │
│ + permanentDelete(trashId)       │
│ + cleanupExpiredTrash()          │
│ - isExpired(expiresAt)           │
│ - deleteFile()                   │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   statsController                │
├──────────────────────────────────┤
│ + getStats(userId)               │
│ - calculateStorageUsed()         │
│ - countDocuments()               │
│ - getRecentFiles()               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│   walletController               │
├──────────────────────────────────┤
│ + getBalance(userId)             │
│ + getQuota(userId)               │
│ - calculateRemaining()           │
└──────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAM - User Login Flow

```
User               Frontend          API Client        Express          MongoDB
 │                   │                  │               │                │
 ├─ Enter creds ───>│                  │               │                │
 │                   │                  │               │                │
 │                   ├─ POST /auth/login──>│               │                │
 │                   │                  │               │                │
 │                   │                  ├────────────────────> Validate   │
 │                   │                  │               │               │
 │                   │                  │               ├──────────────> Query User
 │                   │                  │               │                │
 │                   │                  │               │         <──────┤
 │                   │                  │               │      User Found│
 │                   │                  │               │                │
 │                   │                  │ <─────────────┤ Verify Password│
 │                   │                  │         Valid │                │
 │                   │                  │               │                │
 │                   │                  │ <─────────────┤ Generate JWT   │
 │                   │                  │               │ & Return       │
 │                   │ <─────────────────────────────────┤                │
 │                   │  {user, token}   │               │                │
 │                   │                  │               │                │
 │                   ├─ Store token in localStorage     │                │
 │                   ├─ Set AuthContext.user            │                │
 │                   ├─ Add token to API headers        │                │
 │                   │                  │               │                │
 │ <─ Redirect ──────┤                  │               │                │
 │  /dashboard       │                  │               │                │
```

---

## 4. SEQUENCE DIAGRAM - Document Upload Flow

```
User               Frontend          API Client        Express          MongoDB       File System
 │                   │                  │               │                │               │
 ├─ Select file ───>│                  │               │                │               │
 │                   │                  │               │                │               │
 │                   ├─ POST /documents + file────────>│                │               │
 │                   │   (FormData)      │               │                │               │
 │                   │                  │               │ Verify JWT     │               │
 │                   │                  │               ├─ Check Quota ──>               │
 │                   │                  │               │                │               │
 │                   │                  │               ├─ Validate File │               │
 │                   │                  │               │                │               │
 │                   │                  │               ├─ Save File ─────────────────────>
 │                   │                  │               │                │       File saved
 │                   │                  │               │                │               │
 │                   │                  │               ├─ Create Record──────────────────>
 │                   │                  │               │                │       
 │                   │                  │               │              <─┤
 │                   │                  │               │        Document ID
 │                   │                  │               │
 │                   │                  │               ├─ Update User Storage────────────>
 │                   │                  │               │                │
 │                   │                  │               │                │
 │                   │ <─────────────────────────────────┤                │
 │                   │ {documentId, success}             │                │
 │                   │                  │               │                │
 │ <─ Upload success │                  │               │                │
 │   message ────────┤                  │               │                │
```

---

## 5. SEQUENCE DIAGRAM - Document Download & File Retrieval

```
User               Frontend          API Client        Express          File System      MongoDB
 │                   │                  │               │                │                │
 ├─ Click Download->│                  │               │                │                │
 │                   │                  │               │                │                │
 │                   ├─ GET /downloads/:id────────────>│                │                │
 │                   │                  │               │ Verify JWT     │                │
 │                   │                  │               ├─ Verify Owner                  │
 │                   │                  │               │                │                │
 │                   │                  │               ├─ Retrieve File──────────────────>
 │                   │                  │               │                │         <──────┤
 │                   │                  │               │                │     File stream
 │                   │                  │               │<──────────────────────────────────┤
 │                   │                  │               │                │                │
 │                   │                  │               ├─ Log Download──────────────────>
 │                   │                  │               │                │              Create
 │                   │                  │               │                │             Record
 │                   │                  │               │                │                │
 │                   │ <──── File stream (chunked) ─────┤                │                │
 │                   │                  │               │                │                │
 │ <─ Browser ───────│                  │               │                │                │
 │  download starts  │                  │               │                │                │
```

---

## 6. DEPLOYMENT DIAGRAM

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT ARCHITECTURE                            │
└────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────┐
│         CLIENT DEPLOYMENT                 │
│  ┌──────────────────────────────────────┐ │
│  │ User's Browser                       │ │
│  │ ┌──────────────────────────────────┐ │ │
│  │ │  React SPA (Vite)                │ │ │
│  │ │  - HTML/CSS/JavaScript           │ │ │
│  │ │  - Routing (React Router)        │ │ │
│  │ │  - State Management (Context)    │ │ │
│  │ │  - API Communication (axios)     │ │ │
│  │ └──────────────────────────────────┘ │ │
│  │  LocalStorage: {session, token}     │ │
│  └──────────────────────────────────────┘ │
└────────────────────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    HTTP/HTTPS Request   │   HTTPS       │
         │               │   TLS/SSL     │
         ▼               │               ▼
┌──────────────────────────────────────────────────────────┐
│              API GATEWAY / LOAD BALANCER                 │
│  (Optional - for production scalability)                │
└────────────────┬─────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────┐
│      SERVER DEPLOYMENT (Node.js)         │
│  ┌──────────────────────────────────────┐│
│  │ Express.js Server                    ││
│  │ (localhost:3000)                     ││
│  │                                      ││
│  │ ┌────────────────────────────────┐  ││
│  │ │ Middleware Stack               │  ││
│  │ │ - CORS, Logger, Auth, Parser   │  ││
│  │ └────────────────────────────────┘  ││
│  │                                      ││
│  │ ┌────────────────────────────────┐  ││
│  │ │ Route Handlers                 │  ││
│  │ │ /auth, /documents, /downloads  │  ││
│  │ │ /stats, /trash, /wallet        │  ││
│  │ └────────────────────────────────┘  ││
│  │                                      ││
│  │ ┌────────────────────────────────┐  ││
│  │ │ Controllers & Business Logic   │  ││
│  │ │ authCtrl, docCtrl, downCtrl... │  ││
│  │ └────────────────────────────────┘  ││
│  │                                      ││
│  │ ┌────────────────────────────────┐  ││
│  │ │ Scheduled Background Tasks     │  ││
│  │ │ • Trash Cleanup (hourly)       │  ││
│  │ │ • Storage Enforcement          │  ││
│  │ └────────────────────────────────┘  ││
│  └──────────────────────────────────────┘│
└────┬───────────────────────────┬─────────┘
     │                           │
     │                           │
     ▼                           ▼
┌─────────────────┐      ┌──────────────────┐
│   MongoDB       │      │  File Storage    │
│   Database      │      │  /uploads folder │
│                 │      │                  │
│ Collections:    │      │ Directory Tree:  │
│ • users         │      │ uploads/         │
│ • documents     │      │  ├─ user_id/     │
│ • downloads     │      │  │  ├─ doc_id/   │
│ • trash         │      │  │  │ └─ file1   │
│                 │      │  │  └─ doc_id/   │
│ Indexes:        │      │  ├─ user_id/     │
│ • userId        │      │  └─ ...          │
│ • documentId    │      │                  │
│ • createdAt     │      │ Max: 10GB/user   │
└─────────────────┘      └──────────────────┘
```

---

## 7. STATE DIAGRAM - Document Lifecycle

```
                        START
                          │
                          ▼
        ┌─────────────────────────────────┐
        │    DRAFT/UPLOADED STATE         │
        │  - Document created             │
        │  - File stored in /uploads       │
        │  - Record in MongoDB             │
        │  - User sees in Documents page   │
        └────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ▼                ▼
    Favourite?      Delete?
         │                │
         ▼                ▼
 ┌──────────────┐  ┌──────────────────────┐
 │FAVOURITE     │  │ TRASH STATE          │
 │STATE         │  │ - Marked for deletion│
 │ - Added to   │  │ - Moved to Trash coll│
 │   favourite  │  │ - File kept in /up.. │
 │   list       │  │ - 30-day expiry      │
 │ - Can view   │  │ - User sees in Trash │
 │ - Can unfav  │  └────────┬─────────────┘
 └────┬─────────┘           │
      │                     │
      │              ┌──────┴──────┐
      │              │             │
      │              ▼             ▼
      │         Restore?      Expired?
      │              │             │
      │              ▼             ▼
      │      Back to UPLOADED  PERMANENTLY DELETED
      │      STATE (above)     STATE
      │         ▲              - File deleted from /up
      │         │              - Record deleted from DB
      │         │              - Storage freed up
      │         │              - END
      │         │
      └─────────┘
```

---

## 8. USE CASE DIAGRAM - WORKING FLOW

```
                              ┌─────────────────────────┐
                              │   VAULT APPLICATION     │
                              └─────────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
              ┌──────────┐         ┌──────────┐         ┌────────────┐
              │  LOGIN   │         │REGISTER  │         │ DASHBOARD  │
              └──────────┘         └──────────┘         └────────────┘
                    │                    │                    │
                    │                    │         ┌──────────┼──────────┐
                    │                    │         │          │          │
                    └────────┬───────────┴─────────┤          │          │
                             │                     ▼          ▼          ▼
                             │              ┌─────────────┐ ┌──────┐ ┌────────┐
                             │              │ View Stats  │ │Wallet│ │Recent  │
                             │              │  & Storage  │ │10 GB │ │Files   │
                             │              └─────────────┘ └──────┘ └────────┘
                             │
                    ┌────────┴─────────────────────────────────────────┐
                    │                                                  │
                    ▼                                                  ▼
            ┌──────────────────┐                            ┌──────────────────┐
            │    DOCUMENTS     │                            │      UPLOAD      │
            └──────────────────┘                            └──────────────────┘
                    │                                                  │
       ┌────────────┼────────────┬──────────────┐                     │
       │            │            │              │                     │
       ▼            ▼            ▼              ▼                     │
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────┐               │
    │ List   │  │ View   │  │Download│  │  Favourite │               │
    │Docs    │  │ File   │  │ File   │  │   Toggle   │               │
    └────────┘  └────────┘  └────────┘  └────────────┘               │
       │            │            │              │                     │
       └────────────┼────────────┼──────────────┘                     │
                    │                                                  │
                    ▼                                                  ▼
            ┌──────────────────┐                            ┌──────────────────┐
            │  DELETE DOCUMENT │                            │ FILE SUCCESSFULLY │
            └──────────────────┘                            │ STORED IN VAULT   │
                    │                                       └──────────────────┘
                    ▼
            ┌──────────────────┐
            │   MOVE TO TRASH  │
            │  (30-day expiry) │
            └──────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌──────────┐         ┌──────────────┐
    │ RESTORE  │         │  PERMANENT   │
    │ FILE     │         │  DELETE      │
    │          │         │  (Auto after │
    │          │         │   30 days)   │
    └──────────┘         └──────────────┘


                ┌──────────────────────────────┐
                │  PROFILE & SETTINGS          │
                └──────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        ┌──────────────┐      ┌──────────┐
        │ Edit Profile │      │  Logout  │
        └──────────────┘      └──────────┘
```

---

## Technology Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TECH STACK                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FRONTEND (Client-Side)                                                    │
│  ─────────────────────                                                     │
│  ├─ React 19.2.7           - UI Framework                                 │
│  ├─ React Router 7.18.1    - Page Routing                                 │
│  ├─ Vite                   - Build Tool & Dev Server                      │
│  ├─ Axios 1.18.1           - HTTP Client                                  │
│  ├─ Tailwind CSS 3.4.19    - Styling                                      │
│  ├─ React Icons 5.7.0      - Icon Library                                 │
│  └─ ESLint                 - Code Linting                                 │
│                                                                             │
│  BACKEND (Server-Side)                                                     │
│  ─────────────────────                                                     │
│  ├─ Node.js                - Runtime Environment                          │
│  ├─ Express.js             - Web Framework                                │
│  ├─ MongoDB                - NoSQL Database                               │
│  ├─ Mongoose               - MongoDB ODM (optional)                       │
│  ├─ bcryptjs               - Password Hashing                             │
│  ├─ jsonwebtoken           - JWT Token Generation                         │
│  ├─ cors                   - Cross-Origin Resource Sharing                │
│  ├─ dotenv                 - Environment Variables                        │
│  └─ multer                 - File Upload Handling                         │
│                                                                             │
│  DEPLOYMENT & INFRASTRUCTURE                                               │
│  ────────────────────────────                                              │
│  ├─ Frontend Hosting       - Static file server (Vite build)              │
│  ├─ Backend Hosting        - Node.js server (Express)                     │
│  ├─ Database Hosting       - MongoDB Atlas or local MongoDB               │
│  ├─ File Storage           - Server file system (/uploads)                │
│  ├─ Security               - HTTPS/TLS, JWT, Password Hashing            │
│  └─ Environment            - Windows/Linux/Mac compatible                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

