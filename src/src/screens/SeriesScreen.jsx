import { useState, useEffect, useCallback } from 'react'
import {
  getTrendingTv,
  getAiringTodayTv,
  getPopularTv,
  getTopRatedTv,
  getDiscoverTv,
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
  { key: 'trending', label: 'Trending', fetch: getTrendingTv },
  { key: 'airingToday', label: 'Airing Today', fetch: getAiringTodayTv },
  { key: 'popular', label: 'Popular', fetch: getPopularTv },
  { key: 'topRated', label: 'Top Rated', fetch: getTopRatedTv },
  { key: 'drama', label: 'Drama', fetch: (page = 1) => getDiscoverTv(18, page) },
  { key: 'comedy', label: 'Comedy', fetch: (page = 1) => getDiscoverTv(35, page) },
  { key: 'sciFiFantasy', label: 'Sci-Fi & Fantasy', fetch: (page = 1) => getDiscoverTv(10765, page) },
  { key: 'actionAdventure', label: 'Action & Adventure', fetch: (page = 1) => getDiscoverTv(10759, page) },
  { key: 'mystery', label: 'Mystery', fetch: (page = 1) => getDiscoverTv(9648, page) },
  { key: 'crime', label: 'Crime', fetch: (page = 1) => getDiscoverTv(80, page) },
  { key: 'animation', label: 'Animation', fetch: (page = 1) => getDiscoverTv(16, page) },
  { key: 'reality', label: 'Reality', fetch: (page = 1) => getDiscoverTv(10764, page) },
  { key: 'family', label: 'Family', fetch: (page = 1) => getDiscoverTv(10751, page) },
]

export default function SeriesScreen({ onPlayTv }) {
  const itemsPerPage = useItemsPerPage()
  const [featuredList, setFeaturedList] = useState([])
  const [bannerIndex, setBannerIndex] = useState(0)
  const [categories, setCategories] = useState({})
  const [categoryPages, setCategoryPages] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hasApiKey()) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getTrendingTv()
      .then((list) => {
        if (!cancelled && list.length > 0) {
          const withBackdrops = list.filter((t) => t.backdrop_path).slice(0, MAX_BANNER_ITEMS)
          setFeaturedList(withBackdrops.length > 0 ? withBackdrops : list.slice(0, MAX_BANNER_ITEMS))
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

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
        <p className={styles.empty}>Add a TMDB API key to browse series.</p>
      </section>
    )
  }

  return (
    <>
      <div className={styles.featuredBanner}>
        <div className={styles.featuredBannerViewport}>
          {featuredList.length > 0 ? (
            <div
              className={styles.featuredBannerTrack}
              style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
            >
              {featuredList.map((show) => (
                <div key={show.id} className={styles.featuredBannerSlide}>
                  <div
                    className={styles.featuredBannerSlideBackdrop}
                    style={{
                      backgroundImage: show.backdrop_path
                        ? `url(${TMDB_IMAGE_BASE_ORIGINAL}${show.backdrop_path})`
                        : 'none',
                    }}
                  />
                  <div className={styles.featuredBannerSlideContent}>
                    <h1 className={styles.featuredBannerTitle}>{show.name}</h1>
                    {show.first_air_date && (
                      <p className={styles.featuredBannerMeta}>
                        {show.first_air_date.slice(0, 4)}
                        {show.vote_average ? ` · ${show.vote_average.toFixed(1)} ★` : ''}
                      </p>
                    )}
                    <button
                      type="button"
                      className={styles.featuredBannerCta}
                      onClick={() => onPlayTv?.(show)}
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
              <p className={styles.empty}>No featured series.</p>
            </div>
          )}
        </div>
      </div>

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
                      {list.slice(p * itemsPerPage, p * itemsPerPage + itemsPerPage).map((t) => (
                        <div key={t.id} className={styles.categoryRowItem}>
                          <MediaCard item={t} type="tv" onClick={onPlayTv} />
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
