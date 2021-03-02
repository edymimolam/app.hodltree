import AppLayout from "../components/AppLayout";
import { Row, Col, Card, Button } from "antd";

const data = {
  totalEarnings: 12234567.34,
  apy: 25.567,
};

export default function FlashLoans() {
  return (
    <AppLayout title="Flash Loans">
      <Row gutter={[16, 16]} align="stretch">
        <Col xs={24} md={12}>
          <Card className="fl-earnings">
            <div className="fl-earnings__left">
              <h3 className="fl-earnings__small-text">Total Earnings</h3>
              <span className="fl-earnings__big-text">
                $ {data.totalEarnings}
              </span>
            </div>
            <div className="fl-earnings__right">
              <h3 className="fl-earnings__small-text">APY</h3>
              <span className="fl-earnings__big-text">{data.apy}%</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="fl-balance">
            {/* <h1>Right</h1> */}
            <div className="fl-balance__left">
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
    </AppLayout>
  );
}
