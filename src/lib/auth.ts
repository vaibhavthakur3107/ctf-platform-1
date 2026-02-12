import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import { compare } from "bcrypt"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/error",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub || user?.id
        session.user.role = token.role || user?.role
        session.user.teamId = token.teamId || user?.teamId
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.teamId = user.teamId
      }
      return token
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error("User not found")
        }

        const passwordMatch = await compare(credentials.password, user.passwordHash)

        if (!passwordMatch) {
          throw new Error("Invalid password")
        }

        if (user.role === 'BANNED') {
          throw new Error("Your account has been banned")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          teamId: user.teamId,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Custom credential authentication function
export async function authenticate(
  email: string,
  password: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const passwordMatch = await compare(password, user.passwordHash)

    if (!passwordMatch) {
      return { success: false, error: "Invalid password" }
    }

    if (user.role === 'BANNED') {
      return { success: false, error: "Your account has been banned" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Authentication error:", error)
    return { success: false, error: "Authentication failed" }
  }
}

// Check if user is admin
export function isAdmin(user: any): boolean {
  return user?.role === "ADMIN" || user?.role === "SUPERADMIN"
}

// Check if user is super admin
export function isSuperAdmin(user: any): boolean {
  return user?.role === "SUPERADMIN"
}