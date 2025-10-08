import { Bar } from "@ant-design/plots";
import { hoursPlural } from "../utils/words";
import { Typography } from "antd";
import { beautifyCurrency } from "../utils/numbers";

const { Title } = Typography;

function durationsByUser(arr: any[]) {
  const map = new Map();

  for (const { userId, userName, adjustedDuration, cost } of arr) {
    if (!map.has(userId)) {
      map.set(userId, { userId, userName, duration: adjustedDuration, cost });
    } else {
      Math.round((map.get(userId).duration += adjustedDuration));
      Math.round((map.get(userId).cost += cost));
    }
  }

  return Array.from(map.values());
}

function durationsByProject(arr: any[]) {
  const map = new Map();

  for (const { projectId, projectName, duration } of arr) {
    if (!map.has(projectId)) {
      map.set(projectId, { projectId, projectName, duration });
    } else {
      map.get(projectId).duration += duration;
    }
  }

  return Array.from(map.values());
}

function TotalProjectTime({ data }: any) {
  const preparedData = data.map(
    ({ duration, userName }: { duration: number; userName: string }) => ({
      stage: "",
      duration: Math.round(duration * 10) / 10,
      userName,
    })
  );
  const config = {
    title: false,
    width: 276,
    height: 80,
    data: preparedData,
    xField: "stage",
    yField: "duration",
    colorField: "userName",
    tooltip: false,
    stack: true,
    legend: false,
  };

  const totalDuration =
    Math.floor(
      data.reduce(
        (sum: number, { duration }: { duration: number }) => sum + duration,
        0
      ) * 10
    ) / 10;

  const totaCost = data.reduce(
    (sum: number, { cost }: { cost: number }) => sum + cost,
    0
  );
  return (
    <div className="total-time">
      <Title level={5}>
        <span>Потрачено: </span>
        <span>{`${totalDuration} ${hoursPlural(totalDuration)}`}</span> /{" "}
        <span>{beautifyCurrency(totaCost)}</span>
      </Title>
      <Bar {...config} />
    </div>
  );
}

function TotalUserTime({ data }: any) {
  const preparedData = data.map(
    ({ duration, projectName }: { duration: number; projectName: string }) => ({
      stage: "",
      duration,
      projectName,
    })
  );
  const config = {
    title: false,
    width: 276,
    height: 80,
    data: preparedData,
    xField: "stage",
    yField: "duration",
    colorField: "projectName",
    tooltip: false,
    stack: true,
    legend: false,
  };
  return <Bar {...config} />;
}

function ProjectBudget({ data }: any) {
  const timePerWorker = durationsByUser(data);
  return (
    <div className="statistics">
      <TotalProjectTime data={timePerWorker} />
      <div className="worker-timelist">
        {timePerWorker.map(({ userId, userName, duration, cost }: any) => {
          const spendedHours = Math.round(duration * 10) / 10;
          return (
            <div
              key={userId}
              className={
                "worker-time " +
                (cost === 0 && spendedHours !== 0 ? "_no-cost" : "")
              }
            >
              <Title level={5}>{userName}</Title>
              <div className="worker-time-details">
                <span>{`${spendedHours} ${hoursPlural(spendedHours)}`}</span>
                <span>{beautifyCurrency(cost)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UserBudget({ data }: any) {
  const timePerProject = durationsByProject(data);
  return (
    <div>
      <TotalUserTime data={timePerProject} />
    </div>
  );
}

export { ProjectBudget, UserBudget };
