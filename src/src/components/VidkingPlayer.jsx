import { useMemo } from 'react'
import { VIDKING_BASE } from '../config'
import styles from './VidkingPlayer.module.css'

const DEFAULT_COLOR = 'e50914' // Netflix-style red

/**
 * Build Vidking embed URL per https://www.vidking.net/#documentation
 * Movies: /embed/movie/{tmdbId}
 * TV:    /embed/tv/{tmdbId}/{season}/{episode}
 * Params: color, autoPlay, nextEpisode, episodeSelector, progress
 */
export function buildVidkingUrl({ type, tmdbId, season = 1, episode = 1, color = DEFAULT_COLOR, autoPlay = false, nextEpisode = true, episodeSelector = true, progress }) {
  const params = new URLSearchParams()
  if (color) params.set('color', color.replace(/^#/, ''))
  if (autoPlay) params.set('autoPlay', 'true')
  if (type === 'tv') {
    if (nextEpisode) params.set('nextEpisode', 'true')
    if (episodeSelector) params.set('episodeSelector', 'true')
  }
  if (progress != null && progress > 0) params.set('progress', String(Math.floor(progress)))
  const qs = params.toString()
  const base = type === 'tv'
    ? `${VIDKING_BASE}/tv/${tmdbId}/${season}/${episode}`
    : `${VIDKING_BASE}/movie/${tmdbId}`
  return qs ? `${base}?${qs}` : base
}

export default function VidkingPlayer({ type = 'movie', tmdbId, season = 1, episode = 1, color = DEFAULT_COLOR, autoPlay = false, nextEpisode = true, episodeSelector = true, progress, className = '' }) {
  const src = useMemo(
    () => buildVidkingUrl({ type, tmdbId, season, episode, color, autoPlay, nextEpisode, episodeSelector, progress }),
    [type, tmdbId, season, episode, color, autoPlay, nextEpisode, episodeSelector, progress]
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
        title="Vidking Player"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
