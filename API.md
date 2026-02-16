# Dexter Playz CTF Platform - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via NextAuth.js session.

### Authentication Flow
1. Register or login to get a session
2. Session is stored in an HTTP-only cookie
3. Include session cookie in requests

---

## API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### Challenges

#### `GET /api/challenges`
Get all challenges with filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category (WEB, CRYPTO, FORENSICS, OSINT, REVERSE_ENGINEERING, BINARY_EXPLOITATION, MISCELLANEOUS)
- `search` (optional): Search in title, description, tags, author
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```bash
GET /api/challenges?category=WEB&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "title": "SQL Injection 101",
      "description": "Exploit the SQL injection...",
      "category": "WEB",
      "tags": ["sql", "injection"],
      "author": "Admin",
      "points": 150,
      "minPoints": 75,
      "decay": 0.08,
      "difficulty": "MEDIUM",
      "visible": true,
      "solvedCount": 42,
      "currentPoints": 116,
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 60,
    "page": 1,
    "limit": 10,
    "totalPages": 6
  }
}
```

---

#### `GET /api/challenges/:id`
Get detailed information about a specific challenge.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "title": "SQL Injection 101",
    "description": "Exploit the SQL injection...",
    "category": "WEB",
    "tags": ["sql", "injection"],
    "author": "Admin",
    "points": 150,
    "minPoints": 75,
    "decay": 0.08,
    "difficulty": "MEDIUM",
    "visible": true,
    "solvedCount": 42,
    "currentPoints": 116,
    "userSolved": false,
    "hints": [
      {
        "id": "hintxxx",
        "text": null,
        "cost": 10,
        "order": 1,
        "revealed": false
      }
    ]
  }
}
```

---

#### `POST /api/challenges/:id/solve`
Submit a flag for a challenge.

**Request Headers:**
```
Content-Type: application/json
Cookie: next-auth.session-token=...
```

**Request Body:**
```json
{
  "flag": "dexter{SQL_INJECTION}"
}
```

**Response (200) - Correct Flag:**
```json
{
  "success": true,
  "correct": true,
  "message": "Correct flag!",
  "pointsEarned": 116,
  "isFirstBlood": false,
  "achievements": [],
  "remaining": 9
}
```

**Response (200) - Incorrect Flag:**
```json
{
  "success": false,
  "correct": false,
  "message": "Incorrect flag",
  "remaining": 9
}
```

**Response (429) - Rate Limited:**
```json
{
  "success": false,
  "error": "Too many flag submissions. Please wait."
}
```

---

#### `GET /api/challenges/:id/hints`
Get hints for a challenge (text only if revealed).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "hintxxx",
      "cost": 10,
      "order": 1,
      "text": null,
      "revealed": false
    }
  ]
}
```

---

#### `POST /api/challenges/:id/hints`
Reveal a hint (costs points).

**Request Body:**
```json
{
  "hintId": "hintxxx"
}
```

**Response (200):**
```json
{
  "success": true,
  "hint": {
    "id": "hintxxx",
    "text": "Try using OR 1=1",
    "cost": 10,
    "order": 1
  }
}
```

---

#### `GET /api/challenges/:id/instance`
Get challenge instance for current user (for Docker-based challenges).

**Response (200):**
```json
{
  "success": true,
  "hasInstance": true,
  "data": {
    "id": "instxxx",
    "host": "localhost",
    "port": 20001,
    "instanceType": "STATIC",
    "expiresAt": "2024-01-20T11:20:00.000Z",
    "timeRemaining": 1145000
  }
}
```

---

#### `POST /api/challenges/:id/instance`
Create a new challenge instance.

**Request Body:**
```json
{
  "instanceType": "STATIC"  // "STATIC", "TINY_VM", or "FULL_DOCKER"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "instxxx",
    "host": "localhost",
    "port": 20001,
    "instanceType": "STATIC",
    "expiresAt": "2024-01-20T11:20:00.000Z"
  }
}
```

---

#### `DELETE /api/challenges/:id/instance`
Terminate a challenge instance.

**Response (200):**
```json
{
  "success": true,
  "message": "Instance terminated"
}
```

---

#### `POST /api/challenges`
Create a new challenge (Admin only).

**Request Body:**
```json
{
  "title": "New Challenge",
  "description": "Challenge description",
  "category": "WEB",
  "tags": ["web", "exploit"],
  "points": 200,
  "minPoints": 100,
  "decay": 0.08,
  "flag": "dexter{NEW_CHALLENGE}",
  "difficulty": "MEDIUM",
  "fileUrl": "https://supabase.com/..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "title": "New Challenge",
    ...
  }
}
```

