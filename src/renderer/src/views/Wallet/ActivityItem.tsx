import { type JSX } from 'react'
import { MiningIcon, SendIcon, ReceiveIcon, ContractIcon } from '@/assets/icons'

export type ActivityType = 'mining' | 'send' | 'receive' | 'contract'

export interface ActivityData {
  id: string
  type: ActivityType
  title: string
  subtitle: string
  amount: string
  timestamp: number
  timestampStr: string
  hash?: string
  from?: string
  to?: string
}

interface ActivityItemProps {
  activity: ActivityData
}

/**
 * A reusable transaction list item that renders specific visual states
 * (mining, sent, received, contract call) according to the design specifications.
 * @param props - Activity data representing the transaction.
 * @returns The rendered list item.
 */
function ActivityItem({ activity }: ActivityItemProps): JSX.Element {
  let Icon: JSX.Element
  let bgClass: string
  let amountClass: string
  let displayAmount: string

  switch (activity.type) {
    case 'mining':
      bgClass = 'bg-emerald-100 text-emerald-600'
      amountClass = 'text-emerald-500'
      displayAmount = `+${activity.amount}`
      Icon = <MiningIcon />
      break
    case 'send':
      bgClass = 'bg-orange-100 text-orange-500'
      amountClass = 'text-slate-800'
      displayAmount = `-${activity.amount}`
      Icon = <SendIcon />
      break
    case 'receive':
      bgClass = 'bg-blue-100 text-blue-500'
      amountClass = 'text-emerald-500'
      displayAmount = `+${activity.amount}`
      Icon = <ReceiveIcon />
      break
    case 'contract':
      bgClass = 'bg-purple-100 text-purple-500'
      amountClass = 'text-slate-800'
      displayAmount = `-${activity.amount}`
      Icon = <ContractIcon />
      break
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgClass}`}>
          {Icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800">{activity.title}</h4>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{activity.subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold font-mono ${amountClass}`}>
          {displayAmount} <span className="text-[10px] text-slate-400 font-sans ml-0.5">CMU</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{activity.timestampStr}</p>
      </div>
    </div>
  )
}

export { ActivityItem }
