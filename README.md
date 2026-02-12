# Dexter Playz CTF Platform

A comprehensive, production-ready CTF (Capture The Flag) platform built with Next.js, Prisma, and Supabase.

## Features

### Core Architecture
- **Next.js 15** with App Router
- **Prisma ORM** with Supabase PostgreSQL
- **Auth.js (NextAuth v5)** with Credentials Provider
- **Supabase Storage** for challenge files
- **Tailwind CSS** + Shadcn/UI + Framer Motion
- **Upstash Redis** for rate limiting

### Database Schema
Comprehensive schema including:
- Users with teams and badges
- Challenges with dynamic scoring
- Solves tracking
- Achievement system
- Competition settings
- Audit logging
- Honey tokens for anti-cheat

### Key Features

#### 1. Authentication & Users
- Email/password authentication
- User registration with validation
- Profile management
- Password hashing with bcrypt

#### 2. Team System
- Create teams with unique invite codes
- Team dashboard with aggregate scoring
- Member management

#### 3. Gamification
- Achievement/Badge system:
  - "First Blood" (first solve of any challenge)
  - "Speed Demon" (solve within 2 minutes)
  - "Completionist" (solve all in category)
- Dynamic scoring with decay
- Solves timeline on user profile

#### 4. Challenge System
- Categories: Web, Crypto, Forensics, OSINT, Reverse Engineering, Miscellaneous
- Tags for filtering
- Author attribution
- Challenge files with signed URL download
- MIME type validation and file size limits (10MB)

#### 5. Competition Control
- Public/Private visibility modes
- Registration deadline enforcement
- Max participant cap
- Scoreboard freeze

#### 6. Security
- Rate limiting (10 flag submissions/minute/IP)
- Honey token detection for anti-cheat
- Audit logging for all actions

#### 7. Admin Panel
- Dashboard with graphs
- Active user count
- Competition management
- User management (ban/unban)
- Challenge import/export JSON

## UI/UX
- Dark "Terminal" theme by default with light/dark toggle
- Leaderboard with tabs: Global Rank, Team Rank, Category Leaders
- Search functionality on leaderboard
- Responsive mobile design
- Toast notifications for flag submissions

## Performance Optimization
- Next.js unstable_cache for leaderboard and challenge list
- Connection pooling for serverless environment

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account
- Upstash Redis account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/dexter-playz-ctf.git
cd dexter-playz-ctf
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Seed the database with sample challenges:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:6543/dexter-playz"
DIRECT_URL="postgresql://postgres:postgres@localhost:6543/dexter-playz"

# Auth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Upstash Redis
UPSTASH_REDIS_REST_URL="your-upstash-redis-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-rest-token"

# Rate limiting
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX_REQUESTS=10
```

## Deployment

### Vercel Deployment

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Add all environment variables in Vercel project settings
4. Deploy!

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Database Seeding

The platform includes 30 realistic challenges across all categories:

### Crypto (5 challenges)
- XOR Encryption
- Base64 Layers
- RSA Weak Key
- Caesar Cipher
- AES-CBC Decryption

### Web (5 challenges)
- Hidden Input
- LocalStorage Manipulation
- SQL Injection 101
- XSS Challenge
- Broken Authentication

### Forensics (5 challenges)
- Steganography 101
- PCAP Analysis
- Memory Dump Analysis
- File Carving
- Metadata Extraction

### Reverse Engineering (4 challenges)
- Simple Crackme
- Assembly Puzzle
- Obfuscated JavaScript
- Binary Exploitation

### OSINT (4 challenges)
- Social Media Recon
- Geolocation Challenge
- Domain Investigation
- Email Header Analysis

### Miscellaneous (7 challenges)
- CTF Trivia
- Logic Puzzle
- Math Challenge
- Coding Challenge

Run the seeder:
```bash
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Challenges
- `GET /api/challenges` - List all challenges (with pagination, filtering)
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/solve` - Submit flag solution (with rate limiting)
- `POST /api/challenges` - Create challenge (Admin)
- `PUT /api/challenges/:id` - Update challenge (Admin)
- `DELETE /api/challenges/:id` - Delete challenge (Admin)

### Teams
- `POST /api/teams` - Create a team
- `PUT /api/teams/join` - Join a team with invite code
- `GET /api/teams/:id` - Get team details
- `DELETE /api/teams/:id` - Leave team

### Leaderboard
- `GET /api/leaderboard` - Get global and category leaderboards

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile and password

### Admin
- `GET /api/admin/users` - List all users (with pagination, filtering)
- `PUT /api/admin/users/:id` - Update user role
- `GET /api/admin/competition` - Get competition settings
- `PUT /api/admin/competition` - Update competition settings
- `GET /api/admin/audit-logs` - Get audit logs

### Files
- `POST /api/upload` - Upload challenge file (Admin)
- `DELETE /api/upload` - Delete challenge file (Admin)

## Security Considerations

1. **Rate Limiting**: All flag submissions are rate limited to prevent brute force attacks
2. **Honey Tokens**: Detect and ban users who access honey tokens
3. **Audit Logging**: All actions are logged with timestamps and IP addresses
4. **Password Hashing**: All passwords are hashed with bcrypt (12 rounds)
5. **CSRF Protection**: Built-in with NextAuth.js
6. **Secure Headers**: Configured in Next.js

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---