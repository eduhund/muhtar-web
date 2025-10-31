import { TeamOutlined } from "@ant-design/icons";
import SidebarButton from "../../SidebarButton";

export function WorkersButton() {
  return (
    <SidebarButton
      title="Workers"
      icon={<TeamOutlined />}
      link="/workers"
    ></SidebarButton>
  );
}
