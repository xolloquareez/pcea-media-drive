"use client";

import { useMemo, useState } from "react";
import { Camera, Mic, Lightbulb, Check, Loader2 } from "lucide-react";
import { CATEGORY_KEYS, EQUIPMENT, type CategoryKey } from "@/lib/equipment";

const ICONS: Record<CategoryKey, React.ElementType> = {
  CAMERA: Camera,
  CAMERA LENS: Mic,
  LIGHTING: Lightbulb,
};

type Selection = Partial<Record<CategoryKey, number>>;

const PAYBILL_NUMBER = process.env.NEXT_PUBLIC_PAYBILL_NUMBER || "000000";
const PAYBILL_ACCOUNT = process.env.NEXT_PUBLIC_PAYBILL_ACCOUNT || "MEDIA FUND";

export default function GivingForm() {
  const [selection, setSelection] = useState<Selection>({ CAMERA: 1000 });
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [submitting, setSubmitting] = useState<"GIVE" | "PLEDGE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    type: "GIVE" | "PLEDGE";
    total: number;
    breakdown: { label: string; amount: number }[];
  } | null>(null);

  const total = useMemo(
    () => Object.values(selection).reduce((sum, v) => sum + (v || 0), 0),
    [selection]
  );

  function toggleCategory(key: CategoryKey) {
    setSelection((prev) => {
      const next = { ...prev };
      if (next[key] !== undefined) {
        delete next[key];
      } else {
        next[key] = EQUIPMENT[key].presets[1]; // default to second preset
      }
      return next;
    });
  }

  function setAmount(key: CategoryKey, amount: number) {
    setSelection((prev) => ({ ...prev, [key]: amount }));
  }

  async function submit(type: "GIVE" | "PLEDGE") {
    setError(null);

    if (!donorName.trim() || !donorPhone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (total <= 0) {
      setError("Please allocate an amount to at least one equipment category.");
      return;
    }

    const items = CATEGORY_KEYS.filter((k) => selection[k]).map((k) => ({
      category: k,
      amount: selection[k] as number,
    }));

    setSubmitting(type);
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          donorName: donorName.trim(),
          donorPhone: donorPhone.trim(),
          items,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      setResult({
        type,
        total,
        breakdown: items.map((i) => ({
          label: EQUIPMENT[i.category].label,
          amount: i.amount,
        })),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(null);
    }
  }

  function resetAndClose() {
    setResult(null);
    setDonorName("");
    setDonorPhone("");
    setSelection({ CAMERA: 1000 });
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl bg-ivory p-6 shadow-card sm:p-8">
        <header className="mb-6 text-center">
          <p className="font-serif text-lg font-semibold tracking-tight text-navy sm:text-xl">
            P.C.E.A. Embakasi Church
          </p>
          <p className="mt-0.5 text-sm font-medium text-maroon">Media Fund</p>
          <blockquote className="mt-4 rounded-lg border-l-4 border-navy bg-white/60 px-4 py-3 text-left text-sm italic leading-relaxed text-ink/80">
            &ldquo;Each of you should give what you have decided in your heart
            to give, not reluctantly or under compulsion, for God loves a
            cheerful giver.&rdquo;
            <span className="mt-1 block not-italic font-semibold text-navy">
              — 2 Corinthians 9:7
            </span>
          </blockquote>
        </header>

        <section className="mb-5">
          <h2 className="mb-3 text-sm font-semibold text-ink">
            1. Select equipment to support
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORY_KEYS.map((key) => {
              const Icon = ICONS[key];
              const active = selection[key] !== undefined;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleCategory(key)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center transition-colors ${
                    active
                      ? "border-navy bg-navy/5"
                      : "border-ink/10 bg-white hover:border-navy/30"
                  }`}
                >
                  <Icon
                    size={26}
                    strokeWidth={1.75}
                    className={active ? "text-navy" : "text-ink/50"}
                  />
                  <span className="text-xs font-semibold text-ink">
                    {EQUIPMENT[key].label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">2. Set your allocation</h2>
          {CATEGORY_KEYS.filter((k) => selection[k] !== undefined).length === 0 && (
            <p className="rounded-lg bg-white/60 px-3 py-4 text-center text-xs text-ink/50">
              Select at least one item above.
            </p>
          )}
          {CATEGORY_KEYS.filter((k) => selection[k] !== undefined).map((key) => (
            <div key={key} className="rounded-lg border border-ink/10 bg-white/70 p-3">
              <label className="mb-2 block text-xs font-semibold text-navy">
                {EQUIPMENT[key].label} — {EQUIPMENT[key].blurb}
              </label>
              <div className="mb-2 flex gap-1.5">
                {EQUIPMENT[key].presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(key, p)}
                    className={`flex-1 rounded-md border py-1.5 text-xs font-semibold transition-colors ${
                      selection[key] === p
                        ? "border-navy bg-navy text-white"
                        : "border-ink/15 bg-white text-ink hover:border-navy/40"
                    }`}
                  >
                    {p.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={selection[key] ?? ""}
                onChange={(e) => setAmount(key, parseInt(e.target.value, 10) || 0)}
                placeholder="Custom amount (KES)"
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              />
            </div>
          ))}
        </section>

        <section className="mb-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">3. Your details</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70" htmlFor="donorName">
              Full name
            </label>
            <input
              id="donorName"
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. John Mwangi"
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70" htmlFor="donorPhone">
              Phone number
            </label>
            <input
              id="donorPhone"
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="e.g. 0712345678"
              className="w-full rounded-md border border-ink/15 px-3 py-2.5 text-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            />
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between rounded-lg bg-navy px-4 py-3 text-white">
          <span className="text-sm font-medium">Total</span>
          <span className="font-serif text-lg font-semibold">
            KES {total.toLocaleString()}
          </span>
        </div>

        {error && (
          <p className="mb-3 rounded-md bg-maroon/10 px-3 py-2 text-xs font-medium text-maroon">
            {error}
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => submit("GIVE")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-maroon py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {submitting === "GIVE" && <Loader2 size={16} className="animate-spin" />}
            Give now
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => submit("PLEDGE")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brass py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {submitting === "PLEDGE" && <Loader2 size={16} className="animate-spin" />}
            Make a pledge
          </button>
        </div>
      </div>

      {result && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-ivory p-6 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy/10">
              <Check size={26} className="text-navy" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-navy">
              {result.type === "GIVE" ? "Almost there" : "Pledge recorded"}
            </h3>

            {result.type === "GIVE" ? (
              <div className="mt-3 space-y-3 text-left text-sm text-ink/80">
                <p>
                  Complete your gift of{" "}
                  <strong>KES {result.total.toLocaleString()}</strong> via M-Pesa:
                </p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Go to M-Pesa → Lipa na M-Pesa → Paybill</li>
                  <li>
                    Business number: <strong>{PAYBILL_NUMBER}</strong>
                  </li>
                  <li>
                    Account number: <strong>{PAYBILL_ACCOUNT}</strong>
                  </li>
                  <li>Amount: {result.total.toLocaleString()}</li>
                  <li>Enter your M-Pesa PIN on your phone to confirm</li>
                </ol>
                <p className="text-xs text-ink/50">
                  We&apos;ve logged this as pending — an admin will confirm it
                  once received. God bless you for your generosity.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-left text-sm text-ink/80">
                <p>Thank you, {donorName || "friend"}. Your pledge has been saved:</p>
                <ul className="space-y-1 rounded-lg bg-white/60 p-3">
                  {result.breakdown.map((b) => (
                    <li key={b.label} className="flex justify-between">
                      <span>{b.label}</span>
                      <span className="font-semibold">
                        KES {b.amount.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink/50">
                  Our team may follow up ahead of your planned giving date.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={resetAndClose}
              className="mt-5 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
