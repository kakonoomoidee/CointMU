import { useState, type JSX } from 'react'
import { IconDownload, IconBox } from '@/assets/icons'

/**
 * Settings view panel that allows the user to export the bundled companion
 * Chrome extension as a ZIP archive. The file is copied directly from the
 * local resources folder to a user-selected destination via an IPC bridge.
 * @returns {JSX.Element} The rendered settings panel component.
 */
function ExternalSourceSettings(): JSX.Element {
  const [isExporting, setIsExporting] = useState(false)

  /**
   * Triggers the IPC call to open the native save dialog and copy the
   * extension.zip file to the selected destination.
   * @returns {Promise<void>}
   */
  const handleExport = async (): Promise<void> => {
    setIsExporting(true)
    try {
      await window.api.exportExtensionZip()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">External Sources</h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Manage integrations and standalone companions for your CointMU wallet.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
          <IconBox width={24} height={24} className="text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800">Companion Browser Extension</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
            This standalone extension bridges external dApps to your desktop node. Download the bundled ZIP file and load it unpacked into your browser to enable Web3 connectivity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void handleExport() }}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconDownload width={16} height={16} />
          {isExporting ? 'Saving...' : 'Download ZIP'}
        </button>
      </div>
    </div>
  )
}

export { ExternalSourceSettings }
