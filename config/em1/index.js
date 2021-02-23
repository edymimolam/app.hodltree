import {
  EM_POOL_ABI,
  EM_POOL_ADDRESS_MAINNET,
  EM_POOL_ADDRESS_KOVAN,
} from "./contracts/em-pool";
import {
  RESERVE_POOL_ABI,
  RESERVE_POOL_ADDRESS_MAINNET,
  RESERVE_POOL_ADDRESS_KOVAN,
} from "./contracts/reserve-pool";
import {
  VOLATILE_POOL_ABI,
  VOLATILE_POOL_ADDRESS_MAINNET,
  VOLATILE_POOL_ADDRESS_KOVAN,
} from "./contracts/volatile-pool";
import {
  VP_STORAGE_ABI,
  VP_STORAGE_ADDRESS_MAINNET,
  VP_STORAGE_ADDRESS_KOVAN,
} from "./contracts/vp-storage";
import {
  INPUT_TOKEN_ADDRESS_MAINNET,
  EPT_ADDRESS_MAINNET,
  VPT_ADDRESS_MAINNET,
  BPT_ADDRESS_MAINNET,
  INPUT_TOKEN_ADDRESS_KOVAN,
  EPT_ADDRESS_KOVAN,
  VPT_ADDRESS_KOVAN,
  BPT_ADDRESS_KOVAN,
  IERC20_ABI,
} from "./tokens";

const generalConfig = {
  headerText: {
    title: "Beta",
    annotation: "This module is in beta. Use at your own risk",
  },
  elasticTitle: "EM-USDC pool",
  balancerPoolTitle: "Balancer (USDC/BAL 50/50)",
  balancerCounterCurrencyTicker: "BAL",
  inputTokenTicker: "USDC",
  vptTicker: "SuperUSDC",
  eptTicker: "hUSDC",
  bptTicker: "BPT",
  eptPercentage: "200",
  vptPercentage: "50",
  emPoolAbi: EM_POOL_ABI,
  reservePoolAbi: RESERVE_POOL_ABI,
  volatilePoolAbi: VOLATILE_POOL_ABI,
  vpStorageAbi: VP_STORAGE_ABI,
  iERC20TokenAbi: IERC20_ABI,
};

const testConfig = {
  emPoolAddress: EM_POOL_ADDRESS_KOVAN,
  reservePoolAddress: RESERVE_POOL_ADDRESS_KOVAN,
  volatilePoolAddress: VOLATILE_POOL_ADDRESS_KOVAN,
  vpStorageAddress: VP_STORAGE_ADDRESS_KOVAN,
  inputTokenAddress: INPUT_TOKEN_ADDRESS_KOVAN,
  eptAddress: EPT_ADDRESS_KOVAN,
  vptAddress: VPT_ADDRESS_KOVAN,
  bptAddress: BPT_ADDRESS_KOVAN,
};

const prodConfig = {
  emPoolAddress: EM_POOL_ADDRESS_MAINNET,
  reservePoolAddress: RESERVE_POOL_ADDRESS_MAINNET,
  volatilePoolAddress: VOLATILE_POOL_ADDRESS_MAINNET,
  vpStorageAddress: VP_STORAGE_ADDRESS_MAINNET,
  inputTokenAddress: INPUT_TOKEN_ADDRESS_MAINNET,
  eptAddress: EPT_ADDRESS_MAINNET,
  vptAddress: VPT_ADDRESS_MAINNET,
  bptAddress: BPT_ADDRESS_MAINNET,
};

export const config =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "DEV"
    ? { ...generalConfig, ...testConfig }
    : { ...generalConfig, ...prodConfig };
