# Dexter Playz CTF Platform - Quick Start Guide

Get up and running with Dexter Playz in under 10 minutes!

## 🚀 Quick Start (Docker)

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/dexter-playz-ctf.git
cd dexter-playz-ctf

# 2. Configure environment
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Initialize database
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed

# 5. Open your browser
open http://localhost:3000
```

That's it! You now have:
- ✅ Full CTF platform running
- ✅ 60 pre-loaded challenges
- ✅ Admin dashboard
- ✅ Real-time leaderboard
- ✅ WebSocket support

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 📚 What's Included

### Users & Teams
- 3 sample users (Alice, Bob, Charlie)
- 2 sample teams (Team Alpha, Team Beta)
- Sample solves and achievements

### Challenges (60 total)
- 10 Binary Exploitation
- 10 Web Exploitation
- 10 Cryptography
- 10 Forensics
- 10 Reverse Engineering
- 10 OSINT
- 10 Miscellaneous

### Features
- Dynamic scoring with decay
- Hint system
- Docker-based challenge instances
- Real-time updates
- AI challenge generation (requires API key)

---

## 🎯 First Steps

### 1. Explore Challenges
Navigate to `/challenges` and browse the challenge categories. Each challenge has:
- Title and description
- Difficulty rating (Easy/Medium/Hard/Insane)
- Point value (dynamic)
- Tags
- Solve count

### 2. Solve a Challenge
Pick an "Easy" challenge to start:
1. Read the description
2. If needed, start a Docker instance
3. Work on the challenge
4. Submit the flag (format: `dexter{...}`)
5. Earn points and achievements!

### 3. Create a Team
Go to `/teams` and:
1. Create a new team
2. Share the invite code with friends
3. Compete together on the leaderboard

### 4. Check the Leaderboard
Visit `/leaderboard` to see:
- Global rankings
- Team rankings
- Category leaders
- Real-time updates

### 5. View Your Profile
Go to `/profile` to see:
- Your score and rank
- Solved challenges
- Achievements/badges
- Solve history

---

## 🔧 Manual Setup (Without Docker)

If you prefer to run services manually:

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (or Upstash)

### Setup Steps

1. **Install dependencies:**
```bash
npm install
cd server && npm install && cd ..
cd challenge-manager && npm install && cd ..
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database and Redis URLs
```

3. **Setup database:**
```bash
npx prisma migrate dev
npm run seed
```

4. **Start services:**

Terminal 1 (Main App):
```bash
npm run dev
```

Terminal 2 (WebSocket Server):
```bash
cd server && npm run dev
```

Terminal 3 (Challenge Manager):
```bash
cd challenge-manager && npm run dev
```

---

## 🎨 Key Features to Try

### Admin Dashboard
Login as admin (`admin@example.com` / `admin123`) and explore `/admin`:
- View statistics and charts
- Manage challenges
- Create new challenges
- Manage users and teams
- Configure competition settings
- View audit logs

### Real-time Features
- Watch the leaderboard update live
- Get instant notifications when challenges are solved
- See real-time solve counts

### Docker Challenge Instances
Try a challenge with instance support:
1. Click "Start Instance" on a challenge
2. Get connection details
3. Connect to the challenge instance
4. Instance auto-terminates after timeout

### Hints System
If you're stuck:
1. Click "Reveal Hint" on a challenge
2. Pay the point cost
3. Get a helpful hint
4. More detailed hints cost more points

---

## 📖 Common Tasks

### Adding a New Challenge
1. Go to `/admin`
2. Click "Challenges" tab
3. Click "Add Challenge"
4. Fill in challenge details
5. Upload files if needed
6. Save

### Creating a Competition
1. Go to `/admin`
2. Click "Settings" tab
3. Configure competition parameters:
   - Public/Private
   - Registration deadline
   - Max participants
   - Scoreboard freeze time
4. Save settings

### Managing Users
1. Go to `/admin`
2. Click "Users" tab
3. View all users
4. Promote to admin or ban users as needed

### Generating AI Challenges
1. Add OpenAI or Anthropic API key to `.env`
2. Go to `/admin`
3. Click "Challenges" tab
4. Click "AI Generate"
5. Select category and difficulty
6. Generate!

---

## 🔍 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### WebSocket Connection Failed
```bash
# Check WebSocket server is running
docker-compose ps ws-server

# Restart if needed
docker-compose restart ws-server
```

### Challenge Instance Won't Start
```bash
# Check challenge manager
docker-compose logs challenge-manager

# Verify Docker is running
docker ps
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000  # or :3001, :3002

# Kill the process
kill -9 <PID>
```

---

## 📚 Next Steps

### For Users
- Read the [API Documentation](API.md)
- Learn about [Dynamic Scoring](README.md#-dynamic-scoring)
- Check out the [Achievement System](README.md#-achievement-system)

### For Admins
- Read the [Security Documentation](SECURITY.md)
- Review the [Deployment Guide](DEPLOYMENT.md)
- Learn about [Challenge Management](README.md#-admin-panel)

### For Developers
- Read the [Contributing Guide](CONTRIBUTING.md)
- Explore the codebase structure
- Check out the [API Reference](API.md)

---

## 🎓 Learn More

### Challenge Categories

#### Binary Exploitation
Buffer overflows, ROP, shellcode, format strings, UAF

#### Web Exploitation
SQL injection, XSS, CSRF, SSRF, XXE, deserialization

#### Cryptography
RSA, AES, XOR, ECC, padding oracles, hash collisions

#### Forensics
Steganography, memory dumps, PCAP analysis, file carving

#### Reverse Engineering
Binary analysis, deobfuscation, crackmes, keygens

#### OSINT
Social media recon, geolocation, domain investigation, GitHub recon

#### Miscellaneous
Puzzles, encoding, ciphers, QR codes, audio forensics

### Flag Format
All flags follow the format: `dexter{...}`

Example flags:
- `dexter{BUFFER_OVERFLOW_BASIC}`
- `dexter{SQL_INJECTION}`
- `dexter{FIRST_BLOOD_ACHIEVEMENT}`

---

## 💡 Tips

1. **Start Easy**: Begin with Easy/Medium challenges to get familiar
2. **Use Hints**: Don't hesitate to use hints (they cost points but save time)
3. **Join a Team**: Team up with friends to combine skills
4. **Check Writeups**: After solving, check writeups for alternative approaches
5. **Practice**: Use the platform regularly to improve your skills

---

## 🆘 Getting Help

- **Documentation**: Check [README.md](README.md) for full features
- **API Reference**: See [API.md](API.md) for endpoint details
- **Security**: Review [SECURITY.md](SECURITY.md) for security info
- **Deployment**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions

---

## 🎉 You're Ready!

You now have a fully functional CTF platform. Start exploring challenges and have fun!

Happy Hacking! 🔐💻

---

**Quick Reference:**
- App URL: http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Default Admin: admin@example.com / admin123
- WebSocket: ws://localhost:3001
- Challenge Manager: http://localhost:3002

---

Need more details? Check out the full documentation:
- [README.md](README.md) - Complete feature documentation
- [API.md](API.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [SECURITY.md](SECURITY.md) - Security documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
