# snip.ly — Premium URL Shortener & Analytics Platform

snip.ly is a modern, full-stack link management platform built on a 3-tier architecture. It supports standard and Google OAuth authentication, custom URL alias creation, link expiration, bulk CSV importing, on-demand health checks, and a rich analytics suite with geolocation and device breakdowns.

---

## Setup Instructions

### Prerequisites

- **Node.js** v18.0.0 or higher
- **MongoDB** — a running local instance or a MongoDB Atlas connection string
- **Google OAuth Credentials** *(optional, for Google Login)*
- **Gmail Account & App Password** *(optional, for password reset emails)*

---

### 1. Backend Configuration

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>
PORT=5000

# Security
JWT_SECRET=your_jwt_signing_secret_here

# Frontend URL (for CORS and reset-password emails)
FRONTEND_URL=http://localhost:5173

# Nodemailer SMTP (for password reset emails)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
```

Start the backend server:

```bash
# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start
```

The backend will be available at `http://localhost:5000`.

---

### 2. Frontend Configuration

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

Create a `.env.development` file for local development:

```env
VITE_API_URL=http://localhost:5000
```

Create a `.env` file for production:

```env
VITE_API_URL=https://your-deployed-backend-url.com
FRONTEND_URL=https://your-deployed-frontend-url.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Start the frontend development server:

```bash
npm run dev
```

The React application will be available at `http://localhost:5173`.

---

## Assumptions Made

1. **Node.js Runtime** — The system runs on Node.js v18+. Both backend and frontend packages use ES Modules (`"type": "module"`).
2. **Database Connection** — A MongoDB instance (local or Atlas) is active and reachable via the `MONGO_URI` connection string.
3. **Port Allocation** — The backend defaults to port `5000`; the Vite frontend defaults to port `5173`.
4. **Google OAuth** — The Google Client ID used in both `.env` files must belong to the same Google Cloud Console project, with `http://localhost:5173` whitelisted as an Authorized JavaScript Origin.
5. **Email SMTP** — Nodemailer uses Gmail SMTP. The sender account must have 2-Step Verification enabled, and the generated App Password must be supplied in `EMAIL_PASS`.
6. **Geolocation Accuracy** — IP-based geolocation is used for visitor analytics. Loopback addresses (`127.0.0.1`, `localhost`) resolve to unknown/local values since they have no global geographical mapping.

---

## AI Planning Document & Architecture

### Application Overview

snip.ly is composed of three primary layers:

- **Frontend** — A responsive React single-page application built with Vite, TailwindCSS, and Framer Motion.
- **Backend** — A stateless REST API on Node.js and Express handling short code generation, redirects, analytics aggregation, and authentication.
- **Database** — MongoDB as the persistent document store for users, URL mappings, and visitor analytics.

---

### Feature List

**Authentication & User Management**
- Secure email/password registration with Bcrypt hashing (salt round 12) and JWT sessions
- Google OAuth one-click login via `@react-oauth/google` and `google-auth-library`
- Forgot-password flow with secure timed reset tokens sent via Nodemailer (Gmail SMTP)

**Link Shortening & Management**
- Auto-generated unique 7-character short codes using `nanoid`
- Custom aliases (3–30 characters: letters, numbers, `-`, `_`) with reserved-word validation and uniqueness checks
- Optional expiration dates — expired links return HTTP 410 Gone
- Public/private visibility toggle with a community links board for public links
- Bulk creation via CSV upload (up to 100 links) using `papaparse`
- Favorites management for dashboard filtering
- Full edit and delete support including visit history cleanup

**Advanced Analytics**
- IP-based geolocation for Country and City lookup
- User-Agent parsing for browser, OS, and device type (Desktop, Mobile, Tablet) via `ua-parser-js`
- Referrer tracking (Direct, Twitter/X, GitHub, search engines, etc.)
- Interactive dashboards with 30-day click trend line charts and doughnut/bar breakdowns powered by `chart.js` and `react-chartjs-2`
- Shareable public analytics pages for links marked as public

**Link Health Checking**
- On-demand ping checks using backend `fetch` with abort timeouts
- Returns status (`live`, `redirect`, `dead`) and response time in milliseconds
- 5-minute cooldown cache stored in the database to optimize network usage

---

### Architectural Design Decisions

- **Stateless Authentication** — JWTs stored on the frontend client allow the backend to scale horizontally without database session lookups.
- **Background Analytics Processing** — Visit logging and IP geolocation run asynchronously after the redirect response is sent, keeping redirect latency minimal.
- **Strict Security Middleware** — Route-level `protect` middleware verifies JWT signatures, validates input, and enforces CORS against allowed origins.

---

### Application Workflow

