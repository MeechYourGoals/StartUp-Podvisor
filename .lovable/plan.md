

## Fix Analysis Error + Improve Startup Context UX

### Part 1: Fix the "Analysis Failed" Error

**Root Cause:** The `analyze-episode` edge function tries to insert an `analyzed_by` column into the `episodes` table (line 318), but that column does not exist in the database schema. The `episodes` table only has: `id`, `podcast_id`, `title`, `release_date`, `url`, `platform`, `company_id`, `founder_names`, `analysis_status`, `created_at`, `updated_at`.

**Fix:** Either add the `analyzed_by` column to the `episodes` table via a migration, or remove the `analyzed_by` field from the edge function insert. Adding the column is the better approach since it tracks who analyzed each episode.

- Add migration: `ALTER TABLE public.episodes ADD COLUMN analyzed_by uuid;`
- Redeploy the `analyze-episode` edge function (no code change needed there -- it already references the column correctly)

---

### Part 2: Smart Profile Selection UX

Currently when "Use Saved Profile" is toggled on, a separate "Select Profile" dropdown always appears. The user wants:

- **1 profile:** Auto-select it when toggling "Use Saved Profile" on. No dropdown needed -- just show the profile name inline on the toggle bar.
- **Multiple profiles:** Show a dropdown selector directly on the toggle bar row (not as a separate field below).
- **No profiles:** Hide the "Use Saved Profile" toggle entirely (current behavior).

**Changes to `StartupProfileForm.tsx`:**
- When `savedProfiles.length === 1`, auto-set `useExisting = true` on mount and auto-select the single profile. Display the company name inline next to the toggle.
- When `savedProfiles.length > 1`, embed a compact dropdown selector directly in the toggle bar row.
- Remove the separate "Select Profile" section below the toggle.

---

### Part 3: Split Description into Two Sections

Currently there is one "Description" textarea. The user wants two distinct sections:

1. **"Description" (manual)** -- A free-form textarea where founders write whatever they want about their company and challenges. This is what exists today.
2. **"AI Context Summary" (from deck/website)** -- A separate, editable textarea that shows the AI-generated summary from any uploaded decks. This is the `deck_summary` field that already exists in the database.

**Changes to `StartupProfileForm.tsx`:**
- Keep the existing "Description" textarea as-is for manual input
- Add a second textarea below it labeled "AI Context Summary" (or similar) that displays the `deck_summary` field from the selected profile
- This field should be read-only in the analysis form context (since it's populated via the Startup Profiles dialog where decks are uploaded), with a note like "Upload a deck in your Startup Profile to populate this"
- When submitting to analysis, pass both `description` and `deck_summary` to the edge function

**Changes to `AnalysisForm.tsx`:**
- Update `SavedProfile` interface to include `deck_summary` and `role` fields
- Pass `deck_summary` through to the `analyze-episode` edge function call

---

### Technical Summary

| File | Change |
|---|---|
| `supabase/migrations/` (new) | Add `analyzed_by uuid` column to `episodes` |
| `supabase/functions/analyze-episode/index.ts` | No change needed for the column fix; already references it |
| `src/components/StartupProfileForm.tsx` | Smart auto-select for single profile, inline dropdown for multiple, split Description into manual + AI summary |
| `src/components/AnalysisForm.tsx` | Update `SavedProfile` interface to include `deck_summary` and `role`; pass `deck_summary` to edge function |

