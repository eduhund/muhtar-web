import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";

import Login from "./pages/Login/Login";

import "./App.scss";
import { SidebarNav } from "./components/SidebarNav/SidebarNav";
import { Timetable } from "./pages/Timetable";
import { AppProvider } from "./providers/AppProvider";
import { Workers } from "./pages/Workers/Workers";
import { Projects } from "./pages/Projects/Projects";
import { MessageProvider } from "./providers/UIMessageProvider";
import Home from "./promo/pages/Home/Home";
import { useLogin } from "./hooks/useLogin";

const App = () => {
  const { isLoggedIn } = useLogin();
  console.log("App isLoggedIn:", isLoggedIn());
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
            isLoggedIn() ? (
              <AppProvider>
                <MessageProvider>
                  <div className="App-container">
                    <div className="App-sidebar">
                      <SidebarNav />
                    </div>
                    <div className="App-content">
                      <Routes>
                        <Route path="/" element={<Timetable />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route
                          path="/projects/:projectId"
                          element={<Projects />}
                        />
                        <Route path="/workers" element={<Workers />} />
                      </Routes>
                    </div>
                  </div>
                </MessageProvider>
              </AppProvider>
            ) : (
              <Home />
            )
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
