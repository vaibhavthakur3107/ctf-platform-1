import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'
import { generateInviteCode } from '../src/lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Clear existing data
  await prisma.honeyToken.deleteMany({})
  await prisma.auditLog.deleteMany({})
  await prisma.achievement.deleteMany({})
  await prisma.solve.deleteMany({})
  await prisma.challenge.deleteMany({})
  await prisma.team.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.competitionSettings.deleteMany({})

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'SUPERADMIN',
    },
  })

  // Create regular users
  const alicePassword = await hash('alice123', 12)
  const bobPassword = await hash('bob123', 12)
  const charliePassword = await hash('charlie123', 12)

  const alice = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: alicePassword,
      role: 'USER',
    },
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      passwordHash: bobPassword,
      role: 'USER',
    },
  })

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie',
      email: 'charlie@example.com',
      passwordHash: charliePassword,
      role: 'USER',
    },
  })

  // Create teams
  const teamAlpha = await prisma.team.create({
    data: {
      name: 'Team Alpha',
      inviteCode: generateInviteCode(),
      members: {
        connect: [{ id: alice.id }, { id: bob.id }],
      },
    },
  })

  const teamBeta = await prisma.team.create({
    data: {
      name: 'Team Beta',
      inviteCode: generateInviteCode(),
      members: {
        connect: [{ id: charlie.id }],
      },
    },
  })

  // Update users with team IDs
  await prisma.user.updateMany({
    where: {
      id: { in: [alice.id, bob.id] },
    },
    data: {
      teamId: teamAlpha.id,
    },
  })

  await prisma.user.update({
    where: { id: charlie.id },
    data: {
      teamId: teamBeta.id,
    },
  })

  // Create challenges
  const challenges = [
    // Crypto Challenges
    {
      title: 'XOR Encryption',
      description: 'Decrypt the XOR encrypted message to find the flag. The ciphertext is: 1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736',
      category: 'CRYPTO',
      tags: ['beginner', 'xor'],
      author: 'Admin',
      points: 100,
      minPoints: 50,
      decay: 0.1,
      flag: 'CTF{X}',
    },
    {
      title: 'Base64 Layers',
      description: 'This flag has been encoded multiple times with Base64. Decode it to find the original message.',
      category: 'CRYPTO',
      tags: ['beginner', 'base64'],
      author: 'Admin',
      points: 80,
      minPoints: 40,
      decay: 0.12,
      flag: 'CTF{BASE64_LAYERS}',
    },
    {
      title: 'RSA Weak Key',
      description: 'The flag has been encrypted with RSA using a weak key. Factor the modulus to decrypt the message.',
      category: 'CRYPTO',
      tags: ['rsa', 'factoring'],
      author: 'Admin',
      points: 200,
      minPoints: 100,
      decay: 0.08,
      flag: 'CTF{RSA_WEAK_KEY}',
    },

    // Web Challenges
    {
      title: 'Hidden Input',
      description: 'Find the hidden input field in the HTML source to get the flag.',
      category: 'WEB',
      tags: ['beginner', 'html'],
      author: 'Admin',
      points: 70,
      minPoints: 35,
      decay: 0.15,
      flag: 'CTF{HIDDEN_INPUT}',
    },
    {
      title: 'LocalStorage Manipulation',
      description: 'Modify the LocalStorage values to bypass authentication and get the flag.',
      category: 'WEB',
      tags: ['javascript', 'storage'],
      author: 'Admin',
      points: 120,
      minPoints: 60,
      decay: 0.1,
      flag: 'CTF{LOCALSTORAGE}',
    },

    // Forensics Challenges
    {
      title: 'Steganography 101',
      description: 'Find the hidden message in the provided image using steganography tools.',
      category: 'FORENSICS',
      tags: ['steganography', 'beginner'],
      author: 'Admin',
      points: 90,
      minPoints: 45,
      decay: 0.1,
      flag: 'CTF{STEGO_IMAGE}',
    },
    {
      title: 'PCAP Analysis',
      description: 'Analyze the network capture file to find the flag in the HTTP traffic.',
      category: 'FORENSICS',
      tags: ['pcap', 'network'],
      author: 'Admin',
      points: 150,
      minPoints: 75,
      decay: 0.08,
      flag: 'CTF{PCAP_FLAG}',
    },

    // Reverse Engineering Challenges
    {
      title: 'Simple Crackme',
      description: 'Reverse engineer the binary to find the correct password that outputs the flag.',
      category: 'REVERSE_ENGINEERING',
      tags: ['binary', 'beginner'],
      author: 'Admin',
      points: 180,
      minPoints: 90,
      decay: 0.07,
      flag: 'CTF{CRACKME_PASSWORD}',
    },

    // OSINT Challenges
    {
      title: 'Social Media Recon',
      description: 'Find the flag by investigating the social media profiles of the target user.',
      category: 'OSINT',
      tags: ['social', 'recon'],
      author: 'Admin',
      points: 110,
      minPoints: 55,
      decay: 0.1,
      flag: 'CTF{OSINT_SOCIAL}',
    },

    // Miscellaneous Challenges
    {
      title: 'CTF Trivia',
      description: 'Answer this CTF trivia question to get the flag.',
      category: 'MISCELLANEOUS',
      tags: ['trivia', 'beginner'],
      author: 'Admin',
      points: 50,
      minPoints: 25,
      decay: 0.2,
      flag: 'CTF{TRIVIA_ANSWER}',
    },
  ]

  for (const challenge of challenges) {
    await prisma.challenge.create({
      data: challenge,
    })
  }

  // Create some solves
  const xorChallenge = await prisma.challenge.findFirst({
    where: { title: 'XOR Encryption' },
  })

  if (xorChallenge) {
    await prisma.solve.create({
      data: {
        userId: alice.id,
        challengeId: xorChallenge.id,
      },
    })

    // Give Alice the First Blood badge
    await prisma.achievement.create({
      data: {
        userId: alice.id,
        type: 'FIRST_BLOOD',
      },
    })
  }

  // Create competition settings
  await prisma.competitionSettings.create({
    data: {
      isPublic: true,
      registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxParticipants: 100,
      scoreboardFreezeTime: 30, // 30 minutes
    },
  })

  // Create honey tokens
  const honeyTokens = ['TOKEN1', 'TOKEN2', 'TOKEN3', 'TOKEN4', 'TOKEN5']
  for (const token of honeyTokens) {
    await prisma.honeyToken.create({
      data: {
        token: `HONEY_${token}`,
      },
    })
  }

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'USER_REGISTERED',
        userId: admin.id,
        ipAddress: '192.168.1.1',
      },
      {
        action: 'USER_REGISTERED',
        userId: alice.id,
        ipAddress: '192.168.1.2',
      },
      {
        action: 'TEAM_CREATED',
        userId: alice.id,
        ipAddress: '192.168.1.2',
      },
      {
        action: 'CHALLENGE_SOLVED',
        userId: alice.id,
        ipAddress: '192.168.1.2',
      },
    ],
  })

  console.log('Database seeded successfully!')
  console.log(`Created ${challenges.length} challenges`)
  console.log(`Created 4 users (1 admin, 3 regular)`)
  console.log(`Created 2 teams`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })