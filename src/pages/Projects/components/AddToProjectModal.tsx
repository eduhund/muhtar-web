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
  const [messageApi, contextHolder] = message.useMessage();
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
    const newMemberships = form.getFieldsValue();
    let OK = true;
    for (const membershipId of newMemberships) {
      const success = await addProjectMembership(project.id, {
        membershipId,
        accessRole: "member",
        workRole: "staff",
        multiplier: 1,
      });
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
          label="Member 1"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <div className="membership">
            <MembershipDropdown
              memberships={availableMemberships}
              value={null}
              isRequired={true}
              isLoading={isLoading}
              onChange={() => {}}
            />
          </div>
          <div className="membership-roles">
            <Select
              prefix={<span>Access Role</span>}
              options={ACCESS_ROLES}
              value={ACCESS_ROLES[1]?.value}
              placeholder="Select a membership"
            />
            <Select
              prefix={<span>Project Role</span>}
              options={projectRoles}
              value={projectRoles[0]?.value}
              placeholder="Select a membership"
            />
          </div>
        </Form.Item>
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          name="membership2"
          label="Member 2"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <div className="membership">
            <MembershipDropdown
              memberships={availableMemberships}
              value={null}
              isRequired={true}
              isLoading={isLoading}
              onChange={() => {}}
            />
          </div>
          <div className="membership-roles">
            <Select
              prefix={<span>Access Role</span>}
              options={ACCESS_ROLES}
              value={ACCESS_ROLES[1]?.value}
              placeholder="Select a membership"
            />
            <Select
              prefix={<span>Project Role</span>}
              options={projectRoles}
              value={projectRoles[0]?.value}
              placeholder="Select a membership"
            />
          </div>
        </Form.Item>
        <Form.Item<string>
          className="AddToProjectModal-form-item"
          name="membership3"
          label="Member 3"
          rules={[{ required: true, message: "Please select memberships!" }]}
        >
          <div className="membership">
            <MembershipDropdown
              memberships={availableMemberships}
              value={null}
              isRequired={true}
              isLoading={isLoading}
              onChange={() => {}}
            />
          </div>
          <div className="membership-roles">
            <Select
              prefix={<span>Access Role</span>}
              options={ACCESS_ROLES}
              value={ACCESS_ROLES[1]?.value}
              placeholder="Select a membership"
            />
            <Select
              prefix={<span>Project Role</span>}
              options={projectRoles}
              value={projectRoles[0]?.value}
              placeholder="Select a membership"
            />
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
