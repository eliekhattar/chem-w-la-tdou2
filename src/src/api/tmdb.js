import { TMDB_API_BASE, TMDB_API_KEY } from '../config'

function get(path, params = {}) {
  const url = new URL(TMDB_API_BASE + path)
  url.searchParams.set('api_key', TMDB_API_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  return fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error('TMDB request failed'))))
}

export async function getTrendingMovies() {
  const data = await get('/trending/movie/day')
  return data.results || []
}

export async function getTrendingTv() {
  const data = await get('/trending/tv/day')
  return data.results || []
}

export async function searchMovies(query) {
  if (!query.trim()) return []
  const data = await get('/search/movie', { query: query.trim() })
  return data.results || []
}

export async function searchTv(query) {
  if (!query.trim()) return []
  const data = await get('/search/tv', { query: query.trim() })
  return data.results || []
}

export async function getMovieDetails(id) {
  return get(`/movie/${id}`)
}

export async function getTvDetails(id) {
  return get(`/tv/${id}`)
}

export function hasApiKey() {
  return Boolean(TMDB_API_KEY)
}
