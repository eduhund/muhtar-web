import { DatePicker, Form, Input, InputNumber } from "antd";
import { Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useEffect } from "react";
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

export default function EditTaskModal({ isOpen, task, onClose }: any) {
  const { updateTask } = useTasks();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();

  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        startDate: task.startDate ? dayjs(task.startDate) : null,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        assigneedMembershipId: task.assignedMembership?.id || null,
        duration: Array.isArray(task.duration)
          ? { min: task.duration[0], max: task.duration[1] }
          : task.duration || null,
        name: task.name,
        notes: task.notes || "",
      });
    }
  }, [task, form]);

  async function handleOk() {
    const { startDate, dueDate, assigneedMembershipId, duration, name, notes } =
      form.getFieldsValue();
    const OK = await updateTask({
      id: task.id,
      startDate: startDate.format("YYYY-MM-DD"),
      dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
      assignedMembershipId: assigneedMembershipId,
      duration:
        typeof duration === "object" ? [duration.min, duration.max] : duration,
      name,
      notes,
    });
    if (OK) {
      UIMessages?.updateTask.success();
      onClose();
    } else {
      UIMessages?.updateTask.error();
    }
  }

  function handleCancel() {
    onClose();
  }

  const today = dayjs(new Date());

  return (
    <Modal
      title="Edit Task"
      closable={{ "aria-label": "Close" }}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        className="EditTaskModal-form"
        name="editTask"
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
