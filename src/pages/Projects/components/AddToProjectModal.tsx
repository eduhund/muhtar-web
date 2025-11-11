import { Form, message, Select } from "antd";
import { Modal } from "antd";
import { useMemberships } from "../../../hooks/useMemberships";
import { Project } from "../../../context/AppContext";
import MembershipDropdown from "../../../components/MembershipDropdown/MembershipDropdown";
import { useProjects } from "../../../hooks/useProjects";

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
  const { addMemberToProject } = useProjects();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const availableMemberships = (memberships || []).filter(
    (m) => !project.memberships.some((pm) => pm.membershipId === m.id)
  );

  const projectRoles =
    project.roles && project.roles.length > 0
      ? project.roles.map((role) => ({
          value: role.name,
          label: role.name,
        }))
      : [
          {
            value: "null",
            label: "No roles available",
          },
        ];

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
    const newMemberships = form.getFieldValue("memberships");
    let OK = true;
    for (const membershipId of newMemberships) {
      const success = await addMemberToProject(project.id, membershipId);
      if (!success) {
        OK = false;
      }
    }
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
        className="AddToProjectModal-form"
        name="updateTime"
        layout="vertical"
        requiredMark={false}
        form={form}
      >
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          name="membership1"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <MembershipDropdown
            memberships={availableMemberships}
            value={null}
            isRequired={true}
            isLoading={isLoading}
            onChange={() => {}}
          />
          <Select
            prefix={<span>Role</span>}
            options={projectRoles}
            value={projectRoles[0]?.value}
            placeholder="Select a membership"
          />
        </Form.Item>
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          name="membership2"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <MembershipDropdown
            memberships={availableMemberships}
            value={null}
            isRequired={true}
            isLoading={isLoading}
            onChange={() => {}}
          />
          <Select
            prefix={<span>Role</span>}
            options={projectRoles}
            value={projectRoles[0]?.value}
            placeholder="Select a membership"
          />
        </Form.Item>
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          name="membership3"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <MembershipDropdown
            memberships={availableMemberships}
            value={null}
            isRequired={true}
            isLoading={isLoading}
            onChange={() => {}}
          />
          <Select
            prefix={<span>Role</span>}
            options={projectRoles}
            value={projectRoles[0]?.value}
            placeholder="Select a membership"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
