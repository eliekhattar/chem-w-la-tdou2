import { useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { buildDaddylivesEmbedUrl, LIVE_TV_CHANNELS, ADULT_CHANNELS } from '../api/daddylives'
import styles from './LiveWatch.module.css'

const PLAYER_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 1)
const ALL_CHANNELS = [...LIVE_TV_CHANNELS, ...ADULT_CHANNELS]

export default function LiveWatch() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const source = searchParams.get('source') === 'tv2' ? 'tv2' : 'tv'
  const player = Math.min(13, Math.max(1, Number(searchParams.get('player')) || 1))

  const channelName = useMemo(
    () => ALL_CHANNELS.find((ch) => ch.id === id)?.name ?? null,
    [id]
  )

  const embedSrc = useMemo(
    () => buildDaddylivesEmbedUrl({ id, player, source }),
    [id, player, source]
  )

  if (!id.trim()) {
    return (
      <section className={styles.section}>
        <Link to="/live" className={styles.backBtn}>← Back to Live</Link>
        <p className={styles.empty}>No channel or event ID. Go to Live TV & Sports and pick a channel or enter an ID.</p>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <Link to="/live" className={styles.backBtn}>
          ← Back to Live
        </Link>
        <div className={styles.playerSwitcher}>
          <span className={styles.playerLabel}>Player:</span>
          <div className={styles.playerBtns}>
            {PLAYER_OPTIONS.map((p) => (
              <Link
                key={p}
                to={`/live/watch?id=${encodeURIComponent(id)}&source=${source}&player=${p}`}
                className={player === p ? styles.playerBtnActive : styles.playerBtn}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <h1 className={styles.watchTitle}>{channelName || (source === 'tv2' ? 'Sports / PPV' : 'Live TV')}</h1>
      {!channelName && (
        <p className={styles.sourceNote}>
          ID: <code>{id}</code>
        </p>
      )}
      <div className={styles.playerWrap}>
        <iframe
          src={embedSrc}
          title={channelName || 'Live stream'}
          className={styles.iframe}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  )
}
