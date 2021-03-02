import Link from "next/link";
import { useRouter } from "next/router";
import { Layout, Menu } from "antd";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

function getSelectedMenuItem(route: string): string[] {
  switch (route) {
    case "/":
      return ["1"];
    case "/em1":
      return ["2"];
    case "/susd":
      return ["3"];
    default:
      return [""];
  }
}

export default function Sidebar() {
  const router = useRouter();
  return (
    <Layout.Sider theme="light" breakpoint="lg" collapsedWidth="0">
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={getSelectedMenuItem(router.route)}
      >
        <div className="logo-container">
          <img className="logo-img" src="/images/black_full_logo.png" />
        </div>
        <Menu.Item key="1" icon={<UserOutlined />}>
          <Link href="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<VideoCameraOutlined />}>
          <Link href="/em1">em1</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<UploadOutlined />}>
          <Link href="/susd">susd</Link>
        </Menu.Item>
      </Menu>
    </Layout.Sider>
  );
}
