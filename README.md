# PulseLink — Smart URL Shortener & Analytics Platform

PulseLink is a modern, production-style, full-stack URL shortening and advanced analytics platform built to SaaS-grade standards. Designed with a gorgeous, high-fidelity dark-mode interface, glassmorphism panel styles, Framer Motion animations, and real-time interactive Recharts graphics, it provides developers and businesses complete intelligence over digital links.

This project uses a highly scalable Model-View-Controller (MVC) API backend in Node.js/Express, paired with a React + Vite frontend styled with Tailwind CSS, utilizing JWT for stateless session authentication, and MongoDB for low-latency click metrics and analytics logging.

---

## 🌟 Features

### Core Operations
*   **Instant URL Shortening:** Convert extremely long URLs into clean, short alphanumeric redirection codes.
*   **Custom Brand Aliases:** Optional custom alias codes (e.g., `/my-promo-code`) with unique constraint validation.
*   **Active Expirations:** Safeguard resources or promotions by defining dynamic link expiration dates.
*   **Stateless Security:** Robust JWT session authentication ensuring users can only manage their own URLs.

### Advanced Click Analytics
*   **Real-time Capture:** Parse visitor metrics instantly during redirection.
*   **Detailed Breaks:** Logs total clicks, browser versions, operating systems, device types (Desktop, Mobile, Tablet), referrer domains, and geographical locations.
*   **Activity Timelines:** Area charts highlighting daily click trends for the last 7 days.
*   **Recent Logs:** Tabular ledger of the last 10 clicks with OS, Browser, IP Address, and country detection.

### Modern SaaS Elements
*   **SVG QR Codes:** Custom-built Base64 vector QR codes generated automatically upon URL creation, downloadable for digital prints.
*   **Public Analytics Showcase:** Secure bonus page (`/public/:shortCode`) displaying aggregated click stats for external clients without needing to log in.
*   **Interactive UI:** High-fidelity Glassmorphic cards, loading spinners, skeletal cards, custom scrollbars, and React Hot Toast popups.

---

## 🛠 Tech Stack

### Frontend Architecture
*   **React + Vite:** Ultra-fast hot-module reloading and scaffolding.
*   **Tailwind CSS (v4):** Cutting-edge CSS configuration directly inside stylesheet modules.
*   **Framer Motion:** Micro-interactions, smooth page mounts, and form drawers.
*   **React Router DOM:** Declarative SPAs routing with protected route middleware wrappers.
*   **Axios:** Interceptor-configured REST connector injecting bearer JWT headers.
*   **Recharts:** Scaled SVGs for Area and Pie statistical breakdowns.
*   **Lucide React:** Sleek vector icon library.
*   **React Hot Toast:** Premium micro-notifications.

### Backend Infrastructure
*   **Node.js & Express.js:** Scalable REST framework.
*   **MongoDB + Mongoose:** Document schema models, unique indexes, and aggregation query pipelines.
*   **JWT & bcrypt:** Stateless authorization tokens and secure one-way password hashing.
*   **nanoid:** Unique 6-character shortcode generators.
*   **qrcode:** Server-side Base64 QR code generators.
*   **ua-parser-js:** Deep User-Agent header analytics extraction.
*   **express-validator:** Schema-based validation middleware for incoming requests.
*   **helmet & cors:** Security headers and secure Cross-Origin Resource Sharing.
*   **morgan:** Combined HTTP request network logging.

---

## 📁 Folder Structure

PulseLink utilizes a modular, clean, and scalable MVC architecture:

```text
pulselink/
├── client/
│   ├── src/
│   │   ├── assets/        # Media assets
│   │   ├── components/    # Reusable UI (UrlCard, Loader, ProtectedRoute, DashboardLayout)
│   │   ├── context/       # AuthContext provider
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # LandingPage, Login, Register, Dashboard, AnalyticsDetail, PublicAnalytics
│   │   ├── services/      # API configurations (Axios)
│   │   ├── utils/         # Helpers
│   │   ├── index.css      # Tailwind v4 structure, custom scrollbars, glassmorphism tokens
│   │   ├── main.jsx       # Root initializer
│   │   └── App.jsx        # Router assembly
│   ├── package.json
│   └── vite.config.js
└── server/
    ├── config/            # MongoDB database setups
    ├── controllers/       # MVC Controller layers (auth, url, redirect, analytics)
    ├── middleware/        # JWT auth protection and centralized global error captures
    ├── models/            # Mongoose Schemas (User, Url, Analytics)
    ├── routes/            # REST API Routes mapping
    ├── utils/             # Helper services (tokens)
    ├── validators/        # Express request validation schemas
    ├── server.js          # API Server entrypoint
    ├── .env               # Environment configuration
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v16.x or higher)
*   MongoDB Instance (Local running or MongoDB Atlas cluster URI)

### 1. Database Setup
Ensure your local MongoDB service is running:
```bash
mongod
```
Or prepare a MongoDB Atlas cluster URI connection string.

### 2. Backend Setup
1.  Navigate into the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure `.env` environment parameters:
    Create a `.env` file in the `server` root directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/pulselink
    JWT_SECRET=PulseLinkSuperSecretJWTKey123!
    JWT_EXPIRE=30d
    CLIENT_URL=http://localhost:5173
    BASE_URL=http://localhost:5000
    NODE_ENV=development
    ```
