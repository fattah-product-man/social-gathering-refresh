

# Backend Integration Plan: Lovable Cloud (Supabase)

This plan migrates the app from localStorage to a real Supabase backend so data persists across devices and users can interact in real-time.

---

## Architecture Decision

Since the app uses **guest tokens** (not Supabase Auth), we'll use a practical approach:
- Tables with **permissive RLS for anonymous access** scoped by event_id
- Guests identify themselves via `guest_token` stored in localStorage
- Admin operations (toggle reveal) validated server-side via an **edge function**
- Avatar images uploaded to **Supabase Storage** instead of base64 strings

---

## Step 1: Enable Lovable Cloud

Connect Supabase to the project so we get a database, storage, and edge functions.

## Step 2: Database Schema (Migrations)

**Migration 1 — Create tables:**

- `events` (id uuid PK, name text, host_name text, reveal_matches bool default false, admin_passcode text, start_time timestamptz, created_at timestamptz default now())
- `guests` (id uuid PK, event_id uuid FK→events, guest_token text not null, name text, avatar_url text, instagram text, energy_level text, goals text[], interests text[], answers jsonb default '{}', color text, created_at timestamptz default now(); unique(event_id, guest_token))
- `wall_posts` (id uuid PK, event_id uuid FK→events, guest_token text, guest_name text, message text, gif_url text, created_at timestamptz default now())
- `scores` (id uuid PK, event_id uuid FK→events, guest_token text, guest_name text, game_id text, score int, metadata jsonb, created_at timestamptz default now())
- `feedback` (id uuid PK, event_id uuid FK→events, guest_token text, responses jsonb, created_at timestamptz default now())

**Migration 2 — RLS policies:**

Since no Supabase Auth is used, all access is via the `anon` key. Policies allow:
- SELECT on all tables (public within event)
- INSERT on guests, wall_posts, scores, feedback
- UPDATE on guests (where guest_token matches)
- SELECT on events hides `admin_passcode` via a **view** (`events_public`)

**Migration 3 — Seed demo event:**

Insert the "Ramadan Iftar 2026" demo event with id = a fixed UUID.

## Step 3: Supabase Storage Bucket

Create an `avatars` bucket (public) for profile pictures. Update the onboarding and profile flows to upload images to storage instead of storing base64.

## Step 4: Admin Edge Function

Create `supabase/functions/admin-action/index.ts`:
- POST with `{ event_id, passcode, action, payload }`
- Validates passcode against event's `admin_passcode`
- Supports actions: `toggle_reveal`, `get_guests`, `get_stats`
- Returns results or 403

## Step 5: Rewrite `src/lib/db.ts`

Replace all localStorage operations with Supabase client calls:
- `getEvent` → `supabase.from('events_public').select().eq('id', id).single()`
- `createGuest` → `supabase.from('guests').insert(...)`
- `getGuests` → `supabase.from('guests').select().eq('event_id', id)`
- `updateGuest` → `supabase.from('guests').update(...).eq('event_id', id).eq('guest_token', token)`
- `createWallPost` → `supabase.from('wall_posts').insert(...)`
- `getWallPosts` → `supabase.from('wall_posts').select().eq('event_id', id).order('created_at', { ascending: false })`
- `saveScore` / `getLeaderboard` → same pattern
- `toggleRevealMatches` → calls the admin edge function
- New: `uploadAvatar(file)` → uploads to storage bucket, returns public URL

## Step 6: Update UI Components

- **Onboarding.tsx**: Upload avatar file to Supabase Storage, store returned URL
- **Profile.tsx**: Same storage upload for avatar changes
- **Admin.tsx**: Call edge function instead of direct DB for admin actions
- **Landing.tsx**: Use fixed demo event UUID instead of localStorage auto-creation

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/integrations/supabase/client.ts` | Created by Lovable Cloud |
| `src/lib/db.ts` | Rewrite: Supabase client calls |
| `src/pages/Onboarding.tsx` | Update avatar upload to use Storage |
| `src/pages/Profile.tsx` | Update avatar upload to use Storage |
| `src/pages/Admin.tsx` | Use edge function for admin ops |
| `supabase/functions/admin-action/index.ts` | New edge function |
| Database migrations (3) | Schema, RLS, seed data |

---

## Security Considerations

- `admin_passcode` is never exposed to clients (hidden via view)
- Admin operations go through edge function with passcode validation
- Guest updates require matching `guest_token`
- All data within an event is visible to any guest of that event (by design for a social gathering app)

