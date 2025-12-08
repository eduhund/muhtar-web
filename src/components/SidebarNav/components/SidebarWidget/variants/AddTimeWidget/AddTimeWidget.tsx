import { Button, DatePicker, Form, Input, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { PlusCircleOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget";
import { dateFormat } from "../../../../../../utils/date";
import { useProjects } from "../../../../../../hooks/useProjects";
import { useMemo, useState } from "react";
import { useTimetable } from "../../../../../../hooks/useTimetable";
import { useMembership } from "../../../../../../hooks/useMembership";
import ProjectDropdown from "../../../../../ProjectDropdown/ProjectDropdown";
import { useUIMessages } from "../../../../../../providers/UIMessageProvider";
//import { useTasks } from "../../../../../../hooks/useTasks";

type FieldType = {
  date: Dayjs;
  duration: number;
  project: string;
  target?: string;
  comment?: string;
};

const { TextArea } = Input;

export function AddTimeWidget() {
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const { membership } = useMembership();
  const { activeProjects, isLoading } = useProjects();
  const { addTime } = useTimetable();
  const UIMessages = useUIMessages();

  const projectJobs = useMemo(() => {
    if (!activeProjects) return null;

    const selectedProject = activeProjects.find(
      (project) => project.id === selectedProjectId
    );
    if (!selectedProject?.activePlan) return [];
    return selectedProject.activePlan.jobs;
  }, [activeProjects, selectedProjectId]);

  async function onFinish(values: FieldType) {
    setIsAddingTime(true);
    const { date, duration, project, comment = "" } = values;
    const newTime = await addTime({
      date: date.format("YYYY-MM-DD"),
      duration,
      membershipId: membership?.id || "",
      projectId: project,
      comment,
    });
    if (newTime) {
      UIMessages?.addTime.success();
    } else {
      UIMessages?.addTime.error();
    }
    setIsAddingTime(false);
  }

  const today = dayjs(new Date());

  return (
    <SidebarWidget title="Track the time" icon={<PlusCircleOutlined />}>
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
            onChange={(value) => setSelectedProjectId(value)}
          />
        </Form.Item>

        <Form.Item<FieldType> name="target">
          <Select
            showSearch
            placeholder={
              !selectedProjectId ? "Select project first" : "Select..."
            }
            options={projectJobs || []}
            value={{}}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Job"
            allowClear={false}
            style={{ width: "100%" }}
            onChange={() => {}}
            disabled={!selectedProjectId}
          />
        </Form.Item>

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
