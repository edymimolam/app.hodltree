import Link from "next/link";
import { Layout, Menu } from "antd";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

export default function Sidebar() {
  return (
    <Layout.Sider theme="light" breakpoint="lg" collapsedWidth="0">
      <Menu theme="light" mode="inline" defaultSelectedKeys={["2"]}>
        <div
          style={{
            height: 32,
            margin: 16,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Logo
        </div>
        <Menu.Item key="1" icon={<UserOutlined />}>
          <Link href="/">
            <a>Home</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<VideoCameraOutlined />}>
          <Link href="/em1">
            <a>em1</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<UploadOutlined />}>
          <Link href="/susd">
            <a>susd</a>
          </Link>
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  );
}
