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

  // Create challenges - 30 realistic challenges across all categories
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
    {
      title: 'Caesar Cipher',
      description: 'A message has been encrypted with a Caesar cipher. Find the shift value and decrypt the flag.',
      category: 'CRYPTO',
      tags: ['beginner', 'classical'],
      author: 'Admin',
      points: 60,
      minPoints: 30,
      decay: 0.15,
      flag: 'CTF{CAESAR_13}',
    },
    {
      title: 'AES-CBC Decryption',
      description: 'Decrypt the AES-CBC encrypted message using the provided key and IV to find the flag.',
      category: 'CRYPTO',
      tags: ['aes', 'block-cipher'],
      author: 'Admin',
      points: 150,
      minPoints: 75,
      decay: 0.1,
      flag: 'CTF{AES_CBC_MODE}',
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
    {
      title: 'SQL Injection 101',
      description: 'Exploit the SQL injection vulnerability to retrieve the flag from the database.',
      category: 'WEB',
      tags: ['sql', 'injection'],
      author: 'Admin',
      points: 180,
      minPoints: 90,
      decay: 0.08,
      flag: 'CTF{SQL_INJECTION}',
    },
    {
      title: 'XSS Challenge',
      description: 'Find an XSS vulnerability and execute JavaScript to retrieve the flag.',
      category: 'WEB',
      tags: ['xss', 'javascript'],
      author: 'Admin',
      points: 160,
      minPoints: 80,
      decay: 0.09,
      flag: 'CTF{XSS_EXPLOIT}',
    },
    {
      title: 'Broken Authentication',
      description: 'Exploit the broken authentication mechanism to access admin functionality and get the flag.',
      category: 'WEB',
      tags: ['authentication', 'session'],
      author: 'Admin',
      points: 200,
      minPoints: 100,
      decay: 0.07,
      flag: 'CTF{AUTH_BYPASS}',
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
    {
      title: 'Memory Dump Analysis',
      description: 'Analyze the memory dump to find the hidden flag using forensic tools.',
      category: 'FORENSICS',
      tags: ['memory', 'volatility'],
      author: 'Admin',
      points: 220,
      minPoints: 110,
      decay: 0.06,
      flag: 'CTF{MEMORY_FLAG}',
    },
    {
      title: 'File Carving',
      description: 'Recover deleted files from the disk image to find the flag.',
      category: 'FORENSICS',
      tags: ['disk', 'recovery'],
      author: 'Admin',
      points: 180,
      minPoints: 90,
      decay: 0.07,
      flag: 'CTF{FILE_RECOVERY}',
    },
    {
      title: 'Metadata Extraction',
      description: 'Extract metadata from the provided file to find the hidden flag.',
      category: 'FORENSICS',
      tags: ['metadata', 'exif'],
      author: 'Admin',
      points: 100,
      minPoints: 50,
      decay: 0.1,
      flag: 'CTF{METADATA_FLAG}',
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
    {
      title: 'Assembly Puzzle',
      description: 'Analyze the assembly code to understand the algorithm and find the correct input.',
      category: 'REVERSE_ENGINEERING',
      tags: ['assembly', 'algorithm'],
      author: 'Admin',
      points: 200,
      minPoints: 100,
      decay: 0.06,
      flag: 'CTF{ASM_PUZZLE}',
    },
    {
      title: 'Obfuscated JavaScript',
      description: 'Deobfuscate the JavaScript code to find the hidden flag.',
      category: 'REVERSE_ENGINEERING',
      tags: ['javascript', 'obfuscation'],
      author: 'Admin',
      points: 160,
      minPoints: 80,
      decay: 0.08,
      flag: 'CTF{JS_DEOBFUSCATED}',
    },
    {
      title: 'Binary Exploitation',
      description: 'Exploit the buffer overflow vulnerability to get the flag.',
      category: 'REVERSE_ENGINEERING',
      tags: ['buffer-overflow', 'exploitation'],
      author: 'Admin',
      points: 250,
      minPoints: 125,
      decay: 0.05,
      flag: 'CTF{BUFFER_OVERFLOW}',
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
    {
      title: 'Geolocation Challenge',
      description: 'Use geolocation data from the image to find the exact location and flag.',
      category: 'OSINT',
      tags: ['geolocation', 'metadata'],
      author: 'Admin',
      points: 130,
      minPoints: 65,
      decay: 0.09,
      flag: 'CTF{GEO_LOCATION}',
    },
    {
      title: 'Domain Investigation',
      description: 'Investigate the domain ownership and historical records to find the flag.',
      category: 'OSINT',
      tags: ['domain', 'whois'],
      author: 'Admin',
      points: 140,
      minPoints: 70,
      decay: 0.08,
      flag: 'CTF{DOMAIN_FLAG}',
    },
    {
      title: 'Email Header Analysis',
      description: 'Analyze the email headers to trace the origin and find the flag.',
      category: 'OSINT',
      tags: ['email', 'headers'],
      author: 'Admin',
      points: 120,
      minPoints: 60,
      decay: 0.09,
      flag: 'CTF{EMAIL_HEADER}',
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
    {
      title: 'Logic Puzzle',
      description: 'Solve the logic puzzle to determine the correct sequence and get the flag.',
      category: 'MISCELLANEOUS',
      tags: ['puzzle', 'logic'],
      author: 'Admin',
      points: 90,
      minPoints: 45,
      decay: 0.12,
      flag: 'CTF{LOGIC_PUZZLE}',
    },
    {
      title: 'Math Challenge',
      description: 'Solve the mathematical problem to derive the flag.',
      category: 'MISCELLANEOUS',
      tags: ['math', 'calculus'],
      author: 'Admin',
      points: 110,
      minPoints: 55,
      decay: 0.1,
      flag: 'CTF{MATH_SOLUTION}',
    },
    {
      title: 'Coding Challenge',
      description: 'Write a program to solve the coding problem and generate the flag.',
      category: 'MISCELLANEOUS',
      tags: ['coding', 'algorithm'],
      author: 'Admin',
      points: 150,
      minPoints: 75,
      decay: 0.08,
      flag: 'CTF{CODING_SOLUTION}',
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