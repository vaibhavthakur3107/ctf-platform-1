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
      flag: 'dexter{TRIVIA_ANSWER}',
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
      flag: 'dexter{LOGIC_PUZZLE}',
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
      flag: 'dexter{MATH_SOLUTION}',
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
      flag: 'dexter{CODING_SOLUTION}',
    },

    // Binary Exploitation Challenges (10 challenges)
    {
      title: 'Buffer Overflow 101',
      description: 'This program has a simple buffer overflow vulnerability. Exploit it to get the flag.',
      category: 'BINARY_EXPLOITATION',
      tags: ['buffer-overflow', 'pwn', 'beginner'],
      author: 'Admin',
      points: 200,
      minPoints: 100,
      decay: 0.08,
      flag: 'dexter{BUFFER_OVERFLOW_BASIC}',
      difficulty: 'EASY',
    },
    {
      title: 'Return to libc',
      description: 'Use return-to-libc technique to bypass NX protection and spawn a shell.',
      category: 'BINARY_EXPLOITATION',
      tags: ['ret2libc', 'nx-bypass', 'pwn'],
      author: 'Admin',
      points: 300,
      minPoints: 150,
      decay: 0.06,
      flag: 'dexter{RET2LIBC_SUCCESS}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'ROP Chain',
      description: 'Construct a ROP chain to bypass ASLR and NX protections.',
      category: 'BINARY_EXPLOITATION',
      tags: ['rop', 'aslr', 'pwn'],
      author: 'Admin',
      points: 350,
      minPoints: 175,
      decay: 0.05,
      flag: 'dexter{ROP_CHAIN_MASTER}',
      difficulty: 'HARD',
    },
    {
      title: 'Format String Bug',
      description: 'Exploit a format string vulnerability to write to arbitrary memory.',
      category: 'BINARY_EXPLOITATION',
      tags: ['format-string', 'pwn'],
      author: 'Admin',
      points: 280,
      minPoints: 140,
      decay: 0.06,
      flag: 'dexter{FORMAT_STRING_WRITE}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Heap Overflow',
      description: 'This binary has a heap-based buffer overflow. Exploit it to get the flag.',
      category: 'BINARY_EXPLOITATION',
      tags: ['heap', 'overflow', 'pwn'],
      author: 'Admin',
      points: 320,
      minPoints: 160,
      decay: 0.06,
      flag: 'dexter{HEAP_OVERFLOW_WIN}',
      difficulty: 'HARD',
    },
    {
      title: 'UAF Vulnerability',
      description: 'Use a Use-After-Free vulnerability to execute arbitrary code.',
      category: 'BINARY_EXPLOITATION',
      tags: ['uaf', 'heap', 'pwn'],
      author: 'Admin',
      points: 380,
      minPoints: 190,
      decay: 0.05,
      flag: 'dexter{UAF_EXPLOITED}',
      difficulty: 'HARD',
    },
    {
      title: 'Shellcode Injection',
      description: 'Inject and execute shellcode to get a shell and the flag.',
      category: 'BINARY_EXPLOITATION',
      tags: ['shellcode', 'injection', 'pwn'],
      author: 'Admin',
      points: 250,
      minPoints: 125,
      decay: 0.07,
      flag: 'dexter{SHELLCODE_EXECUTED}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Integer Overflow',
      description: 'Exploit an integer overflow vulnerability to bypass a security check.',
      category: 'BINARY_EXPLOITATION',
      tags: ['integer-overflow', 'pwn'],
      author: 'Admin',
      points: 230,
      minPoints: 115,
      decay: 0.07,
      flag: 'dexter{INTEGER_OVERFLOW}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Stack Pivot',
      description: 'Use a stack pivot technique to execute code at a controlled location.',
      category: 'BINARY_EXPLOITATION',
      tags: ['stack-pivot', 'rop', 'pwn'],
      author: 'Admin',
      points: 400,
      minPoints: 200,
      decay: 0.05,
      flag: 'dexter{STACK_PIVOT_SUCCESS}',
      difficulty: 'INSANE',
    },
    {
      title: 'ASLR Bypass',
      description: 'Bypass Address Space Layout Randomization to exploit the binary.',
      category: 'BINARY_EXPLOITATION',
      tags: ['aslr', 'info-leak', 'pwn'],
      author: 'Admin',
      points: 350,
      minPoints: 175,
      decay: 0.05,
      flag: 'dexter{ASLR_BYPASSED}',
      difficulty: 'HARD',
    },

    // Additional Web Challenges (5 more)
    {
      title: 'Path Traversal',
      description: 'Exploit a path traversal vulnerability to read the flag file.',
      category: 'WEB',
      tags: ['path-traversal', 'file-inclusion'],
      author: 'Admin',
      points: 140,
      minPoints: 70,
      decay: 0.1,
      flag: 'dexter{PATH_TRAVERSAL_WIN}',
      difficulty: 'EASY',
    },
    {
      title: 'SSRF Attack',
      description: 'Exploit Server-Side Request Forgery to access internal services.',
      category: 'WEB',
      tags: ['ssrf', 'internal'],
      author: 'Admin',
      points: 220,
      minPoints: 110,
      decay: 0.08,
      flag: 'dexter{SSRF_SUCCESS}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'CSRF Exploit',
      description: 'Perform a Cross-Site Request Forgery attack to perform actions on behalf of the admin.',
      category: 'WEB',
      tags: ['csrf', 'session'],
      author: 'Admin',
      points: 160,
      minPoints: 80,
      decay: 0.09,
      flag: 'dexter{CSRF_EXPLOIT}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'XXE Injection',
      description: 'Exploit an XML External Entity vulnerability to read the flag.',
      category: 'WEB',
      tags: ['xxe', 'xml'],
      author: 'Admin',
      points: 190,
      minPoints: 95,
      decay: 0.08,
      flag: 'dexter{XXE_INJECTION}',
      difficulty: 'HARD',
    },
    {
      title: 'Deserialization',
      description: 'Exploit insecure deserialization to achieve RCE and get the flag.',
      category: 'WEB',
      tags: ['deserialization', 'rce'],
      author: 'Admin',
      points: 280,
      minPoints: 140,
      decay: 0.06,
      flag: 'dexter{DESERIALIZATION_RCE}',
      difficulty: 'HARD',
    },

    // Additional Crypto Challenges (5 more)
    {
      title: 'ECC Challenge',
      description: 'Solve the Elliptic Curve Cryptography challenge to find the flag.',
      category: 'CRYPTO',
      tags: ['ecc', 'elliptic-curve'],
      author: 'Admin',
      points: 240,
      minPoints: 120,
      decay: 0.07,
      flag: 'dexter{ECC_SOLVED}',
      difficulty: 'HARD',
    },
    {
      title: 'Padding Oracle',
      description: 'Exploit a padding oracle attack to decrypt the ciphertext.',
      category: 'CRYPTO',
      tags: ['padding-oracle', 'cbc'],
      author: 'Admin',
      points: 200,
      minPoints: 100,
      decay: 0.08,
      flag: 'dexter{PADDING_ORACLE}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Lattice Attack',
      description: 'Use lattice-based cryptanalysis to recover the private key.',
      category: 'CRYPTO',
      tags: ['lattice', 'rsa'],
      author: 'Admin',
      points: 320,
      minPoints: 160,
      decay: 0.06,
      flag: 'dexter{LATTICE_ATTACK}',
      difficulty: 'HARD',
    },
    {
      title: 'Stream Cipher',
      description: 'Break a weak stream cipher to recover the plaintext.',
      category: 'CRYPTO',
      tags: ['stream-cipher', 'lfsr'],
      author: 'Admin',
      points: 130,
      minPoints: 65,
      decay: 0.09,
      flag: 'dexter{STREAM_CIPHER}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Hash Collision',
      description: 'Find a hash collision to bypass the authentication check.',
      category: 'CRYPTO',
      tags: ['hash', 'collision'],
      author: 'Admin',
      points: 180,
      minPoints: 90,
      decay: 0.08,
      flag: 'dexter{HASH_COLLISION}',
      difficulty: 'MEDIUM',
    },

    // Additional Forensics Challenges (5 more)
    {
      title: 'USB Forensics',
      description: 'Analyze USB device artifacts to find the flag.',
      category: 'FORENSICS',
      tags: ['usb', 'registry'],
      author: 'Admin',
      points: 170,
      minPoints: 85,
      decay: 0.08,
      flag: 'dexter{USB_FORENSICS}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Browser Forensics',
      description: 'Extract browser history and data to find the flag.',
      category: 'FORENSICS',
      tags: ['browser', 'sqlite'],
      author: 'Admin',
      points: 150,
      minPoints: 75,
      decay: 0.09,
      flag: 'dexter{BROWSER_FORENSICS}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Registry Analysis',
      description: 'Analyze Windows registry hives to find the hidden flag.',
      category: 'FORENSICS',
      tags: ['registry', 'windows'],
      author: 'Admin',
      points: 190,
      minPoints: 95,
      decay: 0.08,
      flag: 'dexter{REGISTRY_FLAG}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Network Forensics',
      description: 'Analyze network traffic to find the flag in encrypted packets.',
      category: 'FORENSICS',
      tags: ['network', 'wireshark'],
      author: 'Admin',
      points: 210,
      minPoints: 105,
      decay: 0.07,
      flag: 'dexter{NETWORK_FORENSICS}',
      difficulty: 'HARD',
    },
    {
      title: 'Image Forensics',
      description: 'Extract hidden data from image files to find the flag.',
      category: 'FORENSICS',
      tags: ['image', 'stego'],
      author: 'Admin',
      points: 130,
      minPoints: 65,
      decay: 0.1,
      flag: 'dexter{IMAGE_FORENSICS}',
      difficulty: 'EASY',
    },

    // Additional Reverse Engineering Challenges (5 more)
    {
      title: 'Unpack Me',
      description: 'Unpack the packed binary to find the flag verification logic.',
      category: 'REVERSE_ENGINEERING',
      tags: ['unpacking', 'obfuscation'],
      author: 'Admin',
      points: 270,
      minPoints: 135,
      decay: 0.06,
      flag: 'dexter{UNPACKED_BINARY}',
      difficulty: 'HARD',
    },
    {
      title: 'Keygen Me',
      description: 'Reverse engineer the key generation algorithm to create a valid key.',
      category: 'REVERSE_ENGINEERING',
      tags: ['keygen', 'algorithm'],
      author: 'Admin',
      points: 290,
      minPoints: 145,
      decay: 0.06,
      flag: 'dexter{KEYGEN_SUCCESS}',
      difficulty: 'HARD',
    },
    {
      title: 'Anti-Debug',
      description: 'Bypass anti-debugging techniques to analyze the binary.',
      category: 'REVERSE_ENGINEERING',
      tags: ['anti-debug', 'tricks'],
      author: 'Admin',
      points: 310,
      minPoints: 155,
      decay: 0.05,
      flag: 'dexter{ANTI_DEBUG_BYPASSED}',
      difficulty: 'HARD',
    },
    {
      title: 'ARM Binary',
      description: 'Reverse engineer an ARM architecture binary to find the flag.',
      category: 'REVERSE_ENGINEERING',
      tags: ['arm', 'assembly'],
      author: 'Admin',
      points: 260,
      minPoints: 130,
      decay: 0.06,
      flag: 'dexter{ARM_REVERSED}',
      difficulty: 'HARD',
    },
    {
      title: 'VM Detection',
      description: 'Bypass VM detection to analyze the protected binary.',
      category: 'REVERSE_ENGINEERING',
      tags: ['vm', 'detection'],
      author: 'Admin',
      points: 240,
      minPoints: 120,
      decay: 0.07,
      flag: 'dexter{VM_BYPASSED}',
      difficulty: 'MEDIUM',
    },

    // Additional OSINT Challenges (5 more)
    {
      title: 'Archive.org Recon',
      description: 'Use the Wayback Machine to find historical data and the flag.',
      category: 'OSINT',
      tags: ['archive', 'wayback'],
      author: 'Admin',
      points: 120,
      minPoints: 60,
      decay: 0.1,
      flag: 'dexter{ARCHIVE_ORG_FLAG}',
      difficulty: 'EASY',
    },
    {
      title: 'Google Dorking',
      description: 'Use advanced Google search operators to find the flag.',
      category: 'OSINT',
      tags: ['google', 'dorking'],
      author: 'Admin',
      points: 100,
      minPoints: 50,
      decay: 0.12,
      flag: 'dexter{GOOGLE_DORK}',
      difficulty: 'EASY',
    },
    {
      title: 'Shodan Search',
      description: 'Use Shodan to find exposed devices and services with the flag.',
      category: 'OSINT',
      tags: ['shodan', 'iot'],
      author: 'Admin',
      points: 140,
      minPoints: 70,
      decay: 0.09,
      flag: 'dexter{SHODAN_FOUND}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Certificate Search',
      description: 'Search certificate transparency logs to find the flag.',
      category: 'OSINT',
      tags: ['certificates', 'ct-logs'],
      author: 'Admin',
      points: 160,
      minPoints: 80,
      decay: 0.08,
      flag: 'dexter{CERTIFICATE_FLAG}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'GitHub Recon',
      description: 'Search GitHub repositories to find exposed secrets and the flag.',
      category: 'OSINT',
      tags: ['github', 'secrets'],
      author: 'Admin',
      points: 180,
      minPoints: 90,
      decay: 0.08,
      flag: 'dexter{GITHUB_LEAK}',
      difficulty: 'MEDIUM',
    },

    // Additional Miscellaneous Challenges (5 more)
    {
      title: 'Morse Code',
      description: 'Decode the Morse code message to find the flag.',
      category: 'MISCELLANEOUS',
      tags: ['morse', 'encoding'],
      author: 'Admin',
      points: 70,
      minPoints: 35,
      decay: 0.15,
      flag: 'dexter{MORSE_CODE}',
      difficulty: 'EASY',
    },
    {
      title: 'Steganography',
      description: 'Find the hidden message in the provided image using steganography.',
      category: 'MISCELLANEOUS',
      tags: ['stego', 'image'],
      author: 'Admin',
      points: 130,
      minPoints: 65,
      decay: 0.1,
      flag: 'dexter{STEGO_HIDDEN}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'Cipher Puzzle',
      description: 'Solve the custom cipher to reveal the flag.',
      category: 'MISCELLANEOUS',
      tags: ['cipher', 'puzzle'],
      author: 'Admin',
      points: 100,
      minPoints: 50,
      decay: 0.12,
      flag: 'dexter{CIPHER_SOLVED}',
      difficulty: 'EASY',
    },
    {
      title: 'Audio Forensics',
      description: 'Analyze the audio file to find the hidden flag.',
      category: 'MISCELLANEOUS',
      tags: ['audio', 'spectrogram'],
      author: 'Admin',
      points: 150,
      minPoints: 75,
      decay: 0.09,
      flag: 'dexter{AUDIO_FLAG}',
      difficulty: 'MEDIUM',
    },
    {
      title: 'QR Code',
      description: 'Decode the QR code to find the flag.',
      category: 'MISCELLANEOUS',
      tags: ['qr', 'barcode'],
      author: 'Admin',
      points: 60,
      minPoints: 30,
      decay: 0.2,
      flag: 'dexter{QR_DECODED}',
      difficulty: 'EASY',
    },
  ]

  for (const challenge of challenges) {
    await prisma.challenge.create({
      data: challenge,
    })
  }

  // Create hints for some challenges
  const hintsData = [
    { title: 'XOR Encryption', hints: ['Try XORing with single byte keys', 'The flag format is dexter{...}'] },
    { title: 'SQL Injection 101', hints: ['Try using OR 1=1', 'Look for UNION based injection'] },
    { title: 'Buffer Overflow 101', hints: ['Calculate the offset to the return address', 'Use pattern_create to find offset'] },
    { title: 'Caesar Cipher', hints: ['Try ROT13', 'The flag format is dexter{...}'] },
    { title: 'Steganography 101', hints: ['Try steghide or binwalk', 'Check for hidden data in image metadata'] },
    { title: 'Base64 Layers', hints: ['Decode multiple times', 'The flag format is dexter{...}'] },
    { title: 'Hidden Input', hints: ['View the page source', 'Look for hidden input fields'] },
    { title: 'LocalStorage Manipulation', hints: ['Check browser developer tools', 'Look for localStorage values'] },
  ]

  for (const hintData of hintsData) {
    const challenge = await prisma.challenge.findFirst({
      where: { title: hintData.title }
    })

    if (challenge) {
      for (let i = 0; i < hintData.hints.length; i++) {
        await prisma.hint.create({
          data: {
            challengeId: challenge.id,
            text: hintData.hints[i],
            cost: 10 * (i + 1),
            order: i + 1,
          }
        })
      }
    }
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
  console.log(`Created 5 honey tokens`)
  console.log(`Created 4 audit logs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })