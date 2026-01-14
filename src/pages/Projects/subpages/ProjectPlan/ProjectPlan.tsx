import { useState } from "react";
import { Radio } from "antd";
import { CheckboxGroupProps } from "antd/lib/checkbox/Group";
import { Timeline } from "../../../../components/Timeline/Timeline";

const options: CheckboxGroupProps<string>["options"] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
];

export default function ProjectPlan({ plan }: { plan: any }) {
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  return (
    <div>
      <Radio.Group
        block
        options={options}
        defaultValue="day"
        optionType="button"
        buttonStyle="solid"
        onChange={(e) => setViewMode(e.target.value)}
        style={{ width: 180 }}
      />
      <Timeline data={plan?.jobs || []} viewMode={viewMode} />
    </div>
  );
}
