import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";

import { Summary } from "./pages";
import Login from "./pages/Login/Login";

import "./App.scss";
import { UserProvider } from "./providers/UserProvider";
import { MembershipProvider } from "./providers/MembershipProvider";

const App = () => {
  return (
    <ConfigProvider
      locale={enUS}
      theme={{ token: { colorPrimary: "#f04f23" } }}
    >
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
