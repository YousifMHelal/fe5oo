import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import authConfig from "@/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      role: string;
    };
  }
  interface User {
    email: string;
    username: string;
    fullName: string;
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { username },
          include: { role: true },
        });

        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          // Auth.js requires email; we stub it since this app uses username only.
          email: `${user.username}@local`,
          emailVerified: null,
          username: user.username,
          fullName: user.fullName,
          role: user.role.key,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.fullName = user.fullName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).user = {
        id: token.id as string,
        email: token.email as string,
        username: token.username as string,
        fullName: token.fullName as string,
        role: token.role as string,
      };
      return session;
    },
  },
});
