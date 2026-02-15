import { Link } from 'react-router-dom'
import { searchMovies, searchTv, hasApiKey } from '../api/tmdb'
import MediaCard from '../components/MediaCard'
import SearchBar from '../components/SearchBar'
import styles from '../App.module.css'

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
  return (
    <>
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>Welcome to KhattarHub</h1>
        <p className={styles.heroTagline}>
          For the best experience and to avoid unwanted ads, we recommend using <strong style={{ color: 'red' }}>Brave Browser</strong> when visiting KhattarHub.
        </p>
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

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Live TV & Sports</h2>
            <div className={styles.liveOptionsGrid}>
              <Link to="/live?provider=cdnlive" className={styles.liveOptionCard}>
                <span className={styles.liveOptionIcon}>📺</span>
                <span className={styles.liveOptionName}>Live TV</span>
                <span className={styles.liveOptionDesc}>Premium Channels </span>
              </Link>
              <Link to="/live?provider=streamed" className={styles.liveOptionCard}>
                <span className={styles.liveOptionIcon}>⚽</span>
                <span className={styles.liveOptionName}>Live Sports</span>
                <span className={styles.liveOptionDesc}>Streamed matches & events</span>
              </Link>
              <Link to="/live?provider=iptvorg" className={styles.liveOptionCard}>
                <span className={styles.liveOptionIcon}>📡</span>
                <span className={styles.liveOptionName}>IPTV Org</span>
                <span className={styles.liveOptionDesc}>Thousands of channels worldwide</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </>
  )
}
