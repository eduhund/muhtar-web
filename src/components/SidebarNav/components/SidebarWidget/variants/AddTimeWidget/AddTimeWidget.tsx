import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Select,
  Tooltip,
} from "antd";
import dayjs, { Dayjs } from "dayjs";

import { PlusCircleOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget";
import { dateFormat } from "../../../../../../utils/date";
import { useProjects } from "../../../../../../hooks/useProjects";
import { useState } from "react";
import { useTimetable } from "../../../../../../hooks/useTimetable";
import { useMembership } from "../../../../../../hooks/useMembership";
import ProjectDropdown from "../../../../../ProjectDropdown/ProjectDropdown";

type FieldType = {
  date: Dayjs;
  duration: string;
  project: string;
  task?: string;
  comment?: string;
};

const { TextArea } = Input;

export function AddTimeWidget() {
  const [isAddingTime, setIsAddingTime] = useState(false);
  const { membership } = useMembership();
  const { activeProjects, isLoading } = useProjects();
  const { addTime } = useTimetable();
  const [messageApi, contextHolder] = message.useMessage();

  const showSuccessMessage = () => {
    messageApi.open({
      type: "success",
      content: "Entry added successfully!",
    });
  };

  const showErrorMessage = () => {
    messageApi.open({
      type: "error",
      content: "Entry was not added!",
    });
  };

  async function onFinish(values: FieldType) {
    setIsAddingTime(true);
    const { date, duration, project, task = null, comment = "" } = values;
    const newTime = await addTime({
      date: date.format("YYYY-MM-DD"),
      duration,
      membershipId: membership?.id || "",
      projectId: project,
      taskId: task,
      comment,
    });
    if (newTime) {
      showSuccessMessage();
    } else {
      showErrorMessage();
    }
    setIsAddingTime(false);
  }

  const today = dayjs(new Date());

  return (
    <SidebarWidget title="Track the time" icon={<PlusCircleOutlined />}>
      {contextHolder}
      <Form
        name="trackTime"
        layout="vertical"
        onFinish={onFinish}
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

        <Form.Item<FieldType>
          name="project"
          rules={[{ required: true, message: "Please select a project!" }]}
        >
          <ProjectDropdown
            projects={activeProjects}
            value={null}
            style={{ width: "100%" }}
            isRequired={true}
            isLoading={isLoading}
            onChange={() => {}}
          />
        </Form.Item>

        <Tooltip title="Tasks are not available yet">
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
        </Tooltip>

        <Form.Item<FieldType> name="duration">
          <Select
            showSearch
            placeholder="0"
            prefix="Hours"
            filterOption={(input, option) =>
              String(option?.key ?? "")
                .toLowerCase()
                .includes(String(input).toLowerCase())
            }
            style={{ width: "100%" }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <Select.Option key={(i + 1) / 2} value={((i + 1) / 2) * 60}>
                {String((i + 1) / 2).replace(".", ",")}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item<FieldType> name="comment">
          <TextArea rows={3} placeholder="What were you doing?" />
        </Form.Item>

        <Form.Item label={null} style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isAddingTime}
            style={{ width: "100%" }}
          >
            Add Time
          </Button>
        </Form.Item>
      </Form>
    </SidebarWidget>
  );
}
