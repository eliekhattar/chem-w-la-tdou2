/**
 * One-time script: reads daddylivesChannels.html and writes src/src/data/daddylivesChannels.json
 * Run: node scripts/extract-daddylives-channels.cjs
 */

const fs = require('fs')
const path = require('path')

const htmlPath = path.join(__dirname, '..', 'daddylivesChannels.html')
const outPath = path.join(__dirname, '..', 'src', 'src', 'data', 'daddylivesChannels.json')

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

const html = fs.readFileSync(htmlPath, 'utf8')
const channels = []
const itemRegex = /<div class="grid-item"[^>]*data-channel-id="([^"]+)"[^>]*>[\s\S]*?<strong>([^<]*)<\/strong>/gi
let m
while ((m = itemRegex.exec(html)) !== null) {
  const id = m[1].trim()
  const name = decodeHtmlEntities(m[2])
  if (id && name) channels.push({ id, name })
}

const data = { source: 'daddylives', channels }
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(data, null, 0), 'utf8')
console.log(`Wrote ${channels.length} channels to ${outPath}`)
