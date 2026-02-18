import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Input, Modal } from "antd";
import Title from "antd/lib/typography/Title";
import { useTeam } from "../../hooks/useTeam";
import { useTeams } from "../../hooks/useTeams";
import { userAPI } from "../../api";

import "./TeamSelector.scss";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { membershipStorage } from "../../utils/storage";

export default function TeamSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { team } = useTeam();
  const { teams, isLoading } = useTeams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [form] = Form.useForm();

  const availableTeams = useMemo(() => {
    if (!teams) {
      return [];
    }
    return teams
      .filter((item) => !item.isDeleted)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teams]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!isOpen) {
        return;
      }
      const target = event.target as Node | null;
      if (containerRef.current && target) {
        if (!containerRef.current.contains(target)) {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  async function handleTeamSelect(teamId: string) {
    if (!teamId || teamId === team?.id || isChanging) {
      setIsOpen(false);
      return;
    }

    try {
      setIsChanging(true);
      const { data } = await userAPI.changeTeam(teamId);
      console.log("Team change response:", { data });
      if (data?.tokens?.membership?.accessToken) {
        membershipStorage.setAccessToken(data.tokens.membership.accessToken);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to change team", error);
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  }

  function handleOpenCreateModal() {
    setIsOpen(false);
    setIsCreateOpen(true);
  }

  function handleCloseCreateModal() {
    setIsCreateOpen(false);
    form.resetFields();
  }

  async function handleCreateTeam() {
    try {
      const values = await form.validateFields();
      const name = String(values.name || "").trim();
      if (!name) {
        return;
      }
      setIsCreating(true);
      await userAPI.createTeam({ name });
      handleCloseCreateModal();
      window.location.reload();
    } catch (error) {
      if ((error as { errorFields?: unknown[] })?.errorFields) {
        return;
      }
      console.error("Failed to create team", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="TeamSelector" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={"TeamSelector-button" + (isOpen ? " _open" : "")}
        disabled={isChanging}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Title
          className="TeamSelector-button-text"
          level={4}
          style={{ margin: 0 }}
        >
          {team?.name || "Unnamed team"}
          {isOpen ? (
            <UpOutlined className="TeamSelector-button-icon" />
          ) : (
            <DownOutlined className="TeamSelector-button-icon" />
          )}
        </Title>
      </button>
      {isOpen && (
        <div className="TeamSelector-menu" role="menu">
          {isLoading ? (
            <div className="TeamSelector-empty">Loading teams...</div>
          ) : availableTeams.length > 0 ? (
            <div className="TeamSelector-list">
              {availableTeams.map((item) => (
                <button
                  key={item.id}
                  className={
                    "TeamSelector-item" +
                    (item.id === team?.id ? " _active" : "")
                  }
                  onClick={() => handleTeamSelect(item.id)}
                  disabled={isChanging}
                  role="menuitem"
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="TeamSelector-empty">No teams found</div>
          )}
          <div className="TeamSelector-divider" />
          <button
            className="TeamSelector-create"
            onClick={handleOpenCreateModal}
          >
            Create new team
          </button>
        </div>
      )}
      <Modal
        title="Create new team"
        closable={{ "aria-label": "Close" }}
        open={isCreateOpen}
        onOk={handleCreateTeam}
        onCancel={handleCloseCreateModal}
        okButtonProps={{ loading: isCreating }}
        cancelButtonProps={{ disabled: isCreating }}
      >
        <Form
          form={form}
          name="createTeam"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Team name"
            rules={[{ required: true, message: "Please enter a name." }]}
          >
            <Input placeholder="Team name" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
