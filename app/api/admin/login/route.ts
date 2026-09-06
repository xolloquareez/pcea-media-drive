import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSessionToken, verifyAdminPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  let valid = false;
  try {
    valid = password.length > 0 && verifyAdminPassword(password);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server misconfigured." },
      { status: 500 }
    );
  }

  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
