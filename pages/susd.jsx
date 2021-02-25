import { config } from "../config/susd";
import Layout from "../components/Layout";
import Faq from "../components/Faq";
import Elastic from "../components/Elastic";
import Volatile from "../components/Volatile";
import { Row, Col } from "antd";

export default function Em1() {
  const { instances, initInstances } = {};
  return (
    <Layout title="susd">
      <Row gutter={[16, 16]} justify="center" align="stretch">
        <Col span={12}>
          <Volatile
            instances={instances}
            initInstances={initInstances}
            config={config}
          />
        </Col>
        <Col span={12}>
          <Elastic
            instances={instances}
            initInstances={initInstances}
            config={config}
          />
        </Col>
        <Col span={24}>
          <Faq config={config} />
        </Col>
      </Row>
    </Layout>
  );
}
