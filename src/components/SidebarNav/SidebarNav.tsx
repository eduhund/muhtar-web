import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useUser } from "../../hooks/useUser";

import { AddTimeWidget } from "./AddTimeWidget/AddTimeWidget";

import "./SidebarNav.scss";

const { Title, Text } = Typography;

export function SidebarNav() {
  const { user } = useUser();
  return (
    <nav className="SidebarNav">
      <div className="SidebarNav-header">
        <img
          src="/assets/img/muhtar-logo_round.png"
          width={32}
          height={32}
          alt="Muhtar Logo"
          className="SidebarNav-logo"
        />
        <div className="SidebarNav-header-divider"></div>
        <Title className="SidebarNav-title" level={4} style={{ margin: 0 }}>
          Sobakapav
        </Title>
      </div>
      <div className="SidebarNav-widgets">
        <AddTimeWidget />
      </div>
      {user && (
        <div className="SidebarNav-user">
          <Avatar shape="square" size={40} icon={<UserOutlined />} />
          <div className="SidebarNav-user-info">
            <Title
              className="SidebarNav-user-name"
              level={5}
              title={`${user.firstName} ${user.lastName}`}
              style={{ margin: 0 }}
            >{`${user.firstName} ${user.lastName}`}</Title>
            <Text className="SidebarNav-user-email" type="secondary">
              {user.email}
            </Text>
          </div>
        </div>
      )}
    </nav>
  );
}
