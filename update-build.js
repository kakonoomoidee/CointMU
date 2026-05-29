const fs = require('fs')
const path = require('path')

/**
 * Automates the tracking of application build increments prior to bundler execution.
 * @returns {void}
 */
function updateBuildNumber() {
  const filePath = path.join(__dirname, 'build-info.json')
  let currentBuild = 0

  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(data)
      if (typeof parsed.build === 'number') {
        currentBuild = parsed.build
      }
    } catch (e) {
      console.warn('Failed to parse existing build-info.json. Defaulting to 0.')
    }
  }

  currentBuild += 1
  fs.writeFileSync(filePath, JSON.stringify({ build: currentBuild }, null, 2), 'utf-8')
  console.log(`Build number updated to ${currentBuild}`)
}

updateBuildNumber()
