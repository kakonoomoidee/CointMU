import {
  useState,
  useEffect,
  useRef,
  type JSX,
  type SyntheticEvent,
} from "react";
import { ethers } from "ethers";
import {
  TokenService,
  type TokenInfo,
} from '@/features/wallet';
import { X, AlertCircle } from "lucide-react";

interface AddTokenModalProps {
  onClose: () => void;
  onTokenAdded: () => void;
}

/**
 * Overlay modal that allows the user to import a custom ERC-20 token by
 * contract address. Validates the address format, probes the network for
 * token metadata, persists the result, then closes itself on success.
 * The backdrop and the close button both dismiss the modal.
 * @param props - The close handler and the post-addition refresh callback.
 * @returns The rendered modal overlay.
 */
function AddTokenModal({
  onClose,
  onTokenAdded,
}: AddTokenModalProps): JSX.Element {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: SyntheticEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!address) {
      setError("Please enter a token contract address.");
      return;
    }

    if (!ethers.isAddress(address)) {
      setError("Invalid Ethereum address format.");
      return;
    }

    setIsLoading(true);

    try {
      const details = await TokenService.fetchTokenDetails(address);
      if (!details || !details.symbol) {
        setError(
          "Could not fetch token details. Ensure it is a valid ERC-20 contract on this network.",
        );
        setIsLoading(false);
        return;
      }

      TokenService.addToken(details as TokenInfo);
      onTokenAdded();
      onClose();
    } catch {
      setError("An error occurred while adding the token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X width={20} height={20} strokeWidth={2.5} />
        </button>

        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Add Custom Token
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Enter the contract address of the ERC-20 token you want to track.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Token Contract Address
              </label>
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100">
                <AlertCircle
                  width={14}
                  height={14}
                  className="flex-shrink-0 mt-0.5"
                />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !address}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Add Token"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export { AddTokenModal };
export type { AddTokenModalProps };
