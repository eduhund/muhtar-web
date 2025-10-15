import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";

import Login from "./pages/Login/Login";

import "./App.scss";
import { SidebarNav } from "./components/SidebarNav/SidebarNav";
import { Timetable } from "./pages/Timetable";
import { AppProvider } from "./providers/AppProvider";

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
            <AppProvider>
              <div className="App-container">
                <div className="App-sidebar">
                  <SidebarNav />
                </div>
                <div className="App-content">
                  <Routes>
                    <Route path="/" element={<Timetable />} />
                  </Routes>
                </div>
              </div>
            </AppProvider>
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
