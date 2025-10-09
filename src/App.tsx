import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import ruRU from "antd/lib/locale/ru_RU";

import { Summary } from "./pages";
import Login from "./pages/Login/Login";

import "./App.css";
import { UserProvider } from "./providers/UserProvider";
import { MembershipProvider } from "./providers/MembershipProvider";

const App = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <UserProvider>
              <MembershipProvider>
                <Routes>
                  <Route path="/" element={<Summary />} />
                </Routes>
              </MembershipProvider>
            </UserProvider>
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
