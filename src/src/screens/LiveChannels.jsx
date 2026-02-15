import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LIVE_TV_CHANNELS, ADULT_CHANNELS, getChannelLetter } from '../api/daddylives'
import { getMatches, getBadgeUrl, getProxyUrl } from '../api/streamed'
import { getChannels, getSportsEvents, flattenEvents, buildPlayerUrl } from '../api/cdnlive'
import { getStreamsWithChannelNames } from '../api/iptvorg'
import styles from './LiveChannels.module.css'

const LETTERS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']

const STREAMED_MATCH_FILTERS = [
  { value: 'live', label: 'Live' },
  { value: 'all-today', label: "Today" },
  { value: 'all', label: 'All' },
]

export default function LiveChannels() {
  const [searchParams, setSearchParams] = useSearchParams()
  const providerParam = searchParams.get('provider')
  const provider = providerParam === 'daddylives' ? 'daddylives' : providerParam === 'iptvorg' ? 'iptvorg' : providerParam === 'streamed' ? 'streamed' : 'cdnlive'

  const [searchQuery, setSearchQuery] = useState('')
  const [letterFilter, setLetterFilter] = useState('All')
  const [iptvSearch, setIptvSearch] = useState('')

  // Streamed state
  const [matchFilter, setMatchFilter] = useState('live')
  const [matches, setMatches] = useState([])
  const [loadingMatches, setLoadingMatches] = useState(false)

  // CDN Live state: 'channels' | 'events'
  const [cdnLiveMode, setCdnLiveMode] = useState('channels')
  const [cdnChannels, setCdnChannels] = useState([])
  const [cdnEvents, setCdnEvents] = useState([])
  const [loadingCdnChannels, setLoadingCdnChannels] = useState(false)
  const [loadingCdnEvents, setLoadingCdnEvents] = useState(false)
  const [cdnLiveChannelSearch, setCdnLiveChannelSearch] = useState('')

  // IPTV Org state
  const [iptvStreams, setIptvStreams] = useState([])
  const [loadingIptv, setLoadingIptv] = useState(false)

  useEffect(() => {
    if (provider !== 'streamed') return
    setLoadingMatches(true)
    getMatches(matchFilter)
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false))
  }, [provider, matchFilter])

  const setProvider = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('provider', p)
    setSearchParams(next)
  }

  useEffect(() => {
    if (provider !== 'cdnlive') return
    if (cdnLiveMode === 'channels') {
      setLoadingCdnChannels(true)
      getChannels()
        .then((data) => setCdnChannels(data.channels || []))
        .catch(() => setCdnChannels([]))
        .finally(() => setLoadingCdnChannels(false))
    }
  }, [provider, cdnLiveMode])

  useEffect(() => {
    if (provider !== 'cdnlive' || cdnLiveMode !== 'events') return
    setLoadingCdnEvents(true)
    getSportsEvents('')
      .then((data) => setCdnEvents(flattenEvents(data)))
      .catch(() => setCdnEvents([]))
      .finally(() => setLoadingCdnEvents(false))
  }, [provider, cdnLiveMode])

  useEffect(() => {
    if (provider !== 'iptvorg') return
    setLoadingIptv(true)
    getStreamsWithChannelNames()
      .then(setIptvStreams)
      .catch(() => setIptvStreams([]))
      .finally(() => setLoadingIptv(false))
  }, [provider])

  /** Build watch URL for a Streamed match (uses first source). */
  const streamedWatchUrl = (match) => {
    const first = match.sources?.[0]
    if (!first) return null
    const params = new URLSearchParams()
    params.set('provider', 'streamed')
    params.set('source', first.source)
    params.set('sourceId', first.id)
    if (match.title) params.set('title', match.title)
    return `/live/watch?${params.toString()}`
  }

  /** Build watch URL for CDN Live channel. */
  const cdnLiveChannelWatchUrl = (ch) => {
    const params = new URLSearchParams()
    params.set('provider', 'cdnlive')
    params.set('name', ch.name)
    params.set('code', ch.code)
    params.set('title', ch.name)
    return `/live/watch?${params.toString()}`
  }

  /** Build watch URL for CDN Live event (first channel). */
  const cdnLiveEventWatchUrl = ({ event }) => {
    const first = event.channels?.[0]
    if (!first) return null
    const params = new URLSearchParams()
    params.set('provider', 'cdnlive')
    params.set('name', first.channel_name)
    params.set('code', first.channel_code)
    params.set('title', `${event.homeTeam} vs ${event.awayTeam}`)
    return `/live/watch?${params.toString()}`
  }

  /** Build watch URL for IPTV Org stream. */
  const iptvWatchUrl = (stream) => {
    const params = new URLSearchParams()
    params.set('provider', 'iptvorg')
    params.set('url', stream.url)
    params.set('title', stream.title || 'Stream')
    return `/live/watch?${params.toString()}`
  }

  const watchUrl = (id, source = 'tv') => `/live/watch?id=${encodeURIComponent(id)}&source=${source}&provider=daddylives`

  const adultUnlockCode = (import.meta.env.VITE_ADULT_UNLOCK_CODE || '').trim()
  /** Daddylives: show Adult section only when search bar matches the env code (case-insensitive). */
  const showAdultSection = provider === 'daddylives' && adultUnlockCode !== '' && searchQuery.trim().toLowerCase() === adultUnlockCode.toLowerCase()

  /** Daddylives: filter channels by search and letter */
  const { filteredChannels, letterCounts } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const byLetter = {}
    let list = LIVE_TV_CHANNELS
    const unlockCodeLower = adultUnlockCode.toLowerCase()
    if (q && (unlockCodeLower === '' || q !== unlockCodeLower)) list = list.filter((ch) => ch.name.toLowerCase().includes(q))
    if (letterFilter !== 'All') list = list.filter((ch) => getChannelLetter(ch) === letterFilter)
    list.forEach((ch) => {
      const letter = getChannelLetter(ch)
      byLetter[letter] = (byLetter[letter] || 0) + 1
    })
    return { filteredChannels: list, letterCounts: byLetter }
  }, [searchQuery, letterFilter, adultUnlockCode])

  /** Streamed: group matches by category (sport), sorted by sport name */
  const matchesBySport = useMemo(() => {
    const bySport = {}
    matches.forEach((match) => {
      const sport = match.category || 'Other'
      if (!bySport[sport]) bySport[sport] = []
      bySport[sport].push(match)
    })
    const sorted = Object.keys(bySport).sort((a, b) => a.localeCompare(b))
    return sorted.map((sport) => ({ sport, list: bySport[sport] }))
  }, [matches])

  /** CDN Live: filter channels by search (name + country code) */
  const filteredCdnChannels = useMemo(() => {
    const q = cdnLiveChannelSearch.trim().toLowerCase()
    if (!q) return cdnChannels
    return cdnChannels.filter(
      (ch) =>
        (ch.name && ch.name.toLowerCase().includes(q)) ||
        (ch.code && ch.code.toLowerCase().includes(q))
    )
  }, [cdnChannels, cdnLiveChannelSearch])

  /** CDN Live: group events by sport, sorted by sport name */
  const cdnEventsBySport = useMemo(() => {
    const bySport = {}
    cdnEvents.forEach(({ event, sport }) => {
      const key = sport || 'Other'
      if (!bySport[key]) bySport[key] = []
      bySport[key].push({ event, sport: key })
    })
    const sorted = Object.keys(bySport).sort((a, b) => a.localeCompare(b))
    return sorted.map((sport) => ({ sport, list: bySport[sport] }))
  }, [cdnEvents])

  /** IPTV Org: filter streams by search */
  const filteredIptvStreams = useMemo(() => {
    const q = iptvSearch.trim().toLowerCase()
    if (!q) return iptvStreams.slice(0, 200)
    return iptvStreams.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.channelName && s.channelName.toLowerCase().includes(q))
    ).slice(0, 200)
  }, [iptvStreams, iptvSearch])

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <Link to="/" className={styles.backBtn}>
          ← Back to browse
        </Link>
        <h1 className={styles.title}>Live TV & Sports</h1>
      </div>

      <div className={styles.providerTabs}>
        <button
          type="button"
          className={provider === 'cdnlive' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('cdnlive')}
        >
          📺 Live TV
        </button>
        <button
          type="button"
          className={provider === 'streamed' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('streamed')}
        >
          ⚽ Live Sports
        </button>
        <button
          type="button"
          className={provider === 'iptvorg' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('iptvorg')}
        >
          📡 IPTV Org
        </button>
        <button
          type="button"
          className={provider === 'daddylives' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('daddylives')}
        >
          📺 Live TV (Alternate)
        </button>
      </div>

      {provider === 'cdnlive' ? (
        <>
          <div className={styles.streamedToolbar}>
            <button
              type="button"
              className={cdnLiveMode === 'channels' ? styles.letterActive : styles.letterBtn}
              onClick={() => setCdnLiveMode('channels')}
            >
              Channels
            </button>
            <button
              type="button"
              className={cdnLiveMode === 'events' ? styles.letterActive : styles.letterBtn}
              onClick={() => setCdnLiveMode('events')}
            >
              Sports events
            </button>
          </div>
          {cdnLiveMode === 'channels' && (
            <>
              <div className={styles.toolbar}>
                <input
                  type="search"
                  value={cdnLiveChannelSearch}
                  onChange={(e) => setCdnLiveChannelSearch(e.target.value)}
                  placeholder="Search by channel name or country code (e.g. bein, us, gb)…"
                  className={styles.searchInput}
                  aria-label="Search TV channels"
                />
              </div>
              {loadingCdnChannels ? (
                <p className={styles.empty}>Loading channels…</p>
              ) : (
                <>
                  <p className={styles.resultCount}>
                    {filteredCdnChannels.length} channel{filteredCdnChannels.length !== 1 ? 's' : ''}
                    {cdnLiveChannelSearch.trim() && ` (of ${cdnChannels.length})`}
                  </p>
                  <div className={styles.channelList}>
                    {filteredCdnChannels.length === 0 ? (
                      <p className={styles.empty}>
                        {cdnLiveChannelSearch.trim() ? 'No channels match your search.' : 'No channels loaded.'}
                      </p>
                    ) : (
                      <ul className={styles.cardGrid}>
                        {filteredCdnChannels.map((ch) => (
                          <li key={`${ch.code}-${ch.name}`}>
                            <Link to={cdnLiveChannelWatchUrl(ch)} className={styles.cdnChannelCard}>
                              {ch.image ? (
                                <img src={ch.image} alt="" className={styles.cdnChannelImg} />
                              ) : (
                                <span className={styles.cdnChannelIcon}>📺</span>
                              )}
                              <span className={styles.channelName}>{ch.name}</span>
                              {ch.code && (
                                <span className={styles.cdnChannelCode} title="Country code">
                                  {ch.code.toUpperCase()}
                                </span>
                              )}
                              {ch.status && (
                                <span className={ch.status === 'offline' ? styles.statusOffline : ch.status === 'online' ? styles.statusOnline : styles.matchCardMeta}>
                                  {ch.status}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          {cdnLiveMode === 'events' && (
            <>
              {loadingCdnEvents ? (
                <p className={styles.empty}>Loading events…</p>
              ) : cdnEventsBySport.length === 0 ? (
                <p className={styles.empty}>No events. Check back later.</p>
              ) : (
                <div className={styles.sportRows}>
                  {cdnEventsBySport.map(({ sport, list }) => (
                    <div key={sport} className={styles.sportRow}>
                      <h2 className={styles.sportRowTitle}>{sport}</h2>
                      <ul className={styles.sportRowList}>
                        {list.map(({ event, sport: sportLabel }) => {
                          const url = cdnLiveEventWatchUrl({ event })
                          const title = `${event.homeTeam} vs ${event.awayTeam}`
                          return (
                            <li key={event.gameID} className={styles.sportRowCard}>
                              {url ? (
                                <Link to={url} className={styles.matchCard}>
                                  <div className={styles.matchCardThumb}>
                                    <span className={styles.matchCardIcon}>⚽</span>
                                  </div>
                                  <div className={styles.matchCardBody}>
                                    <span className={styles.matchCardTitle}>{title}</span>
                                    <span className={styles.matchCardMeta}>
                                      {event.tournament} • {event.time}
                                      {event.channels?.length ? ` • ${event.channels.length} channel(s)` : ''}
                                    </span>
                                  </div>
                                </Link>
                              ) : (
                                <div className={styles.matchCardUnavailable}>
                                  <span className={styles.matchCardTitle}>{title}</span>
                                  <span className={styles.matchCardMeta}>No stream</span>
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : provider === 'streamed' ? (
        <>
          <div className={styles.streamedToolbar}>
            <div className={styles.streamedFilters}>
              {STREAMED_MATCH_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={matchFilter === f.value ? styles.letterActive : styles.letterBtn}
                  onClick={() => setMatchFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {loadingMatches ? (
            <p className={styles.empty}>Loading matches…</p>
          ) : matchesBySport.length === 0 ? (
            <p className={styles.empty}>No matches right now. Try Live, Today, or All.</p>
          ) : (
            <div className={styles.sportRows}>
              {matchesBySport.map(({ sport, list }) => (
                <div key={sport} className={styles.sportRow}>
                  <h2 className={styles.sportRowTitle}>{sport}</h2>
                  <ul className={styles.sportRowList}>
                    {list.map((match) => {
                      const url = streamedWatchUrl(match)
                      const posterUrl = match.poster ? getProxyUrl(match.poster) : null
                      const homeBadge = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : null
                      const awayBadge = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : null
                      return (
                        <li key={match.id} className={styles.sportRowCard}>
                          {url ? (
                            <Link to={url} className={styles.matchCard}>
                              <div className={styles.matchCardThumb}>
                                {posterUrl ? (
                                  <img src={posterUrl} alt="" className={styles.matchCardImg} />
                                ) : (
                                  <span className={styles.matchCardIcon}>⚽</span>
                                )}
                              </div>
                              <div className={styles.matchCardBody}>
                                <span className={styles.matchCardTitle}>{match.title}</span>
                                {match.teams?.home && match.teams?.away && (
                                  <div className={styles.matchCardTeams}>
                                    {homeBadge && <img src={homeBadge} alt="" className={styles.matchBadge} />}
                                    <span className={styles.matchVs}>vs</span>
                                    {awayBadge && <img src={awayBadge} alt="" className={styles.matchBadge} />}
                                  </div>
                                )}
                                <span className={styles.matchCardMeta}>
                                  {new Date(match.date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                  {match.popular && ' • Popular'}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <div className={styles.matchCardUnavailable}>
                              <span className={styles.matchCardTitle}>{match.title}</span>
                              <span className={styles.matchCardMeta}>No stream source</span>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      ) : provider === 'iptvorg' ? (
        <>
          {/* <p className={styles.resultCount}>
            {loadingIptv ? 'Loading…' : `${iptvStreams.length} streams (from IPTV-Org API)`}
          </p> */}
          <div className={styles.toolbar}>
            <input
              type="search"
              value={iptvSearch}
              onChange={(e) => setIptvSearch(e.target.value)}
              placeholder="Search by channel or title…"
              className={styles.searchInput}
              aria-label="Search streams"
            />
          </div>
          {loadingIptv ? (
            <p className={styles.empty}>Loading streams…</p>
          ) : filteredIptvStreams.length === 0 ? (
            <p className={styles.empty}>
              {iptvSearch.trim() ? 'No streams match your search.' : 'No streams loaded.'}
            </p>
          ) : (
            <div className={styles.channelList}>
              <ul className={styles.cardGrid}>
                {filteredIptvStreams.map((stream) => (
                  <li key={stream.id}>
                    <Link to={iptvWatchUrl(stream)} className={styles.channelCard}>
                      <span className={styles.channelIcon}>📺</span>
                      <span className={styles.channelName}>{stream.title}</span>
                      {stream.quality && (
                        <span className={styles.matchCardMeta}>{stream.quality}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.toolbar}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels…"
              className={styles.searchInput}
              aria-label="Search channels"
            />
            <div className={styles.letterBar}>
              {LETTERS.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={letterFilter === letter ? styles.letterActive : styles.letterBtn}
                  onClick={() => setLetterFilter(letter)}
                  title={letter === 'All' ? 'Show all' : `${letter} (${letterCounts[letter] ?? 0})`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
          <p className={styles.resultCount}>
            {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
          </p>
          <div className={styles.channelList}>
            {filteredChannels.length === 0 ? (
              <p className={styles.empty}>No channels match. Try another search or letter.</p>
            ) : (
              <ul className={styles.cardGrid}>
                {filteredChannels.map((ch) => (
                  <li key={ch.id}>
                    <Link to={watchUrl(ch.id, ch.source)} className={styles.channelCard}>
                      <span className={styles.channelIcon}>📺</span>
                      <span className={styles.channelName}>{ch.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {showAdultSection && (
            <div className={styles.adultSection}>
              <h2 className={styles.adultSectionTitle}>Adult</h2>
              <ul className={styles.cardGrid}>
                {ADULT_CHANNELS.map((ch) => (
                  <li key={ch.id}>
                    <Link to={watchUrl(ch.id, ch.source)} className={styles.channelCard}>
                      <span className={styles.channelIcon}>📺</span>
                      <span className={styles.channelName}>{ch.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
