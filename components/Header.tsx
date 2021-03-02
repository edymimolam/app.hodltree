import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../connectors";
import { Layout, Button, Modal } from "antd";
import { shortenAddress } from "../utils";

const { Header: AntHeader } = Layout;

export default function Header({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { active, activate, account } = useWeb3React();
  return (
    <AntHeader className="header">
      <div className="header-inner">
        <span>Header for {title}</span>
        {active ? (
          <Button type="primary" shape="round" onClick={() => setIsOpen(true)}>
            <span>
              <img
                src="images/metamask.svg"
                width="24"
                height="24"
                alt="metamask logo"
              />
              &nbsp;&nbsp;{shortenAddress(account)}
            </span>
          </Button>
        ) : (
          <Button
            type="primary"
            shape="round"
            onClick={() => activate(injected)}
          >
            Connet Wallet
          </Button>
        )}
      </div>
      <Modal
        visible={isOpen}
        onCancel={() => setIsOpen(false)}
        footer=""
        title="Connect Wallet"
        className="walletModal"
      >
        {active ? (
          <div>
            <p>Connected with MetaMask</p>
            <p>{account}</p>
            <a
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </a>
          </div>
        ) : (
          <h2>You don't have metamask. Install it first</h2>
        )}
      </Modal>
    </AntHeader>
  );
}
