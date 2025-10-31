import { Link } from "react-router-dom";
import { Typography } from "antd";

import "./SidebarButton.scss";

const { Text } = Typography;

type IconItemButtonProps = {
  link: string;
  icon: React.ReactNode;
  title: string;
};

export default function SidebarButton({
  link,
  icon,
  title,
}: IconItemButtonProps) {
  return (
    <Link className="SidebarButton" to={link}>
      <div className="SidebarButton-icon">{icon}</div>
      <Text className="SidebarButton-title">{title}</Text>
    </Link>
  );
}
