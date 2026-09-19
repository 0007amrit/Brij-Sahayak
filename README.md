# BrajSahayak (ब्रजसहायक)
### Smart Tourism & Public Safety Platform for Mathura, Vrindavan & the Braj Region

Built for the **AWS Bharat Builds: First Commit** Hackathon.

BrajSahayak is an integrated digital platform that combines cultural pilgrimage exploration with a life-saving public safety engine: **Stampede Saviour**.

---

## Key Highlights & Modules

1. **Tourism Explorer (32 Sacred Places)**:
   - Full 32 verified temples and places loaded with canonical IDs (**M001–M032**).
   - Region filtering across Mathura, Vrindavan, Govardhan, Radha Kund, Barsana, Nandgaon, Gokul, and Baldeo.
   - Verified opening hours, routes, last-mile options (e-rickshaw/walk), and nearby food/shopping/stays.
2. **Flagship Innovation: Stampede Saviour**:
   - AI-assisted crowd-risk early warning and decision-support system.
   - Monitors temples, railway stations (**Mathura Junction**), and bus terminals.
   - Evaluates density ratios ($O = \text{crowd}/\text{capacity}$) and net accumulation flow rates ($\Delta F = \text{entry} - \text{exit}$).
   - Visual risk tiers: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
   - Generates actionable human-in-the-loop SOP recommendations (holding perimeters, traffic diversions, public address advisories).
3. **Authority Control Console**:
   - Live telemetry dashboard with real-time gauges, alert acknowledgment workflows, and historical dispatch logs.
   - Built-in **Simulation Harness** for judges: instantly simulate critical surges or reset to normal.
4. **Grounded Multilingual AI Braj Assistant**:
   - Answers in English, Hindi, and Hinglish.
   - Strictly grounded in the 32-temple knowledge base — refuses out-of-domain queries without hallucinating.
   - Pluggable `IAIProvider` abstraction: runs offline with `MockAIProvider` locally, and switches to **Amazon Bedrock** (`BedrockAIProvider`) via a single environment variable.
5. **Smart Parking & Yatra Planner**:
   - Temple-to-parking locator with clear reference disclaimers.
   - Time-budgeted itinerary builder generating structured chronological timelines.

---

## Project Structure

```
brajsahayak/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Temple, Safety, Authority, AI, Planner controllers
│   │   ├── middleware/       # Authority Auth & Global Error Handlers
│   │   ├── routes/           # REST API routes
│   │   ├── services/
│   │   │   ├── ai/           # IAIProvider, MockAIProvider, BedrockAIProvider
│   │   │   ├── crowd/        # CrowdRiskEngine & AlertService
│   │   │   ├── storage/      # IStorageProvider, LocalStorage, S3Storage
│   │   │   ├── planner/      # YatraPlannerService
│   │   │   └── templeService.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma             # SQLite for zero-config local runs
│   │   ├── schema.postgresql.prisma  # Ready for AWS RDS PostgreSQL
│   │   └── seed.ts                   # Ingests 32 temples + crowd locations
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/ # Navbar & Civic Footer
│   │   ├── pages/            # Home, Temples, Detail, Parking, AI, Planner, Safety, Authority
│   │   ├── services/api.ts   # Typed API client
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
│
├── data/
│   ├── knowledge/            # Source markdown files
│   └── seed/                 # Structured 32 temples & crowd venues JSON
│
├── docs/
│   ├── ARCHITECTURE.md       # Architecture & AWS Target mapping
│   ├── API_DOCUMENTATION.md  # Complete REST API reference
│   └── LOCAL_RUN_GUIDE.md    # Local setup instructions
│
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## Local Startup Instructions

### 1. Install & Seed
```bash
# Backend setup
cd backend
npm install
npm run db:setup

# Frontend setup
cd ../frontend
npm install
```

### 2. Start Servers
- Backend: `npm --prefix backend run dev` (starts on port 5001)
- Frontend: `npm --prefix frontend run dev` (starts on port 5173)

Open `http://localhost:5173` in your browser.

---

## AWS Migration Readiness (Phase 2 Compatible)
- **Frontend**: Pre-configured for **AWS Amplify**.
- **Backend API**: Express router structure is wrapped and ready for **AWS Lambda** via `@vendia/serverless-express` and **Amazon API Gateway**.
- **Database**: Prisma models are 100% portable to **Amazon RDS PostgreSQL** (`schema.postgresql.prisma`).
- **AI**: Pluggable provider architecture (`BedrockAIProvider`) ready for **Amazon Bedrock** (`anthropic.claude-3-haiku` / `amazon.titan`).
