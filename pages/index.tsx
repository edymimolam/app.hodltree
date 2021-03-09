import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { useServerAPI } from "../hooks/useServerAPI";
import { shortenAddress, addKeyField, fromWeiByDecimals } from "../utils";
import { Row, Col, Card, Button, Tabs, Table } from "antd";
import { useWeb3React } from "@web3-react/core";
import iERC20TokenAbi from "../config/ABI/IERC20abi.json";
import liquidityPoolABI from "../config/ABI/LiquidityPool.json";
import numeral from "numeral";

interface IToken {
  img?: string;
  name?: string;
  symbol: string;
  liquidity?: string;
  borrowed?: number;
}

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
  const [tokens, setTokens] = useState<IToken[]>();
  const { data, isLoading } = useServerAPI();
  const { library, active } = useWeb3React();

  useEffect(() => {
    if (!data || !active || tokens) return;

    liquidityPoolInstance = new library.eth.Contract(
      liquidityPoolABI,
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
          new library.eth.Contract(iERC20TokenAbi, tokenAddress)
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

        const token: IToken = {
          name: await tokenInst.methods.name().call(),
          symbol: await tokenInst.methods.symbol().call(),
          liquidity,
          borrowed: data.total_borrowed[tokenInst._address],
        };
        token.img = tokensIcons[token.symbol];
        setTokens((tkns) => (tkns ? [...tkns, token] : [token]));
      });
    })();
  }, [data, active, tokens]);

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
                {tokens && (
                  <>
                    <div className="fl-tokens-header">
                      <div className="fl-tokens-header__item">Asset</div>
                      <div className="fl-tokens-header__item">Liquidity</div>
                      <div className="fl-tokens-header__item">
                        Total Borrowed
                      </div>
                    </div>
                    {tokens.map((tkn, i) => (
                      <Card
                        key={i + tkn?.symbol}
                        className="fl-tokens-container"
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
                  </>
                )}
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
