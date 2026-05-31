import { type JSX } from "react";
import { type BlockData } from "@/hooks";
import { useAppStore } from "@/store";
import { IconChevronRight, IconSquare, IconCube } from "@/assets/icons";
import { formatRelativeAge } from "@/utils";

interface LatestBlocksProps {
  isConnected: boolean;
  recentBlocks: BlockData[];
  activeWalletAddress: string | null;
  onViewAll: () => void;
}

/**
 * Latest blocks panel listing the most recent blocks mined across the network,
 * flagging blocks credited to the active wallet.
 * @param props - Connection state, recent blocks, active address, and the
 * view-all navigation handler.
 * @returns The rendered latest blocks panel.
 */
function LatestBlocks({
  isConnected,
  recentBlocks,
  onViewAll,
}: LatestBlocksProps): JSX.Element {
  const balances = useAppStore((s) => s.balances);

  const checkIfMinedByMe = (
    minerAddress: string,
    balancesMap: Record<string, string>,
  ): boolean => {
    if (!minerAddress || !balancesMap) return false;
    const allMyAddresses = Object.keys(balancesMap).map((addr) =>
      addr.toLowerCase(),
    );
    return allMyAddresses.includes(minerAddress.toLowerCase());
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800">Latest blocks</h3>
        <button
          onClick={onViewAll}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-0.5"
        >
          View all
          <IconChevronRight width={10} height={10} strokeWidth={3} />
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mb-4">
        Mined across the network
      </p>

      <div className="space-y-0">
        {(isConnected ? recentBlocks : []).slice(0, 10).map((block) => (
          <div
            key={block.hash}
            className="flex items-center justify-between py-3.5 border-t border-slate-100 first:border-t-0 hover:bg-slate-50/50 transition-colors px-2 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <IconSquare className="text-blue-500" width={14} height={14} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    #{block.number}
                  </span>
                  {checkIfMinedByMe(block.miner, balances) && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +2 CMU mined
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {block.hash.substring(0, 10)}...
                  {block.hash.substring(block.hash.length - 8)} -{" "}
                  {block.txCount} txs
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {formatRelativeAge(block.timestamp)}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {block.miner.substring(0, 8)}...
              </p>
            </div>
          </div>
        ))}

        {isConnected && recentBlocks.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center">
            <IconCube
              className="text-slate-300 mb-2"
              width={28}
              height={28}
              strokeWidth={1.5}
            />
            <p className="text-sm font-medium text-slate-400">
              Awaiting network blocks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { LatestBlocks };
export type { LatestBlocksProps };
