# Smart Health Assistant — Frontend

React + TypeScript + Tailwind frontend for the Smart Health Assistant backend.

## Stack
- **React 18** + TypeScript
- **Vite** (dev server with `/api` proxy to backend)
- **Tailwind CSS** (custom dark theme — ink palette + teal accent)
- **Zustand** (auth state)
- **React Router v6** (client-side routing)
- **Recharts** (health metrics charts)
- **React Dropzone** (lab report file upload)
- **Axios** (API client with auto token refresh)
- **date-fns** (date formatting)

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Email/password login |
| `/register` | RegisterPage | Account creation with optional health profile |
| `/dashboard` | DashboardPage | Health score, stats, recent activity |
| `/chat` | ChatPage | Conversational symptom collection → AI prediction |
| `/lab-reports` | LabReportPage | Upload PDF/image OR manual value entry |
| `/history` | HistoryPage | Prediction & lab report history with detail modals |
| `/profile` | ProfilePage | Edit profile, track health metrics over time |

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit VITE_API_URL if your backend isn't on localhost:8000

# 3. Start
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000` automatically.

## Production Build

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, etc.
```

For production, set `VITE_API_URL=https://your-backend.onrender.com` in your deployment environment.

## Project Structure

```
src/
├── lib/
│   └── api.ts          # Full typed API client — every backend endpoint
├── store/
│   └── auth.ts         # Zustand auth store with token persistence
├── components/
│   └── ui/
│       └── Layout.tsx  # Sidebar navigation shell
└── pages/
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── DashboardPage.tsx
    ├── ChatPage.tsx
    ├── LabReportPage.tsx
    ├── HistoryPage.tsx
    └── ProfilePage.tsx
```
