import { config } from "../config/em1";
import { useWeb3Connect } from "../hooks/useWeb3Connect";
import { useInitInstances } from "../hooks/useInitInstances";
import AppLayout from "../components/AppLayout";
import Faq from "../components/Faq";
import Elastic from "../components/Elastic";
import Volatile from "../components/Volatile";
import { Row, Col } from "antd";

export default function Em1() {
  useWeb3Connect();
  const [instances, initInstances] = useInitInstances(config);

  return (
    <AppLayout title="em1">
      <Row gutter={[16, 16]} justify="center" align="stretch">
        <Col xs={24} md={12}>
          <Volatile
            instances={instances}
            initInstances={initInstances}
            config={config}
          />
        </Col>
        <Col xs={24} md={12}>
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
    </AppLayout>
  );
}
