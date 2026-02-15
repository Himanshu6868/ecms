import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard", "/tickets", "/admin"];

export async function proxy(request: NextRequest) {
  if (!protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/admin") && !["MANAGER", "ADMIN"].includes((token.role as string) ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tickets/:path*", "/admin/:path*"],
};
