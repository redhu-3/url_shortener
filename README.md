# URL Shortener

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   ```
2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```
3. **Configure environment variables**
   - Copy `.env.example` to `.env` in both `frontend` and `backend` directories.
   - Update the variables as needed (e.g., database URL, API keys).
4. **Run the backend**
   ```bash
   npm start   # or npm run dev
   ```
5. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```
6. **Start the frontend**
   ```bash
   npm run dev   # Vite/Next dev server
   ```
7. Open `http://localhost:3000` in your browser.

## Assumptions Made

- The project uses **Node.js** (v18+) for both frontend and backend.
- A **MongoDB** instance is available for URL storage (configurable via `MONGODB_URI`).
- Environment variables are correctly set; missing variables will cause the app to crash on startup.
- The short URL format is `/<alias>` where `alias` is generated uniquely.
- The frontend is built with **React** (Vite) and expects the backend API at `http://localhost:5000` (configurable via `REACT_APP_API_URL`).

# AI Planning Document & Architecture Diagram

The architecture diagram below illustrates the three‑tier flow of the URL Shortener application:

![Architecture Diagram](file:///C:/Users/redhu/.gemini/antigravity-ide/brain/6b852c16-bc9b-4cb6-a971-eb8e1447d972/architecture_diagram_1780491639920.png)

**High‑level workflow:**

1. **User accesses the frontend** (React, Vite) at `http://localhost:3000`.
2. **Frontend sends API requests** to the backend (Express) for creating or retrieving short URLs.
3. **Backend interacts with MongoDB** to store/retrieve `{ alias, originalUrl }` mappings and logs visits.
4. **Backend returns data** to the frontend – either the generated short URL or analytics data.
5. **When a visitor accesses a short URL**, the backend performs a `302` redirect to the original URL.

For a detailed step‑by‑step flowchart, see the companion file:

- [AI_PLANNING.md](file:///c:/Users/redhu/OneDrive/Dokumen/URL%20SHORTENER/AI_PLANNING.md)

## Demonstration Video

The detailed AI planning document and architecture diagram can be found in the companion file:

- [AI_PLANNING.md](file:///c:/Users/redhu/OneDrive/Dokumen/URL%20SHORTENER/AI_PLANNING.md)

## Demonstration Video

A walkthrough of the application is available here:

- **Loom Video**: https://www.loom.com/share/PLACEHOLDER_VIDEO_ID
- **YouTube Video**: https://www.youtube.com/watch?v=PLACEHOLDER_VIDEO_ID

*Replace the placeholders with the actual video URLs before submission.*

---

This project is a part of a hackathon run by https://katomaran.com
