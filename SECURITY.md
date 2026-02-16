# Dexter Playz CTF Platform - Security Documentation

## Table of Contents
1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation](#input-validation)
4. [SQL Injection Prevention](#sql-injection-prevention)
5. [XSS Protection](#xss-protection)
6. [CSRF Protection](#csrf-protection)
7. [Rate Limiting](#rate-limiting)
8. [Flag Security](#flag-security)
9. [Anti-Cheat Measures](#anti-cheat-measures)
10. [Data Protection](#data-protection)
11. [Docker Security](#docker-security)
12. [Audit Logging](#audit-logging)
13. [Security Headers](#security-headers)
14. [Incident Response](#incident-response)

---

## Security Overview

Dexter Playz implements defense-in-depth security principles to protect against common CTF platform vulnerabilities and attacks.

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Network Security (CORS, Security Headers)               │
│ 2. Application Security (Input Validation, Rate Limiting)     │
│ 3. Authentication (NextAuth.js, JWT, 2FA)                   │
│ 4. Database Security (Prisma ORM, Parameterized Queries)      │
│ 5. Container Security (Docker Isolation)                     │
│ 6. Anti-Cheat (Honey Tokens, IP Tracking)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication & Authorization

### Password Security

```typescript
// Using bcrypt with 12 rounds (production)
const saltRounds = 12
const passwordHash = await hash(password, saltRounds)
```

- **Algorithm**: bcrypt
- **Cost Factor**: 12 rounds (balances security and performance)
- **Password Requirements**: Minimum 8 characters

### Session Management

```typescript
// NextAuth.js configuration
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

- **Session Strategy**: JWT
- **Session Timeout**: 30 days
- **Secure Cookies**: Enabled in production
- **HttpOnly Cookies**: Prevents XSS access to tokens

### Two-Factor Authentication (Optional)

```typescript
// Using speakeasy for TOTP
const secret = speakeasy.generateSecret({
  name: 'Dexter Playz CTF',
  issuer: 'Dexter Playz'
})
```

- **Implementation**: TOTP (Time-based One-Time Password)
- **Backup Codes**: Provided for recovery
- **QR Code Generation**: For easy setup

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
  BANNED = 'BANNED'
}
```

- **USER**: Can solve challenges, create teams
- **ADMIN**: Can manage challenges, users
- **SUPERADMIN**: Full access, can delete challenges
- **BANNED**: Account suspended

---

## Input Validation

### Server-Side Validation

```typescript
import { z } from 'zod'

const flagSchema = z.string()
  .min(1, 'Flag cannot be empty')
  .max(500, 'Flag too long')
  .regex(/^dexter\{.+\}$/, 'Invalid flag format')
```

### File Upload Validation

```typescript
// Allowed MIME types
const allowedTypes = [
  'image/*',
  'application/pdf',
  'application/zip',
  '.txt',
  '.py',
  '.js',
  '.html',
  '.css'
]

// File size limit: 10MB
const maxSize = 10 * 1024 * 1024

// Virus scanning (recommended for production)
// ClamAV integration available
```

### SQL Injection Prevention

```typescript
// ✅ CORRECT: Using Prisma ORM (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userInput }
})

// ❌ INCORRECT: Raw SQL with user input
// await prisma.$queryRaw(
//   `SELECT * FROM User WHERE email = '${userInput}'`
// )
```

**Prisma ORM Benefits:**
- Automatic parameterization
- Type safety
- SQL injection prevention by default

---

## XSS Protection

### Content Security Policy (CSP)

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://*.supabase.co;
      frame-src 'none';
    `.replace(/\n/g, '')
  }
]
```

### Automatic XSS Escaping

```typescript
// React automatically escapes JSX
<div>{userInput}</div>  // ✅ Safe

// For dynamic content, use DOMPurify
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
```

### HTML Sanitization

For user-generated content (e.g., challenge descriptions):

```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizedDescription = DOMPurify.sanitize(
  description,
  {
    ALLOWED_TAGS: ['b', 'i', 'u', 'code', 'pre', 'a'],
    ALLOWED_ATTR: ['href', 'class']
  }
)
```

---

## CSRF Protection

### NextAuth.js Built-in CSRF Protection

```typescript
// CSRF tokens are automatically included in forms
// and validated on POST requests
```

### Additional CSRF Measures

```typescript
// Custom CSRF middleware for API routes
import { createCsrfProtection } from '@edge-csrf/nextjs'

const csrfProtection = createCsrfProtection({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
})
```

---

## Rate Limiting

### API Rate Limiting

```typescript
// Using Upstash Redis for distributed rate limiting
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true
})

// Apply to flag submissions
const { success, remaining } = await ratelimit.limit(
  `flag-submit-${ip}`
)

if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|-----------|-------|--------|
| Flag Submit | 10 | 1 minute |
| Login | 5 | 5 minutes |
| Register | 3 | 1 hour |
| API General | 100 | 15 minutes |
| Challenge Instance | 5 | 1 hour |

---

## Flag Security

### Flag Verification (Server-Side Only)

```typescript
// Flags are NEVER sent to the client
// Verification happens server-side only

export async function POST(request: Request) {
  const { flag } = await request.json()

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId }
    // Flag is NOT sent to client!
  })

  if (flag === challenge.flag) {
    // Correct flag
    return { success: true }
  }

  return { success: false }
}
```

### Flag Format Validation

```typescript
// All flags must match: dexter{...}
const flagRegex = /^dexter\{.+\}$/

if (!flagRegex.test(flag)) {
  throw new Error('Invalid flag format')
}
```

### Honey Tokens (Anti-Cheat)

```typescript
// Create fake flags that trigger bans
const honeyToken = await prisma.honeyToken.create({
  data: {
    token: 'dexter{FAKE_FLAG_HONEY_TOKEN}',
  }
})

// If user submits honey token, auto-ban
if (flag === honeyToken.token) {
  await prisma.user.update({
    where: { id: userId },
    data: { role: 'BANNED' }
  })
}
```

---

## Anti-Cheat Measures

### Honey Tokens

Multiple honey tokens are seeded:
- `dexter{HONEY_TOKEN_1}`
- `dexter{HONEY_TOKEN_2}`
- etc.

### IP-Based Anomaly Detection

```typescript
// Detect suspicious patterns
const recentSubmissions = await prisma.solve.findMany({
  where: {
    user: { ipAddress: requestIp },
    timestamp: {
      gte: new Date(Date.now() - 60 * 1000) // Last minute
    }
  }
})

if (recentSubmissions.length > 10) {
  // Flag for review
  await flagSuspiciousActivity(userId, 'rapid_flag_submissions')
}
```

### Solve Pattern Analysis

```typescript
// Detect impossible solve times (speed cheating)
const solveTime = Date.now() - challenge.createdAt.getTime()
if (solveTime < 5000) { // 5 seconds
  // Flag for review
}
```

### Team Collaboration Verification

```typescript
// Ensure team members are actually collaborating
const teamSolves = await prisma.solve.findMany({
  where: {
    user: { teamId: teamId },
    timestamp: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  }
})

// If all team members solve at exact same time, suspicious
```

---

## Data Protection

### Password Hashing

```typescript
import { hash, compare } from 'bcrypt'

// Hash password on registration
const passwordHash = await hash(password, 12)

// Compare on login
const isValid = await compare(password, user.passwordHash)
```

### Sensitive Data Handling

```typescript
// Never expose sensitive fields
const { passwordHash, twoFactorSecret, ...safeUser } = user
```

### Email Address Privacy

```typescript
// Option to hide email from other users
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    name: true,
    // email: true  - Exclude for privacy
  }
})
```

---

## Docker Security

### Container Isolation

```yaml
# Challenge instances run in isolated containers
services:
  challenge-manager:
    security_opt:
      - no-new-privileges:true
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Network Security

```yaml
# Challenge containers can't access host network
networks:
  dexter-network:
    internal: false  # Allow internet access for challenges
    driver: bridge
```

### Resource Limits

```yaml
# Prevent resource exhaustion
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Auto-Cleanup

```javascript
// Auto-terminate containers after timeout
setTimeout(async () => {
  await container.delete({ force: true })
}, INSTANCE_TIMEOUT * 1000)
```

---

## Audit Logging

### Comprehensive Logging

```typescript
// Log all significant actions
await prisma.auditLog.create({
  data: {
    action: 'CHALLENGE_SOLVED',
    userId: session.user.id,
    ipAddress: request.headers.get('x-forwarded-for'),
  }
})
```

### Logged Actions

- User registration/login
- Challenge solves (correct/incorrect)
- Flag submissions
- Hint reveals
- Team creation/joining
- Admin actions
- Instance creation/termination
- Honey token triggers
- Suspicious activity

### Log Retention

```env
# Keep logs for 90 days
AUDIT_LOG_RETENTION_DAYS=90
```

### Log Analysis

```bash
# View recent suspicious activity
grep -i "HONEY_TOKEN" logs/audit.log
grep -i "BANNED" logs/audit.log
```

---

## Security Headers

### Configured Headers

```typescript
// next.config.js
const headers = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

---

## Incident Response

### Security Incident Procedure

1. **Detection**
   - Monitor audit logs
   - Check for honey token triggers
   - Review rate limit violations

2. **Containment**
   - Ban suspicious users
   - Terminate malicious instances
   - Rotate compromised secrets

3. **Investigation**
   - Analyze audit logs
   - Review IP addresses
   - Check for pattern matching

4. **Recovery**
   - Restore from backup if needed
   - Patch vulnerabilities
   - Update security measures

5. **Post-Incident**
   - Document lessons learned
   - Update security documentation
   - Notify affected users

### Emergency Commands

```bash
# Ban user immediately
npx prisma.user.update({
  where: { email: 'suspicious@user.com' },
  data: { role: 'BANNED' }
})

# Terminate all instances
docker-compose down

# Rotate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Security Best Practices Checklist

- [ ] Change default admin password
- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting on all endpoints
- [ ] Use parameterized queries (Prisma)
- [ ] Enable Content Security Policy
- [ ] Implement CSRF protection
- [ ] Hash passwords with bcrypt (12+ rounds)
- [ ] Never expose flags to client
- [ ] Configure honey tokens
- [ ] Enable audit logging
- [ ] Set up Docker container isolation
- [ ] Configure resource limits
- [ ] Enable auto-cleanup for instances
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor suspicious activity
- [ ] Incident response plan ready

---

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **Do NOT** publicly disclose the issue
2. Email: security@dexterplayz.com
3. Include detailed description and proof of concept
4. Allow 90 days for remediation before disclosure
5. Bug bounty may be available for critical issues

### Acknowledgments

Security researchers who responsibly disclose vulnerabilities will be:
- Credited in our Hall of Fame
- Eligible for bug bounty rewards
- Invited to beta test new features

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/database/security)
- [Docker Security](https://docs.docker.com/engine/security/)

---

Last Updated: 2024-02-16
