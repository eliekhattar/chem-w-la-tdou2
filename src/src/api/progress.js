/**
 * Progress persistence for "Continue watching".
 * Uses localStorage by default; can be swapped for a backend API later.
 */

const STORAGE_KEY = 'khattarhub_progress'
const MAX_ITEMS = 50

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)))
  } catch {}
}

/** Unique key for a title (movie or tv + season/episode) */
function itemKey(type, tmdbId, season, episode) {
  if (type === 'tv') return `tv_${tmdbId}_${season ?? 1}_${episode ?? 1}`
  return `movie_${tmdbId}`
}

/**
 * Save or update progress for a title.
 * @param {string} type - 'movie' | 'tv'
 * @param {number} tmdbId
 * @param {{ position: number, season?: number, episode?: number, title?: string }} data - position in seconds
 */
export function saveProgress(type, tmdbId, data) {
  const { position, season, episode, title } = data
  const key = itemKey(type, tmdbId, season, episode)
  const list = loadAll()
  const existing = list.findIndex((i) => i.key === key)
  const entry = {
    key,
    type,
    tmdbId,
    season: type === 'tv' ? (season ?? 1) : undefined,
    episode: type === 'tv' ? (episode ?? 1) : undefined,
    position: Math.floor(position),
    title: title ?? '',
    updatedAt: Date.now(),
  }
  if (existing >= 0) list.splice(existing, 1)
  list.unshift(entry)
  saveAll(list)
}

/**
 * Get list of in-progress items, newest first (for "Continue watching" row).
 * @returns {{ key: string, type: string, tmdbId: number, season?: number, episode?: number, position: number, title: string, updatedAt: number }[]}
 */
export function getProgressList() {
  return loadAll()
}

/**
 * Get saved position for a single title (for resuming in player).
 * @returns {{ position: number, season?: number, episode?: number } | null}
 */
export function getProgress(type, tmdbId, season, episode) {
  const key = itemKey(type, tmdbId, season, episode)
  const list = loadAll()
  const entry = list.find((i) => i.key === key)
  return entry
    ? {
        position: entry.position,
        ...(entry.season != null && { season: entry.season }),
        ...(entry.episode != null && { episode: entry.episode }),
      }
    : null
}

/** Remove progress for one title (e.g. when user marks "Watched") */
export function removeProgress(type, tmdbId, season, episode) {
  const key = itemKey(type, tmdbId, season, episode)
  const list = loadAll().filter((i) => i.key !== key)
  saveAll(list)
}
