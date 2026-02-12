import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import { compare } from "bcrypt"
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.teamId = user.teamId
      }
      return session
    },
  },
  providers: [
    // Credentials provider will be added in the auth routes
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