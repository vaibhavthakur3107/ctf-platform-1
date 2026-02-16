const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const prisma = new PrismaClient();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per minute for API
  message: 'Too many API requests from this IP'
});

app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user's personal room for notifications
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Join leaderboard room for real-time updates
  socket.join('leaderboard');

  // Join challenge room for real-time challenge updates
  socket.on('join-challenge', (challengeId) => {
    socket.join(`challenge:${challengeId}`);
  });

  // Leave challenge room
  socket.on('leave-challenge', (challengeId) => {
    socket.leave(`challenge:${challengeId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Broadcast leaderboard updates
async function broadcastLeaderboardUpdate() {
  try {
    const leaderboard = await getLeaderboardData();
    io.to('leaderboard').emit('leaderboard-update', leaderboard);
  } catch (error) {
    console.error('Error broadcasting leaderboard update:', error);
  }
}

// Get leaderboard data
async function getLeaderboardData() {
  const users = await prisma.user.findMany({
    where: {
      role: 'USER'
    },
    include: {
      solves: {
        include: {
          challenge: true
        }
      },
      team: true
    },
    orderBy: {
      solves: {
        _count: 'desc'
      }
    }
  });

  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    team: user.team?.name,
    score: calculateUserScore(user.solves),
    solvesCount: user.solves.length
  }));
}

// Calculate user score based on dynamic scoring
function calculateUserScore(solves) {
  return solves.reduce((total, solve) => {
    const challenge = solve.challenge;
    const currentPoints = Math.max(
      challenge.minPoints,
      challenge.points * (1 - challenge.solvedBy.length * challenge.decay)
    );
    return total + Math.round(currentPoints);
  }, 0);
}

// API Routes
app.get('/api/socket/status', (req, res) => {
  res.json({
    connected: io.engine.clientsCount,
    rooms: Object.keys(io.sockets.adapter.rooms)
  });
});

// Start server
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed');
    process.exit(0);
  });
});

// Export for use in other modules
module.exports = { app, io, broadcastLeaderboardUpdate };
