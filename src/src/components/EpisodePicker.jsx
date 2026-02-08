import { useState } from 'react'
import styles from './EpisodePicker.module.css'

export default function EpisodePicker({ seasons = [], currentSeason, currentEpisode, onSelect }) {
  const [season, setSeason] = useState(currentSeason || 1)
  const [episode, setEpisode] = useState(currentEpisode || 1)
  const currentSeasonData = seasons.find((s) => s.season_number === season)

  const handleSeasonChange = (e) => {
    const s = Number(e.target.value)
    setSeason(s)
    setEpisode(1)
    const seasonData = seasons.find((se) => se.season_number === s)
    const epCount = seasonData?.episode_count ?? 1
    onSelect?.({ season: s, episode: 1 })
  }

  const handleEpisodeChange = (e) => {
    const ep = Number(e.target.value)
    setEpisode(ep)
    onSelect?.({ season, episode: ep })
  }

  if (!seasons?.length) return null

  const episodeCount = currentSeasonData?.episode_count ?? 1
  const episodeOptions = Array.from({ length: episodeCount }, (_, i) => i + 1)

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>
        <span>Season</span>
        <select value={season} onChange={handleSeasonChange} className={styles.select}>
          {seasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.label}>
        <span>Episode</span>
        <select value={episode} onChange={handleEpisodeChange} className={styles.select}>
          {episodeOptions.map((ep) => (
            <option key={ep} value={ep}>
              Episode {ep}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
