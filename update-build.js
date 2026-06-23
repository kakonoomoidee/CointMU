const fs = require('fs')
const path = require('path')

/**
 * Generates a compact 8-character hexadecimal build identifier.
 * The first 5 characters are derived from the current Unix timestamp
 * in seconds (last 5 hex digits), and the remaining 3 characters are
 * cryptographically insignificant random hex digits for uniqueness.
 * @returns {string} An 8-character lowercase hex build ID.
 */
function generateBuildId() {
  const timestampHex = Math.floor(Date.now() / 1000).toString(16).slice(-5)
  const randomHex = Math.random().toString(16).substring(2, 5)
  return timestampHex + randomHex
}

/**
 * Generates a new hexadecimal build identifier and persists it to
 * the build-info.json manifest in the project root.
 * @returns {void}
 */
function updateBuildId() {
  const filePath = path.join(__dirname, 'build-info.json')
  const buildId = generateBuildId()

  fs.writeFileSync(filePath, JSON.stringify({ build: buildId }, null, 2), 'utf-8')
  console.log(`Build ID updated to ${buildId}`)
}

updateBuildId()
