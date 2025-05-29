import { generateUUID } from "@/utils";
import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const loggedIn = request.cookies.get("logged_in")?.value;

  const pathname = request.nextUrl.pathname;

  const authPages = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/reset-password",
    "/auth/forgot-password",
    "/auth/session-expired",
  ];

  if (
    (token && authPages.includes(pathname)) ||
    (loggedIn && loggedIn === "true" && pathname === "/")
  ) {
    const res = await axios.post(
      `${request.nextUrl.origin}/api/generate-token`,
      {
        payload: generateUUID(),
      },
    );

    if (!res.data || !res.data.token) {
      throw new Error("Get token from server failed. Try again.");
    }

    return NextResponse.redirect(
      new URL(`/auth/not-found/?token=${res.data.token}`, request.url),
    );
  }

  if (
    (!loggedIn || loggedIn === "false") &&
    (pathname.startsWith("/home") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/profile"))
  ) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}
