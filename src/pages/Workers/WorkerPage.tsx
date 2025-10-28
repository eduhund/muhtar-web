import { Typography } from "antd";
import { BarChart, Bar, Tooltip, TooltipContentProps, YAxis } from "recharts";

import { Membership, TimetableItem } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import dayjs from "dayjs";

const { Title } = Typography;

function getLast5DaysSummary(
  entries: TimetableItem[]
): { date: string; duration: number }[] {
  const result: { date: string; duration: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    const duration = entries
      .filter((e) => e.date === date)
      .reduce((acc, e) => acc + (e.duration || 0), 0);
    result.unshift({ date, duration });
  }
  const formattedResult = result.map((item) => ({
    date: dayjs(item.date).format("D MMMM"),
    duration: item.duration / 60, // in hours
  }));
  return formattedResult;
}

export default function WorkerPage({ membership }: { membership: Membership }) {
  const { timetable } = useTimetable();
  const membershipEntries =
    timetable?.filter((item) => item.membership.id === membership.id) || [];
  const lastFiveDaysData = getLast5DaysSummary(membershipEntries);
  console.log("Last five days data:", lastFiveDaysData);

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipContentProps<string | number, string>) => {
    const isVisible = active && payload && payload.length;
    return (
      <div
        className="WorkerPage-chart-tooltip"
        style={{ visibility: isVisible ? "visible" : "hidden" }}
      >
        {isVisible && (
          <>
            <p className="label">{payload[0].payload.date}</p>
            <p className="value">
              Spent <strong>{payload[0].payload.duration}</strong>
            </p>
          </>
        )}
      </div>
    );
  };

  const TinyBarChart = () => {
    return (
      <BarChart
        style={{
          width: "600px",
          height: "100px",
        }}
        responsive
        data={lastFiveDaysData}
      >
        <YAxis domain={[0, 8]} hide={true} />
        <Tooltip content={CustomTooltip} cursor={false} />
        <Bar
          dataKey="duration"
          fill="#f04f23"
          background={{ fill: "rgba(0, 0, 0, 0.04)" }}
        />
      </BarChart>
    );
  };

  return (
    <div>
      <Title level={2}>{membership.name}</Title>
      <div>
        <TinyBarChart />
      </div>
    </div>
  );
}
