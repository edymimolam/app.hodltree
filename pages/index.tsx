import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useServerAPI } from "../hooks/useServerAPI";
import { useWeb3Connect } from "../hooks/useWeb3Connect";
import { useWeb3React } from "@web3-react/core";
import {
  shortenAddress,
  addKeyField,
  fromWeiByDecimals,
  createEtherscanLink,
} from "../utils";
import {
  Row,
  Col,
  Card,
  Button,
  Tabs,
  Table,
  Drawer,
  Avatar,
  Skeleton,
  InputNumber,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { IERC20ABI } from "../config/ABI/IERC20";
import { LiquidityPoolABI } from "../config/ABI/LiquidityPool";
import numeral from "numeral";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

interface ITokenCard {
  address: string;
  isLoading: boolean;
  img?: string;
  name?: string;
  symbol: string;
}

interface ITokenContentCard extends ITokenCard {
  liquidity?: string;
  borrowed?: number;
}

interface ITokenDepositCard extends ITokenCard {
  balance?: string;
  inputValue?: number;
  isNeedToUnlock: boolean;
  isShowUnlock: boolean;
}

interface ITokenContract {
  address: string;
  decimals?: string;
  instance: Contract;
}

const networkName =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "DEV" ? "kovan" : "mainnet";
const infuraEndpoint = `wss://${networkName}.infura.io/ws/v3/6573e783501746d2a6f9edd5721d1876`;
const web3Infura = new Web3(
  new Web3.providers.WebsocketProvider(infuraEndpoint)
);

const liquidityPoolAddress = "0x56042714e20E118C886e3Bf8B5d13f189F776162";

let liquidityPoolInstance: Contract = new web3Infura.eth.Contract(
  LiquidityPoolABI,
  liquidityPoolAddress
);
let liquidityBalances: string[] = [];

const tokensAddressesToIndexes = new Map();

const tokensIcons: { [key: string]: string } = {
  USDC: "/images/usdc-icon.svg",
  USDT: "/images/usdt-icon.svg",
  DAI: "/images/dai-icon.svg",
  GUSD: "/images/gusd-icon.svg",
  TUSD: "/images/tusd-icon.svg",
  sUSD: "/images/susd-icon.svg",
};

const topTableColumns = [
  {
    title: "Position",
    dataIndex: "key",
    key: "position",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    render: (adr: string) => shortenAddress(adr, 5),
  },
  {
    title: "Contributions",
    dataIndex: "contribute",
    key: "contributions",
    render: (num: number) => numeral(num).format("$0,0[.]00"),
  },
];

export default function FlashLoans() {
  const [tokensContracts, setTokensContracts] = useState(
    new Map<string, ITokenContract>()
  );
  const [tokensCards, setTokensCards] = useState<ITokenContentCard[]>();
  const [tokensDepositCards, setTokensDepositCards] = useState<
    ITokenDepositCard[]
  >();
  const [isDepositVisible, setIsDepositVisible] = useState<boolean>(false);
  const { data, isLoading } = useServerAPI();
  const { active, account, library } = useWeb3React();

  useWeb3Connect();

  // build initial cards and contracts
  useEffect(() => {
    if (!data || tokensCards) return;

    const initialTokensCards: ITokenCard[] = Object.keys(
      data.total_borrowed
    ).map((key: string) => ({ address: key, isLoading: true, symbol: "" }));
    setTokensCards(initialTokensCards);
    setTokensDepositCards(
      initialTokensCards.map((tkn) => ({
        ...tkn,
        isNeedToUnlock: false,
        isShowUnlock: false,
      }))
    );

    (async () => {
      const tokensNumber = await liquidityPoolInstance.methods
        .N_TOKENS()
        .call();

      const _tokensContracts = new Map<string, ITokenContract>();

      for (let i = 0; i < tokensNumber; i++) {
        const tokenAddress = await liquidityPoolInstance.methods
          .tokens(i)
          .call();
        _tokensContracts.set(tokenAddress, {
          instance: new web3Infura.eth.Contract(IERC20ABI, tokenAddress),
          address: tokenAddress,
        });
        tokensAddressesToIndexes.set(tokenAddress, i);
      }
      liquidityBalances = await liquidityPoolInstance.methods.balances().call();

      _tokensContracts.forEach(async (tokenCntr) => {
        tokenCntr.decimals = await tokenCntr.instance.methods.decimals().call();

        const liquidity = fromWeiByDecimals(
          liquidityBalances[tokensAddressesToIndexes.get(tokenCntr.address)],
          tokenCntr.decimals as string
        );

        const tokenCard: ITokenContentCard = {
          address: tokenCntr.address,
          isLoading: false,
          name: await tokenCntr.instance.methods.name().call(),
          symbol: await tokenCntr.instance.methods.symbol().call(),
          liquidity,
          borrowed: data.total_borrowed[tokenCntr.address],
        };
        tokenCard.img = tokensIcons[tokenCard.symbol];

        setTokensCards((prevTkns = []) =>
          [
            ...prevTkns.filter(
              (prevTkn) => prevTkn.address !== tokenCard.address
            ),
            tokenCard,
          ].reverse()
        );
      });

      setTokensContracts(new Map([..._tokensContracts]));
    })();
  }, [data, tokensCards]);

  //build deposit token cards when wallet connects and initial cards are ready
  useEffect(() => {
    if (!active || !tokensCards || tokensCards.some((tkn) => tkn.isLoading))
      return;
    (async () => {
      const _tokensDepositCards: ITokenDepositCard[] = await Promise.all(
        tokensCards.map(async (tkn) => {
          const tknContract = tokensContracts.get(tkn.address);
          const _balance = fromWeiByDecimals(
            await tknContract?.instance.methods.balanceOf(account).call(),
            tknContract?.decimals
          );
          return {
            ...tkn,
            balance: _balance,
            isNeedToUnlock: false,
            isShowUnlock: false,
          };
        })
      );
      setTokensDepositCards(_tokensDepositCards);
    })();
  }, [active, tokensCards]);

  // change infura wss provider to wallet provider in tokens contracts when wallet connects
  // and when token contracts are ready
  useEffect(() => {
    if (
      !active ||
      tokensContracts.size === 0 ||
      [...tokensContracts.values()].some(
        (tkn) => tkn.instance instanceof library.eth.Contract
      )
    )
      return;
    setTokensContracts(
      new Map<string, ITokenContract>(
        Array.from(tokensContracts, ([adr, tkn]) => [
          adr,
          { ...tkn, instance: new library.eth.Contract(IERC20ABI, adr) },
        ])
      )
    );
  }, [active, tokensContracts]);

  const onNeedToUnlock = (adr: string): void =>
    setTokensDepositCards((prev) =>
      prev?.map((tkn) =>
        tkn.address === adr
          ? { ...tkn, isNeedToUnlock: true, isShowUnlock: false }
          : tkn
      )
    );

  const onShowUnlock = (adr: string): void =>
    setTokensDepositCards((prev) =>
      prev?.map((tkn) =>
        tkn.address === adr
          ? { ...tkn, isNeedToUnlock: false, isShowUnlock: true }
          : tkn
      )
    );

  const onCloseUnlock = (adr: string): void =>
    setTokensDepositCards((prev) =>
      prev?.map((tkn) =>
        tkn.address === adr
          ? { ...tkn, isNeedToUnlock: false, isShowUnlock: false }
          : tkn
      )
    );

  const onDepositInput = (value: number, adr: string): void =>
    setTokensDepositCards((prev) =>
      prev?.map((tkn) =>
        tkn.address === adr ? { ...tkn, inputValue: value } : tkn
      )
    );

  type depositCardButtonsProps = {
    isShowUnlock: boolean;
    isNeedToUnlock: boolean;
    address: string;
    inputValue?: number;
    tokenSymbol?: string;
  };
  const DepositCardButtons = ({
    isShowUnlock,
    isNeedToUnlock,
    address,
    tokenSymbol,
    inputValue,
  }: depositCardButtonsProps): JSX.Element[] => {
    const Input = (
      <InputNumber
        className="fl-deposit-card__input"
        size={"large"}
        onChange={(value) => {
          onDepositInput(value as number, address);
          onNeedToUnlock(address);
        }}
        value={inputValue}
      />
    );
    const ButtonToUnlock = (
      <Button onClick={() => onShowUnlock(address)} size="large">
        Unlock token
      </Button>
    );
    const UnlockBlock = (
      <div className="fl-deposit-card__input fl-deposit-card-unlock">
        <div>
          <Button size="large">
            Unlock {inputValue} {tokenSymbol}
          </Button>
        </div>
        <div className="fl-deposit-card-unlock__bottom-block">
          <Button size="large">Unlock infinite</Button>
          <Button
            className="fl-deposit-card-unlock__close"
            size="large"
            onClick={() => onCloseUnlock(address)}
            icon={<CloseOutlined />}
          ></Button>
        </div>
      </div>
    );
    if (isShowUnlock) return [UnlockBlock];
    if (isNeedToUnlock) return [Input, ButtonToUnlock];
    return [Input];
  };

  const DepositDrawer = () => (
    <Drawer
      visible={isDepositVisible}
      width={"80%"}
      title="Title"
      className="fl-drawer fl-deposit"
      onClose={() => setIsDepositVisible(false)}
    >
      <Row gutter={[16, 16]} justify="start">
        {tokensDepositCards?.map((tkn) => (
          <Col key={`deposit${tkn.address}`} xs={24} md={12} lg={8}>
            <Skeleton loading={tkn.isLoading} active avatar>
              <Card
                className="fl-deposit-card"
                style={{
                  marginBottom: tkn.isNeedToUnlock || tkn.isShowUnlock ? 0 : 52,
                }}
                actions={DepositCardButtons({
                  isShowUnlock: tkn.isShowUnlock,
                  isNeedToUnlock: tkn.isNeedToUnlock,
                  address: tkn.address,
                  inputValue: tkn.inputValue,
                  tokenSymbol: tkn.symbol,
                })}
              >
                <Card.Meta
                  avatar={<Avatar size="large" src={tkn.img} />}
                  title={tkn.name}
                  description={
                    <div className="fl-deposit-card__balance">
                      <span>{tkn.balance} </span>
                      <a
                        className="fl-deposit-card__max"
                        onClick={() => console.log("grr")}
                      >
                        Max
                      </a>
                    </div>
                  }
                />
              </Card>
            </Skeleton>
          </Col>
        ))}
      </Row>
    </Drawer>
  );

  return (
    <AppLayout title="Flash Loans" isDataFetching={isLoading}>
      {data && (
        <>
          <div className="fl-row">
            <Row gutter={[16, 16]} align="stretch">
              <Col xs={24} md={12}>
                <Card className="fl-earnings">
                  <div className="fl-earnings__left flex-column-jsb">
                    <h3 className="fl-earnings__small-text">Total Earnings</h3>
                    <span className="fl-earnings__big-text">
                      {numeral(data.total_earnings).format("$0,0[.]00")}
                    </span>
                  </div>
                  <div className="fl-earnings__right flex-column-jsb">
                    <h3 className="fl-earnings__small-text">APY</h3>
                    <span className="fl-earnings__big-text">
                      {numeral(data.apy).format("0[.]00")}%
                    </span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="fl-balance">
                  <div className="fl-balance__left flex-column-jsb">
                    <h3 className="fl-balance__small-text">My Balance</h3>
                    <span className="fl-balance__big-text">$ 12323423</span>
                  </div>
                  <div className="fl-balance__right">
                    <Button
                      size="large"
                      type="primary"
                      onClick={() => setIsDepositVisible(true)}
                      disabled={!active}
                    >
                      Deposit
                    </Button>
                    <Button size="large" type="primary">
                      Withdraw
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} md={12}>
              <div className="fl-tokens">
                <div className="fl-tokens-header">
                  <div className="fl-tokens-header__item">Asset</div>
                  <div className="fl-tokens-header__item">Liquidity</div>
                  <div className="fl-tokens-header__item">Total Borrowed</div>
                </div>
                {tokensCards &&
                  tokensCards.map((tkn) => (
                    <Card key={tkn.address} className="fl-tokens-container">
                      <Skeleton
                        loading={tkn.isLoading}
                        title={{ width: "100%" }}
                        paragraph={{ rows: 1, width: "100%" }}
                        avatar
                        active
                      >
                        <a
                          href={createEtherscanLink(tkn.address)}
                          target="_blank"
                        >
                          <div className="fl-token">
                            <div className="fl-token__item fl-token-asset">
                              <img
                                className="fl-token-icon"
                                src={tkn.img}
                              ></img>
                              <div className="flex-column-jsb">
                                <span className="fl-token-asset__symbol">
                                  {tkn.symbol}
                                </span>
                                <span className="fl-token-asset__name">
                                  {tkn.name}
                                </span>
                              </div>
                            </div>
                            <div className="fl-token__item txt-upper">
                              <span>
                                {numeral(tkn.liquidity).format("($ 0.000a)")}
                              </span>
                            </div>
                            <div className="fl-token__item txt-upper">
                              <span>
                                {numeral(tkn.borrowed).format("($ 0.000a)")}
                              </span>
                            </div>
                          </div>
                        </a>
                      </Skeleton>
                    </Card>
                  ))}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Tabs defaultActiveKey="1" type="card" className="fl-tops">
                <Tabs.TabPane tab="Top Keepers" key="1">
                  <Table
                    columns={topTableColumns}
                    dataSource={addKeyField(data.top.keepers)}
                    pagination={false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Top Liquidity Providers" key="2">
                  <Table
                    columns={topTableColumns}
                    dataSource={addKeyField(data.top.lp)}
                    pagination={false}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
          {DepositDrawer()}
        </>
      )}
    </AppLayout>
  );
}
