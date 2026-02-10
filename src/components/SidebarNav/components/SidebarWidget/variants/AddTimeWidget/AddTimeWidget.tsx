import { Button, DatePicker, Form, Input, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";

import { PlusCircleOutlined } from "@ant-design/icons";
import { SidebarWidget } from "../../SidebarWidget";
import { dateFormat } from "../../../../../../utils/date";
import { useProjects } from "../../../../../../hooks/useProjects";
import { useEffect, useMemo, useState } from "react";
import { useResources } from "../../../../../../hooks/useResources";
import { useMembership } from "../../../../../../hooks/useMembership";
import ProjectDropdown from "../../../../../ProjectDropdown/ProjectDropdown";
import { useUIMessages } from "../../../../../../providers/UIMessageProvider";
//import { useTasks } from "../../../../../../hooks/useTasks";

type FieldType = {
  date: Dayjs;
  consumed: number;
  project: string;
  target?: string;
  comment?: string;
};

const { TextArea } = Input;

export function AddTimeWidget() {
  const [form] = Form.useForm<FieldType>();
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const { membership } = useMembership();
  const { activeProjects, isLoading } = useProjects();
  const { spendResource } = useResources();
  const UIMessages = useUIMessages();

  const projectJobs = useMemo(() => {
    if (!activeProjects) return null;

    const selectedProject = activeProjects.find(
      (project) => project.id === selectedProjectId,
    );
    if (!selectedProject?.activePlan) return [];
    return selectedProject.activePlan.jobs;
  }, [activeProjects, selectedProjectId]);

  const inProgressJobId = useMemo(() => {
    if (!selectedProjectId || !projectJobs) return null;
    return projectJobs.find((job) => job.status === "inProgress")?.id ?? null;
  }, [projectJobs, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      form.setFieldValue("target", undefined);
      return;
    }

    form.setFieldValue("target", inProgressJobId ?? undefined);
  }, [form, inProgressJobId, selectedProjectId]);

  async function onFinish(values: FieldType) {
    setIsAddingTime(true);
    const { date, consumed, project, target, comment = "" } = values;
    const newTime = await spendResource({
      date: date.format("YYYY-MM-DD"),
      consumed,
      membershipId: membership?.id || "",
      projectId: project,
      target: target ? { type: "job", id: target } : null,
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
    <SidebarWidget title="Track resources" icon={<PlusCircleOutlined />}>
      <Form
        name="trackResources"
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        form={form}
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
            fieldNames={{ label: "name", value: "id" }}
            prefix="Job"
            allowClear={false}
            style={{ width: "100%" }}
            disabled={!selectedProjectId}
          />
        </Form.Item>

        <Form.Item<FieldType> name="consumed">
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
            Track it
          </Button>
        </Form.Item>
      </Form>
    </SidebarWidget>
  );
}
