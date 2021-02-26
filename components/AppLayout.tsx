import React, { ReactNode } from "react";

import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Layout, Spin, Alert } from "antd";
import { useIsLoading } from "../hooks/useIsLoading";
const { Content, Footer } = Layout;

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
        <Sidebar />
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
