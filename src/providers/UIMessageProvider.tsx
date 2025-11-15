import React, { createContext, useContext } from "react";
import { message } from "antd";
import ReactDOM from "react-dom";

type UIMessages = {
  addTime: {
    success: () => void;
    error: () => void;
  };
  updateTime: {
    success: () => void;
    error: () => void;
  };
  addProjectMember: {
    success: () => void;
    error: () => void;
  };
  addProjectMembers: {
    success: (count: number) => void;
    error: (memberships: string[]) => void;
  };
  updateProjectMember: {
    success: () => void;
    error: () => void;
  };
  removeProjectMember: {
    success: () => void;
    error: () => void;
  };
};

const MessageContext = createContext<UIMessages | null>(null);

export const MessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [messageApi, contextHolder] = message.useMessage();

  const UIMessages = {
    addTime: {
      success: () => {
        messageApi.open({
          type: "success",
          content: "Time entry added successfully!",
        });
      },
      error: () => {
        messageApi.open({
          type: "error",
          content: "Time entry was not added!",
        });
      },
    },
    updateTime: {
      success: () => {
        messageApi.open({
          type: "success",
          content: "Time entry updated successfully!",
        });
      },
      error: () => {
        messageApi.open({
          type: "error",
          content: "Time entry was not updated!",
        });
      },
    },
    addProjectMember: {
      success: () => {
        messageApi.open({
          type: "success",
          content: "Member added successfully!",
        });
      },
      error: () => {
        messageApi.open({
          type: "error",
          content: "Member was not added!",
        });
      },
    },
    addProjectMembers: {
      success: (count: number) => {
        messageApi.open({
          type: "success",
          content: `${count} member${count > 1 ? "s" : ""} added successfully!`,
        });
      },
      error: (memberships: string[]) => {
        messageApi.open({
          type: "error",
          content: `Members were not added:\n${memberships.join("\n")}`,
        });
      },
    },
    updateProjectMember: {
      success: () => {
        messageApi.open({
          type: "success",
          content: "Member updated successfully!",
        });
      },
      error: () => {
        messageApi.open({
          type: "error",
          content: "Member was not updated!",
        });
      },
    },
    removeProjectMember: {
      success: () => {
        messageApi.open({
          type: "success",
          content: "Member removed successfully!",
        });
      },
      error: () => {
        messageApi.open({
          type: "error",
          content: "Member was not removed!",
        });
      },
    },
  };

  return (
    <MessageContext.Provider value={UIMessages}>
      {ReactDOM.createPortal(contextHolder, document.body)}
      {children}
    </MessageContext.Provider>
  );
};

export const useUIMessages = () => useContext(MessageContext);
