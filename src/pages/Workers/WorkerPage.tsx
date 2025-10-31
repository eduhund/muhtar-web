import { Typography } from "antd";

import { Membership } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";

import Overview from "./components/Overview/Overview";
import Salary from "./components/Salary/Salary";

const { Title } = Typography;

export default function WorkerPage({ membership }: { membership: Membership }) {
  const { timetable } = useTimetable();
  const membershipEntries =
    timetable?.filter((item) => item.membership.id === membership.id) || [];

  return (
    <div>
      <Title level={2}>{membership.name}</Title>
      <div>
        <Overview entries={membershipEntries} />
        <Salary membership={membership} timetable={timetable || []} />
      </div>
    </div>
  );
}
