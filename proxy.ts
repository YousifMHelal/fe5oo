import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isLoginPage = pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    const role = req.auth?.user?.role;
    const dest = role === "CASHIER" ? "/transactions" : "/overview";
    return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|fonts|logo.png).*)",
  ],
};
