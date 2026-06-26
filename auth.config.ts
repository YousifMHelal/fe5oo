import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Edge-safe config — no Prisma, no Node.js-only APIs.
// Used by proxy.ts (edge runtime) for session/route checks only.
// Full authorize logic (bcrypt + DB) lives in auth.ts.
const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" },
      },
      // authorize is intentionally empty here — real logic is in auth.ts.
      // The proxy only uses the session JWT; it never re-authorizes in edge.
      async authorize() {
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isLoginPage = pathname === "/login";

      if (!isLoggedIn && !isLoginPage) return false;
      return true;
    },
  },
};

export default authConfig;
