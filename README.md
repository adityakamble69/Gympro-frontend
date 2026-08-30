# Gym Management System - Admin Dashboard

This is the front-end dashboard for the Gym Management System, built with **Vite**, **React**, and styled with custom themes. It provides admin control over members, payments, check-ins, reports, notifications, and settings.

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── components/       # Shared UI components (Sidebar, Badges, etc.)
│   ├── hooks/            # Custom React hooks (useAuth)
│   ├── pages/            # View pages (Dashboard, Members, Payments, Reports, etc.)
│   ├── services/         # API instance wrapper (axios configured with auth headers)
│   ├── styles/           # Styling files
│   ├── App.jsx           # Routing structure and private route wrappers
│   └── main.jsx          # React app mounting point
├── vite.config.js        # Vite bundler configurations
└── .env                  # API connection variables (Git-ignored)
```

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root of the `frontend/` directory:

```env
# Local Backend URL (default PORT is 8080)
VITE_API_URL=http://localhost:8080/api
```

---

## 🚀 How to Run Local Dashboard

### 1. Install Dependencies
Make sure you are inside the `frontend` folder, then run:
```bash
npm install
```

### 2. Start Dev Server
To start the React development server:
```bash
npm run dev
```
*(Vite will spin up the server, typically on `http://localhost:5173` or another port displayed in the console).*

### 3. Build for Production
To generate a static build bundle for Vercel/Netlify hosting:
```bash
npm run build
```
*(The optimized compiled build will be generated in the `dist/` directory).*
