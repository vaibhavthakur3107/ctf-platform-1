const { PrismaClient } = require('@prisma/client');
const { Docker } = require('node-docker-api');
const axios = require('axios');

const prisma = new PrismaClient();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Configuration
const INSTANCE_TIMEOUT = parseInt(process.env.INSTANCE_TIMEOUT) || 1200; // 20 minutes
const MAX_INSTANCES = parseInt(process.env.MAX_INSTANCES) || 50;
const BASE_PORT = 20000;

// Track active instances
const activeInstances = new Map();
const portPool = new Set();
let currentPort = BASE_PORT;

// Initialize port pool
function initializePortPool() {
  for (let i = BASE_PORT; i < BASE_PORT + MAX_INSTANCES; i++) {
    portPool.add(i);
  }
}

// Get available port
function getAvailablePort() {
  const port = portPool.values().next().value;
  if (port !== undefined) {
    portPool.delete(port);
    return port;
  }
  throw new Error('No available ports');
}

// Release port back to pool
function releasePort(port) {
  portPool.add(port);
}

// Create challenge instance (Type A: Static URL)
async function createStaticInstance(challenge, userId) {
  try {
    // Check if user already has an instance
    const existing = await prisma.challengeInstance.findFirst({
      where: { challengeId: challenge.id, userId }
    });

    if (existing && new Date(existing.expiresAt) > new Date()) {
      return { host: existing.host, port: existing.port, containerId: existing.containerId };
    }

    // Terminate existing if expired
    if (existing) {
      await terminateInstance(existing.id);
    }

    const port = getAvailablePort();
    const containerName = `challenge_${challenge.id}_${userId.substring(0, 8)}`;

    const container = await docker.container.create({
      name: containerName,
      Image: 'nginx:alpine',
      ExposedPorts: { '80/tcp': {} },
      HostConfig: {
        PortBindings: { '80/tcp': [{ HostPort: port.toString() }] },
        AutoRemove: true,
        NetworkMode: 'dexter-network'
      },
      Env: [`CHALLENGE_FLAG=${challenge.flag}`]
    });

    await container.start();

    const expiresAt = new Date(Date.now() + INSTANCE_TIMEOUT * 1000);

    const instance = await prisma.challengeInstance.create({
      data: {
        challengeId: challenge.id,
        userId,
        instanceType: 'STATIC',
        host: 'localhost',
        port,
        containerId: container.id,
        status: 'RUNNING',
        expiresAt
      }
    });

    // Schedule cleanup
    setTimeout(() => terminateInstance(instance.id), INSTANCE_TIMEOUT * 1000);

    activeInstances.set(instance.id, {
      containerId: container.id,
      port,
      expiresAt
    });

    return { host: 'localhost', port, containerId: container.id };
  } catch (error) {
    console.error('Error creating static instance:', error);
    throw error;
  }
}

// Create Tiny VM instance (Type B: Tiny VM)
async function createTinyVMInstance(challenge, userId) {
  try {
    const existing = await prisma.challengeInstance.findFirst({
      where: { challengeId: challenge.id, userId }
    });

    if (existing && new Date(existing.expiresAt) > new Date()) {
      return { host: existing.host, port: existing.port, containerId: existing.containerId };
    }

    if (existing) {
      await terminateInstance(existing.id);
    }

    const port = getAvailablePort();
    const containerName = `tinyvm_${challenge.id}_${userId.substring(0, 8)}`;

    const container = await docker.container.create({
      name: containerName,
      Image: 'alpine:latest',
      Cmd: ['sh', '-c', `echo "${challenge.flag}" > /flag && tail -f /dev/null`],
      ExposedPorts: { '80/tcp': {} },
      HostConfig: {
        PortBindings: { '80/tcp': [{ HostPort: port.toString() }] },
        AutoRemove: true,
        NetworkMode: 'dexter-network'
      }
    });

    await container.start();

    const expiresAt = new Date(Date.now() + 1800 * 1000); // 30 minutes

    const instance = await prisma.challengeInstance.create({
      data: {
        challengeId: challenge.id,
        userId,
        instanceType: 'TINY_VM',
        host: 'localhost',
        port,
        containerId: container.id,
        status: 'RUNNING',
        expiresAt
      }
    });

    setTimeout(() => terminateInstance(instance.id), 1800 * 1000);

    activeInstances.set(instance.id, {
      containerId: container.id,
      port,
      expiresAt
    });

    return { host: 'localhost', port, containerId: container.id };
  } catch (error) {
    console.error('Error creating Tiny VM instance:', error);
    throw error;
  }
}

