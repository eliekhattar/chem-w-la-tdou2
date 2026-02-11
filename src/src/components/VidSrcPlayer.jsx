import { useMemo } from 'react'
import { buildVidSrcEmbedUrl } from '../api/vidsrc'
import styles from './VidkingPlayer.module.css'

export default function VidSrcPlayer({
  type = 'movie',
  tmdbId,
  season = 1,
  episode = 1,
  autoplay = true,
  autonext = false,
  dsLang,
  className = '',
}) {
  const src = useMemo(
    () => buildVidSrcEmbedUrl({ type, tmdbId, season, episode, autoplay, autonext, dsLang }),
    [type, tmdbId, season, episode, autoplay, autonext, dsLang]
  )

  if (!tmdbId) {
    return (
      <div className={`${styles.placeholder} ${className}`}>
        <p>Select a movie or episode to watch</p>
      </div>
    )
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <iframe
        className={styles.iframe}
        src={src}
        title="VidSrc Player"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
