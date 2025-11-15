import { Form, Select } from "antd";
import { Modal } from "antd";
import { useMemberships } from "../../../hooks/useMemberships";
import { Project, ProjectMembership } from "../../../context/AppContext";
import MembershipDropdown from "../../../components/MembershipDropdown/MembershipDropdown";
import { useProjects } from "../../../hooks/useProjects";
import { useUIMessages } from "../../../providers/UIMessageProvider";

type AddToProjectModal = {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
};

const ACCESS_ROLES = [
  { value: "quest", label: "Guest" },
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

export default function AddToProjectModal({
  isOpen,
  project,
  onClose,
}: AddToProjectModal) {
  const { memberships, isLoading } = useMemberships();
  const { addProjectMembership } = useProjects();
  const UIMessages = useUIMessages();
  const [form] = Form.useForm();

  const availableMemberships = (memberships || []).filter(
    (m) => !project.memberships.some((pm) => pm.membershipId === m.id)
  );

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

  async function handleOk() {
    const newMemberships = form.getFieldsValue();
    let addedCounter = 0;
    const failedMemberships: string[] = [];
    for (const membership of Object.values(newMemberships)) {
      const { membershipId, accessRole, workRole } =
        membership as ProjectMembership;
      const success = await addProjectMembership(project.id, {
        membershipId,
        accessRole,
        workRole,
        multiplier: 1,
      });
      if (!success) {
        failedMemberships.push(
          memberships?.find((m) => m.id === membershipId)?.name || "Unknown"
        );
      } else {
        addedCounter++;
      }
    }
    if (addedCounter > 0) {
      UIMessages?.addProjectMembers.success(addedCounter);
      onClose();
    }
    if (failedMemberships.length > 0) {
      UIMessages?.addProjectMembers.error(failedMemberships);
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
      <Form
        className="AddToProjectModal-form"
        name="addProjectMemberships"
        layout="vertical"
        requiredMark={false}
        form={form}
        initialValues={{
          membership1: {
            accessRole: ACCESS_ROLES[1]?.value || "member",
            workRole: projectRoles[0]?.value || "staff",
          },
        }}
      >
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          label="Member 1"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <Form.Item<string>
            className="membership"
            name={["membership1", "membershipId"]}
          >
            <MembershipDropdown
              memberships={availableMemberships}
              value={null}
              isRequired={true}
              isLoading={isLoading}
              onChange={() => {}}
            />
          </Form.Item>
          <div className="membership-roles">
            <Form.Item<string> name={["membership1", "accessRole"]}>
              <Select
                prefix={<span>Access Role</span>}
                options={ACCESS_ROLES}
                value={ACCESS_ROLES[1]?.value}
              />
            </Form.Item>
            <Form.Item<string> name={["membership1", "workRole"]}>
              <Select
                prefix={<span>Project Role</span>}
                options={projectRoles}
                value={projectRoles[0]?.value}
              />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
