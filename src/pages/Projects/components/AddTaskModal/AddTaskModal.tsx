import { DatePicker, Form, Input, InputNumber } from "antd";
import { Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useUIMessages } from "../../../../providers/UIMessageProvider";
import { useTasks } from "../../../../hooks/useTasks";

type FieldType = {
  project: string;
  startDate: Dayjs;
  dueDate: Dayjs;
  assigneedMembership: string;
  duration: string | { min: string; max: string };
  name?: string;
  notes?: string;
};

export default function AddTaskModal({ project, onClose }: any) {
  const { createTask } = useTasks();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();

  async function handleOk() {
    const { startDate, dueDate, assigneedMembershipId, duration, name, notes } =
      form.getFieldsValue();
    const OK = await createTask({
      projectId: project.id,
      jobId: null,
      assignedMembershipId: assigneedMembershipId || null,
      startDate: startDate.format("YYYY-MM-DD"),
      dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
      doneDate: null,
      duration:
        typeof duration === "object" ? [duration.min, duration.max] : duration,
      name,
      notes,
    });
    if (OK) {
      UIMessages?.createTask.success();
      onClose();
    } else {
      UIMessages?.createTask.error();
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
      open={!!project}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        className="AddTaskModal-form"
        name="addTask"
        layout="vertical"
        requiredMark={false}
        form={form}
      >
        <Form.Item<FieldType>
          name="name"
          rules={[{ required: true, message: "Please enter task name" }]}
        >
          <Input placeholder="Your new task name" />
        </Form.Item>
        <Form.Item<FieldType> name="startDate">
          <DatePicker
            prefix="Date"
            placeholder="Select when to start"
            format={dateFormat}
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="dueDate">
          <DatePicker
            prefix="Date"
            placeholder="Select when needs to be done"
            format={dateFormat}
            minDate={today}
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="duration">
          <InputNumber
            prefix="Hours"
            placeholder="Estimated duration in hours"
            min={0}
            step={1}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="notes">
          <TextArea rows={5} placeholder="What were you doing?" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
