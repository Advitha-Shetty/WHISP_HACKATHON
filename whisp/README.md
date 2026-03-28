# WHISP — Women’s Health Information & Support Platform

Production-style monorepo: **React (Vite) + Tailwind**, **Node (Express)** API, **FastAPI** analytics, **PostgreSQL** (core metrics), **MongoDB** (citizen reports), **Redis** (optional cache).

**Brand UI:** primary purple `#5D3EBC`, accent pink, risk colours (red / amber / green), cards ~14px radius — aligned with the dashboard reference you shared.

---

## 1. Architecture overview

| Layer | Role |
|--------|------|
| `frontend/` | Citizen + government dashboards, Leaflet maps, Recharts, JWT login for `/gov`. |
| `backend/` | REST API, JWT auth, WHI/TRI/leakage logic, report-adjusted scores, optional PG + Mongo + Redis + ML HTTP client. |
| `ml/` | FastAPI: WHI/TRI, leakage narrative, **rule-based impact simulator**, menopause assess, recommendations. |
| `database/schema.sql` | PostgreSQL DDL + seed rows for 5 Karnataka districts. |

**WHI (0–100):**  
`0.4×anaemia + 0.3×menstrualHygiene + 0.2×awareness + 0.1×menopauseSupport` (each input 0–100; higher = better outcome/coverage).

**TRI:** Sample standard deviation across the four scores — high value ⇒ **thematic resource imbalance**.

**Citizen layer:** Each **Open** or **Investigating** report applies up to **−2 WHI** points per report (cap **−15**), so anonymous submissions feed the live index.

**Fund leakage flag:** `utilized/allocated < 0.65` and `funding > ₹20 Cr`.

---

## 2. Folder structure

```
whisp/
├── frontend/          # Vite + React + Tailwind + Leaflet + Recharts
├── backend/
│   ├── server.js
│   ├── data/seed.json
│   └── src/
│       ├── app.js
│       ├── initData.js
│       ├── state.js
│       ├── http/routes.js
│       ├── lib/analytics.js
│       ├── middleware/auth.js
│       ├── db/postgresDistricts.js
│       └── services/   # redisCache, mlClient, reportsStore (Mongo/memory)
├── ml/
│   ├── analytics_service.py
│   └── requirements.txt
├── database/schema.sql
├── docker-compose.yml  # postgres + mongo + redis for local dev
├── data/sample-districts.json
└── README.md
```

---

## 3. Prerequisites

- **Node.js 18+**
- **Python 3.10+**
- Optional: **Docker Desktop** (for databases), **PostgreSQL** client (`psql`) to load schema

---

## 4. Step-by-step: run everything (Windows PowerShell)

### A. Optional: start databases

```powershell
Set-Location "c:\Users\TASYA SHETTY\OneDrive\Desktop\whisp"
docker compose up -d
```

Apply PostgreSQL schema (adjust connection string for your install):

```powershell
# example after docker-compose postgres is up:
$env:PGPASSWORD = "whisp"
psql -h localhost -U whisp -d whisp_db -f database/schema.sql
```

### B. Backend API

```powershell
Set-Location "c:\Users\TASYA SHETTY\OneDrive\Desktop\whisp\backend"
Copy-Item .env.example .env
# Edit .env: set JWT_SECRET; optionally DATABASE_URL, MONGODB_URI, REDIS_URL, ML_SERVICE_URL
npm install
npm run dev
```

Default: **http://localhost:5000**  
Health: `GET http://localhost:5000/api/health`

### C. ML service (FastAPI)

**Python 3.13 on Windows:** older pins tried to compile `pydantic-core` (needs Rust). The current `requirements.txt` uses versions with **pre-built wheels** — no Rust required.

```powershell
Set-Location "c:\Users\TASYA SHETTY\OneDrive\Desktop\whisp\ml"
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python analytics_service.py
```

Docs: **http://localhost:8000/docs** (unless you change `PORT` below).

**Port 8000 already in use** (`WinError 10048`): either stop the other process or run on another port:

```powershell
$env:PORT = "8001"
python analytics_service.py
# Then set in backend/.env → ML_SERVICE_URL=http://localhost:8001
```

See which PID holds 8000 (optional):

```powershell
netstat -ano | findstr :8000
```

Point the API at ML (in `backend/.env`):

```env
ML_SERVICE_URL=http://localhost:8000
```

### D. Frontend

```powershell
Set-Location "c:\Users\TASYA SHETTY\OneDrive\Desktop\whisp\frontend"
npm install
npm run dev
```

Open **http://localhost:5173**  
`vite.config.js` proxies `/api` → `http://localhost:5000` so the browser can call `/api/...` without CORS friction.

**Government login (demo):** `admin@whisp.gov` / `Admin@123`

---

## 5. Test APIs (PowerShell examples)

```powershell
# Health
Invoke-RestMethod http://localhost:5000/api/health

# Districts + WHI/TRI/leakage + report-adjusted scores
Invoke-RestMethod http://localhost:5000/api/districts

# Explainable payload
Invoke-RestMethod http://localhost:5000/api/health-score/1/explain

# Anonymous report (updates live WHI penalty when unresolved)
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/reports `
  -ContentType "application/json" `
  -Body '{"district":"Ballari","type":"No Pads Available","location":"Demo PHC"}'

# Login
$login = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@whisp.gov","password":"Admin@123"}'
$token = $login.token

# Simulation (government JWT)
$h = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/simulation `
  -Headers $h `
  -Body '{"districtId":1,"extraFunding":10,"extraPrograms":5}'
```

---

## 6. Environment variables

**Backend** (`backend/.env.example`): `PORT`, `JWT_SECRET`, `FRONTEND_URL`, optional `DATABASE_URL`, `MONGODB_URI`, `MONGODB_DB`, `REDIS_URL`, `ML_SERVICE_URL`, `CACHE_TTL_SEC`.

**Frontend:** optional `VITE_API_URL` (e.g. `http://localhost:5000/api` in production static hosting without proxy).

---

## 7. Deployment (summary)

| Component | Suggested host |
|-----------|----------------|
| Frontend | **Vercel** — `npm run build`, output `frontend/dist`, set `VITE_API_URL` to public API origin + `/api`. |
| API | **Railway** / **Render** — start `node server.js`, set env vars. |
| PostgreSQL | **Neon** / **Supabase** — run `database/schema.sql`, set `DATABASE_URL`. |
| MongoDB | **Atlas** — set `MONGODB_URI`. |
| Redis | **Upstash** — set `REDIS_URL`. |
| ML | **Railway** — start command `uvicorn analytics_service:app --host 0.0.0.0 --port 8000` (or `python analytics_service.py`), set `ML_SERVICE_URL` on the Node service. |

---

## 8. Licence

MIT — built for public-health impact.
