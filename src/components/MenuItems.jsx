import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { ShopOutlined, WalletOutlined, AlertOutlined } from '@ant-design/icons';

export default function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/" icon={<span>🍌</span>}>
      <NavLink to="/">Mint</NavLink>
      </Menu.Item>
      <Menu.Item key="/marketplace" icon={<ShopOutlined />}>
        <NavLink to="/marketplace">Marketplace</NavLink>
      </Menu.Item>
      <Menu.Item key="/wallet" icon={<WalletOutlined />}>
        <NavLink to="/wallet">Wallet</NavLink>
      </Menu.Item>
      <Menu.Item key="/activity" icon={<AlertOutlined />}>
        <NavLink to="/activity">Activity</NavLink>
      </Menu.Item>
    </Menu>
  );
}