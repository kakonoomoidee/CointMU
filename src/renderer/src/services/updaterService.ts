/**
 * Triggers an application update check through the main process auto-updater.
 * @returns A promise resolving once the check has been dispatched.
 */
async function checkForUpdates(): Promise<void> {
  await window.api?.updater?.checkForUpdates()
}

/**
 * Quits the application and installs a downloaded update.
 * @returns A promise resolving once the install has been dispatched.
 */
async function quitAndInstall(): Promise<void> {
  await window.api?.updater?.quitAndInstall()
}

export { checkForUpdates, quitAndInstall }
