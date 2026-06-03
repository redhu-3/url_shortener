# AI Planning Document & Architecture Diagram

## Overview
The **URL Shortener** consists of three layers:
1. **Frontend** – React (Vite) UI for creating and retrieving short links.
2. **Backend** – Node.js/Express API that generates aliases, stores mappings, and handles redirects.
3. **Database** – MongoDB persisting the alias‑URL records.

---

## End‑to‑End Workflow (Plain Text, Top‑Down)
1. **Landing Page Load** – User opens the application URL (e.g., `http://localhost:3000`).
2. **Enter Long URL** – The React form on the landing page captures the user‑provided long URL.
3. **Submit Form** – The frontend sends a `POST /api/shorten` request containing the long URL in the JSON body.
4. **Backend Validation** – The server validates the URL format and checks if an alias already exists.
5. **Alias Generation** – If there is no existing alias, the backend creates a unique 6‑character alphanumeric string.
6. **Persist Mapping** – The `{ alias, originalUrl, createdAt }` record is stored in MongoDB.
7. **Return Short URL** – The backend responds with the full short link (e.g., `https://short.ly/abc123`).
8. **Display Result** – The frontend shows the short URL to the user and provides a copy‑to‑clipboard button.
9. **User Shares Link** – The user can copy and share the short URL.
10. **Redirect Flow** – When anyone visits `https://short.ly/abc123`:
    a. The request reaches the backend route `GET /:alias`.
    b. The backend looks up the alias in MongoDB.
    c. If found, it records a visit (timestamp, IP) for analytics.
    d. It sends an HTTP 301 redirect to the original long URL.
    e. The visitor’s browser follows the redirect and loads the original site.
11. **Analytics Page** – The `/analytics` frontend page requests `GET /api/visits`.
    a. The backend queries the `visits` collection.
    b. The data is returned and rendered as charts (total clicks, timestamps, etc.).

---

## Architecture Diagram
The diagram visualising these components is stored as `architecture_diagram.png`.

![Architecture Diagram](file:///C:/Users/redhu/.gemini/antigravity-ide/brain/6b852c16-bc9b-4cb6-a971-eb8e1447d972/architecture_diagram_1780491639920.png)

---

## Design Decisions
- **Alias Length**: 6 alphanumeric characters, checked for uniqueness.
- **Stateless Backend**: Enables horizontal scaling behind a load balancer.
- **Security**: Input sanitisation, rate limiting, env‑based configuration.

---

## Future Enhancements
- Support custom user‑chosen aliases.
- richer analytics (geolocation, device info).
- Add a Redis cache for faster redirect look‑ups.

---

*This document now provides a clear, top‑down textual description of the entire application workflow.*
