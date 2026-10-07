import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookie } from "@/lib/session-cookie";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(sessionCookie)?.value;
  const isLogin = request.nextUrl.pathname === "/login";
  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
