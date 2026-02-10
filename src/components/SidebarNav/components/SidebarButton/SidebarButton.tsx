import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const normalizePath = (path: string) => {
    const normalized = path.toLowerCase().replace(/\/+$/, "");
    return normalized === "" ? "/" : normalized;
  };

  const currentPath = normalizePath(location.pathname);
  const linkPath = normalizePath(link);
  const isActive =
    linkPath === "/"
      ? currentPath === "/"
      : currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
  const className = "SidebarButton" + (isActive ? " _active" : "");

  if (isActive) {
    return (
      <span className={className} aria-disabled="true">
        <div className="SidebarButton-icon">{icon}</div>
        <Text className="SidebarButton-title">{title}</Text>
      </span>
    );
  }

  return (
    <Link className={className} to={link}>
      <div className="SidebarButton-icon">{icon}</div>
      <Text className="SidebarButton-title">{title}</Text>
    </Link>
  );
}
