import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isValidSessionToken } from "@/lib/auth";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "FULFILLED", "OUTSTANDING"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await prisma.contribution.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  return NextResponse.json({ contribution: updated });
}
