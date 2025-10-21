import { Typography } from "antd";

import { useMemberships } from "../../hooks/useMemberships";

const { Title } = Typography;

export function Timetable() {
  const { memberships } = useMemberships();

  return (
    <div className="Timetable">
      <div className="Timetable-header">
        <div className="Timetable-header-title">
          <Title level={1}>Workers</Title>
        </div>
      </div>
      <div id="Workers-list">
        {memberships &&
          memberships.map((membership) => (
            <div key={membership.id}>{membership.name}</div>
          ))}
      </div>
    </div>
  );
}
