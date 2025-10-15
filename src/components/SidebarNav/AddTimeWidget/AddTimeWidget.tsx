import { FieldTimeOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget/SidebarWidget";

export function AddTimeWidget() {
  return (
    <SidebarWidget
      title="Track the time"
      icon={<FieldTimeOutlined />}
      showArrow={false}
    ></SidebarWidget>
  );
}
