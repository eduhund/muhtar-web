import { Descriptions, DescriptionsProps, Statistic, Typography } from "antd";
import { Membership, Resource } from "../../../../context/AppContext";
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
  resources: Resource[],
  monthsAgo: number
): number {
  const contract = membership.contract[membership.contract.length - 1];
  const targetMonth = dayjs().subtract(monthsAgo, "month");
  const filteredResources = resources.filter(
    (item) =>
      item.membership.id === membership.id &&
      dayjs(item.date).isSame(targetMonth, "month")
  );
  const hourlyRate = contract.rate?.value || 0;
  return (
    (filteredResources.reduce((acc, item) => acc + item.consumed, 0) / 60) *
    hourlyRate
  );
}

function EmployeeSalary({
  membership,
}: {
  membership: Membership;
  resources: Resource[];
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
  resources,
}: {
  membership: Membership;
  resources: Resource[];
}) {
  const contract = membership.contract[membership.contract.length - 1];
  const currency = contract.rate?.currency || "USD";
  // Current month
  const currentMonthLabel = dayjs().format("MMMM");
  const currentMonthEarnings = getMonthlyEarnings(membership, resources, 0);
  // Previous three months
  const prevMonthLabels = [1, 2, 3].map((m) =>
    dayjs().subtract(m, "month").format("MMMM")
  );
  const prevMonthEarnings = [1, 2, 3].map((m) =>
    getMonthlyEarnings(membership, resources, m)
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
  resources,
}: {
  membership: Membership;
  resources: Resource[];
}) {
  const contract = membership.contract[membership.contract.length - 1];
  console.log(contract);
  const isEmployee = contract.type === "staff";
  return (
    <div className="Salary">
      <Title level={3}>Salary</Title>
      {isEmployee ? (
        <EmployeeSalary membership={membership} resources={resources} />
      ) : (
        <FreelanceSalary membership={membership} resources={resources} />
      )}
    </div>
  );
}
