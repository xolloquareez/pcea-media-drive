import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/equipment";
import { ADMIN_COOKIE, isValidSessionToken } from "@/lib/auth";

const KENYA_PHONE = /^(?:\+254|0)7\d{8}$/;

type IncomingItem = { category: string; amount: number };

function validate(body: any): string | null {
  if (body.type !== "GIVE" && body.type !== "PLEDGE") return "Invalid contribution type.";
  if (typeof body.donorName !== "string" || body.donorName.trim().length < 2)
    return "Please enter a valid name.";
  if (typeof body.donorPhone !== "string" || !KENYA_PHONE.test(body.donorPhone.trim()))
    return "Please enter a valid Kenyan phone number (e.g. 0712345678).";
  if (!Array.isArray(body.items) || body.items.length === 0)
    return "Select at least one equipment category.";

  for (const item of body.items as IncomingItem[]) {
    if (!CATEGORY_KEYS.includes(item.category as CategoryKey))
      return "Invalid equipment category.";
    if (typeof item.amount !== "number" || !Number.isFinite(item.amount) || item.amount <= 0)
      return "Each allocation must be a positive amount.";
    if (item.amount > 1_000_000) return "Amount is too large.";
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const items: IncomingItem[] = body.items;
  const totalAmount = items.reduce((sum, i) => sum + Math.round(i.amount), 0);

  const contribution = await prisma.contribution.create({
    data: {
      donorName: body.donorName.trim(),
      donorPhone: body.donorPhone.trim(),
      type: body.type,
      status: body.type === "GIVE" ? "PENDING" : "OUTSTANDING",
      totalAmount,
      items: {
        create: items.map((i) => ({
          category: i.category as CategoryKey,
          amount: Math.round(i.amount),
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ contribution }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contributions = await prisma.contribution.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return NextResponse.json({ contributions });
}
