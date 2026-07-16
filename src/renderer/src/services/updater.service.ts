/**
 * Triggers an application update check through the main process auto-updater.
 * @returns A promise resolving once the check has been dispatched.
 */
async function checkForUpdates(): Promise<void> {
  await window.api?.updater?.check()
}

/**
 * Starts downloading the available update through the main process auto-updater.
 * @returns A promise resolving once the download has been dispatched.
 */
async function downloadUpdate(): Promise<void> {
  await window.api?.updater?.download()
}

/**
 * Quits the application and installs the downloaded update.
 * @returns A promise resolving once the install has been dispatched.
 */
async function installUpdate(): Promise<void> {
  await window.api?.updater?.install()
}

export { checkForUpdates, downloadUpdate, installUpdate }
