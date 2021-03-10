import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useServerAPI } from "../hooks/useServerAPI";
import { useWeb3Connect } from "../hooks/useWeb3Connect";
import { shortenAddress, addKeyField, fromWeiByDecimals } from "../utils";
import { Row, Col, Card, Button, Tabs, Table } from "antd";
import { IERC20ABI } from "../config/ABI/IERC20";
import { LiquidityPoolABI } from "../config/ABI/LiquidityPool";
import numeral from "numeral";
import Web3 from "web3";

interface ITokenCard {
  address: string;
  isLoading: boolean;
  img?: string;
  name?: string;
  symbol: string;
  liquidity?: string;
  borrowed?: number;
}

const infuraUrl = `https://kovan.infura.io/v3/7aa91bdccc17426b9c2c4c9ca3f414d3`;
const web3Infura = new Web3(new Web3.providers.HttpProvider(infuraUrl));

const liquidityPoolAddress = "0x56042714e20E118C886e3Bf8B5d13f189F776162";
let liquidityPoolInstance: any;
const tokensIntances: any[] = [];
const tokensAddressesToIndexes = new Map();
let balances: string[] = [];

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
  const [tokensCards, setTokensCards] = useState<ITokenCard[]>();
  const { data, isLoading } = useServerAPI();

  useWeb3Connect();

  useEffect(() => {
    if (!data || tokensCards) return;

    const initialTokensCards: ITokenCard[] = Object.keys(
      data.total_borrowed
    ).map((key: string) => ({ address: key, isLoading: true, symbol: "" }));
    setTokensCards(initialTokensCards);

    liquidityPoolInstance = new web3Infura.eth.Contract(
      LiquidityPoolABI,
      liquidityPoolAddress
    );

    (async () => {
      const tokensNumber = await liquidityPoolInstance.methods
        .N_TOKENS()
        .call();

      for (let i = 0; i < tokensNumber; i++) {
        const tokenAddress = await liquidityPoolInstance.methods
          .tokens(i)
          .call();
        tokensIntances.push(
          new web3Infura.eth.Contract(IERC20ABI, tokenAddress)
        );
        tokensAddressesToIndexes.set(tokenAddress, i);
      }
      balances = await liquidityPoolInstance.methods.balances().call();

      tokensIntances.forEach(async (tokenInst) => {
        tokenInst._decimals = await tokenInst.methods.decimals().call();

        const liquidity = fromWeiByDecimals(
          balances[tokensAddressesToIndexes.get(tokenInst._address)],
          tokenInst._decimals
        );

        const tokenCard: ITokenCard = {
          address: tokenInst._address,
          isLoading: false,
          name: await tokenInst.methods.name().call(),
          symbol: await tokenInst.methods.symbol().call(),
          liquidity,
          borrowed: data.total_borrowed[tokenInst._address],
        };
        tokenCard.img = tokensIcons[tokenCard.symbol];
        setTokensCards((tkns = []) =>
          [
            ...tkns.filter((tkn) => tkn.address !== tokenCard.address),
            tokenCard,
          ].reverse()
        );
      });
    })();
  }, [data, tokensCards]);

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
                    <Button size="large" type="primary">
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
                    <Card
                      key={tkn.address}
                      className="fl-tokens-container"
                      loading={tkn.isLoading}
                    >
                      <div className="fl-token">
                        <img className="fl-token-icon" src={tkn.img}></img>
                        <div className="fl-token__item fl-token-asset flex-column-jsb ">
                          <span className="fl-token-asset__symbol">
                            {tkn.symbol}
                          </span>
                          <span className="fl-token-asset__name">
                            {tkn.name}
                          </span>
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
        </>
      )}
    </AppLayout>
  );
}
