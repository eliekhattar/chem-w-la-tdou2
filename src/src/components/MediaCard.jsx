import { TMDB_IMAGE_BASE } from '../config'
import styles from './MediaCard.module.css'

export default function MediaCard({ item, type = 'movie', onClick }) {
  const title = type === 'movie' ? item.title : item.name
  const subtitle = type === 'movie'
    ? (item.release_date ? item.release_date.slice(0, 4) : '')
    : (item.first_air_date ? item.first_air_date.slice(0, 4) : '')
  const poster = item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null

  return (
    <button type="button" className={styles.card} onClick={() => onClick?.(item)}>
      <div className={styles.posterWrap}>
        {poster ? (
          <img src={poster} alt="" className={styles.poster} loading="lazy" />
        ) : (
          <div className={styles.noPoster}>{title?.slice(0, 2) || '?'}</div>
        )}
        <div className={styles.overlay}>
          <span className={styles.playIcon}>▶</span>
          <span className={styles.playText}>Watch</span>
        </div>
      </div>
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </button>
  )
}
