import { useState } from 'react'
import styles from './OpenByTmdbId.module.css'

export default function OpenByTmdbId({ onPlayMovie, onPlayTv }) {
  const [type, setType] = useState('movie')
  const [tmdbId, setTmdbId] = useState('')
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)

  const handleOpen = (e) => {
    e.preventDefault()
    const id = parseInt(tmdbId, 10)
    if (!id) return
    const item = { id, title: `Movie ${id}`, name: `Show ${id}` }
    if (type === 'movie') {
      onPlayMovie?.(item)
    } else {
      onPlayTv?.(item, { season, episode })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleOpen}>
      <p className={styles.hint}>Or open by TMDB ID (no API key needed):</p>
      <div className={styles.row}>
        <select value={type} onChange={(e) => setType(e.target.value)} className={styles.select}>
          <option value="movie">Movie</option>
          <option value="tv">TV Series</option>
        </select>
        <input
          type="number"
          placeholder="TMDB ID (e.g. 1078605)"
          value={tmdbId}
          onChange={(e) => setTmdbId(e.target.value)}
          className={styles.input}
          min="1"
        />
        {type === 'tv' && (
          <>
            <input
              type="number"
              placeholder="S"
              value={season}
              onChange={(e) => setSeason(Number(e.target.value) || 1)}
              className={styles.num}
              min="1"
            />
            <input
              type="number"
              placeholder="E"
              value={episode}
              onChange={(e) => setEpisode(Number(e.target.value) || 1)}
              className={styles.num}
              min="1"
            />
          </>
        )}
        <button type="submit" className={styles.btn}>Watch</button>
      </div>
    </form>
  )
}
