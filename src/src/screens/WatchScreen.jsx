import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { getMovieDetails, getTvDetails } from '../api/tmdb'
import VidkingPlayer from '../components/VidkingPlayer'
import EpisodePicker from '../components/EpisodePicker'
import styles from '../App.module.css'

export default function WatchScreen() {
  const { type, id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const season = Math.max(1, Number(searchParams.get('season')) || 1)
  const episode = Math.max(1, Number(searchParams.get('episode')) || 1)

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const tmdbId = id ? Number(id) : null
  const isTv = type === 'tv'

  useEffect(() => {
    if (!tmdbId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const fetchDetails = isTv ? () => getTvDetails(tmdbId) : () => getMovieDetails(tmdbId)
    fetchDetails()
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setLoading(false))
  }, [tmdbId, isTv])

  const title = details
    ? (isTv ? details.name : details.title)
    : (loading ? 'Loading…' : 'Not found')
  const seasons = isTv && details?.seasons
    ? details.seasons.filter((s) => s.season_number >= 1)
    : []

  const handleEpisodeSelect = ({ season: s, episode: e }) => {
    setSearchParams({ season: String(s), episode: String(e) })
  }

  if (!type || !id) {
    return (
      <section className={styles.watchSection}>
        <Link to="/" className={styles.backBtn}>← Back to browse</Link>
        <p className={styles.empty}>Invalid watch URL.</p>
      </section>
    )
  }

  return (
    <section className={styles.watchSection}>
      <Link to="/" className={styles.backBtn}>
        ← Back to browse
      </Link>
      <h1 className={styles.watchTitle}>{title}</h1>
      {isTv && (
        <EpisodePicker
          key={`${season}-${episode}`}
          seasons={seasons}
          currentSeason={season}
          currentEpisode={episode}
          onSelect={handleEpisodeSelect}
        />
      )}
      <div className={styles.playerWrap}>
        <VidkingPlayer
          type={isTv ? 'tv' : 'movie'}
          tmdbId={tmdbId}
          season={season}
          episode={episode}
          autoPlay
          nextEpisode
          episodeSelector
        />
      </div>
    </section>
  )
}
