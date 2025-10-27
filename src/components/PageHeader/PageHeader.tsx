import { Typography } from "antd";

import "./PageHeader.scss";

const { Title } = Typography;

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="PageHeader">
      <div className="PageHeader-title">
        <Title level={1}>{title}</Title>
      </div>
      {children}
    </div>
  );
}
