import { useState, useEffect, useCallback } from 'react'
import {
  getTrendingMovies,
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getDiscoverMovies,
  hasApiKey,
} from '../api/tmdb'
import { TMDB_IMAGE_BASE_ORIGINAL } from '../config'
import MediaCard from '../components/MediaCard'
import styles from '../App.module.css'

const ITEMS_PER_PAGE_DESKTOP = 8
const ITEMS_PER_PAGE_MOBILE = 4
const MOBILE_BREAKPOINT_PX = 600
const BANNER_INTERVAL_MS = 5000
const MAX_BANNER_ITEMS = 5

function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches
      ? ITEMS_PER_PAGE_MOBILE
      : ITEMS_PER_PAGE_DESKTOP
  )
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`)
    const update = () => setItemsPerPage(mql.matches ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP)
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])
  return itemsPerPage
}

const CATEGORIES = [
  { key: 'trending', label: 'Trending', fetch: getTrendingMovies },
  { key: 'nowPlaying', label: 'Now in Theaters', fetch: getNowPlayingMovies },
  { key: 'popular', label: 'Popular', fetch: getPopularMovies },
  { key: 'topRated', label: 'Top Rated', fetch: getTopRatedMovies },
  { key: 'action', label: 'Action', fetch: (page = 1) => getDiscoverMovies(28, page) },
  { key: 'comedy', label: 'Comedy', fetch: (page = 1) => getDiscoverMovies(35, page) },
  { key: 'drama', label: 'Drama', fetch: (page = 1) => getDiscoverMovies(18, page) },
  { key: 'horror', label: 'Horror', fetch: (page = 1) => getDiscoverMovies(27, page) },
  { key: 'sciFi', label: 'Sci-Fi', fetch: (page = 1) => getDiscoverMovies(878, page) },
  { key: 'romance', label: 'Romance', fetch: (page = 1) => getDiscoverMovies(10749, page) },
  { key: 'thriller', label: 'Thriller', fetch: (page = 1) => getDiscoverMovies(53, page) },
  { key: 'adventure', label: 'Adventure', fetch: (page = 1) => getDiscoverMovies(12, page) },
  { key: 'animation', label: 'Animation', fetch: (page = 1) => getDiscoverMovies(16, page) },
]

export default function MoviesScreen({ onPlayMovie }) {
  const itemsPerPage = useItemsPerPage()
  const [featuredList, setFeaturedList] = useState([])
  const [bannerIndex, setBannerIndex] = useState(0)
  const [categories, setCategories] = useState({})
  const [categoryPages, setCategoryPages] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch up to 5 featured (now playing with backdrop)
  useEffect(() => {
    if (!hasApiKey()) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getNowPlayingMovies(1)
      .then((list) => {
        if (!cancelled && list.length > 0) {
          const withBackdrops = list.filter((m) => m.backdrop_path).slice(0, MAX_BANNER_ITEMS)
          setFeaturedList(withBackdrops.length > 0 ? withBackdrops : list.slice(0, MAX_BANNER_ITEMS))
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Auto-rotate banner
  useEffect(() => {
    if (featuredList.length <= 1) return
    const id = setInterval(() => {
      setBannerIndex((i) => (i + 1) % featuredList.length)
    }, BANNER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [featuredList.length])

  useEffect(() => {
    if (!hasApiKey()) return
    CATEGORIES.forEach(({ key, fetch: fetchFn }) => {
      fetchFn(1).then((list) => {
        setCategories((prev) => ({ ...prev, [key]: list }))
      }).catch(() => {})
    })
  }, [])

  const setPage = useCallback((key, delta, listLength) => {
    setCategoryPages((prev) => {
      const numPages = Math.max(1, Math.ceil((listLength || 0) / itemsPerPage))
      const current = prev[key] ?? 0
      const next = Math.max(0, Math.min(numPages - 1, current + delta))
      return { ...prev, [key]: next }
    })
  }, [itemsPerPage])

  if (!hasApiKey()) {
    return (
      <section className={styles.section}>
        <p className={styles.empty}>Add a TMDB API key to browse movies.</p>
      </section>
    )
  }

  return (
    <>
      {/* Banner carousel: up to 5 items, infinite auto-rotate */}
      <div className={styles.featuredBanner}>
        <div className={styles.featuredBannerViewport}>
          {featuredList.length > 0 ? (
            <div
              className={styles.featuredBannerTrack}
              style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
            >
              {featuredList.map((movie) => (
                <div key={movie.id} className={styles.featuredBannerSlide}>
                  <div
                    className={styles.featuredBannerSlideBackdrop}
                    style={{
                      backgroundImage: movie.backdrop_path
                        ? `url(${TMDB_IMAGE_BASE_ORIGINAL}${movie.backdrop_path})`
                        : 'none',
                    }}
                  />
                  <div className={styles.featuredBannerSlideContent}>
                    <h1 className={styles.featuredBannerTitle}>{movie.title}</h1>
                    {movie.release_date && (
                      <p className={styles.featuredBannerMeta}>
                        {movie.release_date.slice(0, 4)}
                        {movie.vote_average ? ` · ${movie.vote_average.toFixed(1)} ★` : ''}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.featuredBannerCta}
                      onClick={() => onPlayMovie?.(movie)}
                    >
                      ▶ Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className={styles.featuredBannerSlideContent}>
              <p className={styles.loading}>Loading featured…</p>
            </div>
          ) : (
            <div className={styles.featuredBannerSlideContent}>
              <p className={styles.empty}>No featured movie.</p>
            </div>
          )}
        </div>
      </div>

      {/* Category rows: horizontal slider with next/back (4 per page on mobile, 8 on desktop) */}
      {CATEGORIES.map(({ key, label }) => {
        const list = categories[key] || []
        const numPages = Math.max(1, Math.ceil(list.length / itemsPerPage))
        const page = Math.min(categoryPages[key] ?? 0, numPages - 1)

        return (
          <section key={key} className={styles.categoryRow}>
            <div className={styles.categoryRowHeader}>
              <h2 className={styles.categoryRowTitle}>{label}</h2>
              <div className={styles.categoryRowNav}>
                <button
                  type="button"
                  className={styles.categoryRowNavBtn}
                  aria-label="Previous"
                  disabled={page <= 0 || list.length === 0}
                  onClick={() => setPage(key, -1, list.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={styles.categoryRowNavBtn}
                  aria-label="Next"
                  disabled={page >= numPages - 1 || list.length === 0}
                  onClick={() => setPage(key, 1, list.length)}
                >
                  ›
                </button>
              </div>
            </div>
            {!list.length ? (
              <div className={styles.loading}>Loading…</div>
            ) : (
              <div className={styles.categoryRowViewport}>
                <div
                  className={styles.categoryRowTrack}
                  style={{
                    width: `${numPages * 100}%`,
                    transform: `translateX(-${(page / numPages) * 100}%)`,
                    '--category-pages': numPages,
                    '--items-per-page': itemsPerPage,
                  }}
                >
                  {Array.from({ length: numPages }, (_, p) => (
                    <div key={p} className={styles.categoryRowPage}>
                      {list.slice(p * itemsPerPage, p * itemsPerPage + itemsPerPage).map((m) => (
                        <div key={m.id} className={styles.categoryRowItem}>
                          <MediaCard item={m} type="movie" onClick={onPlayMovie} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </>
  )
}
