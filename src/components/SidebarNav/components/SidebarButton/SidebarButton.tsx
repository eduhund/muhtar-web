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
  const isActive = window.location.pathname.startsWith(link);
  return (
    <Link className={"SidebarButton" + (isActive ? " _active" : "")} to={link}>
      <div className="SidebarButton-icon">{icon}</div>
      <Text className="SidebarButton-title">{title}</Text>
    </Link>
  );
}
