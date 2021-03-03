import AppLayout from "../components/AppLayout";
import { Row, Col, Card, Button } from "antd";

const data = {
  totalEarnings: 12234567.34,
  apy: 25.567,
  tokens: [
    {
      symbol: "USDC",
      name: "USDC Coin",
      img: "images/usdc-icon.svg",
      liquidity: 4568000,
      borrowed: 456789,
    },
    {
      symbol: "DAI",
      name: "DAI Stablecoin",
      img: "images/dai-icon.svg",
      liquidity: 4568000,
      borrowed: 456789,
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      img: "images/usdt-icon.svg",
      liquidity: 4568000,
      borrowed: 456789,
    },
  ],
};

export default function FlashLoans() {
  return (
    <AppLayout title="Flash Loans">
      <div className="fl-row">
        <Row gutter={[16, 16]} align="stretch">
          <Col xs={24} md={12}>
            <Card className="fl-earnings">
              <div className="fl-earnings__left flex-column-jsb">
                <h3 className="fl-earnings__small-text">Total Earnings</h3>
                <span className="fl-earnings__big-text">
                  $ {data.totalEarnings}
                </span>
              </div>
              <div className="fl-earnings__right flex-column-jsb">
                <h3 className="fl-earnings__small-text">APY</h3>
                <span className="fl-earnings__big-text">{data.apy}%</span>
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
        <Col span={24}>
          <div className="fl-tokens">
            <div className="fl-tokens-header">
              <div className="fl-tokens-header__item">Asset</div>
              <div className="fl-tokens-header__item">Liquidity</div>
              <div className="fl-tokens-header__item">Total Borrowed</div>
            </div>
            {data.tokens.map((tkn, i) => (
              <Card key={i + tkn.symbol} className="fl-tokens-container">
                <div className="fl-token">
                  <img className="fl-token-icon" src={tkn.img}></img>
                  <div className="fl-token__item fl-token-asset flex-column-jsb ">
                    <span className="fl-token-asset__symbol">{tkn.symbol}</span>
                    <span className="fl-token-asset__name">{tkn.name}</span>
                  </div>
                  <div className="fl-token__item ">
                    <span>$ {tkn.liquidity}</span>
                  </div>
                  <div className="fl-token__item">
                    <span>$ {tkn.borrowed}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Col>
      </Row>
    </AppLayout>
  );
}
