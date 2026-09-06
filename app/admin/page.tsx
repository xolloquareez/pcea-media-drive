import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isValidSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    redirect("/admin/login");
  }

  const contributions = await prisma.contribution.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return <AdminDashboard initialContributions={contributions} />;
}