4.  Boot up the development API server:
    ```bash
    npm run dev
    ```
    *The API will run on `http://localhost:5000`.*

### 3. Frontend Setup
1.  Open a new terminal session and navigate into the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Boot up Vite's dev server:
    ```bash
    npm run dev
    ```
    *The client application will run on `http://localhost:5173`.*

---

## 🔌 API Endpoints Reference

### 🔐 Authentication API (`/api/auth`)
*   `POST /register` — Register a new account.
    *   *Payload:* `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword" }`
*   `POST /login` — Access token generation.
    *   *Payload:* `{ "email": "john@example.com", "password": "securepassword" }`
*   `GET /me` — Returns current logged-in user profile details (Bearer Token Required).

### 🔗 URL Operations (`/api/url`)
*   `POST /create` — Generates a shortened URL (Bearer Token Required).
    *   *Payload:* `{ "originalUrl": "https://google.com", "customAlias": "my-google" [optional], "expiresAt": "2026-12-31" [optional] }`
*   `GET /my-urls` — Returns all created URLs for the current logged-in user (Bearer Token Required).
    *   *GET /:id* — Returns single shortlink metadata including Base64 QR Vector strings (Bearer Token Required).
*   `PUT /:id` — Updates destination target link or expiry thresholds (Bearer Token Required).
*   `DELETE /:id` — Deletes shortcode entry and sweeps associated analytics (Bearer Token Required).

### 📊 Analytics API (`/api/analytics`)
*   `GET /:urlId` — Owner detailed statistics breakdown: daily timeline trends, device pie charts, geographical list, activity logs (Bearer Token Required).
*   `GET /public/:shortCode` — Aggregated public statistical breakdown for external client tracking.

### 🌐 Resolve Redirection (`/`)
*   `GET /:shortCode` — Resolves redirection. Capture visit browser metadata, geolocations, IP headers, and redirects to target.

---

## 🏛 Scalable Architecture Highlights

1.  **Strict MVC Layout:** Complete separation of concern. Controller handles requests, routes link paths, validators check arguments, models update DB state.
2.  **Centralized Error capturing:** Robust global error catchers mapping CastErrors, Mongoose Validation constraints, and Duplicate entries (11000) straight into unified JSON outputs.
3.  **Unique Code constraints:** Schema index mapping unique sparse keys for `customAlias` allowing null entries while enforcing uniqueness.
4.  **JWT stateless middlewares:** Decoupled signature keys, parsing bearer authorization and securing all URL/analytics pipelines.

---

## 🎯 AI Planning & Mentorship Strategy

This codebase was crafted adopting modern pair-programming strategies:
*   **Step-by-Step Execution:** Designed an interactive checklist (`task.md`) detailing dependency loads, controller layouts, route binds, layout grids, components, charts, and docs.
*   **Clean Code Patterns:** Strict avoidance of mock placeholders. Zero lazy loading bypass. Full clientside and serverside schema validators implemented using robust validation checks.
*   **Modern Framework Integrations:** Utilizing Tailwind v4 `@import` css compilation structures for low latency stylesheet builds.

---

## 🔮 Future Enhancements
1.  **Multiple API Limits (Rate-limiting):** Protect backend redirects using custom `express-rate-limit` limits.
2.  **True Geo IP API Binds:** Integrate MaxMind database lookups to track literal city/region metrics.
3.  **Custom QR code styles:** Support dots size, color gradients, and logo overlay inside QR modules.
4.  **Workspace Team Collaboration:** Share shorten folders between coworker emails.

---

### 📸 Screenshots
*Dashboard panel, beautiful analytics detailing pages, and vector QR drawers screenshots will appear here.*

### 🎥 Demo Video
*Live walkthrough videos detailing shorten speeds and dynamic charts will appear here.*

---

## 🧠 Assumptions Made
1.  The application expects a local Mongo service or a remote Mongo Atlas connection string placed in `.env` variable `MONGO_URI`.
2.  Redirection matches standard `ua-parser-js` device categories (Desktop, Mobile, Tablet).
3.  Localhost geolocations are mock-mapped into countries consistently via numeric IP hash strings for rich, visually complete visual charts during local evaluations.

---

### **This project is a part of a hackathon run by https://katomaran.com**
