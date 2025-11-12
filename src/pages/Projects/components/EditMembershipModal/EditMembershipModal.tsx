import { Form, Input, message, Select } from "antd";
import { Modal } from "antd";
import { Project, ProjectMembership } from "../../../../context/AppContext";
import { useProjects } from "../../../../hooks/useProjects";

type EditMembershipModal = {
  isOpen: boolean;
  projectMembership: ProjectMembership;
  project: Project;
  onClose: () => void;
};

const ACCESS_ROLES = [
  { value: "quest", label: "Guest" },
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

export default function EditMembershipModal({
  isOpen,
  projectMembership,
  project,
  onClose,
}: EditMembershipModal) {
  console.log("projectMembership:", projectMembership);
  const { updateProjectMembership } = useProjects();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const projectRoles =
    project.roles && project.roles.length > 0
      ? project.roles.map((role) => ({
          value: role.key,
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
      content: `Member updated successfully!`,
    });
  };

  const showErrorMessage = () => {
    messageApi.open({
      type: "error",
      content: `Member was not updated`,
    });
  };

  async function handleOk() {
    const { membership } = form.getFieldsValue();
    const success = await updateProjectMembership(project.id, {
      membershipId: projectMembership.membershipId,
      accessRole: membership.accessRole,
      workRole: membership.workRole,
      multiplier: Number(membership.multiplier),
    });
    if (success) {
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
      title="Edit Project Membership"
      closable={{ "aria-label": "Close" }}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Form
        className="AddToProjectModal-form"
        name="updateProjectMembership"
        layout="vertical"
        requiredMark={false}
        form={form}
        initialValues={{
          membership: {
            accessRole:
              projectMembership.accessRole || ACCESS_ROLES[1]?.value || null,
            workRole:
              projectMembership.workRole || projectRoles[0]?.value || null,
            multiplier: projectMembership.multiplier || 1,
          },
        }}
      >
        <Form.Item<string> name={["membership", "accessRole"]}>
          <Select prefix={<span>Access Role</span>} options={ACCESS_ROLES} />
        </Form.Item>
        <Form.Item<string> name={["membership", "workRole"]}>
          <Select prefix={<span>Project Role</span>} options={projectRoles} />
        </Form.Item>
        <Form.Item<string>
          className="membership"
          name={["membership", "multiplier"]}
        >
          <Input
            type="number"
            min={0.1}
            step={0.1}
            prefix={<span>Multiplier</span>}
            placeholder="e.g., 1.0"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
