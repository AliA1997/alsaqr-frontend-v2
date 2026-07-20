import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Web3 wallet connection config. The injected connector covers MetaMask,
// Trust Wallet, and any other extension exposing window.ethereum; wagmi also
// discovers EIP-6963 wallets automatically on top of it.
export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});
