import { useState, useEffect, Suspense, lazy } from "react";
import { MenuUnfoldOutlined, MenuFoldOutlined, LoadingOutlined } from '@ant-design/icons';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, Row, Spin } from "antd";
import { useMoralis } from "react-moralis";
import Account from "./components/Account/Account";
import NativeBalance from "./components/NativeBalance";
import MenuItems from "./components/MenuItems";
import MonkeyLogo from "./components/MonkeyLogo";
import "antd/dist/antd.min.css";
const { Header, Content, Sider, Footer } = Layout;

const Mint = lazy(() => import('./components/Mint/Mint'));
const Marketplace = lazy(() => import('./components/Marketplace/Marketplace'));
const Wallet = lazy(() => import('./components/Wallet/Wallet'));
const Activity = lazy(() => import('./components/Activity/Activity'));

export default function App() {
  const [collapsed, setCollapsed] = useState(true);
  const { isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled, isWeb3EnableLoading]);

  const toggle = () => setCollapsed(!collapsed);
  
  const MenuFold = collapsed ? <MenuUnfoldOutlined className="trigger" onClick={toggle}/> : <MenuFoldOutlined className="trigger" onClick={toggle}/>;

  return (
    <Layout style={{height: "100vh", width: "100vw"}}>
      <BrowserRouter>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo"><MonkeyLogo /></div> 
        <MenuItems />
      </Sider>

      <Layout className="site-layout">

        <Header className="site-layout-background" style={{ padding: 10 }}>
          <Row style={{display: "flex", justifyContent: "space-between"}}>
            {MenuFold}
            <Row>
              <NativeBalance />
              <Account />
            </Row>
          </Row>

        </Header>

        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px 0 24px',
            overflow: "auto",
            borderRadius: '10px'            
          }}
        >
        <Suspense fallback={<Spin size="large" style={{display: "flex", justifyContent: "center", transform: "translateY(30vh)"}} indicator={<LoadingOutlined style={{ fontSize: 50 }} spin />} />}>
          <Routes>
            <Route path="/" element={<Mint />}/>
            <Route path="/marketplace" element={<Marketplace />}/>
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/activity" element={<Activity />} />
          </Routes>
        </Suspense>
        </Content>
        <Footer style={{ textAlign: 'center'}}>Avax Monkeys ©2022</Footer>
      </Layout>
      </BrowserRouter>
    </Layout>
  );
}