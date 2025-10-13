import type { TableProps } from "antd";

interface DataType {
  key: string;
  membership: { id: string; name: string };
  project: { id: string; name: string };
  duration: number;
  comment: string;
}

export const columns: TableProps<DataType>["columns"] = [
  {
    title: "When",
    dataIndex: "date",
    key: "date",
    width: 160,
    render: (date: Date) => {
      const dateObj = new Date(date);

      const dateString = dateObj.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const dayOfWeek = dateObj.toLocaleDateString("ru-RU", {
        weekday: "long",
      });

      return (
        <>
          <div>{dateString}</div>
          <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{dayOfWeek}</span>
        </>
      );
    },
  },
  {
    title: "Who",
    dataIndex: "membershipName",
    key: "membershipName",
    width: 180,
    render: (_: unknown, { membership }: DataType) => membership.name,
  },
  {
    title: "Where",
    dataIndex: "projectName",
    key: "projectName",
    width: 200,
    render: (_: unknown, { project }: DataType) => project.name,
  },
  {
    title: "How long",
    dataIndex: "duration",
    key: "duration",
    width: 80,
    render: (duration: number) => duration / 60,
  },
  {
    title: "What",
    dataIndex: "comment",
    key: "comment",
  },
];
