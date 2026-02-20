

## Deck Upload Rework + AI Deck Summary + Re-Analyze Button

Three changes based on your feedback:

---

### 1. Stop Pre-Filling Form Fields from Deck Upload

Currently when a deck is uploaded, the AI extracts fields and pre-fills Company Name, Stage, Industry, etc. This will be removed. The deck upload will no longer auto-fill any form fields -- users fill those in manually.

The toast message "Fields have been pre-filled from your deck" will be replaced with something like "Deck uploaded and summarized."

---

### 2. Add "Deck Summary" Field Below Description

After the AI parses the deck, instead of pre-filling fields, it will generate a plain-language summary of what it understood from the deck. This summary will appear in a new read-only textarea labeled "Deck Summary (AI-generated)" below the Description field.

- The summary will be stored in a new `deck_summary` column on `user_startup_profiles`
- Users can see what context the AI extracted and edit/refine it if needed (making it editable, not read-only)
- This summary, along with the deck content, will be passed to the analysis engine as additional context when generating personalized insights

**Database change:** Add `deck_summary` (text, nullable) column to `user_startup_profiles`.

**Edge function change (parse-deck):** Instead of extracting structured fields, the AI prompt will be changed to produce a comprehensive narrative summary of the deck (2-3 paragraphs covering what the company does, its stage, market, traction, team, etc.).

**UI change (StartupProfileDialog):** Remove the `onFieldsExtracted` callback that pre-fills form fields. Instead, when the deck is analyzed, populate only the new "Deck Summary" textarea. The DeckUploadZone component will return a summary string instead of structured fields.

**Analysis engine change (analyze-episode):** The personalization prompt will include the `deck_summary` alongside existing profile fields for richer context.

---

### 3. Add "Re-Analyze" Button on Episode Detail Page

Next to the existing "Watch Episode" button, add a "Re-Analyze" button. When clicked:

- It re-runs the analysis for that episode URL using the user's current startup profile (which may have changed since the original analysis)
- The old lessons, callouts, and personalized insights for that episode are deleted and replaced with fresh ones
- Shows a confirmation dialog first ("This will replace the existing analysis with a fresh one based on your current profile. Continue?")
- Shows a loading state while re-analyzing

**UI change (EpisodeDetail.tsx):** Add a "Re-Analyze" button with a RefreshCw icon next to "Watch Episode." On click, show a confirmation dialog, then call the analyze-episode edge function with the episode URL and current profile. On success, delete old data and refresh.

---

### Technical Details

**Database Migration:**
- Add `deck_summary` text column to `user_startup_profiles`

**Files to Modify:**
- `supabase/functions/parse-deck/index.ts` -- Change AI prompt from structured extraction to narrative summary generation
- `src/components/DeckUploadZone.tsx` -- Return a summary string instead of structured fields
- `src/components/StartupProfileDialog.tsx` -- Remove field pre-filling, add Deck Summary textarea below Description
- `src/components/EpisodeDetail.tsx` -- Add Re-Analyze button with confirmation dialog and loading state
- `supabase/functions/analyze-episode/index.ts` -- Include `deck_summary` in personalization prompt; support re-analysis (delete old data for episode before inserting new)

**Flow for Re-Analyze:**
1. User clicks "Re-Analyze" on episode detail
2. Confirmation dialog appears
3. On confirm: delete existing lessons, callouts, personalized_insights for that episode
4. Call analyze-episode with the episode URL + user's current profile (including deck_summary)
5. Refresh episode detail view with new data

