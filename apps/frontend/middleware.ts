import { generateToken } from "@/lib/api/auth";
import { generateUUID } from "@/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    const data = await generateToken({
      payload: generateUUID(),
    });

    if (!data || !data.token)
      throw new Error("Get token from server failed. Try again.");

    return NextResponse.redirect(
      new URL(`/auth/not-found/?token=${data.token}`, request.url),
    );
  }

  return NextResponse.next();
}
