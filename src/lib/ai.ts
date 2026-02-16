import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface ChallengePrompt {
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';
  topic?: string;
}

export interface GeneratedChallenge {
  title: string;
  description: string;
  category: string;
  tags: string[];
  points: number;
  minPoints: number;
  decay: number;
  flag: string;
  difficulty: string;
  solution?: string;
}

/**
 * Generate a CTF challenge using AI
 */
export async function generateChallenge(
  prompt: ChallengePrompt,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<GeneratedChallenge | null> {
  try {
    const systemPrompt = `You are an expert CTF challenge creator. Generate a realistic, solvable CTF challenge based on the given parameters.

The challenge must include:
1. A unique title
2. A clear description with enough context to solve it
3. Appropriate tags for the challenge type
4. A difficulty level (EASY, MEDIUM, HARD, or INSANE)
5. A realistic point value based on difficulty
6. A unique flag in the format: dexter{...}
7. A brief solution hint (for internal use)

Categories available:
- WEB: Web exploitation (SQLi, XSS, CSRF, SSRF, etc.)
- CRYPTO: Cryptography (RSA, AES, XOR, etc.)
- FORENSICS: File analysis, memory dumps, network traffic
- OSINT: Open source intelligence
- REVERSE_ENGINEERING: Binary analysis, deobfuscation
- BINARY_EXPLOITATION: Buffer overflows, ROP, shellcode
- MISCELLANEOUS: Puzzles, encoding, steganography

Difficulty guidelines:
- EASY: 50-100 points, requires basic knowledge
- MEDIUM: 100-200 points, requires intermediate skills
- HARD: 200-350 points, requires advanced techniques
- INSANE: 350-500 points, requires expert-level knowledge

IMPORTANT: All flags MUST be in the format dexter{...} and should be unique and realistic.

Respond with valid JSON only, no markdown formatting.`;

    const userPrompt = `Generate a ${prompt.difficulty} difficulty ${prompt.category} challenge${prompt.topic ? ` about ${prompt.topic}` : ''}.

Provide a JSON response with this exact structure:
{
  "title": "Challenge Title",
  "description": "Challenge description with enough context to solve it",
  "category": "${prompt.category}",
  "tags": ["tag1", "tag2"],
  "points": 100,
  "minPoints": 50,
  "decay": 0.1,
  "flag": "dexter{unique_flag_here}",
  "difficulty": "${prompt.difficulty}",
  "solution": "Brief explanation of how to solve"
}`;

    let content = '';

    if (provider === 'openai' && openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });
      content = response.choices[0].message.content || '';
    } else if (provider === 'anthropic' && anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      content = response.content[0].type === 'text' ? response.content[0].text : '';
    } else {
      throw new Error('No AI provider available');
    }

    // Parse the JSON response
    const challenge = JSON.parse(content);

    // Validate required fields
    if (!challenge.title || !challenge.description || !challenge.flag) {
      throw new Error('Generated challenge missing required fields');
    }

    // Validate flag format
    if (!challenge.flag.startsWith('dexter{') || !challenge.flag.endsWith('}')) {
      throw new Error('Invalid flag format');
    }

    return challenge;
  } catch (error) {
    console.error('Error generating challenge:', error);
    return null;
  }
}

/**
 * Generate multiple challenges for a category
 */
export async function generateChallengeBatch(
  category: string,
  count: number = 5,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<GeneratedChallenge[]> {
  const difficulties: Array<'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'> = ['EASY', 'MEDIUM', 'HARD', 'INSANE'];
  const challenges: GeneratedChallenge[] = [];

  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % difficulties.length];
    const challenge = await generateChallenge(
      { category, difficulty },
      provider
    );

    if (challenge) {
      challenges.push(challenge);
    }

    // Rate limiting between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return challenges;
}

/**
 * Generate hints for an existing challenge
 */
export async function generateHints(
  challengeTitle: string,
  challengeDescription: string,
  count: number = 3,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<string[] | null> {
  try {
    const systemPrompt = `You are an expert CTF challenge creator. Generate helpful hints for a CTF challenge.

Hints should:
1. Start general and become more specific
2. Point players in the right direction without giving away the solution
3. Be helpful and educational
4. Not reveal the flag directly

Each hint should be 1-2 sentences long.`;

    const userPrompt = `Generate ${count} hints for this CTF challenge:

Title: ${challengeTitle}

Description: ${challengeDescription}

Provide a JSON response with this structure:
{
  "hints": [
    "First hint (general)",
    "Second hint (more specific)",
    "Third hint (very specific)"
  ]
}`;

    let content = '';

    if (provider === 'openai' && openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      content = response.choices[0].message.content || '';
    } else if (provider === 'anthropic' && anthropic) {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      });

      content = response.content[0].type === 'text' ? response.content[0].text : '';
    } else {
      throw new Error('No AI provider available');
    }

    const result = JSON.parse(content);
    return result.hints || [];
  } catch (error) {
    console.error('Error generating hints:', error);
    return null;
  }
}

/**
 * Validate a generated challenge
 */
export async function validateChallenge(
  challenge: GeneratedChallenge
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  // Check required fields
  if (!challenge.title) issues.push('Missing title');
  if (!challenge.description) issues.push('Missing description');
  if (!challenge.category) issues.push('Missing category');
  if (!challenge.flag) issues.push('Missing flag');

  // Validate flag format
  if (challenge.flag && !challenge.flag.startsWith('dexter{')) {
    issues.push('Flag must start with dexter{');
  }
  if (challenge.flag && !challenge.flag.endsWith('}')) {
    issues.push('Flag must end with }');
  }

  // Validate points
  if (challenge.points < 0) issues.push('Points cannot be negative');
  if (challenge.minPoints < 0) issues.push('Min points cannot be negative');
  if (challenge.minPoints >= challenge.points) {
    issues.push('Min points must be less than base points');
  }

  // Validate decay
  if (challenge.decay < 0 || challenge.decay > 1) {
    issues.push('Decay must be between 0 and 1');
  }

  // Validate difficulty
  const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'INSANE'];
  if (!validDifficulties.includes(challenge.difficulty)) {
    issues.push('Invalid difficulty level');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
