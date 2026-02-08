import { useState } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ onSearch, placeholder = 'Search movies & series...', isLoading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(query.trim())
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <span className={styles.icon} aria-hidden>🔍</span>
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        aria-label="Search"
      />
      <button type="submit" className={styles.btn} disabled={isLoading}>
        {isLoading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}
