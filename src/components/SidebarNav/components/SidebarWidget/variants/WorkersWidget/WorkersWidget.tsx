import { TeamOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget";

export function WorkersWidget() {
  return (
    <SidebarWidget
      title="Workers"
      icon={<TeamOutlined />}
      url="/workers"
    ></SidebarWidget>
  );
}
