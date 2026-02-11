import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LIVE_TV_CHANNELS, ADULT_CHANNELS, getChannelLetter } from '../api/daddylives'
import { getSports, getMatches, getBadgeUrl, getProxyUrl } from '../api/streamed'
import styles from './LiveChannels.module.css'

const LETTERS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']
const TAP_WINDOW_MS = 1500
const TAPS_REQUIRED = 7

const STREAMED_MATCH_FILTERS = [
  { value: 'live', label: 'Live' },
  { value: 'all-today', label: "Today" },
  { value: 'all', label: 'All' },
]

export default function LiveChannels() {
  const [searchParams, setSearchParams] = useSearchParams()
  const provider = searchParams.get('provider') === 'streamed' ? 'streamed' : 'daddylives'

  const [searchQuery, setSearchQuery] = useState('')
  const [letterFilter, setLetterFilter] = useState('All')
  const [adultUnlocked, setAdultUnlocked] = useState(false)
  const hashTapCountRef = useRef(0)
  const lastHashTapTimeRef = useRef(0)

  // Streamed state
  const [sports, setSports] = useState([])
  const [matchFilter, setMatchFilter] = useState('live')
  const [matches, setMatches] = useState([])
  const [sportId, setSportId] = useState('')
  const [loadingSports, setLoadingSports] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)

  useEffect(() => {
    if (provider !== 'streamed') return
    setLoadingSports(true)
    getSports()
      .then(setSports)
      .catch(() => setSports([]))
      .finally(() => setLoadingSports(false))
  }, [provider])

  useEffect(() => {
    if (provider !== 'streamed') return
    setLoadingMatches(true)
    const endpoint = sportId ? `${sportId}` : matchFilter
    getMatches(endpoint)
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setLoadingMatches(false))
  }, [provider, matchFilter, sportId])

  const setProvider = (p) => {
    const next = new URLSearchParams(searchParams)
    if (p === 'daddylives') next.delete('provider')
    else next.set('provider', p)
    setSearchParams(next)
  }

  const watchUrl = (id, source = 'tv') => `/live/watch?id=${encodeURIComponent(id)}&source=${source}`

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

  const handleLetterClick = (letter) => {
    if (letter !== '#') {
      hashTapCountRef.current = 0
      setLetterFilter(letter)
      return
    }
    const now = Date.now()
    if (now - lastHashTapTimeRef.current > TAP_WINDOW_MS) hashTapCountRef.current = 0
    lastHashTapTimeRef.current = now
    hashTapCountRef.current += 1
    if (hashTapCountRef.current >= TAPS_REQUIRED) {
      setAdultUnlocked(true)
      hashTapCountRef.current = 0
    }
    setLetterFilter('#')
  }

  const { filteredChannels, letterCounts } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const byLetter = {}
    let list = LIVE_TV_CHANNELS

    if (q) {
      list = list.filter((ch) => ch.name.toLowerCase().includes(q))
    }
    if (letterFilter !== 'All') {
      list = list.filter((ch) => getChannelLetter(ch) === letterFilter)
    }

    list.forEach((ch) => {
      const letter = getChannelLetter(ch)
      byLetter[letter] = (byLetter[letter] || 0) + 1
    })

    return { filteredChannels: list, letterCounts: byLetter }
  }, [searchQuery, letterFilter])

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
          className={provider === 'daddylives' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('daddylives')}
        >
          📺 Live TV (Daddylives)
        </button>
        <button
          type="button"
          className={provider === 'streamed' ? styles.providerTabActive : styles.providerTab}
          onClick={() => setProvider('streamed')}
        >
          ⚽ Sports (Streamed)
        </button>
      </div>

      {provider === 'streamed' ? (
        <>
          <div className={styles.streamedToolbar}>
            <div className={styles.streamedFilters}>
              {STREAMED_MATCH_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={matchFilter === f.value && !sportId ? styles.letterActive : styles.letterBtn}
                  onClick={() => { setSportId(''); setMatchFilter(f.value) }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {!loadingSports && sports.length > 0 && (
              <select
                value={sportId}
                onChange={(e) => { setSportId(e.target.value); setMatchFilter('') }}
                className={styles.sportSelect}
                aria-label="Sport"
              >
                <option value="">All sports</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
          {loadingMatches ? (
            <p className={styles.empty}>Loading matches…</p>
          ) : matches.length === 0 ? (
            <p className={styles.empty}>No matches right now. Try “All” or another sport.</p>
          ) : (
            <p className={styles.resultCount}>
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </p>
          )}
          <div className={styles.channelList}>
            {!loadingMatches && matches.length > 0 && (
              <ul className={styles.cardGrid}>
                {matches.map((match) => {
                  const url = streamedWatchUrl(match)
                  const posterUrl = match.poster ? getProxyUrl(match.poster) : null
                  const homeBadge = match.teams?.home?.badge ? getBadgeUrl(match.teams.home.badge) : null
                  const awayBadge = match.teams?.away?.badge ? getBadgeUrl(match.teams.away.badge) : null
                  return (
                    <li key={match.id}>
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
            )}
          </div>
        </>
      ) : (
        <>
      {/* <p className={styles.intro}>
        {LIVE_TV_CHANNELS.length} live channels via{' '}
        <a href="https://daddylives.nl/api" target="_blank" rel="noopener noreferrer">Daddylives</a>.
        For PPV/sports events use “Open by ID” below.
      </p> */}

      {/* <div className={styles.openById}> */}
        {/* <h2 className={styles.subtitle}>Open by Channel or Event ID</h2> */}
        {/* <p className={styles.hint}>
          Paste any channel ID or a PPV path (e.g. <code>admin/ppv-event/1</code>) and choose source.
        </p>
        <div className={styles.idRow}>
          <input
            type="text"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            placeholder="Channel or event ID"
            className={styles.idInput}
          />
          <select
            value={customSource}
            onChange={(e) => setCustomSource(e.target.value)}
            className={styles.sourceSelect}
            aria-label="Source type"
          >
            <option value="tv">TV</option>
            <option value="tv2">Sports / PPV</option>
          </select>
          {customId.trim() ? (
            <Link to={watchUrl(customId.trim(), customSource)} className={styles.watchBtn}>
              Watch
            </Link>
          ) : (
            <span className={styles.watchBtnDisabled}>Watch</span>
          )}
        </div> */}
      {/* </div> */}

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
              onClick={() => handleLetterClick(letter)}
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

      {adultUnlocked && (
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
