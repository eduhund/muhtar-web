import { Segmented, Typography } from "antd";
import { BarChart, Bar, Tooltip, TooltipContentProps, YAxis } from "recharts";
import dayjs from "dayjs";
import { TimetableItem } from "../../../../context/AppContext";
import isoWeek from "dayjs/plugin/isoWeek";
import { useState } from "react";

import "./Overview.scss";

type Period = "Daily" | "Weekly" | "Monthly";

dayjs.extend(isoWeek);

const { Title } = Typography;

function getDailyEntries(
  entries: TimetableItem[]
): { date: string; duration: number }[] {
  const result: {
    date: string;
    duration: number;
  }[] = [];
  for (let i = 0; i < 30; i++) {
    const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    const duration = entries
      .filter((e) => e.date === date)
      .reduce((acc, e) => (acc += e.duration || 0), 0);
    result.unshift({ date, duration });
  }
  const formattedResult = result.map((item) => ({
    date: dayjs(item.date).format("D MMMM"),
    duration: item.duration / 60, // in hours
  }));
  return formattedResult;
}

function getWeeklyEntries(
  entries: TimetableItem[]
): { date: string; duration: number }[] {
  const result: {
    startDate: string;
    endDate: string;
    duration: number;
  }[] = [];

  for (let i = 0; i < 10; i++) {
    const weekStart = dayjs().startOf("isoWeek").subtract(i, "week");
    const weekEnd = weekStart.endOf("isoWeek");
    const startDate = weekStart.format("YYYY-MM-DD");
    const endDate = weekEnd.format("YYYY-MM-DD");
    const duration = entries
      .filter((entry) => entry.date >= startDate && entry.date <= endDate)
      .reduce((acc, entry) => acc + (entry.duration || 0), 0);

    result.unshift({
      startDate,
      endDate,
      duration,
    });
  }

  return result.map((item) => ({
    date: `${dayjs(item.startDate).format("D MMMM")} - ${dayjs(
      item.endDate
    ).format("D MMMM")}`,
    duration: item.duration / 60,
  }));
}

function getMonthlyEntries(
  entries: TimetableItem[]
): { date: string; duration: number }[] {
  const result: { date: string; duration: number }[] = [];
  const now = dayjs();
  const monthsCount = 12;

  for (let i = monthsCount - 1; i >= 0; i--) {
    const month = now.subtract(i, "month");
    const startOfMonth = month.startOf("month").format("YYYY-MM-DD");
    const isCurrentMonth = month.isSame(now, "month");
    const endOfMonth = isCurrentMonth
      ? now.format("YYYY-MM-DD")
      : month.endOf("month").format("YYYY-MM-DD");

    const duration = entries
      .filter((entry) => entry.date >= startOfMonth && entry.date <= endOfMonth)
      .reduce((acc, entry) => acc + (entry.duration || 0), 0);

    result.push({
      date: month.format("MMMM YYYY"),
      duration: duration / 60,
    });
  }
  return result;
}

function getEntriesByPeriod(
  entries: TimetableItem[],
  period: Period = "Daily"
) {
  switch (period) {
    case "Monthly":
      return getMonthlyEntries(entries);
    case "Weekly":
      return getWeeklyEntries(entries);
    default:
      return getDailyEntries(entries);
  }
}

export default function Overview({ entries }: { entries: TimetableItem[] }) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Daily");
  const groupedEntries = getEntriesByPeriod(entries, selectedPeriod);

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
    const topValue =
      selectedPeriod === "Monthly" ? 180 : selectedPeriod === "Weekly" ? 40 : 8;
    return (
      <BarChart
        style={{
          width: "600px",
          height: "100px",
        }}
        responsive
        data={groupedEntries}
      >
        <YAxis domain={[0, topValue]} hide={true} />
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
    <div className="WorkerPage-overview">
      <div className="WorkerPage-overview-header">
        <Title level={5}>Timetable overview</Title>
        <Segmented<Period>
          options={["Daily", "Weekly", "Monthly"]}
          onChange={(value) => {
            setSelectedPeriod(value);
          }}
        />
      </div>
      <TinyBarChart />
    </div>
  );
}
