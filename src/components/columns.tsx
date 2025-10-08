import type { TableProps } from "antd";

interface DataType {
  key: string;
  userName: string;
  projectName: string;
  subproject: string;
  duration: number;
  comment: string;
}

export const columns: TableProps<DataType>["columns"] = [
  {
    title: "Когда",
    dataIndex: "date",
    key: "date",
    render: (date: any) => {
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
    width: 140,
  },
  {
    title: "Кто",
    dataIndex: "userName",
    key: "userName",
    width: 180,
  },
  {
    title: "Где",
    dataIndex: "projectName",
    key: "projectName",
    width: 200,
    render: (_: any, { projectName, subproject }: DataType) => (
      <>
        {projectName}
        {subproject && (
          <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>
            {` | ${subproject}`}
          </span>
        )}
      </>
    ),
  },
  {
    title: "Сколько",
    dataIndex: "duration",
    key: "duration",
    width: 80,
  },
  {
    title: "Что",
    dataIndex: "comment",
    key: "comment",
  },
];
