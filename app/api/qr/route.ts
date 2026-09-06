import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1024,
    color: { dark: "#0F3875", light: "#FFFFFF" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
