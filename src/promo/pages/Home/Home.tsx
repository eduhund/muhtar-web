import { Button, Typography } from "antd";

import "./Home.scss";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div className="container">
      <div className="content">
        <div className="logo">
          <img
            src="/assets/img/muhtar-logo_round.png"
            width={40}
            height={40}
            alt="Muhtar Logo"
            className="SidebarNav-logo"
          />
          <Title level={1}>Muhtar</Title>
        </div>
        <Title level={4}>
          A tool for agencies tired of guessing their finances
        </Title>
        <div className="actionWrapper">
          <Button type="primary" size="large" href="/login">
            Login
          </Button>
          <Paragraph className="disclaimer">
            or contact us via email{" "}
            <a href="mailto:we@muhtar.pro">we@muhtar.pro</a>
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
