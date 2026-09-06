"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Download, Trash2 } from "lucide-react";
import { EQUIPMENT, type CategoryKey } from "@/lib/equipment";

type Item = { id: string; category: CategoryKey; amount: number };
type Contribution = {
  id: string;
  donorName: string;
  donorPhone: string;
  type: "GIVE" | "PLEDGE";
  status: "PENDING" | "CONFIRMED" | "FULFILLED" | "OUTSTANDING";
  totalAmount: number;
  createdAt: string | Date;
  items: Item[];
};

const STATUS_STYLES: Record<Contribution["status"], string> = {
  PENDING: "bg-brass/15 text-brass",
  CONFIRMED: "bg-green-100 text-green-700",
  OUTSTANDING: "bg-ink/10 text-ink/70",
  FULFILLED: "bg-green-100 text-green-700",
};

export default function AdminDashboard({
  initialContributions,
}: {
  initialContributions: Contribution[];
}) {
  const router = useRouter();
  const [contributions, setContributions] = useState(initialContributions);
  const [updating, setUpdating] = useState<string | null>(null);

  const categoryTotals = useMemo(() => {
    const totals: Record<CategoryKey, number> = {
      CAMERA: 0,
      MICROPHONE: 0,
      LIGHTING: 0,
    };
    for (const c of contributions) {
      for (const item of c.items) {
        totals[item.category] += item.amount;
      }
    }
    return totals;
  }, [contributions]);

  const totalGiven = contributions
    .filter((c) => c.type === "GIVE")
    .reduce((s, c) => s + c.totalAmount, 0);
  const totalPledged = contributions
    .filter((c) => c.type === "PLEDGE")
    .reduce((s, c) => s + c.totalAmount, 0);

  async function updateStatus(id: string, status: Contribution["status"]) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/contributions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update.");
      setContributions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch {
      alert("Could not update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this contribution?")) return;

    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.success) {
        setContributions((prev) => prev.filter((c) => c.id !== id));
        alert("Entry deleted successfully!");
      } else {
        alert("Failed to delete: " + data.error);
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  }

  function exportCsv() {
    const header = [
      "Name",
      "Phone",
      "Type",
      "Status",
      "Total (KES)",
      "Categories",
      "Date",
    ];
    const rows = contributions.map((c) => [
      c.donorName,
      c.donorPhone,
      c.type,
      c.status,
      c.totalAmount.toString(),
      c.items.map((i) => `${EQUIPMENT[i.category].label}:${i.amount}`).join(" | "),
      new Date(c.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pcea-media-fund-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-ivory px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-semibold text-navy">
              Media Fund dashboard
            </h1>
            <p className="text-xs text-ink/60">P.C.E.A. Embakasi Church</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-navy px-3 py-2 text-xs font-semibold text-navy"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard label="Given" value={totalGiven} accent="bg-maroon" />
          <SummaryCard label="Pledged" value={totalPledged} accent="bg-brass" />
          {(Object.keys(categoryTotals) as CategoryKey[]).map((k) => (
            <SummaryCard
              key={k}
              label={EQUIPMENT[k].label}
              value={categoryTotals[k]}
              accent="bg-navy"
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Donor</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Breakdown</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{c.donorName}</div>
                    <div className="text-xs text-ink/50">{c.donorPhone}</div>
                  </td>
                  <td className="px-4 py-3">{c.type === "GIVE" ? "Give" : "Pledge"}</td>
                  <td className="px-4 py-3 text-xs text-ink/70">
                    {c.items
                      .map((i) => `${EQUIPMENT[i.category].label}: ${i.amount.toLocaleString()}`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    KES {c.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      disabled={updating === c.id}
                      onChange={(e) =>
                        updateStatus(c.id, e.target.value as Contribution["status"])
                      }
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[c.status]}`}
                    >
                      {c.type === "GIVE" ? (
                        <>
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                        </>
                      ) : (
                        <>
                          <option value="OUTSTANDING">Outstanding</option>
                          <option value="FULFILLED">Fulfilled</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink/50">
                    {new Date(c.createdAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center gap-1 rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {contributions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/50">
                    No contributions yet. Once the QR code is shared, records will
                    appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-3">
      <div className={`mb-2 h-1 w-6 rounded-full ${accent}`} />
      <div className="text-xs text-ink/50">{label}</div>
      <div className="font-serif text-base font-semibold text-ink">
        KES {value.toLocaleString()}
      </div>
    </div>
  );
}
