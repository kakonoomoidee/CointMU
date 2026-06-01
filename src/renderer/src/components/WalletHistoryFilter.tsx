import { type JSX } from 'react'
import { Select, type SelectOption } from './ui'
import { HISTORY_FILTER_ALL, type HistoryFilter } from '@/store'

interface WalletHistoryFilterOption {
  address: string
  label?: string
}

interface WalletHistoryFilterProps {
  accounts: WalletHistoryFilterOption[]
  value: HistoryFilter
  onChange: (filter: HistoryFilter) => void
  className?: string
}

const ALL_WALLETS_LABEL = 'All Wallets'

/**
 * Abbreviates a wallet address for compact display in the filter dropdown.
 * @param address - The full wallet address.
 * @returns The shortened address label.
 */
function abbreviate(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Dropdown that drives the global history filter. It always offers an
 * aggregate 'All Wallets' option followed by one entry per owned wallet, so any
 * history surface can scope its data to all wallets or a single wallet.
 * @param props - The owned wallets, the current filter value, and the change handler.
 * @returns The rendered wallet history filter control.
 */
function WalletHistoryFilter({
  accounts,
  value,
  onChange,
  className
}: WalletHistoryFilterProps): JSX.Element {
  const options: SelectOption[] = [
    { value: HISTORY_FILTER_ALL, label: ALL_WALLETS_LABEL },
    ...accounts.map((account) => ({
      value: account.address,
      label: account.label || abbreviate(account.address)
    }))
  ]

  return (
    <Select
      ariaLabel="Filter history by wallet"
      value={value}
      options={options}
      onChange={onChange}
      className={className}
    />
  )
}

export { WalletHistoryFilter }
export type { WalletHistoryFilterProps }
