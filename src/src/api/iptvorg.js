/**
 * IPTV-Org API - https://github.com/iptv-org/api
 * Data: https://iptv-org.github.io/api/
 */

const API_BASE = 'https://iptv-org.github.io/api'

let channelsCache = null
let streamsCache = null

export async function getChannels() {
  if (channelsCache) return channelsCache
  const res = await fetch(`${API_BASE}/channels.json`)
  if (!res.ok) throw new Error('Failed to fetch channels')
  channelsCache = await res.json()
  return channelsCache
}

export async function getStreams() {
  if (streamsCache) return streamsCache
  const res = await fetch(`${API_BASE}/streams.json`)
  if (!res.ok) throw new Error('Failed to fetch streams')
  streamsCache = await res.json()
  return streamsCache
}

/**
 * Get streams with channel name when available.
 * Returns { id, title, url, channelName, quality, channelId }[].
 * id is index-based for stable keys (streams.json has no unique id per row).
 */
export async function getStreamsWithChannelNames() {
  const [channels, streams] = await Promise.all([getChannels(), getStreams()])
  const channelMap = new Map((channels || []).map((c) => [c.id, c.name]))
  return (streams || []).map((s, i) => ({
    id: `iptv-${i}`,
    title: s.title || (s.channel ? channelMap.get(s.channel) : null) || 'Stream',
    url: s.url,
    channelName: s.channel ? channelMap.get(s.channel) : null,
    quality: s.quality || null,
    channelId: s.channel || null,
  }))
}
