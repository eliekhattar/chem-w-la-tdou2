/**
 * Fetches a free TMDB API key via the freekeys package and writes it to .env.local
 * so site2 (StreamHub) can use it without TMDB signup.
 * Run: npm run get-key
 */
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')

async function main() {
  const freekeys = require('freekeys')
  try {
    const params = await freekeys()
    const tmdbKey = params?.tmdb_key || params?.tmdbKey
    if (!tmdbKey) {
      console.error('freekeys did not return a TMDB key:', params)
      process.exit(1)
    }
    const line = `VITE_TMDB_API_KEY=${tmdbKey}\n`
    fs.writeFileSync(envPath, line, 'utf8')
    console.log('Wrote VITE_TMDB_API_KEY to .env.local (use with npm run dev:site2)')
  } catch (err) {
    console.error('Failed to get key:', err.message)
    process.exit(1)
  }
}

main()
