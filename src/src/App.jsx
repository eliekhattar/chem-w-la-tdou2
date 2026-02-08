import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { getTrendingMovies, getTrendingTv, searchMovies, searchTv, hasApiKey } from './api/tmdb'
import MediaCard from './components/MediaCard'
import SearchBar from './components/SearchBar'
import OpenByTmdbId from './components/OpenByTmdbId'
import WatchScreen from './screens/WatchScreen'
import styles from './App.module.css'
import logo from '../../src/assets/Klogo.png'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isBrowse = location.pathname === '/' || location.pathname === ''

  const [trendingMovies, setTrendingMovies] = useState([])
  const [trendingTv, setTrendingTv] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ movies: [], tv: [] })
  const [searching, setSearching] = useState(false)
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
    navigate(`/watch/movie/${item.id}`)
  }

  const handlePlayTv = (item, opts = {}) => {
    const s = opts.season ?? 1
    const e = opts.episode ?? 1
    navigate(`/watch/tv/${item.id}?season=${s}&episode=${e}`)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <button type="button" className={styles.logo} onClick={() => navigate('/')}>
          <img src={logo} alt="KhattarHub" className={styles.logoImg} />
          <span className={styles.logoText}>KhattarHub</span>
        </button>
        {isBrowse && (
          <div className={styles.searchWrap}>
            <SearchBar onSearch={handleSearch} isLoading={searching} />
          </div>
        )}
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/watch/:type/:id" element={<WatchScreen />} />
          <Route path="/" element={
          <>
            <div className={styles.heroBanner}>
              <h1 className={styles.heroTitle}>Welcome to KhattarHub</h1>
              <p className={styles.heroTagline}>Ensa akbar Netflix</p>
            </div>
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
              <section className={styles.searchSection}>
                <h2 className={styles.searchSectionTitle}>Search: “{searchQuery}”</h2>
                {(searchResults.movies.length > 0 || searchResults.tv.length > 0) ? (
                  <>
                    {searchResults.movies.length > 0 && (
                      <div className={styles.searchCategory}>
                        <h3 className={styles.searchCategoryTitle}>Movies</h3>
                        <div className={styles.cardGrid}>
                          {searchResults.movies.map((m) => (
                            <MediaCard key={`m-${m.id}`} item={m} type="movie" onClick={handlePlayMovie} />
                          ))}
                        </div>
                      </div>
                    )}
                    {searchResults.tv.length > 0 && (
                      <div className={styles.searchCategory}>
                        <h3 className={styles.searchCategoryTitle}>TV Series</h3>
                        <div className={styles.cardGrid}>
                          {searchResults.tv.map((t) => (
                            <MediaCard key={`t-${t.id}`} item={t} type="tv" onClick={handlePlayTv} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  !searching && <p className={styles.empty}>No results.</p>
                )}
              </section>
            )}

            {hasApiKey() && !searchQuery.trim() && (
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
          } />
        </Routes>
      </main>
    </div>
  )
}
