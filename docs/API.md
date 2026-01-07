# Skaidrus Seimas API Documentation

## Overview

The Skaidrus Seimas API provides programmatic access to Lithuanian Parliament data. Built with **tRPC** for type-safe communication between client and server.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.seimas.example.com`

## API Format

This API uses **tRPC** - a TypeScript-first RPC framework. All endpoints follow the pattern:

```
GET /api/trpc/{router}.{procedure}?input={json_encoded_params}
```

### Example Request

```bash
# Get MP by ID
curl "http://localhost:3000/api/trpc/mps.byId?input=%7B%22id%22%3A1%7D"

# List all active MPs
curl "http://localhost:3000/api/trpc/mps.list?input=%7B%22isActive%22%3Atrue%7D"

# Compare two MPs
curl "http://localhost:3000/api/trpc/mps.compare?input=%7B%22mpId1%22%3A1%2C%22mpId2%22%3A2%7D"
```

## Rate Limiting

| Endpoint Type     | Limit   | Window | Block Duration |
| ----------------- | ------- | ------ | -------------- |
| Read (MPs, Bills) | 100 req | 60 sec | -              |
| Search            | 30 req  | 60 sec | -              |
| Expensive Queries | 20 req  | 60 sec | -              |
| Auth (Login)      | 5 req   | 60 sec | 5 min          |

Rate limit headers are included in every response:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `Retry-After`: Seconds until limit resets (when blocked)

## Endpoints

### MPs Router (`mps.*`)

#### `mps.list`

List all Members of Parliament with optional filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| party | string | No | Filter by party name |
| isActive | boolean | No | Filter by active status |

**Response:**

```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "seimasId": "12345",
        "name": "Jonas Jonaitis",
        "party": "Tėvynės sąjunga",
        "faction": "TS-LKD",
        "isActive": true
      }
    ]
  }
}
```

#### `mps.byId`

Get detailed MP information including statistics.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | MP database ID |

**Response:**

```json
{
  "result": {
    "data": {
      "id": 1,
      "name": "Jonas Jonaitis",
      "stats": {
        "votingAttendance": "85.50",
        "partyLoyalty": "92.30",
        "accountabilityScore": "78.20"
      },
      "assistants": [...],
      "trips": [...]
    }
  }
}
```

#### `mps.compare`

Compare voting patterns between two MPs.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| mpId1 | number | Yes | First MP ID |
| mpId2 | number | Yes | Second MP ID |

**Response:**

```json
{
  "result": {
    "data": {
      "mp1": { "id": 1, "name": "Jonas", "stats": {...} },
      "mp2": { "id": 2, "name": "Petras", "stats": {...} },
      "agreementScore": 67.5,
      "commonVotes": 234
    }
  }
}
```

#### `mps.search`

Search MPs by name.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| searchTerm | string | Yes | Search query (min 2 chars) |

---

### Bills Router (`bills.*`)

#### `bills.list`

List all legislative bills with optional filtering.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| status | string | No | Filter by status (Pateiktas, Svarstymas, Priimtas, etc.) |
| category | string | No | Filter by category |

#### `bills.byId`

Get detailed bill information with AI-generated summary.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | Bill database ID |

---

### Votes Router (`votes.*`)

#### `votes.byMp`

Get voting history for an MP.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| mpId | number | Yes | MP database ID |
| limit | number | No | Max results (default: 50) |

#### `votes.byBill`

Get all votes for a specific bill.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| billId | number | Yes | Bill database ID |

---

### Committees Router (`committees.*`)

#### `committees.list`

List all parliamentary committees.

#### `committees.byId`

Get committee details with members.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | Committee database ID |

---

### Dashboard Router (`dashboard.*`)

#### `dashboard.pulse`

Get real-time activity statistics.

**Response:**

```json
{
  "result": {
    "data": {
      "recentVotes": 156,
      "activeMPs": 138,
      "pendingBills": 42,
      "dailyActivity": [{ "date": "2024-01-15", "votes": 23 }]
    }
  }
}
```

#### `dashboard.globalStats`

Get aggregated statistics across all MPs.

---

### Quiz Router (`quiz.*`)

#### `quiz.questions`

Get quiz questions for a bill.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| billId | number | Yes | Bill database ID |

#### `quiz.mpAnswers`

Get MP answers for quiz questions.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| mpId | number | Yes | MP database ID |

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "MP not found",
    "code": "NOT_FOUND",
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404
    }
  }
}
```

### Error Codes

| Code                  | HTTP Status | Description              |
| --------------------- | ----------- | ------------------------ |
| BAD_REQUEST           | 400         | Invalid input parameters |
| UNAUTHORIZED          | 401         | Authentication required  |
| FORBIDDEN             | 403         | Insufficient permissions |
| NOT_FOUND             | 404         | Resource not found       |
| TOO_MANY_REQUESTS     | 429         | Rate limit exceeded      |
| INTERNAL_SERVER_ERROR | 500         | Server error             |

---

## Data Types

### Vote Values (Lithuanian)

| Value      | English             | Description                 |
| ---------- | ------------------- | --------------------------- |
| už         | For                 | Voted in favor              |
| prieš      | Against             | Voted against               |
| susilaikė  | Abstained           | Abstained from voting       |
| nebalsavo  | Did not vote        | Was present but didn't vote |
| nedalyvavo | Did not participate | Was absent                  |

### Bill Statuses

| Status     | Description           |
| ---------- | --------------------- |
| Pateiktas  | Submitted             |
| Svarstymas | Under consideration   |
| Priimtas   | Passed                |
| Atmestas   | Rejected              |
| Grąžintas  | Returned for revision |

---

## Interactive Documentation

Visit `/docs` in your browser for interactive Swagger UI documentation where you can try API calls directly.

---

## TypeScript Client

For type-safe API access, use the tRPC client:

```typescript
import { trpc } from "@/lib/trpc";

// Type-safe API call
const mp = await trpc.mps.byId.query({ id: 1 });
console.log(mp.name); // TypeScript knows this is a string

// With React Query hooks
const { data: mps } = trpc.mps.list.useQuery({ isActive: true });
```

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/skaidrus-seimas-demo/issues)
- **Documentation**: [GitHub Wiki](https://github.com/your-org/skaidrus-seimas-demo/wiki)
