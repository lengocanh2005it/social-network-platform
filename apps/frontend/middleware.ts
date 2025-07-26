import { generateUUID } from "@/utils";
import axios from "axios";
import { decodeJwt } from "jose";
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

      if (!res.data?.token) {
        throw new Error("Get token from server failed. Try again.");
      }

      return NextResponse.redirect(
        new URL(`/auth/not-found/?token=${res.data.token}`, request.url),
      );
    }

    return NextResponse.next();
  }

  if (accessToken) {
    try {
      const decoded = decodeJwt(accessToken);

      if (decoded && decoded.exp && Date.now() < decoded.exp * 1000)
        return NextResponse.next();
    } catch (err) {
      console.error("Access token decoding failed", err);
    }
  }

  if (
    pathname.startsWith("/home") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard")
  ) {
    const response = NextResponse.redirect(
      new URL("/auth/sign-in", request.url),
    );
    response.cookies.set("access_token", "", { maxAge: 0 });
    response.cookies.set("refresh_token", "", { maxAge: 0 });
    response.cookies.set("role", "", { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}
