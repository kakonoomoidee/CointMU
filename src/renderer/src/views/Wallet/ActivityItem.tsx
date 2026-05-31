import { type JSX } from 'react'

export type ActivityType = 'mining' | 'send' | 'receive' | 'contract'

export interface ActivityData {
  id: string
  type: ActivityType
  title: string
  subtitle: string
  amount: string
  timestampStr: string
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
  let textClass: string
  let amountClass: string
  let displayAmount: string

  switch (activity.type) {
    case 'mining':
      bgClass = 'bg-emerald-100 text-emerald-600'
      textClass = 'text-emerald-500'
      amountClass = 'text-emerald-500'
      displayAmount = `+${activity.amount}`
      Icon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
      break
    case 'send':
      bgClass = 'bg-orange-100 text-orange-500'
      textClass = 'text-slate-800'
      amountClass = 'text-slate-800'
      displayAmount = `-${activity.amount}`
      Icon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      )
      break
    case 'receive':
      bgClass = 'bg-blue-100 text-blue-500'
      textClass = 'text-emerald-500'
      amountClass = 'text-emerald-500'
      displayAmount = `+${activity.amount}`
      Icon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      )
      break
    case 'contract':
      bgClass = 'bg-purple-100 text-purple-500'
      textClass = 'text-slate-800'
      amountClass = 'text-slate-800'
      displayAmount = `-${activity.amount}`
      Icon = (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
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
