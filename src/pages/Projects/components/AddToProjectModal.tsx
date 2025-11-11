import { Form, message } from "antd";
import { Modal } from "antd";
import { useMemberships } from "../../../hooks/useMemberships";
import { Project } from "../../../context/AppContext";
import MembershipDropdown from "../../../components/MembershipDropdown/MembershipDropdown";

type FieldType = {
  memberships: string[];
};

type AddToProjectModal = {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
};

export default function AddToProjectModal({
  isOpen,
  project,
  onClose,
}: AddToProjectModal) {
  const { memberships, isLoading } = useMemberships();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const availableMemberships = (memberships || []).filter(
    (m) => !project.memberships.some((pm) => pm.membershipId === m.id)
  );

  const showSuccessMessage = () => {
    messageApi.open({
      type: "success",
      content: "Members added successfully!",
    });
  };

  const showErrorMessage = () => {
    messageApi.open({
      type: "error",
      content: "Members were not added!",
    });
  };

  async function handleOk() {
    const OK = true;
    if (OK) {
      showSuccessMessage();
      onClose();
    } else {
      showErrorMessage();
    }
  }

  function handleCancel() {
    onClose();
  }

  return (
    <Modal
      title="Add Members to Project"
      closable={{ "aria-label": "Close" }}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Form
        className="TimeEditModal-form"
        name="updateTime"
        layout="vertical"
        requiredMark={false}
        form={form}
      >
        <Form.Item<FieldType>
          name="memberships"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <MembershipDropdown
            memberships={availableMemberships}
            isMultiple={true}
            value={null}
            style={{ width: "100%" }}
            isRequired={true}
            isLoading={isLoading}
            onChange={() => {}}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
