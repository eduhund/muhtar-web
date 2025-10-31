import { Descriptions, DescriptionsProps, Statistic, Typography } from "antd";
import { Membership, TimetableItem } from "../../../../context/AppContext";
import dayjs from "dayjs";

import "./Salary.scss";

const { Title } = Typography;

function combineCurrency(value: number = 0, currency: string = "USD") {
  const currencies: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    RUB: "₽",
  };
  if (!currencies[currency]) return `${value}`;

  if (currency === "RUB") return `${value} ${currencies[currency]}`;
  return `${currencies[currency]} ${value}`;
}

function getMonthlyEarnings(
  membership: Membership,
  timetable: TimetableItem[],
  monthsAgo: number
): number {
  const contract = membership.contract[membership.contract.length - 1];
  const targetMonth = dayjs().subtract(monthsAgo, "month");
  const filteredTimetable = timetable.filter(
    (item) =>
      item.membership.id === membership.id &&
      dayjs(item.date).isSame(targetMonth, "month")
  );
  const hourlyRate = contract.rate?.value || 0;
  return (
    (filteredTimetable.reduce((acc, item) => acc + item.duration, 0) / 60) *
    hourlyRate
  );
}

function EmployeeSalary({
  membership,
  timetable,
}: {
  membership: Membership;
  timetable: TimetableItem[];
}) {
  const contract = membership.contract[membership.contract.length - 1];
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Base Salary",
      children: (
        <>{combineCurrency(contract.rate?.value, contract.rate?.currency)}</>
      ),
    },
  ];
  return (
    <div>
      <Descriptions items={items} />
    </div>
  );
}

function FreelanceSalary({
  membership,
  timetable,
}: {
  membership: Membership;
  timetable: TimetableItem[];
}) {
  const contract = membership.contract[membership.contract.length - 1];
  const currency = contract.rate?.currency || "USD";
  // Current month
  const currentMonthLabel = dayjs().format("MMMM");
  const currentMonthEarnings = getMonthlyEarnings(membership, timetable, 0);
  // Previous three months
  const prevMonthLabels = [1, 2, 3].map((m) =>
    dayjs().subtract(m, "month").format("MMMM")
  );
  const prevMonthEarnings = [1, 2, 3].map((m) =>
    getMonthlyEarnings(membership, timetable, m)
  );
  const descItems = prevMonthLabels.map((label, idx) => ({
    key: label,
    label,
    children: <>{combineCurrency(prevMonthEarnings[idx], currency)}</>,
  }));
  return (
    <div className="Salary-statistics">
      <Statistic
        className="Salary-statistics-item"
        title={currentMonthLabel}
        value={combineCurrency(currentMonthEarnings, currency)}
      />
      <Descriptions size="small" column={1} items={descItems} />
    </div>
  );
}

export default function Salary({
  membership,
  timetable,
}: {
  membership: Membership;
  timetable: TimetableItem[];
}) {
  const contract = membership.contract[membership.contract.length - 1];
  const isEmployee = contract.type === "staff";
  return (
    <div className="Salary">
      <Title level={3}>Salary</Title>
      {isEmployee ? (
        <EmployeeSalary membership={membership} timetable={timetable} />
      ) : (
        <FreelanceSalary membership={membership} timetable={timetable} />
      )}
    </div>
  );
}
