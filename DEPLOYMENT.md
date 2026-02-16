# Dexter Playz CTF Platform - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment (Vercel)](#production-deployment-vercel)
5. [Production Deployment (Docker/Kubernetes)](#production-deployment-dockerkubernetes)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ (LTS version recommended)
- **Docker** 20.10+ and Docker Compose 2.0+
- **PostgreSQL** 15+ (if not using Docker)
- **Git** for cloning the repository
- **Redis** (for rate limiting and caching)

### Required Accounts (Optional but Recommended)
- **Supabase** (for PostgreSQL database and file storage)
- **Upstash Redis** (for rate limiting)
- **OpenAI API** (for AI-powered challenge generation)
- **Anthropic API** (for AI-powered challenge generation)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/dexter-playz-ctf.git
cd dexter-playz-ctf
```

### 2. Install Dependencies

```bash
npm install
cd server
npm install
cd ../challenge-manager
npm install
cd ..
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Database - Use your local PostgreSQL or Supabase
DATABASE_URL="postgresql://postgres:password@localhost:5432/dexter_playz"
DIRECT_URL="postgresql://postgres:password@localhost:5432/dexter_playz"

# Auth - Generate a secure secret
NEXTAUTH_SECRET="openssl rand -base64 32"  # Run this command to generate
NEXTAUTH_URL="http://localhost:3000"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# AI Integration (optional)
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the Database

```bash
npm run seed
```

This will create:
- 4 users (1 admin, 3 regular)
- 2 teams
- 60 challenges across all categories
- Sample hints
- Honey tokens
- Audit logs

### 6. Start the Development Servers

**Terminal 1 - Main Application:**
```bash
npm run dev
```

**Terminal 2 - WebSocket Server:**
```bash
cd server
npm run dev
```

**Terminal 3 - Challenge Manager:**
```bash
cd challenge-manager
npm run dev
```

### 7. Access the Application

- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Default Admin**: `admin@example.com` / `admin123`

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Deletes data)
docker-compose down -v
```

### Docker Compose Services

The docker-compose.yml includes:
- **PostgreSQL** - Database
- **Redis** - Caching and rate limiting
- **Next.js App** - Main application
- **WebSocket Server** - Real-time updates
- **Challenge Manager** - Docker-based challenge instances

### Custom Docker Configuration

If you need to customize the Docker setup, edit `docker-compose.yml`:

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: dexter_playz
    volumes:
      - ./custom-data:/var/lib/postgresql/data
```

---

## Production Deployment (Vercel)

### 1. Prepare for Vercel Deployment

```bash
# Build the application
npm run build

# Test the production build
npm start
```

### 2. Configure Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Add environment variables in Vercel settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `OPENAI_API_KEY` (optional)
   - `ANTHROPIC_API_KEY` (optional)

4. Deploy!

### 3. Deploy WebSocket Server Separately

The WebSocket server should be deployed separately (e.g., Railway, Render, or a VPS):

```bash
cd server
npm install
npm start
```

Update `WS_URL` in your Vercel environment variables to point to your WebSocket server.

### 4. Deploy Challenge Manager Separately

The challenge manager needs Docker access, so it should be deployed on a server with Docker:

```bash
cd challenge-manager
npm install
npm start
```

Update `CHALLENGE_MANAGER_URL` in your Vercel environment variables.

---

## Production Deployment (Docker/Kubernetes)

### Docker Deployment

```bash
# Build images
docker build -t dexter-playz-app .
docker build -t dexter-playz-ws server/
docker build -t dexter-playz-challenges challenge-manager/

# Run containers
docker run -d \
  --name dexter-playz-app \
  -p 3000:3000 \
  --env-file .env \
  dexter-playz-app

docker run -d \
  --name dexter-playz-ws \
  -p 3001:3001 \
  --env-file .env \
  dexter-playz-ws

docker run -d \
  --name dexter-playz-challenges \
  -p 3002:3002 \
  --privileged \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --env-file .env \
  dexter-playz-challenges
```

### Kubernetes Deployment

Create a `k8s/` directory with deployment files:

**k8s/deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dexter-playz-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dexter-playz-app
  template:
    metadata:
      labels:
        app: dexter-playz-app
    spec:
      containers:
      - name: app
        image: dexter-playz-app:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: dexter-playz-secrets
---
# Add deployments for ws-server, postgres, redis, challenge-manager
```

**k8s/service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: dexter-playz-app
spec:
  selector:
    app: dexter-playz-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy to Kubernetes:
```bash
kubectl apply -f k8s/
```

---

## Environment Configuration

### Security Best Practices

1. **Generate Secure Secrets**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate database password
   openssl rand -base64 24
   ```

2. **Use Environment Variables for Secrets**
   Never commit secrets to git. Use `.env` for local development and configure secrets in your hosting platform.

3. **Enable HTTPS in Production**
   Set `NEXTAUTH_URL` to use HTTPS.

### Database Configuration

For production, use a managed PostgreSQL service like:
- **Supabase** (Recommended, free tier available)
- **Neon**
- **Railway**
- **AWS RDS**
- **Google Cloud SQL**

### Redis Configuration

For production, use a managed Redis service like:
- **Upstash Redis** (Recommended, free tier available)
- **Redis Cloud**
- **ElastiCache (AWS)**

---

## Database Setup

### Using Supabase (Recommended)

1. Create a new project at https://supabase.com
2. Get your project URL and anon/service role keys
3. Update `.env` with Supabase credentials

### Using Local PostgreSQL

```bash
# Start PostgreSQL
docker run -d \
  --name dexter-postgres \
  -e POSTGRES_USER=dexter \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=dexter_playz \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### Reset Database

⚠️ **WARNING: This deletes all data**

```bash
# Reset and reseed
npx prisma migrate reset --force
npm run seed
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL
```

### Migration Errors

```bash
# Reset database schema
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name custom_migration
```

### WebSocket Connection Issues

```bash
# Check WebSocket server logs
cd server
npm run dev

# Verify WS_URL is correct in .env
```

### Challenge Instance Issues

```bash
# Check challenge manager logs
cd challenge-manager
npm run dev

# Verify Docker is accessible
docker ps
docker info
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :3001, :3002, :5432, etc.

# Kill process
kill -9 <PID>
```

---

## Monitoring and Logging

### Application Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f ws-server
docker-compose logs -f challenge-manager
```

### Database Queries

```bash
# Enable Prisma query logging
DATABASE_URL="postgresql://...?statement_cache_size=0&log_level=debug"
```

---

## Performance Optimization

### Enable Next.js Caching

The application uses Next.js `unstable_cache` for:
- Leaderboard data
- Challenge lists
- User profiles

### Database Connection Pooling

Configure connection pool size in `.env`:

```env
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

### Redis Caching

Configure Redis TTL for cached data:

```env
REDIS_CACHE_TTL=300  # 5 minutes
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure honey tokens
- [ ] Set up database backups
- [ ] Use environment variables for secrets
- [ ] Enable security headers
- [ ] Configure CSP (Content Security Policy)

---

## Backup and Restore

### Database Backup

```bash
# Backup database
npx prisma db pull

# Or using pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### Database Restore

```bash
# Restore from backup
npx prisma db push --force-generate

# Or using psql
psql $DATABASE_URL < backup.sql
```

---

## Support and Contributing

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Contact the maintainers

---

## License

MIT License - See LICENSE file for details
