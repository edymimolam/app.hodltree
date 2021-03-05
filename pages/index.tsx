import AppLayout from "../components/AppLayout";
import { useServerAPI } from "../hooks/useServerAPI";
import { shortenAddress } from "../utils";
import { Row, Col, Card, Button, Tabs, Table } from "antd";
import numeral from "numeral";

const mockData = {
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
  topKeepers: [
    {
      key: 1,
      address: "0x727818Bf466B603824224B433eE40179F4059A52",
      contribution: 12345678,
    },
    {
      key: 2,
      address: "0x727818Bf466B603824224B433eE40179F4059A52",
      contribution: 12345678,
    },
    {
      key: 3,
      address: "0x727818Bf466B603824224B433eE40179F4059A52",
      contribution: 12345678,
    },
    {
      key: 4,
      address: "0x727818Bf466B603824224B433eE40179F4059A52",
      contribution: 12345678,
    },
    {
      key: 5,
      address: "0x727818Bf466B603824224B433eE40179F4059A52",
      contribution: 12345678,
    },
  ],
  topProviders: [
    {
      key: 1,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 2,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 3,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 4,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 5,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 6,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 7,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
    {
      key: 8,
      address: "0x3a22a3a9d548b6e090fa288aef9a23d1b8cdb080",
      contribution: 87654321,
    },
  ],
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

const prepareDataForTable = (
  data: { address: string; contribute: number }[]
): { address: string; contribute: number; key: number }[] =>
  data.map((v, i) => ({ ...v, key: i + 1 }));

export default function FlashLoans() {
  const { data, isLoading } = useServerAPI();
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
                {mockData.tokens.map((tkn, i) => (
                  <Card key={i + tkn.symbol} className="fl-tokens-container">
                    <div className="fl-token">
                      <img className="fl-token-icon" src={tkn.img}></img>
                      <div className="fl-token__item fl-token-asset flex-column-jsb ">
                        <span className="fl-token-asset__symbol">
                          {tkn.symbol}
                        </span>
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
            <Col xs={24} md={12}>
              <Tabs defaultActiveKey="1" type="card" className="fl-tops">
                <Tabs.TabPane tab="Top Keepers" key="1">
                  <Table
                    columns={topTableColumns}
                    dataSource={prepareDataForTable(data.top.keepers)}
                    pagination={false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Top Liquidity Providers" key="2">
                  <Table
                    columns={topTableColumns}
                    dataSource={prepareDataForTable(data.top.lp)}
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
