import React, { createContext, useContext } from "react";
import { message } from "antd";
import ReactDOM from "react-dom";

type UIMessages = {
  addTime: {
    success: () => void;
    error: () => void;
  };
  editTime: {
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
    editTime: {
      success: () => {
        console.log("here");
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
  };

  return (
    <MessageContext.Provider value={UIMessages}>
      {ReactDOM.createPortal(contextHolder, document.body)}
      {children}
    </MessageContext.Provider>
  );
};

export const useUIMessages = () => useContext(MessageContext);
