# Podvisor Media Component Deep Dive Review

**Date:** February 27, 2026  
**Scope:** Episode analysis pipeline, deck uploads, media URL handling, export, bookmarks  

---

## Critical Bugs (Must Fix Before Launch)

### 1. Quick Import Bypasses Its Own Logic (AnalysisForm.tsx:103-109)

The `validateAndProceed` function has a control flow bug. When `mode === "quick"`, it calls `analyzeWithContext(null)` **and then falls through** to `setStep("profile")` on line 109, which runs unconditionally.

```typescript
// BUGGY CODE:
if (mode === "quick") {
  analyzeWithContext(null);  // starts analysis
} else {
  setStep("profile");
}
triggerHapticFeedback('light');
setStep("profile");  // <-- THIS ALWAYS RUNS, overriding the "quick" path
```

**Impact:** When a user clicks "Quick Import", the analysis starts but the UI simultaneously navigates to the profile form. The user sees the profile form while analysis is running in the background, creating a confusing broken UX.

**Fix:** Remove the duplicate `setStep("profile")` on line 109 and move `triggerHapticFeedback('light')` into the else block.

---

### 2. Double Analysis Count Increment

Each analysis is counted **twice**:
- **Client-side** in `AnalysisForm.tsx:163`: `await trackAnalysis()` calls `incrementAnalysisCount()` in `subscriptionService.ts`
- **Server-side** in `analyze-episode/index.ts:338`: `await supabase.rpc('increment_analysis_count', ...)`

This means users consume 2 of their monthly quota for every single analysis. A free-tier user (4 analyses/month) can only actually analyze 2 episodes.

**Fix:** Remove the client-side `trackAnalysis()` call since the server-side increment is more reliable and atomic. Keep `refreshSubscription()` to update the UI.

---

### 3. Pitch Deck Parser Reads Binary Files as Text (parse-deck/index.ts:41)

```typescript
const textContent = await fileData.text();
```

PDF and PPTX files are binary formats. Calling `.text()` on them produces garbled binary content, which is then passed to the AI model. The AI receives nonsensical data and likely hallucinates a summary.

**Impact:** Deck upload feature is fundamentally broken for all file types it claims to support. Users uploading real PDFs or PPTX files will get fabricated summaries.

**Fix:** Use a PDF parsing library (e.g., `pdf-parse` for Deno) or convert to base64 and use the Gemini model's multimodal capabilities to read the document visually.

---

### 4. Re-Analyze Bypasses Subscription Limits (EpisodeDetail.tsx:254-327)

`handleReanalyze` deletes the episode and re-runs analysis without checking:
- Whether the user has remaining analyses for the month
- Whether the user's subscription tier allows it

Any user, even one at their limit, can infinitely re-analyze episodes.

**Fix:** Add a `canAnalyzeVideo()` check before proceeding with re-analysis.

---

### 5. BookmarkButton Stale State Race Condition (BookmarkButton.tsx:196)

```typescript
setIsBookmarked(selectedFolderIds.size > 0 || !selectedFolderIds.has(folderId));
```

This uses the **old** `selectedFolderIds` (before React batches the state update). The logic is also incorrect — it should be based on the **new** set, not the old one. The subsequent `checkBookmarkStatus()` will eventually fix it via a re-fetch, but there's a visible UI flicker.

**Fix:** Derive `isBookmarked` from the new set computed above, rather than reading stale state.

---

## Significant Bugs (Should Fix)

### 6. Episodes Visible Across All Users (EpisodesTable.tsx:226-237)

The `fetchEpisodes` query has **no user filter** — it returns all episodes from all users. The same applies to `fetchAllData` in `ExportModal.tsx`. If RLS policies are not perfectly configured (the spec says episodes have "public read access"), every user can see and export every other user's analyzed episodes.

**Recommendation:** Add `.eq('analyzed_by', user.id)` to the episodes query, or verify RLS policies are enforced correctly.

### 7. No Spotify Metadata Extraction (analyze-episode/index.ts)

The app claims to support Spotify URLs, but there's zero Spotify-specific handling. YouTube gets `oembed` metadata extraction; Spotify gets nothing. The AI model receives only the raw URL with no additional context.

### 8. YouTube Short URL Parsing Broken (analyze-episode/index.ts:98-99)

For `youtu.be` URLs, the video ID extraction tries `URLSearchParams` which looks for `?v=`, but `youtu.be` URLs use the path: `youtu.be/VIDEO_ID`. The fallback `episodeUrl.split('/').pop()?.split('?')[0]` should work, but the `urlParams.get('v')` will return `null` first, causing `videoId` to be empty string rather than the actual ID from the fallback.

Actually, looking more carefully: `videoId = urlParams.get('v') || episodeUrl.split('/').pop()?.split('?')[0] || ''` — the `||` chain should fall through to the split logic. This works but is fragile. URLs like `youtube.com/shorts/VIDEO_ID` or `music.youtube.com` variants won't be handled.

### 9. Hardcoded "ChravelApp" Default Profile (analyze-episode/index.ts:452-466)

