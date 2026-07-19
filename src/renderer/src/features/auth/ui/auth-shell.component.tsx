import { type JSX, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type AuthStep, type ImportMethod } from "../model/auth.store";
import { Zap } from "lucide-react";

interface AuthShellProps {
  step: AuthStep;
  importMethod: ImportMethod;
  children: ReactNode;
}

interface StepCopy {
  title: string;
  subtitle: string;
}

/**
 * Resolves the title and subtitle copy for the current AuthFlow step.
 * @param t - The translation function.
 * @param step - The active AuthFlow step.
 * @param importMethod - The selected import method, used to vary import copy.
 * @returns The title and subtitle strings for the step.
 */
function getStepCopy(
  t: any,
  step: AuthStep,
  importMethod: ImportMethod,
): StepCopy {
  switch (step) {
    case "initial":
      return {
        title: t("auth.shell.welcomeTitle"),
        subtitle: t("auth.shell.welcomeSubtitle"),
      };
    case "login":
      return {
        title: t("auth.shell.welcomeBackTitle"),
        subtitle: t("auth.shell.welcomeBackSubtitle"),
      };
    case "create-seed":
      return {
        title: t("auth.shell.secretRecoveryTitle"),
        subtitle: t("auth.shell.secretRecoverySubtitle"),
      };
    case "create-password":
    case "import-password":
      return {
        title: t("auth.shell.createPasswordTitle"),
        subtitle: t("auth.shell.createPasswordSubtitle"),
      };
    case "import-method":
      return {
        title: t("auth.shell.importWalletTitle"),
        subtitle: t("auth.shell.importWalletSubtitle"),
      };
    case "import-input":
      return {
        title:
          importMethod === "seed"
            ? t("auth.shell.enterSeedTitle")
            : t("auth.shell.enterPrivateKeyTitle"),
        subtitle:
          importMethod === "seed"
            ? t("auth.shell.enterSeedSubtitle")
            : t("auth.shell.enterPrivateKeySubtitle"),
      };
    default:
      return { title: "", subtitle: "" };
  }
}

/**
 * Outer presentational shell for the AuthFlow wizard. Renders the centered
 * card, brand logo, and step-aware title and subtitle, then renders the active
 * step as its children.
 * @param props - The current step, import method, and the active step content.
 * @returns The rendered AuthFlow shell.
 */
function AuthShell({
  step,
  importMethod,
  children,
}: AuthShellProps): JSX.Element {
  const { t } = useTranslation();
  const { title, subtitle } = getStepCopy(t, step, importMethod);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white'>
      <div className='w-full max-w-md p-10 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-sm flex flex-col items-center'>
        <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md mb-8'>
          <Zap color='white' width={40} height={40} />
        </div>

        <h1 className='text-2xl font-bold tracking-tight mb-2 text-center text-gray-900 dark:text-white'>
          {title}
        </h1>
        <p className='text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}

export { AuthShell, getStepCopy };
export type { AuthShellProps, StepCopy };
