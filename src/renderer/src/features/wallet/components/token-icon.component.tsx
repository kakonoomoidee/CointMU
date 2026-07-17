import { type JSX } from "react";
import { getTokenGradient, getTokenInitials } from "../utils/token-icon.util";

interface TokenIconProps {
  address: string;
  symbol: string;
  size?: "sm" | "md";
}

/**
 * Circular token avatar that displays deterministic gradient backgrounds and
 * accurate symbol initials. The gradient is derived from the contract address
 * so every token gets a unique, consistent colour without requiring any stored
 * colour metadata. The native coin sentinel address produces a fixed premium
 * blue-to-purple Web3 gradient.
 * @param props - The contract address, token symbol, and optional size variant.
 * @returns The rendered circular token icon element.
 */
function TokenIcon({
  address,
  symbol,
  size = "md",
}: TokenIconProps): JSX.Element {
  const gradient = getTokenGradient(address);
  const initials = getTokenInitials(symbol);

  const sizeClasses =
    size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-[10px]";

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
}

export { TokenIcon };
export type { TokenIconProps };
