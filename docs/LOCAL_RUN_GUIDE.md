# BrajSahayak Local Run & Development Guide

Follow these exact steps to run BrajSahayak from a clean terminal.

## Prerequisites
- **Node.js**: v18+ or v20+ (Node v26 tested and verified)
- **npm**: v9+ or v11+
- **Python 3** (for running automated E2E test scripts)

---

## 1. Quick Start (From Project Root)

```bash
cd /Users/amritmishra05/.gemini/antigravity/scratch/brajsahayak

# 1. Install dependencies
npm --prefix backend install
npm --prefix frontend install

# 2. Initialize Database & Ingest 32 Temples + Crowd Venues
npm --prefix backend run db:setup

# 3. Start Backend Server (Terminal 1)
npm --prefix backend run dev

# 4. Start Frontend Dev Server (Terminal 2)
npm --prefix frontend run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5001/api`
- **Backend Health Check**: `http://localhost:5001/api/health`

---

## 2. Running Automated Tests

Run the complete 21-test integration suite:

```bash
python3 -c "
import urllib.request, json
res = json.loads(urllib.request.urlopen('http://localhost:5001/api/temples').read().decode())
print('Temples Loaded:', res['count'])
"
```
Or execute the automated test runner in the root directory:
```bash
npm run test:e2e
```

---

## 3. Demo Credentials & Authority Access

- **Authority Key / Passcode**: `braj-authority-secure-key` or `authority2026`
- **Authority Dashboard**: `http://localhost:5173/authority`