```mermaid
flowchart TD
    classDef page fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef action fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
    classDef db fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef ext fill:#ef4444,stroke:#dc2626,stroke-width:2px,color:#fff;

    Guest([Guest Visitor]) --> LandingPage[Landing Page]:::page

    LandingPage --> ViewPublic[View Public Links Board]:::action
    LandingPage --> GoLogin[Go to Login Page]:::page
    LandingPage --> GoRegister[Go to Register Page]:::page

    GoRegister --> RegisterAction{Register Option}
    RegisterAction -->|Standard Sign Up| CreateUser[Enter Name, Email, Password]:::action
    RegisterAction -->|OAuth| GoogleOAuth1[Google Sign-In]:::ext
    CreateUser --> RegisterDB[(Save User in MongoDB)]:::db
    GoogleOAuth1 --> RegisterDB

    GoLogin --> LoginAction{Login Option}
    LoginAction -->|Credentials| AuthCreds[Enter Email & Password]:::action
    LoginAction -->|OAuth| GoogleOAuth2[Google Sign-In]:::ext
    LoginAction -->|Forgot Password| ForgotPwd[Request Reset Email]:::action

    ForgotPwd --> ResetMail[Send Reset Link via Nodemailer]:::ext
    ResetMail --> ResetPwd[Reset Password Page]:::page
    ResetPwd --> AuthCreds

    AuthCreds --> VerifyUser{JWT Verify}
    GoogleOAuth2 --> VerifyUser
    VerifyUser -->|Success| Dashboard[User Dashboard]:::page
    VerifyUser -->|Failure| GoLogin

    Dashboard --> CreateLink{Shorten Link}
    CreateLink -->|Single Form| SingleShorten[Enter URL, Custom Alias, Expiration, Visibility]:::action
    CreateLink -->|Bulk Import| CSVShorten[Upload CSV File - up to 100 links]:::action
    SingleShorten --> SaveLink[(Store Short URL in MongoDB)]:::db
    CSVShorten --> SaveLink

    Dashboard --> ManageLink[Manage Created Links]:::action
    ManageLink --> ToggleFav[Mark/Filter Favorites]:::action
    ManageLink --> DeleteLink[Delete Link & Visit History]:::action
    ManageLink --> EditLink[Edit URL, Alias, Expiration, Visibility]:::action
    ManageLink --> PingCheck[On-Demand Ping Health Check]:::action

    ToggleFav --> SaveLink
    DeleteLink --> SaveLink
    EditLink --> SaveLink
    PingCheck --> PingRequest{Trigger Backend Ping}
    PingRequest -->|Fetch HEAD/GET| TargetSite[External Target Website]:::ext
    TargetSite -->|Latency & Status| SavePing[(Save Cache in DB)]:::db
    SavePing --> ShowPing[Display Ping Diagnostics]:::action

    ManageLink --> ViewAnalytics[View Full Link Analytics]:::page
    ViewAnalytics --> FetchAnalytics[Fetch 30-Day Click Logs]:::action
    FetchAnalytics --> RenderCharts[Render ChartJS Line/Doughnut Charts]:::action

    LandingPage --> AccessPublicStats[View Public Stats Page]:::page
    AccessPublicStats --> FetchPublicStats[Fetch Analytics for Public Links]:::action
    FetchPublicStats --> RenderCharts

    class LandingPage,GoLogin,GoRegister,ResetPwd,Dashboard,ViewAnalytics,AccessPublicStats page;
    class ViewPublic,CreateUser,AuthCreds,ForgotPwd,SingleShorten,CSVShorten,ManageLink,ToggleFav,DeleteLink,EditLink,PingCheck,ShowPing,FetchAnalytics,RenderCharts,FetchPublicStats action;
    class RegisterDB,SaveLink,SavePing db;
    class GoogleOAuth1,GoogleOAuth2,ResetMail,TargetSite ext;
```

---

### Visitor Redirection & Analytics Capture Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Visitor Client
    participant Server as Express Server
    participant DB as MongoDB
    participant GeoAPI as GeoIP Provider

    Visitor->>Server: GET /:shortCode (e.g., /my-promo)
    activate Server
    Server->>DB: Find URL by shortCode or alias
    activate DB
    DB-->>Server: Return URL document
    deactivate DB

    alt URL not found
        Server-->>Visitor: 404 Short URL not found
    else URL expired (current time > expiresAt)
        Server-->>Visitor: 410 This link has expired
    else URL is valid and active
        Note over Server: Increment clickCount and save URL
        Server->>DB: Save updated clickCount
        Note over Server: Parse User-Agent and Geolocation in background
        Server->>GeoAPI: Look up location for IP address
        activate GeoAPI
        GeoAPI-->>Server: Return Country and City
        deactivate GeoAPI
        Server->>DB: Create Visit document (IP, browser, OS, device, country, city, referrer)
        Server-->>Visitor: HTTP 302 Redirect to originalUrl
    end
    deactivate Server
```

---

### Architecture & Flow Diagrams

#### System Architecture Diagram
![System Architecture Diagram](./ARCHITECTURE_DIAGRAM.png)

#### Application Redirection & Sequence Flow Chart
![Flow Chart](./Flow%20chart.png)

---

### Application Screenshots (Output Showcase)

Here are the output screenshots displaying the UI and core features of the application:

#### 1. Landing Page
![Landing Page](./OUTPUT_IMAGES/Landing%20page.png)

#### 2. Authentication Page (Login & Register)
![Login & Register](./OUTPUT_IMAGES/login_Registerpage.png)

#### 3. Dashboard Page
![Dashboard Page](./OUTPUT_IMAGES/Dashboard%20page.png)

#### 4. Link Creation
![Link Creation](./OUTPUT_IMAGES/Link%20creation.png)

#### 5. Favourite Links
![Favourite Links](./OUTPUT_IMAGES/Favourite%20links.png)

#### 6. QR Code Generation
![QR Code](./OUTPUT_IMAGES/QR.png)

#### 7. CSV Bulk Upload
![CSV Bulk Upload](./OUTPUT_IMAGES/CSV%20upload.png)

#### 8. Generated Bulk Links
![Generated Bulk Links](./OUTPUT_IMAGES/Generated%20Bulk%20links.png)

#### 9. Analytics Page
![Analytics Page](./OUTPUT_IMAGES/Analyticspage.png)

#### 10. Public Statistics
![Public Statistics](./OUTPUT_IMAGES/Public%20stats.png)
## Demo Video

Watch the complete walkthrough covering user onboarding, link shortening with custom aliases and expiration, bulk CSV upload, live redirection, health check pings, and the interactive analytics dashboard:

**YouTube Demo:** [Watch on YouTube](https://youtu.be/cbv5PnJi-A0)

---

*This project is a part of a hackathon run by https://katomaran.com*