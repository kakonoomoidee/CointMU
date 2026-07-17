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
    <div className="w-full flex flex-col gap-4">
      {hasExistingWallet && (
        <button
          onClick={onLogin}
          className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-sm"
        >
          {t("auth.welcome.login")}
        </button>
      )}
      <button
        onClick={onCreate}
        className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
      >
        {t("auth.welcome.createNewWallet")}
      </button>
      <button
        onClick={onImport}
        className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
      >
        {t("auth.welcome.importWallet")}
      </button>
    </div>
  );
}

export { WelcomeStep };
export type { WelcomeStepProps };
