import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";

import Login from "./pages/Login/Login";

import "./App.scss";
import { UserProvider } from "./providers/UserProvider";
import { MembershipProvider } from "./providers/MembershipProvider";
import { TimetableProvider } from "./providers/TimetableProvider";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { SidebarNav } from "./components/SidebarNav/SidebarNav";

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
                <TimetableProvider>
                  <div className="App-container">
                    <div className="App-sidebar">
                      <SidebarNav />
                    </div>
                    <div className="App-content">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                      </Routes>
                    </div>
                  </div>
                </TimetableProvider>
              </MembershipProvider>
            </UserProvider>
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
