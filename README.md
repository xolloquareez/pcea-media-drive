# P.C.E.A. Embakasi — Media Drive & Pledge Portal

A QR-code-driven, mobile-first web portal that lets P.C.E.A. Embakasi Church
members give or pledge toward specific media equipment (cameras, microphones,
lighting) for the sanctuary and livestream.

Open source under the [MIT License](./LICENSE) — free for any church or
community group to reuse, adapt, and self-host.

## Features

- 📱 **Scan-to-give** — a QR code opens the giving page directly on a member's phone
- 🎯 **Itemized allocation** — donors choose exactly which equipment their money supports, and can split one gift across multiple categories
- 💳 **Give now** — shows Paybill/M-Pesa instructions to complete payment (no PINs are ever collected by this app — see [Security note](#security-note) below)
- 🤝 **Make a pledge** — records a commitment for follow-up, without requiring payment on the spot
- 🔐 **Admin dashboard** — password-protected view of all gifts and pledges, with status tracking and CSV export
- 🖨️ **Printable QR code** — generate a high-resolution QR code for screens, bulletins, and posters

## Tech stack

| Layer      | Choice                                  |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript     |
| Styling    | Tailwind CSS                             |
| Database   | PostgreSQL (works great with free tiers on [Neon](https://neon.tech) or [Supabase](https://supabase.com)) |
| ORM        | Prisma                                   |
| Hosting    | Vercel (free tier friendly)              |

## Security note

This app **never asks for or stores an M-Pesa PIN**. "Give now" simply
displays your church's Paybill number and account number, and the member
completes payment through their own phone's official M-Pesa menu — the same
secure PIN prompt used for any M-Pesa payment. A future version can add
Safaricom's Daraja STK Push API, which triggers that same official prompt
automatically, but even then the PIN is entered on Safaricom's own screen,
never inside this app.

## Getting started (local development)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in:
   - `DATABASE_URL` — a free Postgres connection string from [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - `ADMIN_PASSWORD` — the password church staff use to sign in to `/admin`
   - `ADMIN_SESSION_SECRET` — a random secret (generate with `openssl rand -hex 32`)
   - `NEXT_PUBLIC_PAYBILL_NUMBER` / `NEXT_PUBLIC_PAYBILL_ACCOUNT` — your church's Paybill details

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` for the giving page and
   `http://localhost:3000/admin/login` for the dashboard.

## Deploying (free tier)

1. Push this repo to GitHub.
2. Create a free Postgres database on [Neon](https://neon.tech) (or Supabase) and copy its connection string.
3. Import the repo into [Vercel](https://vercel.com/new).
4. Add the same environment variables from `.env.example` in the Vercel project settings, including `NEXT_PUBLIC_SITE_URL` set to your final Vercel URL.
5. Deploy. Vercel runs `prisma generate` automatically via the `postinstall` script.
6. After the first deploy, run the migration once against your production database:
   ```bash
   DATABASE_URL="<your production URL>" npx prisma migrate deploy
   ```
7. Visit `/qr` on your live site, download the QR code, and print it for the sanctuary.

## Project structure

```
app/
  page.tsx              Giving/pledge form (home page)
  qr/page.tsx            Printable QR code page
  admin/                 Admin login + dashboard
  api/
    contributions/       Create + list gifts/pledges
    admin/                Admin login/logout
    qr/                   QR code image generator
components/               React UI components
lib/                      Prisma client, auth helpers, equipment metadata
prisma/schema.prisma      Database schema
```

## Roadmap / good first issues

- [ ] SMS pledge reminders via Africa's Talking
- [ ] Safaricom Daraja STK Push for automatic payment confirmation
- [ ] Multi-language support (English/Swahili toggle)
- [ ] Church-branded email receipts

## Contributing

Issues and pull requests are welcome. This project was built for P.C.E.A.
Embakasi Church but is intended to be reusable by any congregation running a
similar equipment or building fund drive.

## License

[MIT](./LICENSE) — free to use, modify, and redistribute.
