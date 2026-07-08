import { type JSX, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { type OnboardingStep, type ImportMethod } from '@/store'
import { IconBolt } from '@/assets/icons'

interface OnboardingShellProps {
  step: OnboardingStep
  importMethod: ImportMethod
  children: ReactNode
}

interface StepCopy {
  title: string
  subtitle: string
}

/**
 * Resolves the title and subtitle copy for the current onboarding step.
 * @param t - The translation function.
 * @param step - The active onboarding step.
 * @param importMethod - The selected import method, used to vary import copy.
 * @returns The title and subtitle strings for the step.
 */
function getStepCopy(t: any, step: OnboardingStep, importMethod: ImportMethod): StepCopy {
  switch (step) {
    case 'initial':
      return {
        title: t('onboarding.shell.welcomeTitle'),
        subtitle: t('onboarding.shell.welcomeSubtitle')
      }
    case 'login':
      return { title: t('onboarding.shell.welcomeBackTitle'), subtitle: t('onboarding.shell.welcomeBackSubtitle') }
    case 'create-seed':
      return {
        title: t('onboarding.shell.secretRecoveryTitle'),
        subtitle: t('onboarding.shell.secretRecoverySubtitle')
      }
    case 'create-password':
    case 'import-password':
      return {
        title: t('onboarding.shell.createPasswordTitle'),
        subtitle: t('onboarding.shell.createPasswordSubtitle')
      }
    case 'import-method':
      return {
        title: t('onboarding.shell.importWalletTitle'),
        subtitle: t('onboarding.shell.importWalletSubtitle')
      }
    case 'import-input':
      return {
        title: importMethod === 'seed' ? t('onboarding.shell.enterSeedTitle') : t('onboarding.shell.enterPrivateKeyTitle'),
        subtitle:
          importMethod === 'seed'
            ? t('onboarding.shell.enterSeedSubtitle')
            : t('onboarding.shell.enterPrivateKeySubtitle')
      }
    default:
      return { title: '', subtitle: '' }
  }
}

/**
 * Outer presentational shell for the onboarding wizard. Renders the centered
 * card, brand logo, and step-aware title and subtitle, then renders the active
 * step as its children.
 * @param props - The current step, import method, and the active step content.
 * @returns The rendered onboarding shell.
 */
function OnboardingShell({ step, importMethod, children }: OnboardingShellProps): JSX.Element {
  const { t } = useTranslation()
  const { title, subtitle } = getStepCopy(t, step, importMethod)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <div className="w-full max-w-md p-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-8">
          <IconBolt color="white" width={40} height={40} />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">{title}</h1>
        <p className="text-center text-sm font-medium text-slate-500 mb-8 leading-relaxed">
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  )
}

export { OnboardingShell, getStepCopy }
export type { OnboardingShellProps, StepCopy }
