import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import { getMovieDetails, getTvDetails } from '../api/tmdb'
import VidkingPlayer from '../components/VidkingPlayer'
import VidSrcPlayer from '../components/VidSrcPlayer'
import EpisodePicker from '../components/EpisodePicker'
import styles from '../App.module.css'

export default function WatchScreen() {
  const { type, id } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const season = Math.max(1, Number(searchParams.get('season')) || 1)
  const episode = Math.max(1, Number(searchParams.get('episode')) || 1)
  const returnTo = location.state?.returnTo ?? '/'

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('vidsrc') // 'vidsrc' | 'vidking' — main source is VidSrc

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
        <Link to={returnTo} className={styles.backBtn}>← Back to browse</Link>
        <p className={styles.empty}>Invalid watch URL.</p>
      </section>
    )
  }

  return (
    <section className={styles.watchSection}>
      <Link to={returnTo} className={styles.backBtn}>
        ← Back to browse
      </Link>
      <h1 className={styles.watchTitle}>{title}</h1>
      {isTv && (
        <EpisodePicker
          seasons={seasons}
          currentSeason={season}
          currentEpisode={episode}
          onSelect={handleEpisodeSelect}
        />
      )}
      <div className={styles.sourceRow}>
        <span className={styles.sourceLabel}>Player:</span>
        <div className={styles.sourceTabs}>
          <button
            type="button"
            className={source === 'vidsrc' ? styles.sourceTabActive : styles.sourceTab}
            onClick={() => setSource('vidsrc')}
          >
            VidSrc
          </button>
          <button
            type="button"
            className={source === 'vidking' ? styles.sourceTabActive : styles.sourceTab}
            onClick={() => setSource('vidking')}
          >
            Vidking
          </button>
        </div>
      </div>
      {source === 'vidking' && (
        <p className={styles.providerAdNotice} role="status">
          This provider may display advertisements. If other sources offer the content you want, we recommend switching to them for a better experience.
        </p>
      )}
      <div className={styles.playerWrap}>
        {source === 'vidking' ? (
          <VidkingPlayer
            type={isTv ? 'tv' : 'movie'}
            tmdbId={tmdbId}
            season={season}
            episode={episode}
            autoPlay
            nextEpisode
            episodeSelector
          />
        ) : (
          <VidSrcPlayer
            type={isTv ? 'tv' : 'movie'}
            tmdbId={tmdbId}
            season={season}
            episode={episode}
            autoplay
            autonext={isTv}
          />
        )}
      </div>
    </section>
  )
}
