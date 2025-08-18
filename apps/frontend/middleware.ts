import { generateUUID } from "@/utils";
import { decodeJwt, JWTPayload } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function clearAuthCookiesAndRedirect(url: string, request: NextRequest) {
  const response = NextResponse.redirect(new URL(url, request.url));
  response.cookies.set("access_token", "", { maxAge: 0 });
  response.cookies.set("refresh_token", "", { maxAge: 0 });
  response.cookies.set("role", "", { maxAge: 0 });
  return response;
}

function isForbiddenPath(pathname: string, role: string) {
  return (
    (role === "admin" &&
      (pathname.startsWith("/home") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/profile"))) ||
    (role === "user" && pathname.startsWith("/dashboard"))
  );
}

function extractRole(token: string | undefined): string | undefined {
  if (!token) return undefined;
  try {
    const decoded = decodeJwt(token) as JWTPayload & {
      resource_access?: Record<string, any>;
    };
    return (
      decoded?.resource_access?.[
        process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || ""
      ]?.roles?.[0] ?? undefined
    );
  } catch {
    return undefined;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const roleData = request.cookies.get("role")?.value;
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/api/refresh-token") ||
    pathname.startsWith("/api/generate-token")
  ) {
    return NextResponse.next();
  }

  const authPages = [
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/reset-password",
    "/auth/forgot-password",
    "/auth/session-expired",
    "/",
  ];

  if (refreshToken) {
    if (authPages.includes(pathname)) {
      const res = await fetch(`${request.nextUrl.origin}/api/generate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: generateUUID() }),
      });

      const data = await res.json();

      if (!data?.token) {
        throw new Error("Get token from server failed. Try again.");
      }

      return NextResponse.redirect(
        new URL(`/auth/not-found/?token=${data.token}`, request.url),
      );
    }

    let role = roleData;

    if (!roleData) {
      const res = await fetch(`${request.nextUrl.origin}/api/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        console.error("Failed to refresh token");
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }

      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
      };

      role = extractRole(data.accessToken);
    }

    if (!role) {
      return clearAuthCookiesAndRedirect("/auth/sign-in", request);
    }

    if (isForbiddenPath(pathname, role)) {
      const res = await fetch(`${request.nextUrl.origin}/api/generate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: generateUUID() }),
      });

      const data = await res.json();

      if (!data?.token) {
        throw new Error("Get token from server failed. Try again.");
      }

      return NextResponse.redirect(
        new URL(`/auth/forbidden/?token=${data.token}`, request.url),
      );
    }

    return NextResponse.next();
  }

  if (accessToken) {
    const role = extractRole(accessToken);

    if (!role) {
      return clearAuthCookiesAndRedirect("/auth/sign-in", request);
    }

    if (isForbiddenPath(pathname, role)) {
      return NextResponse.redirect(new URL("/auth/forbidden", request.url));
    }

    const decoded = decodeJwt(accessToken);
    if (decoded && decoded.exp && Date.now() < decoded.exp * 1000) {
      return NextResponse.next();
    }
  }

  if (
    pathname.startsWith("/home") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard")
  ) {
    return clearAuthCookiesAndRedirect("/auth/sign-in", request);
  }

  return NextResponse.next();
}
