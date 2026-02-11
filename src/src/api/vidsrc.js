import { VIDSRC_EMBED_BASE } from '../config'

/**
 * Build VidSrc embed URL per https://vidsrcme.ru/api/
 * Movies: /embed/movie?tmdb=...
 * TV episode: /embed/tv?tmdb=...&season=...&episode=...
 * Params: tmdb (we use TMDB IDs), optional sub_url, ds_lang, autoplay, autonext (tv)
 */
export function buildVidSrcEmbedUrl({ type, tmdbId, season = 1, episode = 1, autoplay = true, autonext = false, dsLang }) {
  const params = new URLSearchParams()
  params.set('tmdb', String(tmdbId))
  if (type === 'tv') {
    params.set('season', String(season))
    params.set('episode', String(episode))
    params.set('autoplay', autoplay ? '1' : '0')
    params.set('autonext', autonext ? '1' : '0')
  } else {
    params.set('autoplay', autoplay ? '1' : '0')
  }
  if (dsLang) params.set('ds_lang', dsLang)

  const path = type === 'tv' ? '/embed/tv' : '/embed/movie'
  return `${VIDSRC_EMBED_BASE}${path}?${params.toString()}`
}
