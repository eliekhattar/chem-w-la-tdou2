import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getTrendingMovies, getTrendingTv, searchMovies, searchTv, hasApiKey } from '../api/tmdb'
import { LIVE_TV_CHANNELS } from '../api/daddylives'
import MediaCard from '../components/MediaCard'
import SearchBar from '../components/SearchBar'
import OpenByTmdbId from '../components/OpenByTmdbId'
import styles from '../App.module.css'

const SECTION_IDS = { movies: 'section-movies', series: 'section-series', liveTv: 'section-live-tv' }

// Featured live channels for home showcase (popular IDs + fill to 12)
const FEATURED_IDS = ['44', '45', '39', '51', '53', '345', '366', '52', '300', '370', '664', '425', '308']
const featured = LIVE_TV_CHANNELS.filter((ch) => FEATURED_IDS.includes(ch.id))
const fill = LIVE_TV_CHANNELS.filter((ch) => !FEATURED_IDS.includes(ch.id)).slice(0, 12 - featured.length)
const HOME_LIVE_CHANNELS = [...featured, ...fill].slice(0, 12)

export default function HomePage({
  trendingMovies,
  trendingTv,
  loadingTrending,
  searchQuery,
  searchResults,
  searching,
  handleSearch,
  handlePlayMovie,
  handlePlayTv,
}) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (scrollTo && typeof document !== 'undefined') {
      const el = document.getElementById(scrollTo)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state?.scrollTo, location.pathname, navigate])

  const watchLiveUrl = (id, source = 'tv') => `/live/watch?id=${encodeURIComponent(id)}&source=${source}`

  return (
    <>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>Welcome to KhattarHub</h1>
        {/* <p className={styles.heroTagline}>Ensa akbar Netflix</p> */}
        {hasApiKey() && (
          <div className={styles.heroSearchWrap}>
            <SearchBar onSearch={handleSearch} isLoading={searching} />
          </div>
        )}
      </div>

      {/* {!hasApiKey() && (
        <div className={styles.apiBanner}>
          <p>
            Add a <strong>TMDB API key</strong> to browse and search: run <code>npm run get-key</code> in the project folder (uses freekeys, no signup), or get your own at{' '}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">themoviedb.org</a> and set <code>VITE_TMDB_API_KEY</code> in <code>.env</code>. Then restart the dev server.
          </p>
          <OpenByTmdbId onPlayMovie={handlePlayMovie} onPlayTv={handlePlayTv} />
        </div>
      )} */}

      {searchQuery.trim() && (
        <section className={styles.searchSection}>
          <h2 className={styles.searchSectionTitle}>Search: "{searchQuery}"</h2>
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
          <section id={SECTION_IDS.movies} className={styles.section}>
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

          <section id={SECTION_IDS.series} className={styles.section}>
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

          <section id={SECTION_IDS.liveTv} className={styles.section}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitle}>Live TV & Sports</h2>
              <Link to="/live" className={styles.seeAllLink}>See all channels</Link>
            </div>
            <div className={styles.liveTvGrid}>
              {HOME_LIVE_CHANNELS.map((ch) => (
                <Link
                  key={ch.id}
                  to={watchLiveUrl(ch.id, ch.source)}
                  className={styles.liveTvCard}
                >
                  <span className={styles.liveTvCardIcon}>📺</span>
                  <span className={styles.liveTvCardName}>{ch.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

export { SECTION_IDS }
