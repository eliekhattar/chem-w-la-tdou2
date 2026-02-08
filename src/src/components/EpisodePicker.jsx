import { useRef, useEffect } from 'react'
import styles from './EpisodePicker.module.css'

export default function EpisodePicker({ seasons = [], currentSeason, currentEpisode, onSelect }) {
  const seasonRef = useRef(null)
  const episodeRef = useRef(null)
  const season = currentSeason ?? 1
  const episode = currentEpisode ?? 1
  const currentSeasonData = seasons.find((s) => s.season_number === season)

  useEffect(() => {
    const el = seasonRef.current
    if (!el) return
    const active = el.querySelector(`[data-season="${season}"]`)
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [season])

  useEffect(() => {
    const el = episodeRef.current
    if (!el) return
    const active = el.querySelector(`[data-episode="${episode}"]`)
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [episode])

  const handleSeasonClick = (s) => {
    onSelect?.({ season: s, episode: 1 })
  }

  const handleEpisodeClick = (ep) => {
    onSelect?.({ season, episode: ep })
  }

  if (!seasons?.length) return null

  const episodeCount = currentSeasonData?.episode_count ?? 1
  const episodeNumbers = Array.from({ length: episodeCount }, (_, i) => i + 1)

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Season</span>
        <div className={styles.seasonStrip} ref={seasonRef} role="tablist">
          {seasons.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.season_number === season}
              aria-label={`Season ${s.season_number}`}
              data-season={s.season_number}
              className={s.season_number === season ? styles.seasonChipActive : styles.seasonChip}
              onClick={() => handleSeasonClick(s.season_number)}
            >
              {s.season_number}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>Episodes</span>
        <div className={styles.episodeStrip} ref={episodeRef} role="list">
          {episodeNumbers.map((ep) => (
            <button
              key={ep}
              type="button"
              role="listitem"
              aria-label={`Episode ${ep}`}
              data-episode={ep}
              className={ep === episode ? styles.episodeBtnActive : styles.episodeBtn}
              onClick={() => handleEpisodeClick(ep)}
            >
              {ep}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
