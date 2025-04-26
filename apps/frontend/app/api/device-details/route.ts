import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userAgent = req.headers.get("user-agent");

  let ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "Unknown IP";

  if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
    try {
      const res = await fetch("https://api.ipify.org/?format=json");

      const data = await res.json();

      ipAddress = data.ip;
    } catch {
      ipAddress = "Unknown (ipify failed)";
    }
  }

  const location = await getLocationFromIP(ipAddress);

  return NextResponse.json({
    device_name: userAgent,
    user_agent: userAgent,
    ip_address: ipAddress,
    location: location,
  });
}

async function getLocationFromIP(ip: string) {
  if (!ip || ip === "Unknown IP") return "Unknown location";

  const token = process.env.IP_INFO_API_TOKEN;

  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json?token=${token}`);

    const data = await response.json();

    return data.city || "Unknown city";
  } catch (error) {
    console.error(error);

    return "Location fetch failed";
  }
}
