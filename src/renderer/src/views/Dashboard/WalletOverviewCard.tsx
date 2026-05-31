import { type JSX } from 'react'

interface WalletOverviewCardProps {
  balance: string
  abbrAddress: string
  activeWalletAddress: string | null
}

/**
 * Gradient hero card summarizing the active wallet: its label, abbreviated
 * address, node-reported balance, and the primary wallet quick actions.
 * @param props - The balance, abbreviated address, and full active address.
 * @returns The rendered wallet overview card.
 */
function WalletOverviewCard({
  balance,
  abbrAddress,
  activeWalletAddress
}: WalletOverviewCardProps): JSX.Element {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-7 text-white relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/5 blur-sm" />
      <div className="absolute -right-4 -bottom-8 w-40 h-40 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M22 10H2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">Main wallet</p>
              <p
                className="text-xs text-white/60 font-mono"
                title={activeWalletAddress || undefined}
              >
                {abbrAddress}
              </p>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white/90 hover:bg-white/25 transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-bold tracking-tight">{balance}</span>
            <span className="text-lg font-semibold text-white/70">CMU</span>
          </div>
          <p className="text-sm text-white/50 mt-1">Balance from node</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="17 11 12 6 7 11" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
            Send
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7 13 12 18 17 13" />
              <line x1="12" y1="6" x2="12" y2="18" />
            </svg>
            Receive
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Stake
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-white hover:bg-white/25 transition-colors">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Mining live
          </button>
        </div>
      </div>
    </div>
  )
}

export { WalletOverviewCard }
export type { WalletOverviewCardProps }
