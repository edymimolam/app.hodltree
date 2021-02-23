import { config } from "../config/susd";
import Layout from "../components/Layout";
import Faq from "../components/Faq";
import Elastic from "../components/Elastic";
import Volatile from "../components/Volatile";
import { Row } from "antd";

export default function Em1() {
  const { instances, initInstances } = {};
  return (
    <Layout title="susd">
      <Row gutter={0} justify="center">
        <Volatile
          instances={instances}
          initInstances={initInstances}
          config={config}
        />
        <Elastic
          instances={instances}
          initInstances={initInstances}
          config={config}
        />
      </Row>
      <Row justify="center" config={config}>
        <Faq config={config} />
      </Row>
    </Layout>
  );
}
