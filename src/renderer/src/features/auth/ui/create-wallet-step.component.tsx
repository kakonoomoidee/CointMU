import { type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../model/auth.store";
import { Check, Copy, AlertTriangle } from "lucide-react";

interface CreateWalletStepProps {
  onCopySeed: () => void;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * Wallet creation step displaying the generated 12-word recovery phrase with a
 * copy control and an offline-storage warning. The mnemonic and copied flag are
 * read from the AuthFlow store.
 * @param props - The copy, continue, and back navigation handlers.
 * @returns The rendered create wallet step.
 */
function CreateWalletStep({
  onCopySeed,
  onContinue,
  onBack,
}: CreateWalletStepProps): JSX.Element {
  const { t } = useTranslation();
  const mnemonic = useAuthStore((s) => s.mnemonic);
  const copied = useAuthStore((s) => s.copied);

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='relative'>
        <div className='grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800'>
          {mnemonic.split(' ').map((word, index) => (
            <div
              key={index}
              className='flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-100 dark:border-gray-800'
            >
              <span className='text-xs text-gray-400 dark:text-gray-500 font-mono select-none w-4'>
                {index + 1}.
              </span>
              <span className='text-sm font-semibold text-gray-800 dark:text-white font-mono'>
                {word}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onCopySeed}
          className='absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-sm text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors'
        >
          {copied ? (
            <>
              <Check
                className='text-emerald-500'
                width={14}
                height={14}
                strokeWidth={2.5}
              />
              {t('auth.createWallet.copied')}
            </>
          ) : (
            <>
              <Copy width={14} height={14} />
              {t('auth.createWallet.copy')}
            </>
          )}
        </button>
      </div>

      <div className='p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-3 items-start'>
        <AlertTriangle
          className='text-amber-500 shrink-0 mt-0.5'
          width={16}
          height={16}
          strokeWidth={2.5}
        />
        <p className='text-xs text-amber-800 dark:text-amber-500 font-medium'>
          {t('auth.createWallet.warning')}
        </p>
      </div>

      <div className='flex gap-3'>
        <button
          onClick={onBack}
          className='flex-1 py-3.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
        >
          {t('auth.createWallet.back')}
        </button>
        <button
          onClick={onContinue}
          className='flex-[2] py-3.5 bg-accent text-white rounded-xl text-sm font-bold hover:opacity-80 transition-colors shadow-sm'
        >
          {t('auth.createWallet.savedWords')}
        </button>
      </div>
    </div>
  );
}

export { CreateWalletStep };
export type { CreateWalletStepProps };
