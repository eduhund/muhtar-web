import { Button, Form, Input, Select } from "antd";
import { Modal } from "antd";
import { Project, ProjectMembership } from "../../../../context/AppContext";
import { useProjects } from "../../../../hooks/useProjects";
import { DeleteOutlined } from "@ant-design/icons";

import "./EditMembershipModal.scss";
import { useUIMessages } from "../../../../providers/UIMessageProvider";

type EditMembershipModal = {
  isOpen: boolean;
  projectMembership: ProjectMembership & { membershipName: string };
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
  const { updateProjectMembership, removeProjectMembership } = useProjects();
  const UIMessages = useUIMessages();
  const [form] = Form.useForm();

  const projectRoles =
    project.activeContract?.roles && project.activeContract.roles.length > 0
      ? project.activeContract.roles.map((role) => ({
          value: role.key,
          label: role.name,
        }))
      : [
          {
            value: "null",
            label: "No roles available",
          },
        ];

  async function handleOk() {
    const { membership } = form.getFieldsValue();
    const success = await updateProjectMembership(project.id, {
      membershipId: projectMembership.membershipId,
      accessRole: membership.accessRole,
      workRole: membership.workRole,
      multiplier: Number(membership.multiplier),
    });
    if (success) {
      UIMessages?.updateProjectMember.success();
      onClose();
    } else {
      UIMessages?.updateProjectMember.error();
    }
  }

  function handleCancel() {
    onClose();
  }

  async function handleRemove() {
    const success = await removeProjectMembership(
      project.id,
      projectMembership.membershipId
    );
    if (success) {
      UIMessages?.removeProjectMember.success();
      onClose();
    } else {
      UIMessages?.removeProjectMember.error();
    }
  }

  return (
    <Modal
      title={`Edit ${projectMembership.membershipName} Membership in ${project.name}`}
      closable={{ "aria-label": "Close" }}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={() => (
        <div className="EditMembershipModal-footer">
          <Button
            key="remove"
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={handleRemove}
          >
            Remove from Project
          </Button>
          <div className="EditMembershipModal-footer-actions">
            <Button onClick={handleCancel} key="cancel">
              Cancel
            </Button>
            <Button key="submit" type="primary" onClick={handleOk}>
              Update
            </Button>
          </div>
        </div>
      )}
    >
      <Form
        className="EditMembershipModal-form"
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
