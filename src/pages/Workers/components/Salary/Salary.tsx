import { Descriptions, DescriptionsProps, Select, Typography } from "antd";
import { Membership, TimetableItem } from "../../../../context/AppContext";

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
  const items: DescriptionsProps["items"] = [
    {
      key: "1",
      label: "Hourly Rate",
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
      <Title level={3}>
        Salary in <Select size="small" defaultValue="November" />
      </Title>
      {isEmployee ? (
        <EmployeeSalary membership={membership} timetable={timetable} />
      ) : (
        <FreelanceSalary membership={membership} timetable={timetable} />
      )}
    </div>
  );
}
