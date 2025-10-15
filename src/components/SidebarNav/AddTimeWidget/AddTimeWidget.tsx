import { Button, DatePicker, Form, Input, Select } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { PlusCircleOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget/SidebarWidget";
import { dateFormat } from "../../../utils/date";
import { useProjects } from "../../../hooks/useProjects";

type FieldType = {
  date: string;
  duration: string;
  project: string;
  task?: string;
  comment?: string;
};

const { TextArea } = Input;

export function AddTimeWidget() {
  const { projects, isLoading } = useProjects();

  const selectorItems = projects?.map((project) => ({
    label: project.customer
      ? `${project.customer} / ${project.name}`
      : project.name,
    value: project.id,
  }));
  async function onFinish(values: FieldType) {
    console.log("Success:", values);
  }

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  const today = dayjs(new Date());

  return (
    <SidebarWidget
      title="Track the time"
      icon={<PlusCircleOutlined />}
      showArrow={false}
    >
      <Form
        name="trackTime"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        requiredMark={false}
      >
        <Form.Item<FieldType>
          name="date"
          initialValue={today}
          rules={[{ required: true, message: "Date can't be empty!" }]}
        >
          <DatePicker
            prefix="Date"
            placeholder="Select..."
            format={dateFormat}
            maxDate={today}
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item<FieldType>>
          <Select
            showSearch
            placeholder="0"
            prefix="Hours"
            style={{ width: "100%" }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <Select.Option key={(i + 1) / 2} value={(i + 1) / 2}>
                {(i + 1) / 2}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item<FieldType>
          name="project"
          rules={[{ required: true, message: "Please select a project!" }]}
        >
          <Select
            showSearch
            placeholder="Select..."
            options={selectorItems || []}
            value={{}}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            prefix="Project"
            allowClear={false}
            style={{ width: "100%" }}
            loading={isLoading}
            onChange={() => {}}
          />
        </Form.Item>

        <Form.Item<FieldType> name="task">
          <Select
            showSearch
            placeholder="Select..."
            options={[]}
            value={{}}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Task"
            allowClear={false}
            style={{ width: "100%" }}
            onChange={() => {}}
            disabled
          />
        </Form.Item>

        <Form.Item<FieldType> name="comment">
          <TextArea rows={3} placeholder="What were you doing?" />
        </Form.Item>

        <Form.Item label={null} style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Add Time
          </Button>
        </Form.Item>
      </Form>
    </SidebarWidget>
  );
}
