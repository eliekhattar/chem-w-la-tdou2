import { DADDYLIVES_EMBED_BASE } from '../config'

// Full channel list extracted from daddylives (see scripts/extract-daddylives-channels.cjs)
import channelsData from '../data/daddylivesChannels.json'

/**
 * Build Daddylives embed URL for live TV or sports.
 * @param {Object} opts
 * @param {string} opts.id - Channel ID or event path (e.g. 664, admin/ppv-event/1)
 * @param {number} [opts.player=1] - Player number 1-13
 * @param {'tv'|'tv2'} [opts.source='tv'] - tv = regular channels, tv2 = sports/PPV
 */
export function buildDaddylivesEmbedUrl({ id, player = 1, source = 'tv' }) {
  if (!id) return ''
  const params = new URLSearchParams()
  params.set('id', String(id))
  params.set('player', String(Math.min(13, Math.max(1, Number(player) || 1))))
  params.set('source', source === 'tv2' ? 'tv2' : 'tv')
  return `${DADDYLIVES_EMBED_BASE}?${params.toString()}`
}

/** All live TV channels: { id, name } — use source 'tv' for embed. */
export const LIVE_TV_CHANNELS = channelsData.channels.map((ch) => ({
  ...ch,
  source: 'tv',
}))

/** First letter for grouping (A–Z or # for digits/other). */
export function getChannelLetter(channel) {
  const first = (channel.name || '').trim().toUpperCase()[0]
  if (!first) return '#'
  return /[A-Z]/.test(first) ? first : '#'
}

/** Adult channels (unlocked via 7-tap on # on Live TV screen; not persisted). Source: adult.html */
export const ADULT_CHANNELS = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1
  return { id: String(500 + n), name: `18+ (Player-${String(n).padStart(2, '0')})`, source: 'tv' }
})
