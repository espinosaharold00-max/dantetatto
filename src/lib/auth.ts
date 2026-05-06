import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role: Role;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role?: string }).role =
          token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      if (nextUrl.pathname.startsWith("/admin")) {
        if (!auth?.user) return false;
        const role = (auth.user as unknown as { role?: string }).role;
        if (role !== "ADMIN" && role !== "STAFF") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }
      return true;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[auth] No credentials provided");
            return null;
          }

          console.log("[auth] Login attempt:", credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.error("[auth] User not found:", credentials.email);
            return null;
          }

          if (!user.password) {
            console.error("[auth] User has no password:", credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.error("[auth] Invalid password for:", credentials.email);
            return null;
          }

          console.log("[auth] Login success:", credentials.email, "role:", user.role);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("[auth] Error in authorize:", error);
          return null;
        }
      },
    }),
  ],
});