// Create Full Docker instance (Type C: Full Docker)
async function createFullDockerInstance(challenge, userId) {
  try {
    const existing = await prisma.challengeInstance.findFirst({
      where: { challengeId: challenge.id, userId }
    });

    if (existing && new Date(existing.expiresAt) > new Date()) {
      return { host: existing.host, port: existing.port, containerId: existing.containerId };
    }

    if (existing) {
      await terminateInstance(existing.id);
    }

    const port = getAvailablePort();
    const containerName = `full_${challenge.id}_${userId.substring(0, 8)}`;

    const container = await docker.container.create({
      name: containerName,
      Image: 'ubuntu:22.04',
      Cmd: ['sh', '-c', 'apt-get update && apt-get install -y nginx && echo "CHALLENGE RUNNING" > /var/www/html/index.html && nginx -g "daemon off;"'],
      ExposedPorts: { '80/tcp': {} },
      HostConfig: {
        PortBindings: { '80/tcp': [{ HostPort: port.toString() }] },
        AutoRemove: true,
        NetworkMode: 'dexter-network',
        Privileged: false
      },
      Tty: true
    });

    await container.start();

    const expiresAt = new Date(Date.now() + 3600 * 1000); // 60 minutes

    const instance = await prisma.challengeInstance.create({
      data: {
        challengeId: challenge.id,
        userId,
        instanceType: 'FULL_DOCKER',
        host: 'localhost',
        port,
        containerId: container.id,
        status: 'RUNNING',
        expiresAt
      }
    });

    setTimeout(() => terminateInstance(instance.id), 3600 * 1000);

    activeInstances.set(instance.id, {
      containerId: container.id,
      port,
      expiresAt
    });

    return { host: 'localhost', port, containerId: container.id };
  } catch (error) {
    console.error('Error creating Full Docker instance:', error);
    throw error;
  }
}

// Terminate instance
async function terminateInstance(instanceId) {
  try {
    const instance = await prisma.challengeInstance.findUnique({
      where: { id: instanceId }
    });

    if (!instance) return;

    try {
      const container = docker.container.get(instance.containerId);
      await container.delete({ force: true });
    } catch (err) {
      console.error(`Error stopping container ${instance.containerId}:`, err.message);
    }

    if (instance.port) {
      releasePort(instance.port);
    }

    await prisma.challengeInstance.update({
      where: { id: instanceId },
      data: { status: 'TERMINATED' }
    });

    activeInstances.delete(instanceId);
  } catch (error) {
    console.error('Error terminating instance:', error);
  }
}

// Clean up expired instances
async function cleanupExpiredInstances() {
  try {
    const expiredInstances = await prisma.challengeInstance.findMany({
      where: {
        status: 'RUNNING',
        expiresAt: { lt: new Date() }
      }
    });

    for (const instance of expiredInstances) {
      await terminateInstance(instance.id);
    }

    console.log(`Cleaned up ${expiredInstances.length} expired instances`);
  } catch (error) {
    console.error('Error cleaning up expired instances:', error);
  }
}

// Health check
async function healthCheck() {
  try {
    const containers = await docker.container.list({ all: true });
    const active = containers.filter(c => c.data.State === 'running').length;

    return {
      status: 'healthy',
      activeContainers: active,
      activeInstances: activeInstances.size,
      availablePorts: portPool.size
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// API Server (using Express for management API)
const express = require('express');
const api = express();
api.use(express.json());

api.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.json(health);
});

api.post('/instance', async (req, res) => {
  try {
    const { challengeId, userId, instanceType } = req.body;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    let instance;
    switch (instanceType) {
      case 'STATIC':
        instance = await createStaticInstance(challenge, userId);
        break;
      case 'TINY_VM':
        instance = await createTinyVMInstance(challenge, userId);
        break;
      case 'FULL_DOCKER':
        instance = await createFullDockerInstance(challenge, userId);
        break;
      default:
        instance = await createStaticInstance(challenge, userId);
    }

    res.json({ success: true, instance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

api.delete('/instance/:id', async (req, res) => {
  try {
    await terminateInstance(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize
initializePortPool();

// Start cleanup interval (every minute)
setInterval(cleanupExpiredInstances, 60000);

// Start API server
const PORT = process.env.API_PORT || 3002;
api.listen(PORT, () => {
  console.log(`Challenge Manager API running on port ${PORT}`);
});

// Export functions
module.exports = {
  createStaticInstance,
  createTinyVMInstance,
  createFullDockerInstance,
  terminateInstance,
  healthCheck
};
