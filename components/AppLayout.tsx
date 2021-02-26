import React, { ReactNode } from "react";
import Link from "next/link";
import Head from "next/head";
import Header from "./Header";
import { Layout, Menu, Spin, Alert } from "antd";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useIsLoading } from "../hooks/useIsLoading";
const { Content, Footer, Sider } = Layout;

type Props = {
  children?: ReactNode;
  title?: string;
};

export default function AppLayout({
  children,
  title = "This is the default title",
}: Props) {
  const isLoading = useIsLoading();
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Layout hasSider={true}>
        <Sider
          theme="light"
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}
        >
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
        </Sider>
        <Layout>
          <Header title={title}></Header>
          <Content
            style={{
              maxWidth: 960,
              minHeight: "100vh",
              margin: "1rem auto",
            }}
          >
            {isLoading ? (
              <Alert
                type="info"
                className="spin-container"
                message={<Spin />}
              ></Alert>
            ) : (
              children
            )}
          </Content>
          <Footer>Footer</Footer>
        </Layout>
      </Layout>
    </div>
  );
}
