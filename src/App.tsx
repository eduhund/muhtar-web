import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import ruRU from "antd/lib/locale/ru_RU";

import { Summary, UserTimeboard } from "./pages";
import Login from "./pages/Login";

import "./App.css";
import { UserProvider } from "./context/UserContext";

const App = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <UserProvider>
              <Routes>
                <Route path="/" element={<Summary />} />
                <Route path="/users/:userId" element={<UserTimeboard />} />
              </Routes>
            </UserProvider>
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
