import { Typography } from "antd";
import { Link } from "react-router-dom";

import "./SidebarWidget.scss";
import { RightOutlined } from "@ant-design/icons";

type SidebarWidgetProps = {
  title?: string;
  icon?: React.ReactNode;
  url?: string;
  children?: React.ReactNode;
};

const { Title } = Typography;

export function SidebarWidget({
  title,
  icon,
  url,
  children,
}: SidebarWidgetProps) {
  return (
    <div className="SidebarWidget">
      {url ? (
        <Link className="SidebarWidget-header" to={url}>
          <div className="SidebarWidget-title">
            {icon}
            <Title level={4}>{title}</Title>
          </div>
          <RightOutlined />
        </Link>
      ) : (
        <div className="SidebarWidget-header">
          <div className="SidebarWidget-title">
            {icon}
            <Title level={4}>{title}</Title>
          </div>
        </div>
      )}
      {children && <div className="SidebarWidget-content">{children}</div>}
    </div>
  );
}
