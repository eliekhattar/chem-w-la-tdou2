# Continue Watching / Progress Persistence

Several ways to implement “Continue watching” (save and resume playback position, like Netflix):

---

## 1. **Backend (database)**

**How it works:** Your server stores progress per user and per title: `user_id`, `tmdb_id`, `type` (movie/tv), `season`, `episode`, `position_seconds`, `updated_at`.

**Pros:** Syncs across devices, survives clearing browser data, can power recommendations.  
**Cons:** Requires auth (or anonymous user id), API, database, and the player must send progress (e.g. on pause or every N seconds).

**Typical flow:**  
- Player sends `PATCH /api/progress` with `{ tmdbId, type, season?, episode?, position }`.  
- On load, `GET /api/progress` returns list of in-progress items; UI shows “Continue watching” and links to `/watch/...?t=123` (or player reads `position` and seeks on load).

---

## 2. **LocalStorage (frontend only)**

**How it works:** In the browser you save progress in `localStorage`, e.g. key `progress_${type}_${tmdbId}` (for TV include season/episode in key or in value). Value: `{ position, season?, episode?, updatedAt, title? }`. When building the “Continue watching” row, read all keys, sort by `updatedAt`, and link to watch URL with `?t=123` (and season/episode for TV).

**Pros:** No backend, works offline, quick to add.  
**Cons:** Per device/browser only, lost if user clears site data, no sync across devices.

**Implementation sketch:**  
- `src/api/progress.js` (or similar): `saveProgress(type, id, { position, season, episode, title })`, `getProgressList()`, `getProgress(type, id)`.  
- Player (Vidking/VidSrc): on interval or on pause, call `saveProgress(...)`.  
- Home (or Movies/Series): “Continue watching” row that uses `getProgressList()` and renders cards linking to `/watch/...?t=...` with season/episode for TV.

---

## 3. **Hybrid (LocalStorage + optional backend)**

**How it works:** Use LocalStorage for anonymous users; when user signs in, upload progress to backend and merge. On load after login, prefer server list and optionally backfill from LocalStorage for items not on server.

**Pros:** Works without auth; after login you get sync and cross-device.  
**Cons:** More logic (merge, conflict handling) and still need a backend for logged-in users.

---

## 4. **URL / bookmark only**

**How it works:** No persistent list. Only the watch URL includes resume time, e.g. `/watch/movie/123?t=600`. User can bookmark that URL. No “Continue watching” row.

**Pros:** Trivial.  
**Cons:** No list, no automatic “resume”; user must keep the link.

---

## Recommendation

- **Short term:** Use **LocalStorage** (option 2): add `progress.js` with save/get, have the player report position, and add a “Continue watching” row that reads from it. No backend needed.  
- **Long term:** Add a **backend** (option 1) and, if you want, a **hybrid** (option 3) so anonymous users still get progress in the current browser until they sign in.
