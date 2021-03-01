import "../styles/style.less";
import Web3 from "web3";
import { Web3ReactProvider } from "@web3-react/core";

function getLibrary(provider: any) {
  return new Web3(provider);
}

function MyApp({ Component, pageProps }: any) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default MyApp;