---

### Leaderboard

#### `GET /api/leaderboard`
Get leaderboard data.

**Query Parameters:**
- `type` (optional): "individual" or "team" (default: "individual")
- `category` (optional): Filter by category

**Example Request:**
```bash
GET /api/leaderboard?type=individual
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "id": "userxxx",
      "name": "Alice",
      "team": "Team Alpha",
      "score": 1250,
      "solvesCount": 15
    }
  ],
  "categories": {
    "WEB": {
      "rank": 1,
      "name": "Alice",
      "score": 450
    },
    "CRYPTO": {
      "rank": 2,
      "name": "Alice",
      "score": 380
    }
  }
}
```

---

### Teams

#### `POST /api/teams`
Create a new team.

**Request Body:**
```json
{
  "name": "Team Alpha"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "teamxxx",
    "name": "Team Alpha",
    "inviteCode": "ABC12345",
    "score": 0,
    "members": [
      {
        "id": "userxxx",
        "name": "Alice"
      }
    ]
  }
}
```

---

#### `PUT /api/teams/join`
Join a team using invite code.

**Request Body:**
```json
{
  "inviteCode": "ABC12345"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "teamxxx",
    "name": "Team Alpha",
    "inviteCode": "API12345",
    "score": 1250
  }
}
```

---

### Profile

#### `GET /api/profile`
Get current user's profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "userxxx",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "USER",
    "team": "Team Alpha",
    "score": 1250,
    "solvesCount": 15,
    "badges": [
      {
        "type": "FIRST_BLOOD",
        "unlockedAt": "2024-01-20T10:30:00.000Z"
      }
    ],
    "solves": [
      {
        "id": "solvexxx",
        "challenge": {
          "id": "challengexxx",
          "title": "SQL Injection 101",
          "category": "WEB",
          "pointsEarned": 116
        },
        "timestamp": "2024-01-20T10:30:00.000Z"
      }
    ]
  }
}
```

---

#### `PUT /api/profile`
Update user profile.

**Request Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice.smith@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "userxxx",
    "name": "Alice Smith",
    "email": "alice.smith@example.com",
    ...
  }
}
```

---

### Admin

#### `GET /api/admin/users`
List all users (Admin only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search in name/email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "userxxx",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "USER",
      "team": "Team Alpha",
      "score": 1250,
      "solvesCount": 15,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `PUT /api/admin/users/:id`
Update user role (Admin only).

**Request Body:**
```json
{
  "role": "ADMIN"  // "USER", "ADMIN", "SUPERADMIN", or "BANNED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "userxxx",
    "role": "ADMIN",
    ...
  }
}
```

---

#### `GET /api/admin/competition`
Get competition settings (Admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "compxxx",
    "isPublic": true,
    "registrationDeadline": "2024-12-31T23:59:59.000Z",
    "maxParticipants": 100,
    "scoreboardFreezeTime": 30
  }
}
```

---

#### `PUT /api/admin/competition`
Update competition settings (Admin only).

**Request Body:**
```json
{
  "isPublic": true,
  "registrationDeadline": "2024-12-31T23:59:59.000Z",
  "maxParticipants": 100,
  "scoreboardFreezeTime": 30
}
```

---

#### `GET /api/admin/audit-logs`
Get audit logs (Admin only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `action` (optional): Filter by action type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "logxxx",
      "action": "CHALLENGE_SOLVED",
      "user": {
        "id": "userxxx",
        "name": "Alice"
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2024-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 20
  }
}
```

---

#### `POST /api/admin/ai/generate`
Generate AI-powered challenge (Admin only).

**Request Body:**
```json
{
  "category": "WEB",
  "difficulty": "MEDIUM",
  "topic": "SQL Injection",
  "provider": "openai",  // "openai" or "anthropic"
  "generateHints": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "challenge": {
      "id": "clxxx",
      "title": "Blind SQL Injection",
      "description": "...",
      ...
    },
    "hints": [
      {
        "id": "hintxxx",
        "text": "Try time-based blind SQLi",
        "cost": 10,
        "order": 1
      }
    ],
    "solution": "Use sleep() function..."
  }
}
```

---

### Announcements

