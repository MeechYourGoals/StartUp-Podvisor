

## Fix Build Errors + Add Major Features

This plan covers 5 areas: fixing the current build errors, adding deck upload with AI parsing, episode folder organization, column sorting, and pagination.

---

### 1. Fix Build Errors in subscriptionService.ts

The `check_tier_limits` and `increment_analysis_count` RPC functions are referenced in code but don't exist in the database (only `has_role` exists). The fix is to rewrite `getSubscriptionInfo()` and `incrementAnalysisCount()` to use direct table queries instead of non-existent RPC functions.

- **getSubscriptionInfo()**: Query `user_subscriptions` for tier, `user_startup_profiles` count for profiles used, `bookmarked_episodes` count for bookmarks used, and `user_monthly_usage` for analyses used -- all via standard Supabase client queries instead of `rpc('check_tier_limits')`
- **incrementAnalysisCount()**: Upsert into `user_monthly_usage` table directly instead of `rpc('increment_analysis_count')`
- **getRevenueCatOfferings()**: Fix the `offerings` property access to match the actual SDK types

---

### 2. Deck Upload on Startup Profile (AI-Powered)

Allow users to drag-and-drop a pitch deck (PDF/PPTX) on the profile edit dialog. The AI parses it and pre-fills profile fields.

**Database Changes:**
- Add `deck_url` (text, nullable) column to `user_startup_profiles` to store the uploaded deck reference

**Storage:**
- Create a `startup-decks` storage bucket (private, authenticated access)
- RLS policies: users can only upload/read their own decks

**New Edge Function: `parse-deck`**
- Accepts a file URL from storage
- Downloads the file, extracts text content
- Sends to Gemini Flash via Lovable AI gateway with a prompt to extract: company name, description, stage, industry, funding, team size
- Returns structured JSON with extracted fields

**UI Changes (StartupProfileDialog.tsx):**
- Add a drag-and-drop zone below the dialog header
- On drop: upload to storage bucket, call `parse-deck` edge function
- Auto-fill form fields with AI-extracted data (user can review/edit before saving)
- Show upload progress and "AI is analyzing your deck..." loading state

---

### 3. Episode Folder Organization

Allow users to organize analyzed episodes into custom folders (Marketing, Go-to-Market, etc.) directly from the episodes table.

**Database Changes:**
- Create `episode_folders` table: id, user_id, name, color, created_at
- Create `episode_folder_assignments` table: id, user_id, episode_id, folder_id, created_at
- RLS policies: users can only CRUD their own folders and assignments

**UI Changes (EpisodesTable.tsx):**
- Add a folder filter bar above the table (similar to existing industry filters)
- Add "Move to Folder" option in the episode dropdown menu
- Show folder badge on each episode row
- Add "Manage Folders" button to create/edit/delete folders

---

### 4. Column Sorting

Make each column header in the episodes table clickable to sort alphabetically (ascending/descending).

**UI Changes (EpisodesTable.tsx):**
- Add sort state: `sortColumn` and `sortDirection`
- Make Episode, Company, Founder, Stage, Industry, and Date Added headers clickable with sort indicator arrows
- Sort the filtered episodes array client-side based on selected column
- Add a "Date Added" column showing when the episode was analyzed (`created_at`)

---

### 5. Pagination (15-20 episodes per page)

Show 15 episodes per page with pagination controls at the bottom.

**UI Changes (EpisodesTable.tsx):**
- Add pagination state: `currentPage` (default 1), `pageSize` (15)
- Slice the sorted/filtered episodes array for the current page
- Add pagination controls at the bottom using the existing Pagination UI components
- Show "Showing 1-15 of 51 episodes" text
- Page number buttons with Previous/Next navigation

---

### Technical Details

**Files to Create:**
- `supabase/functions/parse-deck/index.ts` -- Edge function for AI deck parsing

**Files to Modify:**
- `src/services/subscriptionService.ts` -- Fix build errors (rewrite RPC calls to direct queries)
- `src/components/StartupProfileDialog.tsx` -- Add deck drag-and-drop zone + AI parsing
- `src/components/EpisodesTable.tsx` -- Add sorting, pagination, date added column, folder organization
- `supabase/config.toml` -- Add parse-deck function config

**Database Migrations:**
- Add `deck_url` column to `user_startup_profiles`
- Create `startup-decks` storage bucket
- Create `episode_folders` and `episode_folder_assignments` tables with RLS

**Edge Function Dependencies:**
- Uses `LOVABLE_API_KEY` (already configured) for Gemini Flash via Lovable AI gateway
- No new secrets needed

