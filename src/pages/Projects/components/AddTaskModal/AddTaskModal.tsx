import { DatePicker, Form, Input, InputNumber, Switch } from "antd";
import { Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { dateFormat } from "../../../../utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useUIMessages } from "../../../../providers/UIMessageProvider";
import { useTasks } from "../../../../hooks/useTasks";
import MembershipDropdown from "../../../../components/MembershipDropdown/MembershipDropdown";
import { useMemberships } from "../../../../hooks/useMemberships";
import { useState } from "react";

type FieldType<T extends "fixed" | "range" = "fixed"> = {
  project: string;
  startDate: Dayjs | null;
  dueDate: Dayjs | null;
  assigneedMembership: string | null;
  duration: T extends "range" ? { min: number; max: number } : number;
  name?: string;
  notes?: string;
};

export default function AddTaskModal({ isOpen, project, onClose }: any) {
  const [durationType, setDurationType] = useState<"fixed" | "range">("fixed");
  const { createTask } = useTasks();
  const { memberships } = useMemberships();
  const [form] = Form.useForm();
  const UIMessages = useUIMessages();

  const projectMemberships = project.memberships.map((pm: any) => {
    return memberships?.find((m) => m.id === pm.membershipId);
  });

  function calculateResultingDuration(
    duration: { min: number; max: number } | number
  ): number | [number, number] | null {
    if (
      durationType === "range" &&
      typeof duration === "object" &&
      duration?.min != null &&
      duration?.max != null
    ) {
      return [duration.min * 60, duration.max * 60] as [number, number];
    } else if (durationType === "fixed") {
      return Number(duration) * 60 || null;
    } else {
      return null;
    }
  }

  async function handleOk() {
    const { startDate, dueDate, assigneedMembership, duration, name, notes } =
      form.getFieldsValue();
    console.log(form.getFieldsValue());
    const OK = await createTask({
      projectId: project.id,
      jobId: null,
      assignedMembershipId: assigneedMembership || null,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
      dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
      doneDate: null,
      duration: calculateResultingDuration(duration),
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

        <div className="duration">
          <Switch
            checkedChildren="range"
            unCheckedChildren="fixed"
            defaultChecked={durationType === "range"}
            onChange={(checked) => setDurationType(checked ? "range" : "fixed")}
          />
          {durationType === "range" ? (
            <Form.Item<FieldType<typeof durationType>>>
              <Form.Item>
                <Form.Item<FieldType<"range">>
                  name={["duration", "min"]}
                  noStyle
                >
                  <InputNumber
                    prefix="Min Hours"
                    placeholder="Min hours"
                    min={0}
                    step={1}
                    style={{ width: "47%" }}
                  />
                </Form.Item>
                {" — "}
                <Form.Item<FieldType<"range">>
                  name={["duration", "max"]}
                  noStyle
                >
                  <InputNumber
                    prefix="Max Hours"
                    placeholder="Max hours"
                    min={0}
                    step={1}
                    style={{ width: "47%" }}
                  />
                </Form.Item>
              </Form.Item>
            </Form.Item>
          ) : (
            <Form.Item<FieldType<typeof durationType>> name="duration">
              <InputNumber
                prefix="Hours"
                placeholder="Estimated duration in hours"
                min={0}
                step={1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}
        </div>

        <Form.Item<FieldType> name="notes">
          <TextArea rows={5} placeholder="Some notes about the task" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
