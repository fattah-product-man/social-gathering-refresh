

# Comprehensive Improvements Plan

This is a large set of changes touching the onboarding flow, navigation, matches removal, profile page, and sample data cleanup. Here's the organized plan:

---

## 1. Onboarding Flow Fixes (Onboarding.tsx)

**Step 1 - Name Entry:**
- Remove the "Ahlannn, Hashem..." welcome card (lines 57-64)
- Reduce whitespace: remove `flex-1 flex flex-col justify-center` centering, compact the layout
- Ensure Continue button is above the fold on mobile

**Step 2 - Avatar Upload:**
- Remove the 500KB file size limit (line 28) — allow any size image
- Reduce whitespace for mobile

**Step 3 - Instagram:**
- Same whitespace reduction, button above fold
- Remove glow/pulsating background effects

**Step 4 - Questions ("Where do we know each other from?"):**
- Replace choices in `QUESTIONS` constant (constants.ts lines 67-72) with:
  1. Friend from way back
  2. School Days
  3. Sahel Summers
  4. Sokhna Vibes
  5. Met recently
  6. First time meeting
- Fix transition stutter after pressing Finish — use smoother `AnimatePresence` transition

**Step 5 - Celebration ("You're in!"):**
- Add the user's name: "USERNAME, You're in!"

**Step 6 - Wall Post Entry (Step 7 in code):**
- Change background to white-to-purple subtle gradient, full screen, no containers
- Replace GIF URLs with reliable, working Giphy GIFs (use stable Giphy URLs)

## 2. Remove Global Pulsating/Glow Effects (Layout.tsx)

- Remove the animated blob divs from Layout.tsx (the `animate-blob` background circles)
- Keep a clean, static background instead

## 3. Welcome Modal Improvements (Wall.tsx, lines 100-127)

- Replace "Reveal My Matches" → "See people with common interests"
- Replace "You're in!" → "USERNAME, Welcome to the Community!"
- Make confetti emoji 4x bigger, static (no `animate-bounce`), positioned to pop out of card
- Update navigation links to point to real pages (they already do, but ensure no sample data fallback)

## 4. Remove Matches Feature Entirely

- Delete `src/pages/Matches.tsx`
- Remove Matches route from `App.tsx`
- Update `BottomNav.tsx`: replace Matches tab with a different tab or remove it
- Create a **"Common Interests" card** pinned at top of People page → links to new sub-page
- Create new page `src/pages/CommonInterests.tsx`: shows users sharing interests with current user, gradient glow cards, highlighted common interests
- Add route for `/e/:eventId/common-interests`

## 5. Profile Page (Profile.tsx) — Make Fully Functional

- Ensure editing name, image, instagram, interests all work with `db.updateGuest`
- Add bottom section: "Want a Social App for Your Gathering?" promo card + "Created by Mo Fattah, CEO of Bub AI"

## 6. Remove All Sample Data Fallbacks

- In `People.tsx` line 25: remove `getSampleGuests` fallback
- In `Groups.tsx` line 31: remove `getSampleGuests` fallback
- In `Wall.tsx` line 61: remove `getSampleWallPosts` fallback
- In `Matches.tsx` line 32: file will be deleted
- In `db.ts` lines 117-134: remove the fake guest seeding in `getGuests`
- Show empty states instead of sample data

## 7. Update BottomNav

- Remove Matches tab, replace with "Common Interests" or keep 4 tabs: People, Groups, Wall, Me

---

## Technical Details

**Files to modify:**
- `src/pages/Onboarding.tsx` — onboarding steps, file size limit, whitespace, questions transition
- `src/lib/constants.ts` — update QUESTIONS choices
- `src/components/Layout.tsx` — remove blob animations
- `src/pages/Wall.tsx` — welcome modal updates
- `src/pages/People.tsx` — add common interests card, remove sample data
- `src/pages/Groups.tsx` — remove sample data
- `src/pages/Profile.tsx` — make functional, add promo footer
- `src/components/BottomNav.tsx` — remove matches, update nav
- `src/App.tsx` — remove matches route, add common interests route
- `src/lib/db.ts` — remove fake guest seeding

**Files to create:**
- `src/pages/CommonInterests.tsx` — new page showing users with shared interests

**Files to delete:**
- `src/pages/Matches.tsx`

