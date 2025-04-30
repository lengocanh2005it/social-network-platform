import { generateToken } from "@/lib/api/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { payload } = await req.json();

  const result = await generateToken({ payload });

  if (!result?.token) {
    return NextResponse.json(
      { error: "Token generation failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ token: result.token });
}
