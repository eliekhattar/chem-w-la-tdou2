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

export async function getPopularMovies(page = 1) {
  const data = await get('/movie/popular', { page })
  return data.results || []
}

export async function getTopRatedMovies(page = 1) {
  const data = await get('/movie/top_rated', { page })
  return data.results || []
}

export async function getNowPlayingMovies(page = 1) {
  const data = await get('/movie/now_playing', { page })
  return data.results || []
}

export async function getPopularTv(page = 1) {
  const data = await get('/tv/popular', { page })
  return data.results || []
}

export async function getTopRatedTv(page = 1) {
  const data = await get('/tv/top_rated', { page })
  return data.results || []
}

export async function getAiringTodayTv(page = 1) {
  const data = await get('/tv/airing_today', { page })
  return data.results || []
}

/** Discover movies by genre. Genre IDs: 28 Action, 12 Adventure, 16 Animation, 35 Comedy, 80 Crime, 99 Documentary, 18 Drama, 10751 Family, 14 Fantasy, 36 History, 27 Horror, 10402 Music, 9648 Mystery, 10749 Romance, 878 Sci-Fi, 53 Thriller, 10752 War, 37 Western */
export async function getDiscoverMovies(genreId, page = 1) {
  const data = await get('/discover/movie', { with_genres: genreId, page })
  return data.results || []
}

/** Discover TV by genre. Genre IDs: 10759 Action & Adventure, 16 Animation, 35 Comedy, 80 Crime, 99 Documentary, 18 Drama, 10751 Family, 10762 Kids, 9648 Mystery, 10765 Sci-Fi & Fantasy, 10764 Reality, etc. */
export async function getDiscoverTv(genreId, page = 1) {
  const data = await get('/discover/tv', { with_genres: genreId, page })
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
