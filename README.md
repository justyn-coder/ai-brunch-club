# AI Brunch Club

Members-only landing page + guest tracker for the AI Brunch Club.

## Founders
Justyn · Brad · John

## Stack
- Next.js 14 (App Router)
- Tailwind v3
- Supabase (postgres, anon writes via permissive RLS)
- Deployed to Vercel
- Dynamic Open Graph image so WhatsApp shows live brunch info

## How it works
- Anyone with the link sees the roster and can edit it.
- The URL is the secret. Don't post it publicly.
- Status options: Invited, Pinky Sworn (confirmed), Maybe, Regrets.
- The OG image regenerates on every deploy and reflects current confirmed count.

## If spam ever becomes a problem
Add a PIN gate or basic auth. Not yet.

## Adding a new edition
Tap "+ New edition" on the edition card. Or insert directly:

```sql
insert into abc_events (edition_number, event_date, status)
values (2, '2026-05-17', 'planning');
```

## Env vars (Vercel project settings)
- `NEXT_PUBLIC_SUPABASE_URL=https://slttpknnuthbttjuzrnz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_Yt1Ey9QBeKyJrRj8oHUfew_PkHyLF8m`
