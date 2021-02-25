import { useState, useEffect } from "react";
import { useEagerConnect } from "./useEagerConnect";
import { useInactiveListener } from "./useInactiveListener";
import { useWeb3React } from "@web3-react/core";

export function useWeb3Connect() {
  const [activatingConnector, setActivatingConnector] = useState();
  const { connector } = useWeb3React();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // mount only once or face issues :P
  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);
}
