import { Avatar, Button, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useUser } from "../../hooks/useUser";

const { Title, Text } = Typography;

import "./SidebarNav.scss";

export function SidebarNav() {
  const { user } = useUser();
  return (
    <nav className="SidebarNav">
      <div className="SidebarNav-header"></div>
      <Button size="large" type="primary" disabled>
        Track the Time
      </Button>
      <div className="SidebarNav-widgets">Widgets</div>
      {user && (
        <div className="SidebarNav-user">
          <Avatar shape="square" size={44} icon={<UserOutlined />} />
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
