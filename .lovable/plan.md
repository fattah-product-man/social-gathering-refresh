

# Fix Plan: Make the App Fully Functional

## Root Causes Identified

### 1. Events data inaccessible (Critical)
The `events` table has RLS enabled but **zero SELECT policies**. The `events_public` view uses `security_invoker=on`, which means it checks RLS on the base table. Since there's no SELECT policy, the view returns nothing. Additionally, the `events_public` view has **no GRANT** for `anon` or `authenticated` roles. Result: `getEvent()` always returns `null` → Landing page shows "Event not found".

### 2. BottomNav invisible on light pages
The navigation bar uses dark-theme styling (`bg-white/10`, white text) designed for dark backgrounds. But pages like People, Groups, Profile use a light `bg-[#F5F5F7]` background, making the nav nearly invisible.

### 3. No sample/seed data for demo feel
The database has only 1 test user. The old demo had 12 sample guests with interests across all categories, which made Groups, People, and Common Interests pages feel alive. We should seed these into the database so the app feels populated.

---

## Technical Changes

### Migration: Fix events access + seed sample guests

```sql
-- 1. Add SELECT policy on events table for the view to work
CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT
  USING (true);

-- 2. Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.events_public TO anon, authenticated;

-- 3. Seed the 12 sample guests into the real event
INSERT INTO public.guests (event_id, guest_token, name, avatar_url, energy_level, goals, interests, answers, color)
VALUES
  ('8f42b1c3-...', 'token_1', 'Sarah Chen', '...', 'Social butterfly', ...),
  -- ... all 12 sample guests from sampleData.ts
```

This seeds the demo event with real data so People, Groups, Common Interests, and the Wall all show content.

### Fix BottomNav styling (`src/components/BottomNav.tsx`)
Change the nav to use a light/solid background that works on the light `bg-[#F5F5F7]` pages:
- `bg-white/90 backdrop-blur-xl shadow-lg border border-stone-200`
- Active tab: solid indigo gradient (already works)
- Inactive: `text-stone-500` instead of white-based opacity

### Fix Wall page background conflict (`src/pages/Wall.tsx`)
The Wall page has `fixed inset-0` which creates a full-screen overlay. Ensure it works within the Layout properly since Layout already handles backgrounds.

### Seed sample wall posts
Insert the 5 sample wall posts from `sampleData.ts` into the `wall_posts` table so the Hype Wall has content.

---

## Files to Change
| File | Change |
|------|--------|
| Database migration | Add events SELECT policy, GRANT on view, seed 12 guests + 5 wall posts |
| `src/components/BottomNav.tsx` | Fix styling for light backgrounds |
| `src/pages/Wall.tsx` | Minor background fix for Layout compatibility |

## Expected Outcome
- Landing page loads the event correctly
- People directory shows all 12+ guests
- Groups page shows interest-based groups with members
- Common Interests shows matches
- Wall shows posts
- Profile loads the current user's data
- Bottom navigation is visible and functional on all pages