The edge function has a hardcoded default startup profile for "ChravelApp" (the developer's company). If a user skips personalization, callouts are generated specifically for a travel/events startup, which is irrelevant for other users.

The system prompt also hardcodes: "Extract EXACTLY 5 callouts relevant to a travel/events startup (chravelapp.com)" — this should be dynamic based on the user's profile.

### 10. `startupContext` State Set But Never Read (AnalysisForm.tsx:114)

The state `startupContext` is set in `handleProfileSubmit` but never referenced elsewhere. Dead code.

### 11. Uploaded Deck Files Never Cleaned Up (DeckUploadZone.tsx)

If the `parse-deck` function fails after the file is uploaded to storage, the file remains in the `startup-decks` bucket permanently. Over time this wastes storage.

---

## Edge Cases Not Handled

### Input Validation
- **No URL validation**: Any string is accepted as an episode URL. Malicious or internal URLs could be passed.
- **No duplicate detection**: The same URL can be analyzed multiple times, creating duplicate episodes.
- **Malformed YouTube URLs**: `m.youtube.com`, `music.youtube.com`, `youtube.com/embed/`, `youtube.com/shorts/`, playlist URLs — none are handled specifically.
- **URL input type="url"**: The HTML `type="url"` doesn't enforce URL format on all browsers/mobile platforms.

### Concurrency & Race Conditions
- **Concurrent analysis submissions**: Double-clicking "Analyze" can fire two simultaneous requests.
- **Session expiry during long analysis**: The AI pipeline takes 30-60+ seconds. If the auth token expires mid-process, the edge function may fail partway through, leaving partial data (podcast created, company created, but no episode/lessons).
- **Partial failure in analyze-episode**: If lesson insertion succeeds but callout insertion fails, the episode will have lessons but no callouts. There's no transaction wrapping.
- **Rapid bookmark toggling**: Multiple rapid clicks can cause race conditions with bookmark state.

### Data Integrity
- **Company name collisions**: The edge function looks up companies by exact name match. "Stripe" and "Stripe, Inc." would create separate entries. Two different companies with the same name would share a record.
- **Tag normalization**: Tags are lowercased but not otherwise normalized. `#fund-raising` and `#fundraising` become separate tags.
- **No idempotency in re-analysis**: Deleting an episode and re-creating it changes its UUID, breaking any existing bookmarks pointing to the old ID.

### Platform & Browser
- **Clipboard API fallback**: `navigator.clipboard.writeText()` (EpisodesTable:371) requires HTTPS and may fail in non-secure contexts or older browsers with no fallback.
- **Browser confirm() for deletion**: Uses the browser's native `confirm()` dialog (EpisodesTable:327) which is ugly, blocks the thread, and inconsistent with the rest of the UI that uses shadcn AlertDialog.

---

## High-Impact Features to Consider for MVP

### 1. Full-Text Search Across Episodes and Lessons ⭐⭐⭐
**Impact: Very High | Effort: Medium**

The app is called a "Founder Lessons Database" but has no search capability. Users with 20+ analyzed episodes have no way to find a specific lesson or topic. A search bar that searches across episode titles, lesson text, company names, and founder names would dramatically increase the app's utility.

Implementation: Supabase supports full-text search via `tsvector`. Add a search input above the episodes table that filters results.

### 2. Duplicate Episode Detection ⭐⭐⭐
**Impact: High | Effort: Low**

Before analyzing, check if the URL (or a normalized version of it) has already been analyzed. Show the existing analysis instead of creating a duplicate. This prevents wasted analysis quota.

### 3. Embedded YouTube Player ⭐⭐
**Impact: Medium-High | Effort: Low**

In `EpisodeDetail`, show an embedded YouTube player instead of just a "Watch Episode" link. Users can reference the video directly alongside the extracted lessons. A simple `<iframe>` with the YouTube embed URL.

### 4. Analysis Progress Indicator ⭐⭐
**Impact: Medium | Effort: Low**

The analysis takes 30-60+ seconds but the UI just shows a spinner. Add meaningful progress stages: "Fetching episode metadata..." → "Analyzing content with AI..." → "Extracting lessons..." → "Generating personalized insights..." This is partially implemented with `setProgress` calls but they're all overridden quickly.

### 5. Share Analysis Results ⭐⭐
**Impact: Medium | Effort: Medium**

Allow users to generate a shareable link for an episode analysis. Useful for sharing insights with co-founders or investors. Could be a public read-only view of the episode detail.

### 6. Lesson Sorting and Filtering ⭐⭐
**Impact: Medium | Effort: Low**

In `EpisodeDetail`, lessons are displayed sorted by impact score. Allow users to sort by actionability score, category, or filter by tags. The data is already there.

---

## Summary of Fixes Applied in This PR

| # | Bug | File | Severity |
|---|-----|------|----------|
| 1 | Quick Import control flow | `AnalysisForm.tsx` | Critical |
| 2 | Double analysis count | `AnalysisForm.tsx` | Critical |
| 3 | BookmarkButton stale state | `BookmarkButton.tsx` | Significant |
| 4 | Re-analyze bypasses limits | `EpisodeDetail.tsx` | Significant |
| 5 | Duplicate episode detection | `AnalysisForm.tsx` + `analyze-episode` | Edge case |
| 6 | URL validation | `analyze-episode/index.ts` | Edge case |
| 7 | Hardcoded ChravelApp removal | `analyze-episode/index.ts` | Significant |

---

*This review covers the full media/content pipeline from URL input → AI analysis → storage → display → export.*
