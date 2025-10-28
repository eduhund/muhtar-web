import { Statistic } from "antd";

type QuickSummaryItemProps = {
  title: string;
  value: number;
};

export default function QuickSummaryItem({
  title,
  value,
}: QuickSummaryItemProps) {
  return (
    <Statistic
      className="WorkerRow-summary-item"
      title={title}
      value={value.toFixed(0)}
    />
  );
}
