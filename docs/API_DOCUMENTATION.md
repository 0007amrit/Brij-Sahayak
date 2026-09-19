# BrajSahayak REST API Documentation

Base URL: `http://localhost:5001/api`

---

## 1. System Health
### `GET /api/health`
Returns system status, active database provider, and configured AI provider.

**Response:**
```json
{
  "status": "ok",
  "project": "BrajSahayak",
  "version": "1.0.0",
  "mode": "LOCAL_DEVELOPMENT",
  "aiProvider": "mock",
  "database": "Prisma/SQLite (AWS RDS compatible)",
  "timestamp": "2026-09-19T11:53:21.997Z"
}
```

---

## 2. Temples & Sacred Places
### `GET /api/temples`
List all 32 verified sacred places with optional filtering.

**Query Parameters:**
- `city` (string, optional): e.g. `Mathura`, `Vrindavan`, `Govardhan`, `Barsana`
- `zone` (string, optional): e.g. `Old Mathura`, `Old Vrindavan`, `Chhatikara Road`
- `category` (string, optional): e.g. `Temple`, `Sacred Water Body / Ghat`
- `search` (string, optional): Full-text keyword search across names and areas

**Response:**
```json
{
  "success": true,
  "count": 32,
  "disclaimer": "REFERENCE DATA ONLY...",
  "data": [
    {
      "id": "M001",
      "index": 1,
      "name": "Shri Krishna Janmabhoomi Temple",
      "area": "Janmabhoomi, Mathura",
      "zone": "Old Mathura",
      "city": "Mathura",
      "category": "Temple",
      "timing": "5:00 AM–12:00 PM; 4:00–9:00 PM",
      "route": "From Mathura Junction, use Mathura city roads toward Janmabhoomi...",
      "parking": "Use city-side parking such as ISBT, Ramlila Maidan, Railway Ground...",
      "lastMile": "E-rickshaw to outer perimeter, then walk",
      "zoneRule": "This temple is in old Mathura...",
      "nearby": "Janmabhoomi market, peda shops, local thali restaurants...",
      "imageUrl": "https://images.unsplash.com/..."
    }
  ]
}
```

### `GET /api/temples/:id`
Fetch complete details for a single temple using canonical ID (e.g. `M001` to `M032`).

### `GET /api/parking/:templeId`
Fetch suggested reference parking options for a given temple ID.

---

## 3. Grounded AI Assistant
### `POST /api/assistant`
Queries the grounded assistant in English, Hindi, or Hinglish.

**Request Body:**
```json
{
  "query": "Where can I park near Banke Bihari?",
  "preferredLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Suggested reference parking for Banke Bihari Temple (M010)...",
    "language": "en",
    "provider": "mock",
    "sources": ["M010: Banke Bihari Temple Reference Record"],
    "disclaimer": "Reference data only...",
    "suggestedFollowups": ["Banke Bihari opening hours", "Prem Mandir route"]
  }
}
```

---

## 4. Yatra Planner
### `POST /api/planner`
Generates a practical time-budgeted sequence of visits.

**Request Body:**
```json
{
  "startLocation": "Mathura Junction",
  "startTime": "09:00",
  "durationHours": 5,
  "selectedTempleIds": ["M010", "M011"],
  "pace": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "startLocation": "Mathura Junction",
      "startTime": "09:00",
      "endTime": "14:00",
      "totalDurationHours": 5,
      "stopsPlanned": 2,
      "feasibilityNotice": "Feasible itinerary within the requested time envelope."
    },
    "stops": [ ... ],
    "planningDisclaimer": "ESTIMATED ITINERARY DISCLAIMER..."
  }
}
```

---

## 5. Stampede Saviour Crowd Telemetry & Authority Console
### `GET /api/safety/locations`
Returns public density metrics and evaluated risk levels for all 6 monitored venues.

### `GET /api/authority/dashboard`
Returns operational telemetry, active directives, and recent alert dispatch logs for authorized personnel.

### `POST /api/authority/simulate-scenario`
Triggers real-time simulated surges for hackathon evaluation:
- `CRITICAL_BANKE_BIHARI`: Triggers high inflow spike at Banke Bihari.
- `RUSH_MATHURA_JUNCTION`: Triggers passenger train surge at Mathura Junction.
- `RESET_NORMAL`: Restores baseline normal crowd telemetry.

### `PATCH /api/authority/alerts/:id`
Acknowledges an active alert.
