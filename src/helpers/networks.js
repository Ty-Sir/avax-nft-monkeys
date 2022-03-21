export const networkConfigs = {
  "0xa86a": {
    chainId: 43114,
    chainName: "Avalanche Mainnet",
    currencyName: "AVAX",
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://snowtrace.io/",
  },
  "0xa869": {
    chainId: 43113,
    chainName: "Avalanche Fuji Testnet",
    currencyName: "AVAX",
    currencySymbol: "AVAX",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorerUrl: "https://testnet.snowtrace.io/",
  },
};

export const getNativeByChain = (chain) =>
  networkConfigs[chain]?.currencySymbol || "NATIVE";

export const getChainById = (chain) => networkConfigs[chain]?.chainId || null;

export const getExplorer = (chain) => networkConfigs[chain]?.blockExplorerUrl;

export const getWrappedNative = (chain) =>
  networkConfigs[chain]?.wrapped || null;
