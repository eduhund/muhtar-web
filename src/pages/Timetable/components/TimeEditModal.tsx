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
import { useTasks } from "../../../hooks/useTasks";

type FieldType = {
  date: Dayjs;
  duration: string;
  project: string;
  task?: string;
  comment?: string;
};

export default function TimeEditModal({ record, onClose }: any) {
  const { updateTime } = useTimetable();
  const { activeProjects, isLoading } = useProjects();
  const { tasks } = useTasks();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  const filteredTasks = useMemo(
    () =>
      tasks && selectedProjectId
        ? tasks.filter((task) => task.project.id === selectedProjectId)
        : [],
    [tasks, selectedProjectId]
  );

  useEffect(() => {
    if (record) {
      setSelectedProjectId(record.project.id);
      form.setFieldsValue({
        date: dayjs(record.date),
        project: record.project.id,
        duration: record.duration,
        task: record.task ? record.task.id : null,
        comment: record.comment,
      });
    }
  }, [record, form]);

  async function handleOk() {
    const {
      date,
      duration,
      project,
      task = null,
      comment = "",
    } = form.getFieldsValue();
    const OK = await updateTime({
      date: date.format("YYYY-MM-DD"),
      membershipId: record.membership.id,
      id: record.id,
      duration,
      projectId: project,
      taskId: task,
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
              form.setFieldValue("task", null); // Сбросить выбранную задачу
            }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="task">
          <Select
            showSearch
            placeholder={"Select..."}
            options={filteredTasks}
            fieldNames={{ label: "name", value: "id" }}
            prefix="Task"
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
