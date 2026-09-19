# BrajSahayak System Architecture

BrajSahayak is designed with a **cloud-ready, decoupled architecture** built specifically for seamless migration to AWS serverless and managed services without rewriting application code.

## 1. Local Development Architecture vs Target AWS Architecture

```
========================================================================================
LOCAL DEVELOPMENT ENVIRONMENT (CURRENT PHASE)
========================================================================================

  [React 18 + Vite + Tailwind UI]
           │
           │ HTTP Proxy (port 5173 -> 5001)
           ▼
  [Node.js + Express REST API (port 5001)]
     ├── TempleService (32 verified temples, M001–M032)
     ├── StampedeSaviour Risk Engine (Density ratio + flow rate)
     ├── AlertService (Active & historical dispatch log)
     ├── YatraPlannerService (Opening hours + cluster heuristics)
     └── AIService
           ├── MockAIProvider (Grounded strictly in local dataset)
           └── BedrockAIProvider (Configured bridge ready for Phase 2)
           │
           ▼
  [Prisma ORM with SQLite (dev.db) / Local PostgreSQL via Docker]
  [Local Static Asset Store (public/assets)]


========================================================================================
TARGET AWS ARCHITECTURE (PHASE 2 - NO RE-ARCHITECTURE REQUIRED)
========================================================================================

  [AWS Amplify Hosting] (React SPA static build)
           │
           │ HTTPS API Calls
           ▼
  [Amazon API Gateway (HTTP API / REST)]
           │
           │ Lambda Proxy Integration
           ▼
  [AWS Lambda / Node.js Express Container (via @vendia/serverless-express)]
     ├── TempleService
     ├── StampedeSaviour Risk Engine
     ├── AlertService
     ├── YatraPlannerService
     └── AIService
           └── GroundedKnowledgeAIProvider (Self-contained Rule-Based RAG, Zero-Cloud dependency)
           │
     ┌─────┴─────────────────────────┐
     ▼                               ▼
  [Amazon RDS PostgreSQL]       [Self-Contained Grounded Knowledge Store / S3]
  (schema.postgresql.prisma)     (Static temple media + vector docs)
========================================================================================
```

## 2. Pluggable Service Abstractions

### AI Service Abstraction (`IAIProvider`)
- Interface: `generateResponse(request: AIQueryRequest): Promise<AIQueryResponse>`
- **MockAIProvider (Local)**:
  - Strict grounded evaluation against the 32 temples knowledge base.
  - Multi-lingual response (English, Hindi, Hinglish).
  - Out-of-domain safe fallback: *"I don't have enough verified information for that."*
- **BedrockAIProvider (AWS Cloud)**:
  - Formatted for `@aws-sdk/client-bedrock-runtime` calling Anthropic Claude 3 Haiku or Amazon Titan.
  - Activated by flipping `AI_PROVIDER=bedrock` in `.env`.

### Storage Service Abstraction (`IStorageProvider`)
- Interface: `getAssetUrl(path: string): string; saveAsset(name: string, buf: Buffer): Promise<string>`
- **LocalStorageProvider**: Serves media from local `public/assets`.
- **S3StorageProvider**: Formats asset URLs to `https://<bucket>.s3.<region>.amazonaws.com/<path>`.
- Activated by flipping `STORAGE_PROVIDER=s3`.

### Database Schema Portability (Prisma ORM)
- Local runs use `schema.prisma` with SQLite (`file:./dev.db`), requiring zero database daemon installs.
- AWS runs use `schema.postgresql.prisma` with AWS RDS PostgreSQL.
- Both schemas share 100% identical models, fields, and relation definitions.

## 3. Stampede Saviour Decision-Support Model
- **Mathematical Thresholds**:
  - $O = \text{currentCrowd} / \text{capacity}$ (Occupancy ratio)
  - $\Delta F = \text{entryRate} - \text{exitRate}$ (Net accumulation flow)
  - Risk Levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Safeguards**:
  - Explicitly marked as a prototype decision-support tool.
  - Generates recommended human SOP actions (holding areas, traffic diversions, public address advisories).
  - Does NOT claim autonomous physical infrastructure actuation.
