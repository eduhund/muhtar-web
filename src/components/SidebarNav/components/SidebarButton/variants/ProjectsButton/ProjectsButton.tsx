import { ReconciliationOutlined } from "@ant-design/icons";
import SidebarButton from "../../SidebarButton";

export function ProjectsButton() {
  return (
    <SidebarButton
      title="Projects"
      icon={<ReconciliationOutlined />}
      link="/projects"
    ></SidebarButton>
  );
}
