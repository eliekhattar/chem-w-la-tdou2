import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { buildDaddylivesEmbedUrl, LIVE_TV_CHANNELS, ADULT_CHANNELS } from '../api/daddylives'
import { getStreams } from '../api/streamed'
import { buildPlayerUrl } from '../api/cdnlive'
import styles from './LiveWatch.module.css'

const PLAYER_OPTIONS = Array.from({ length: 13 }, (_, i) => i + 1)
const ALL_CHANNELS = [...LIVE_TV_CHANNELS, ...ADULT_CHANNELS]

export default function LiveWatch() {
  const [searchParams] = useSearchParams()
  const providerParam = searchParams.get('provider')
  const provider = providerParam === 'streamed' ? 'streamed' : providerParam === 'cdnlive' ? 'cdnlive' : 'daddylives'

  // Daddylives
  const id = searchParams.get('id') || ''
  const source = searchParams.get('source') === 'tv2' ? 'tv2' : 'tv'
  const player = Math.min(13, Math.max(1, Number(searchParams.get('player')) || 1))

  // Streamed
  const streamedSource = searchParams.get('source') || ''
  const streamedSourceId = searchParams.get('sourceId') || ''
  const streamedTitle = searchParams.get('title') || ''

  // CDN Live
  const cdnLiveName = searchParams.get('name') || ''
  const cdnLiveCode = searchParams.get('code') || ''
  const cdnLiveTitle = searchParams.get('title') || ''

  const [streams, setStreams] = useState([])
  const [streamsLoading, setStreamsLoading] = useState(false)
  const [streamsError, setStreamsError] = useState(null)
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0)

  useEffect(() => {
    if (provider !== 'streamed' || !streamedSource || !streamedSourceId) return
    setStreamsLoading(true)
    setStreamsError(null)
    getStreams(streamedSource, streamedSourceId)
      .then((list) => {
        setStreams(Array.isArray(list) ? list : [])
        setSelectedStreamIndex(0)
      })
      .catch((err) => {
        setStreamsError(err.message || 'Failed to load streams')
        setStreams([])
      })
      .finally(() => setStreamsLoading(false))
  }, [provider, streamedSource, streamedSourceId])

  const channelName = useMemo(
    () => ALL_CHANNELS.find((ch) => ch.id === id)?.name ?? null,
    [id]
  )

  const embedSrc = useMemo(
    () => buildDaddylivesEmbedUrl({ id, player, source }),
    [id, player, source]
  )

  const currentStream = streams[selectedStreamIndex]
  const streamedEmbedSrc = currentStream?.embedUrl || ''

  const isStreamed = provider === 'streamed'
  const isCdnLive = provider === 'cdnlive'
  const hasStreamedParams = streamedSource && streamedSourceId
  const hasCdnLiveParams = cdnLiveName && cdnLiveCode
  const hasDaddylivesId = id.trim()

  const cdnLiveEmbedSrc = useMemo(
    () => (hasCdnLiveParams ? buildPlayerUrl(cdnLiveName, cdnLiveCode) : ''),
    [cdnLiveName, cdnLiveCode, hasCdnLiveParams]
  )

  if (!isStreamed && !isCdnLive && !hasDaddylivesId) {
    return (
      <section className={styles.section}>
        <Link to="/live" className={styles.backBtn}>← Back to Live</Link>
        <p className={styles.empty}>No channel or event ID. Go to Live TV & Sports and pick a channel or enter an ID.</p>
      </section>
    )
  }

  if (isStreamed && !hasStreamedParams) {
    return (
      <section className={styles.section}>
        <Link to="/live?provider=streamed" className={styles.backBtn}>← Back to Sports</Link>
        <p className={styles.empty}>Missing stream source. Pick a match from Sports (Streamed).</p>
      </section>
    )
  }

  if (isCdnLive && !hasCdnLiveParams) {
    return (
      <section className={styles.section}>
        <Link to="/live?provider=cdnlive" className={styles.backBtn}>← Back to CDN Live</Link>
        <p className={styles.empty}>Missing channel. Pick a channel or event from CDN Live.</p>
      </section>
    )
  }

  if (isCdnLive) {
    const title = cdnLiveTitle || cdnLiveName || 'CDN Live'
    return (
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <Link to="/live?provider=cdnlive" className={styles.backBtn}>
            ← Back to CDN Live
          </Link>
        </div>
        <h1 className={styles.watchTitle}>{title}</h1>
        {cdnLiveEmbedSrc && (
          <div className={styles.playerWrap}>
            <iframe
              src={cdnLiveEmbedSrc}
              title={title}
              className={styles.iframe}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
      </section>
    )
  }

  if (isStreamed) {
    const title = streamedTitle || 'Sports stream'
    return (
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <Link to="/live?provider=streamed" className={styles.backBtn}>
            ← Back to Sports
          </Link>
          {streams.length > 1 && (
            <div className={styles.playerSwitcher}>
              <span className={styles.playerLabel}>Stream:</span>
              <div className={styles.playerBtns}>
                {streams.map((s, idx) => (
                  <button
                    key={s.id || idx}
                    type="button"
                    className={selectedStreamIndex === idx ? styles.playerBtnActive : styles.playerBtn}
                    onClick={() => setSelectedStreamIndex(idx)}
                  >
                    {s.streamNo}
                    {s.language ? ` ${s.language}` : ''}
                    {s.hd ? ' HD' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <h1 className={styles.watchTitle}>{title}</h1>
        {streamsLoading && <p className={styles.empty}>Loading streams…</p>}
        {streamsError && <p className={styles.empty}>{streamsError}</p>}
        {!streamsLoading && !streamsError && streams.length === 0 && (
          <p className={styles.empty}>No streams available for this match.</p>
        )}
        {!streamsLoading && streamedEmbedSrc && (
          <div className={styles.playerWrap}>
            <iframe
              src={streamedEmbedSrc}
              title={title}
              className={styles.iframe}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
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