#### `GET /api/announcements`
Get published announcements.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "annxxx",
      "title": "Welcome to Dexter Playz!",
      "content": "The competition has started...",
      "priority": "INFO",
      "isPublished": true,
      "createdAt": "2024-01-20T09:00:00.000Z",
      "updatedAt": "2024-01-20T09:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/admin/announcements`
Get all announcements (Admin only).

**Query Parameters:**
- `includeUnpublished` (optional): Include unpublished announcements

---

#### `POST /api/admin/announcements`
Create announcement (Admin only).

**Request Body:**
```json
{
  "title": "Important Update",
  "content": "New challenges have been added...",
  "priority": "HIGH",  // "INFO", "MEDIUM", "HIGH"
  "isPublished": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "annxxx",
    "title": "Important Update",
    "content": "...",
    "priority": "HIGH",
    "isPublished": true,
    "publishedBy": "adminxxx",
    "createdAt": "2024-01-20T11:00:00.000Z"
  }
}
```

---

### Files

#### `POST /api/upload`
Upload challenge file (Admin only).

**Request:**
```
Content-Type: multipart/form-data

file: <binary data>
challengeId: <string>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://supabase.com/storage/...",
    "filename": "challenge.zip",
    "size": 1024000,
    "mimeType": "application/zip"
  }
}
```

---

## WebSocket Events

### Connection
```javascript
import io from 'socket.io-client'

const socket = io(WS_URL, {
  auth: { userId: 'userxxx' }
})
```

### Events

#### `leaderboard-update`
Emitted when leaderboard changes.

```javascript
socket.on('leaderboard-update', (leaderboard) => {
  console.log('Leaderboard updated:', leaderboard)
})
```

#### `challenge-solved`
Emitted when a challenge is solved.

```javascript
socket.on('challenge-solved', (data) => {
  console.log('Challenge solved:', {
    challengeId: data.challengeId,
    userId: data.userId,
    timestamp: data.timestamp
  })
})
```

#### `new-announcement`
Emitted when a new announcement is published.

```javascript
socket.on('new-announcement', (announcement) => {
  console.log('New announcement:', announcement)
})
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required field: flag"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Challenge not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests. Please wait."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Flag Submit | 10 | 1 minute |
| Login | 5 | 5 minutes |
| Register | 3 | 1 hour |
| Instance Create | 5 | 1 hour |
| General API | 100 | 15 minutes |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1705766400
```

---

## Categories

- `WEB`: Web Exploitation
- `CRYPTO`: Cryptography
- `FORENSICS`: Digital Forensics
- `OSINT`: Open Source Intelligence
- `REVERSE_ENGINEERING`: Binary Analysis
- `BINARY_EXPLOITATION`: Pwn/Binary Exploitation
- `MISCELLANEOUS`: Various challenges

---

## Difficulty Levels

- `EASY`: 50-100 points
- `MEDIUM`: 100-200 points
- `HARD`: 200-350 points
- `INSANE`: 350-500 points

---

## Dynamic Scoring

Points decay based on solve count:

```
currentPoints = max(minPoints, basePoints * (1 - solveCount * decay))
```

Example:
- Base points: 150
- Min points: 75
- Decay: 0.08
- Solve count: 10
- Current points: max(75, 150 * (1 - 10 * 0.08)) = 90

---

## Flag Format

All flags must follow the format: `dexter{...}`

Examples:
- `dexter{SQL_INJECTION}`
- `dexter{BUFFER_OVERFLOW_BASIC}`
- `dexter{XOR_ENCRYPTED_MESSAGE}`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Get challenges
const response = await fetch('/api/challenges?category=WEB')
const { data } = await response.json()

// Submit flag
const solve = await fetch('/api/challenges/xxx/solve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ flag: 'dexter{FLAG}' })
})
const result = await solve.json()
```

### Python

```python
import requests

# Get challenges
response = requests.get('http://localhost:3000/api/challenges')
challenges = response.json()['data']

# Submit flag
solve = requests.post(
    'http://localhost:3000/api/challenges/xxx/solve',
    json={'flag': 'dexter{FLAG}'},
    cookies={'session': '...'}
)
result = solve.json()
```

### curl

```bash
# Get challenges
curl http://localhost:3000/api/challenges

# Submit flag
curl -X POST \
  http://localhost:3000/api/challenges/xxx/solve \
  -H "Content-Type: application/json" \
  -d '{"flag":"dexter{FLAG}"}' \
  --cookie "session=..."
```

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/your-repo/dexter-playz-ctf/issues
- Email: api@dexterplayz.com

---

Last Updated: 2024-02-16
