import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LIVE_TV_CHANNELS, ADULT_CHANNELS, getChannelLetter } from '../api/daddylives'
import styles from './LiveChannels.module.css'

const LETTERS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']
const TAP_WINDOW_MS = 1500
const TAPS_REQUIRED = 7

export default function LiveChannels() {
  const [searchQuery, setSearchQuery] = useState('')
  const [letterFilter, setLetterFilter] = useState('All')
  const [adultUnlocked, setAdultUnlocked] = useState(false)
  const hashTapCountRef = useRef(0)
  const lastHashTapTimeRef = useRef(0)

  const watchUrl = (id, source = 'tv') => `/live/watch?id=${encodeURIComponent(id)}&source=${source}`

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
    </section>
  )
}
