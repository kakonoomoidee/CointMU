import { type JSX } from "react";
import { useTranslation } from "react-i18next";

interface WelcomeStepProps {
  hasExistingWallet: boolean;
  onLogin: () => void;
  onCreate: () => void;
  onImport: () => void;
}

/**
 * Initial AuthFlow step presenting the entry actions: unlock an existing
 * wallet (when one is present), create a new wallet, or import an existing one.
 * @param props - Whether a stored wallet exists and the entry action handlers.
 * @returns The rendered welcome step.
 */
function WelcomeStep({
  hasExistingWallet,
  onLogin,
  onCreate,
  onImport,
}: WelcomeStepProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className='w-full flex flex-col gap-4'>
      {hasExistingWallet && (
        <button
          onClick={onLogin}
          className='w-full py-3.5 bg-gray-800 dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors shadow-sm'
        >
          {t('auth.welcome.login')}
        </button>
      )}
      <button
        onClick={onCreate}
        className='w-full py-3.5 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-80 transition-colors shadow-sm'
      >
        {t('auth.welcome.createNewWallet')}
      </button>
      <button
        onClick={onImport}
        className='w-full py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm'
      >
        {t('auth.welcome.importWallet')}
      </button>
    </div>
  );
}

export { WelcomeStep };
export type { WelcomeStepProps };
