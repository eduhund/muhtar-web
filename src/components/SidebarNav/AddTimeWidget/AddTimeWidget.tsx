import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import type { FormProps } from "antd";
import dayjs from "dayjs";

import { PlusCircleOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget/SidebarWidget";
import { dateFormat } from "../../../utils/date";

type FieldType = {
  date: string;
  duration: string;
  duration_minutes: string;
  project: string;
  task?: string;
  comment?: string;
};

const { TextArea } = Input;

export function AddTimeWidget() {
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
          rules={[{ required: true, message: "Date can't be empty!" }]}
        >
          <DatePicker
            prefix="Date"
            placeholder="Select..."
            format={dateFormat}
            defaultValue={today}
            maxDate={today}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <div className="SidebarWidget-formRow">
          <Form.Item<FieldType>
            name="duration"
            rules={[{ required: true, message: "Write at least 0.5!" }]}
          >
            <InputNumber
              placeholder="0"
              prefix="Hours"
              min={0}
              step={1}
              style={{ width: 139 }}
            />
          </Form.Item>
          <Form.Item<FieldType>
            name="duration_minutes"
            rules={[{ required: true, message: "Write at least 1!" }]}
          >
            <InputNumber
              placeholder="0"
              prefix="Minutes"
              min={0}
              max={59}
              step={15}
              style={{ width: 139 }}
            />
          </Form.Item>
        </div>

        <Form.Item<FieldType>
          name="project"
          rules={[{ required: true, message: "Please select a project!" }]}
        >
          <Select
            placeholder="Select..."
            options={[]}
            value={{}}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Project"
            style={{ width: "100%" }}
            onChange={() => {}}
          />
        </Form.Item>

        <Form.Item<FieldType> name="task">
          <Select
            placeholder="Select..."
            options={[]}
            value={{}}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Task"
            style={{ width: "100%" }}
            onChange={() => {}}
            disabled
          />
        </Form.Item>

        <Form.Item<FieldType> name="comment">
          <TextArea rows={4} placeholder="What were you doing?" />
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
