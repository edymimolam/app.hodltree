import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";

export function useInitInstances(config) {
  const {
    emPoolAbi,
    emPoolAddress,
    reservePoolAbi,
    reservePoolAddress,
    volatilePoolAbi,
    volatilePoolAddress,
    vpStorageAbi,
    vpStorageAddress,
    iERC20TokenAbi,
    inputTokenAddress,
    eptAddress,
    vptAddress,
    bptAddress,
  } = config;

  const { library, active } = useWeb3React();
  const [instances, setInstances] = useState(null);

  const initInstances = useCallback(() => {
    const inputToken = new library.eth.Contract(
      iERC20TokenAbi,
      inputTokenAddress
    );
    const ept = new library.eth.Contract(iERC20TokenAbi, eptAddress);
    const vpt = new library.eth.Contract(iERC20TokenAbi, vptAddress);
    const bpt = new library.eth.Contract(iERC20TokenAbi, bptAddress);
    const emPool = new library.eth.Contract(emPoolAbi, emPoolAddress);
    const reservePool = new library.eth.Contract(
      reservePoolAbi,
      reservePoolAddress
    );
    const volatilePool = new library.eth.Contract(
      volatilePoolAbi,
      volatilePoolAddress
    );
    const vpStorage = new library.eth.Contract(vpStorageAbi, vpStorageAddress);

    const tokens = { inputToken, ept, vpt, bpt };
    Object.keys(tokens).forEach((key) => {
      tokens[key].getDecimals = async function () {
        if (!tokens[key].decimals) {
          tokens[key].decimals = await tokens[key].methods.decimals().call();
        }
        return tokens[key].decimals;
      };
    });

    setInstances({
      ...tokens,
      emPool,
      reservePool,
      volatilePool,
      vpStorage,
    });
  }, [library]);

  useEffect(() => {
    if (!active) return;
    initInstances();
  }, [library, initInstances, active]);

  return [instances, initInstances];
}
