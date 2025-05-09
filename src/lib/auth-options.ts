import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
// Add proper typing for the credentials
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  // @ts-ignore - PrismaAdapter has typing issues with the current version
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
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
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl || undefined, // Convert null to undefined to match the User interface
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "TEACHER" | "ADMIN";
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
};

// This is just an interface definition, the actual implementation would happen in a next-auth provider
declare module "next-auth" {
  interface User {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatarUrl?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    avatarUrl?: string;
  }
}
