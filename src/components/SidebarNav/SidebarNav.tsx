import { Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useUser } from "../../hooks/useUser";

import { AddTimeWidget } from "./components/SidebarWidget/variants/AddTimeWidget/AddTimeWidget";

import { useMembership } from "../../hooks/useMembership";
import { WorkersWidget } from "./components/SidebarWidget/variants/WorkersWidget/WorkersWidget";
import { useTeam } from "../../hooks/useTeam";
import { Link } from "react-router-dom";
import { ProjectsWidget } from "./components/SidebarWidget/variants/ProjectsWidget/ProjectsWidget";
import { useSidebarExpanded } from "./hooks/useSidebarExpanded";
import { ProjectsButton } from "./components/SidebarButton/variants/ProjectsButton/ProjectsButton";

import "./SidebarNav.scss";
import { WorkersButton } from "./components/SidebarButton/variants/WorkersButton/WorkersButton";

const { Title, Text } = Typography;

function CollapsedSidebar() {
  const { user } = useUser();
  const { membership } = useMembership();
  const isAdmin = membership?.accessRole === "admin";

  function Buttons() {
    if (isAdmin) {
      return (
        <>
          <ProjectsButton />
          <WorkersButton />
        </>
      );
    }
    return null;
  }

  return (
    <>
      <Link to="/" className="SidebarNav-header">
        <img
          src="/assets/img/muhtar-logo_round.png"
          width={40}
          height={40}
          alt="Muhtar Logo"
          className="SidebarNav-logo"
        />
      </Link>
      <div className="SidebarNav-contentWrapper">
        <div className="SidebarNav-widgets">
          <Buttons />
        </div>
      </div>
      {user && (
        <div className="SidebarNav-footer">
          <div className="SidebarNav-user">
            <Avatar shape="circle" size={40} icon={<UserOutlined />} />
          </div>
        </div>
      )}
    </>
  );
}

function ExpandedSidebar() {
  const { user } = useUser();
  const { membership } = useMembership();
  const { team } = useTeam();
  const isAdmin = membership?.accessRole === "admin";

  function Widgets() {
    if (isAdmin) {
      return (
        <>
          <ProjectsWidget />
          <WorkersWidget />
          <AddTimeWidget />
        </>
      );
    }
    return <AddTimeWidget />;
  }

  return (
    <>
      <Link to="/" className="SidebarNav-header">
        <img
          src="/assets/img/muhtar-logo_round.png"
          width={40}
          height={40}
          alt="Muhtar Logo"
          className="SidebarNav-logo"
        />
        <div className="SidebarNav-header-divider"></div>
        <Title className="SidebarNav-title" level={4} style={{ margin: 0 }}>
          {team?.name || "Unnamed team"}
        </Title>
      </Link>
      <div className="SidebarNav-contentWrapper">
        <div className="SidebarNav-widgets">
          <Widgets />
        </div>
      </div>
      {user && (
        <div className="SidebarNav-footer">
          <div className="SidebarNav-user">
            <Avatar shape="circle" size={40} icon={<UserOutlined />} />
            <div className="SidebarNav-user-info">
              <Title
                className="SidebarNav-user-name"
                level={5}
                title={`${user.firstName} ${user.lastName}`}
                style={{ margin: 0 }}
              >{`${user.firstName} ${user.lastName}`}</Title>
              <Text className="SidebarNav-user-email" type="secondary">
                {user.email}
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SidebarNav() {
  const isExpanded = useSidebarExpanded();

  return (
    <nav className={"SidebarNav" + (isExpanded ? "" : " _collapsed")}>
      {isExpanded ? <ExpandedSidebar /> : <CollapsedSidebar />}
    </nav>
  );
}
