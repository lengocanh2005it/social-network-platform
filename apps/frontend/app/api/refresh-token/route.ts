import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  const url = `${process.env.NEXT_PUBLIC_KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "");
  params.append(
    "client_secret",
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_SECRET ?? "",
  );
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

  const response = await axios.post<{
    access_token: string;
    refresh_token: string;
  }>(url, params.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const { access_token: accessToken, refresh_token: newRefreshToken } =
    response.data;

  return NextResponse.json({
    accessToken,
    refreshToken: newRefreshToken,
  });
}
