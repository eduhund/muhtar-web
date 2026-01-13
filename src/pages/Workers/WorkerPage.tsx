import { Typography } from "antd";

import { Membership } from "../../context/AppContext";
import { useResources } from "../../hooks/useResources";

import Overview from "./components/Overview/Overview";
import Salary from "./components/Salary/Salary";

const { Title } = Typography;

export default function WorkerPage({ membership }: { membership: Membership }) {
  const { resources } = useResources();
  const membershipEntries =
    resources?.filter((item) => item.membership.id === membership.id) || [];

  return (
    <div>
      <Title level={2}>{membership.name}</Title>
      <div>
        <Overview entries={membershipEntries} />
        <Salary membership={membership} resources={resources || []} />
      </div>
    </div>
  );
}
