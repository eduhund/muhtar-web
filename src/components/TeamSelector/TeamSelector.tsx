import { useState } from "react";
//import { useTeams } from "../../hooks/useTeams";
import Title from "antd/lib/typography/Title";
import { useTeam } from "../../hooks/useTeam";

import "./TeamSelector.scss";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

export default function TeamSelector() {
  const [isOpen, setIsOpen] = useState(false);
  //const { teams } = useTeams();
  const { team } = useTeam();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={"TeamSelector-button" + (isOpen ? " _open" : "")}
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
    </>
  );
}
