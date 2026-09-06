export default function QrPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="rounded-2xl bg-ivory p-8 shadow-card">
        <p className="mb-1 font-serif text-lg font-semibold text-navy">
          Scan to give or pledge
        </p>
        <p className="mb-5 text-sm text-maroon">P.C.E.A. Embakasi Media Fund</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/api/qr"
          alt="QR code linking to the P.C.E.A. Embakasi Media Fund giving page"
          className="mx-auto h-64 w-64 rounded-lg border border-ink/10"
        />
        <a
          href="/api/qr"
          download="pcea-media-fund-qr.png"
          className="mt-5 inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white"
        >
          Download PNG
        </a>
        <p className="mt-4 max-w-xs text-xs text-ink/50">
          Display this on the sanctuary screen, print it on bulletins, or add
          it to posters around the church.
        </p>
      </div>
    </main>
  );
}
