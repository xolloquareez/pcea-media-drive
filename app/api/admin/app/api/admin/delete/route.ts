import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing pledge ID" },
        { status: 400 }
      );
    }

    await prisma.pledge.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Entry deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
