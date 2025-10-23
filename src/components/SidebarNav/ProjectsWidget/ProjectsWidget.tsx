import { ReconciliationOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget/SidebarWidget";

export function ProjectsWidget() {
  return (
    <SidebarWidget
      title="Projects"
      icon={<ReconciliationOutlined />}
      url="/Projects"
    ></SidebarWidget>
  );
}
