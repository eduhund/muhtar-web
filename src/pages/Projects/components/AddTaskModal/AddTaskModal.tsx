import { DatePicker, Form, Input, InputNumber } from "antd";
import { Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useUIMessages } from "../../../../providers/UIMessageProvider";
import { useTasks } from "../../../../hooks/useTasks";
import MembershipDropdown from "../../../../components/MembershipDropdown/MembershipDropdown";
import { useMemberships } from "../../../../hooks/useMemberships";

type FieldType = {
  project: string;
  startDate: Dayjs;
  dueDate: Dayjs;
  assigneedMembership: string;
  duration: string | { min: string; max: string };
  name?: string;
  notes?: string;
};

export default function AddTaskModal({ isOpen, project, onClose }: any) {
  const { createTask } = useTasks();
  const { memberships } = useMemberships();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();

  const projectMemberships = project.memberships.map((pm) => {
    return memberships?.find((m) => m.id === pm.membershipId);
  });

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
        typeof duration === "object"
          ? [duration.min * 60, duration.max * 60]
          : duration
          ? duration * 60
          : null,
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
      title="New Task"
      closable={{ "aria-label": "Close" }}
      open={isOpen}
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
            prefix="Start date"
            placeholder="Select when to start"
            format={dateFormat}
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="dueDate">
          <DatePicker
            prefix="Deadline"
            placeholder="Select when needs to be done"
            format={dateFormat}
            minDate={today}
            allowClear={false}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item<FieldType> name="assigneedMembership">
          <MembershipDropdown
            memberships={projectMemberships}
            value={null}
            isRequired={false}
            onChange={() => {}}
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
          <TextArea rows={5} placeholder="Some notes about the task" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
