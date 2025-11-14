import { DatePicker, Form, Select, Tooltip } from "antd";
import { Modal } from "antd";
import ProjectDropdown from "../../../components/ProjectDropdown/ProjectDropdown";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useProjects } from "../../../hooks/useProjects";
import { useEffect } from "react";
import { useTimetable } from "../../../hooks/useTimetable";
import { useUIMessages } from "../../../providers/UIMessageProvider";

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
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        date: dayjs(record.date),
        project: record.project.id,
        duration: record.duration,
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
      UIMessages?.editTime.success();
      onClose();
    } else {
      UIMessages?.editTime.error();
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
