import { STREAMED_API_BASE, STREAMED_BASE } from '../config'

/**
 * Streamed.pk API – sports matches, streams, sports list, images.
 * Docs: https://streamed.pk/docs
 */

/** @typedef {{ id: string; name: string }} Sport */
/** @typedef {{ id: string; title: string; category: string; date: number; poster?: string; popular: boolean; teams?: { home?: { name: string; badge: string }; away?: { name: string; badge: string } }; sources: { source: string; id: string }[] }} APIMatch */
/** @typedef {{ id: string; streamNo: number; language: string; hd: boolean; embedUrl: string; source: string }} Stream */

/**
 * Fetch all sports categories.
 * @returns {Promise<Sport[]>}
 */
export async function getSports() {
  const res = await fetch(`${STREAMED_API_BASE}/sports`)
  if (!res.ok) throw new Error('Failed to fetch sports')
  return res.json()
}

/**
 * Fetch matches. Use 'live' | 'all' | 'all-today' or a sport id (e.g. 'football').
 * @param {string} endpoint - 'live' | 'all' | 'all-today' | sport id. Append '/popular' for popular only.
 * @returns {Promise<APIMatch[]>}
 */
export async function getMatches(endpoint = 'live') {
  const path = endpoint.endsWith('/popular') ? endpoint : endpoint.replace(/\/$/, '')
  const res = await fetch(`${STREAMED_API_BASE}/matches/${path}`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

/**
 * Fetch streams for a match source.
 * @param {string} source - e.g. 'alpha', 'bravo'
 * @param {string} id - source-specific match id from match.sources[].id
 * @returns {Promise<Stream[]>}
 */
export async function getStreams(source, id) {
  if (!source || !id) return []
  const res = await fetch(`${STREAMED_API_BASE}/stream/${encodeURIComponent(source)}/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error('Failed to fetch streams')
  return res.json()
}

/**
 * Team badge image URL (WebP).
 * API returns badge as an id (often long/base64-like); use as path segment.
 * @param {string} badgeId - from match.teams.home.badge or match.teams.away.badge
 */
export function getBadgeUrl(badgeId) {
  if (!badgeId) return ''
  const suffix = badgeId.endsWith('.webp') ? '' : '.webp'
  return `${STREAMED_API_BASE}/images/badge/${badgeId}${suffix}`
}

/**
 * Match poster image URL (WebP).
 * @param {string} badge1 - first badge
 * @param {string} badge2 - second badge
 */
export function getPosterUrl(badge1, badge2) {
  if (!badge1 || !badge2) return ''
  return `${STREAMED_API_BASE}/images/poster/${badge1}/${badge2}.webp`
}

/**
 * Poster image URL. API returns match.poster as full path including .webp, e.g.
 * "/api/images/proxy/XXX.webp". Use STREAMED_BASE + that path.
 * @param {string} posterValue - from match.poster (path or id)
 */
export function getProxyUrl(posterValue) {
  if (!posterValue) return ''
  if (posterValue.startsWith('http')) return posterValue
  if (posterValue.startsWith('/')) return `${STREAMED_BASE}${posterValue}`
  const id = posterValue.replace(/\.webp$/i, '')
  return `${STREAMED_API_BASE}/images/proxy/${id}.webp`
}
