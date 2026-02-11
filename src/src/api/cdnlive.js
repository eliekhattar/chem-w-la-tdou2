import { CDN_LIVE_API_BASE, CDN_LIVE_PLAYER_BASE, CDN_LIVE_QUERY } from '../config'

/**
 * CDN-Live TV API (StreamSports99) – live channels and sports events.
 * Channels: https://api.cdn-live.tv/api/v1/channels/?user=cdnlivetv&plan=free
 * Events:   https://api.cdn-live.tv/api/v1/events/sports/{sport}/?user=cdnlivetv&plan=free
 *           sport = '' (all), 'soccer', 'nfl', 'nba', 'nhl'
 */

/** @typedef {{ name: string; code: string; url: string; image: string | null; status: string; viewers: number }} CDNChannel */
/** @typedef {{ gameID: string; homeTeam: string; awayTeam: string; homeTeamIMG: string; awayTeamIMG: string; time: string; tournament: string; country: string; countryIMG: string; status: string; start: string; end: string; channels: { channel_name: string; channel_code: string; url: string; image: string | null; viewers: number }[] }} CDNEvent */

/**
 * Fetch all live channels.
 * @returns {Promise<{ total_channels: number; channels: CDNChannel[] }>}
 */
export async function getChannels() {
  const res = await fetch(`${CDN_LIVE_API_BASE}/channels/?${CDN_LIVE_QUERY}`)
  if (!res.ok) throw new Error('Failed to fetch channels')
  return res.json()
}

/**
 * Fetch sports events. Use '' for all, or 'soccer', 'nfl', 'nba', 'nhl'.
 * @param {string} sport - '' | 'soccer' | 'nfl' | 'nba' | 'nhl'
 * @returns {Promise<Record<string, CDNEvent[]>>} e.g. { "cdn-live-tv": { "Soccer": [...], "NFL": [...] } }
 */
export async function getSportsEvents(sport = '') {
  const path = sport ? `sports/${sport}/` : 'sports/'
  const res = await fetch(`${CDN_LIVE_API_BASE}/events/${path}?${CDN_LIVE_QUERY}`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

/**
 * Flatten events from API response into a single array with sport label.
 * @param {Record<string, Record<string, CDNEvent[]>>} data - API response
 * @returns {{ event: CDNEvent; sport: string }[]}
 */
export function flattenEvents(data) {
  const out = []
  const root = data['cdn-live-tv'] || data
  if (!root || typeof root !== 'object') return out
  for (const [sport, events] of Object.entries(root)) {
    if (Array.isArray(events)) {
      events.forEach((event) => out.push({ event, sport }))
    }
  }
  return out
}

/**
 * Build player iframe URL for a channel (by name and code).
 * @param {string} name - channel name (e.g. "ESPN", "Sky Sports 1")
 * @param {string} code - country code (e.g. "us", "gb")
 */
export function buildPlayerUrl(name, code) {
  if (!name || !code) return ''
  const params = new URLSearchParams()
  params.set('name', name)
  params.set('code', code)
  params.set('user', 'cdnlivetv')
  params.set('plan', 'free')
  return `${CDN_LIVE_PLAYER_BASE}/?${params.toString()}`
}
