import { Typography } from "antd";

import "./Page.scss";

const { Title } = Typography;

type PageProps = {
  title: string;
  className?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Page({
  title,
  className = "",
  actions,
  children,
}: PageProps) {
  return (
    <div className="Page">
      <div className="Page-header">
        <div className="Page-header-title">
          <Title level={1}>{title}</Title>
        </div>
        <div className="Page-header-actions">{actions}</div>
      </div>
      <div className={"Page-content " + className}>{children}</div>
    </div>
  );
}
