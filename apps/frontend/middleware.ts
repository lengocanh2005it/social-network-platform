import { generateUUID } from "@/utils";
import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const pathname = request.nextUrl.pathname;

  const authPages = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/reset-password",
    "/auth/forgot-password",
    "/auth/session-expired",
  ];

  if (refreshToken) {
    if (authPages.includes(pathname)) {
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

    return NextResponse.next();
  }

  if (
    !refreshToken &&
    (pathname.startsWith("/home") || pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}
