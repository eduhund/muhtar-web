import { Typography } from "antd";

import "./SidebarWidget.scss";
import { RightOutlined } from "@ant-design/icons";

type SidebarWidgetProps = {
  title?: string;
  icon?: React.ReactNode;
  url?: string;
  showArrow?: boolean;
  children?: React.ReactNode;
};

const { Title } = Typography;

export function SidebarWidget({
  title,
  icon,
  showArrow = false,
  children,
}: SidebarWidgetProps) {
  return (
    <div className="SidebarWidget">
      <div className="SidebarWidget-header">
        <div className="SidebarWidget-title">
          {icon}
          <Title level={4}>{title}</Title>
        </div>
        {showArrow && <RightOutlined />}
      </div>
      {children && <div className="SidebarWidget-content">{children}</div>}
    </div>
  );
}
