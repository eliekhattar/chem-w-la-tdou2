import { useState, useEffect } from 'react'
import { getTrendingMovies, getTrendingTv, searchMovies, searchTv, getTvDetails, hasApiKey } from './api/tmdb'
import VidkingPlayer from './components/VidkingPlayer'
import MediaCard from './components/MediaCard'
import SearchBar from './components/SearchBar'
import EpisodePicker from './components/EpisodePicker'
import OpenByTmdbId from './components/OpenByTmdbId'
import styles from './App.module.css'

export default function App() {
  const [view, setView] = useState('browse')
  const [watching, setWatching] = useState(null)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTv, setTrendingTv] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ movies: [], tv: [] })
  const [searching, setSearching] = useState(false)
  const [tvDetails, setTvDetails] = useState(null)
  const [loadingTrending, setLoadingTrending] = useState(true)

  useEffect(() => {
    if (!hasApiKey()) {
      setLoadingTrending(false)
      return
    }
    let cancelled = false
    setLoadingTrending(true)
    Promise.all([getTrendingMovies(), getTrendingTv()])
      .then(([movies, tv]) => {
        if (!cancelled) {
          setTrendingMovies(movies)
          setTrendingTv(tv)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingTrending(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (watching?.type === 'tv' && watching?.item?.id) {
      getTvDetails(watching.item.id).then(setTvDetails).catch(() => setTvDetails(null))
    } else {
      setTvDetails(null)
    }
  }, [watching?.type, watching?.item?.id])

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults({ movies: [], tv: [] })
      return
    }
    if (!hasApiKey()) return
    setSearching(true)
    Promise.all([searchMovies(query), searchTv(query)])
      .then(([movies, tv]) => setSearchResults({ movies, tv }))
      .finally(() => setSearching(false))
  }

  const handlePlayMovie = (item) => {
    setWatching({ type: 'movie', item, season: 1, episode: 1 })
    setView('watch')
  }

  const handlePlayTv = (item, opts = {}) => {
    setWatching({ type: 'tv', item, season: opts.season ?? 1, episode: opts.episode ?? 1 })
    setView('watch')
  }

  const handleEpisodeSelect = ({ season, episode }) => {
    setWatching((prev) => prev ? { ...prev, season, episode } : null)
  }

  const seasons = tvDetails?.seasons?.filter((s) => s.season_number >= 1) ?? []

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button type="button" className={styles.logo} onClick={() => { setView('browse'); setWatching(null) }}>
          🎬 KhattarHub
        </button>
        {view === 'browse' && (
          <div className={styles.searchWrap}>
            <SearchBar onSearch={handleSearch} isLoading={searching} />
          </div>
        )}
      </header>

      <main className={styles.main}>
        {view === 'watch' && watching && (
          <section className={styles.watchSection}>
            <button type="button" className={styles.backBtn} onClick={() => setView('browse')}>
              ← Back to browse
            </button>
            <h1 className={styles.watchTitle}>
              {watching.type === 'movie' ? watching.item.title : watching.item.name}
            </h1>
            {watching.type === 'tv' && (
              <EpisodePicker
                seasons={seasons}
                currentSeason={watching.season}
                currentEpisode={watching.episode}
                onSelect={handleEpisodeSelect}
              />
            )}
            <div className={styles.playerWrap}>
              <VidkingPlayer
                type={watching.type}
                tmdbId={watching.item.id}
                season={watching.season}
                episode={watching.episode}
                autoPlay
                nextEpisode
                episodeSelector
              />
            </div>
          </section>
        )}

        {view === 'browse' && (
          <>
            {!hasApiKey() && (
              <div className={styles.apiBanner}>
                <p>
                  Add a <strong>TMDB API key</strong> to browse and search: run <code>npm run get-key</code> in the project folder (uses freekeys, no signup), or get your own at{' '}
                  <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">themoviedb.org</a> and set <code>VITE_TMDB_API_KEY</code> in <code>.env</code>. Then restart the dev server.
                </p>
                <OpenByTmdbId onPlayMovie={handlePlayMovie} onPlayTv={handlePlayTv} />
              </div>
            )}

            {searchQuery.trim() && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Search: “{searchQuery}”</h2>
                {(searchResults.movies.length > 0 || searchResults.tv.length > 0) ? (
                  <>
                    {searchResults.movies.length > 0 && (
                      <div className={styles.cardGrid}>
                        {searchResults.movies.map((m) => (
                          <MediaCard key={`m-${m.id}`} item={m} type="movie" onClick={handlePlayMovie} />
                        ))}
                      </div>
                    )}
                    {searchResults.tv.length > 0 && (
                      <div className={styles.cardGrid}>
                        {searchResults.tv.map((t) => (
                          <MediaCard key={`t-${t.id}`} item={t} type="tv" onClick={handlePlayTv} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  !searching && <p className={styles.empty}>No results.</p>
                )}
              </section>
            )}

            {hasApiKey() && (
              <>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Trending Movies</h2>
                  {loadingTrending ? (
                    <div className={styles.loading}>Loading…</div>
                  ) : (
                    <div className={styles.cardGrid}>
                      {trendingMovies.slice(0, 12).map((m) => (
                        <MediaCard key={m.id} item={m} type="movie" onClick={handlePlayMovie} />
                      ))}
                    </div>
                  )}
                </section>
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Trending TV Series</h2>
                  {loadingTrending ? (
                    <div className={styles.loading}>Loading…</div>
                  ) : (
                    <div className={styles.cardGrid}>
                      {trendingTv.slice(0, 12).map((t) => (
                        <MediaCard key={t.id} item={t} type="tv" onClick={handlePlayTv} />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
