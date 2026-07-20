import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  const role = req.auth?.user?.role;
  if (pathname.startsWith("/portal") && role && role !== "revendedora") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  if (
    !pathname.startsWith("/portal") &&
    !isPublic &&
    role === "revendedora"
  ) {
    return NextResponse.redirect(new URL("/portal", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:png|jpg|jpeg|webp|svg)$).*)",
  ],
};
