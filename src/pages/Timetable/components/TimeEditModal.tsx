import { DatePicker, Form, Select } from "antd";
import { Modal } from "antd";
import ProjectDropdown from "../../../components/ProjectDropdown/ProjectDropdown";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useProjects } from "../../../hooks/useProjects";
import { useEffect, useMemo, useState } from "react";
import { useTimetable } from "../../../hooks/useTimetable";
import { useUIMessages } from "../../../providers/UIMessageProvider";

type FieldType = {
  date: Dayjs;
  duration: string;
  project: string;
  target?: { type: string; id: string } | null;
  comment?: string;
};

export default function TimeEditModal({ record, onClose }: any) {
  const { updateTime } = useTimetable();
  const { activeProjects, isLoading } = useProjects();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const projectJobs = useMemo(() => {
    if (!activeProjects) return null;

    const selectedProject = activeProjects.find(
      (project) => project.id === selectedProjectId
    );
    if (!selectedProject?.activePlan) return [];
    return selectedProject.activePlan.jobs;
  }, [activeProjects, selectedProjectId]);

  useEffect(() => {
    if (record) {
      setSelectedProjectId(record.project.id);
      form.setFieldsValue({
        date: dayjs(record.date),
        project: record.project.id,
        duration: record.duration,
        target: record.target ? record.target.id : null,
        comment: record.comment,
      });
    }
  }, [record, form]);

  async function handleOk() {
    const {
      date,
      duration,
      project,
      target,
      comment = "",
    } = form.getFieldsValue();
    const OK = await updateTime({
      date: date.format("YYYY-MM-DD"),
      membershipId: record.membership.id,
      id: record.id,
      duration,
      projectId: project,
      target: target ? { type: "job", id: target } : null,
      comment,
    });
    if (OK) {
      UIMessages?.updateTime.success();
      onClose();
    } else {
      UIMessages?.updateTime.error();
    }
  }

  function handleCancel() {
    onClose();
  }

  const today = dayjs(new Date());

  return (
    <Modal
      title="Edit Timetable Entry"
      closable={{ "aria-label": "Close" }}
      open={!!record}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        className="TimeEditModal-form"
        name="updateTime"
        layout="vertical"
        requiredMark={false}
        form={form}
        initialValues={{
          date: record ? dayjs(record.date) : today,
          comment: record ? record.comment : "",
        }}
      >
        <Form.Item<FieldType>
          name="date"
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
            value={record ? record.project.id : null}
            style={{ width: "100%" }}
            isRequired={true}
            isLoading={isLoading}
            onChange={(value) => {
              setSelectedProjectId(value);
              form.setFieldValue("target", null);
            }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="target">
          <Select
            showSearch
            placeholder={"Select..."}
            options={projectJobs || []}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Job"
            allowClear
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="duration">
          <Select
            showSearch
            placeholder="0"
            value={record ? record.duration : null}
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
          <TextArea rows={5} placeholder="What were you doing?" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
