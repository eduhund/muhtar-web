import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import enGB from "antd/locale/en_GB";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";

import Login from "./pages/Login/Login";

import "./App.scss";
import { SidebarNav } from "./components/SidebarNav/SidebarNav";
import { Resources } from "./pages/Resources";
import { AppProvider } from "./providers/AppProvider";
import { Workers } from "./pages/Workers/Workers";
import { Projects } from "./pages/Projects/Projects";
import { MessageProvider } from "./providers/UIMessageProvider";
import Home from "./promo/pages/Home/Home";
import { useLogin } from "./hooks/useLogin";

const App = () => {
  dayjs.locale("en-gb");
  const { isLoggedIn } = useLogin();
  console.log("App isLoggedIn:", isLoggedIn());
  return (
    <ConfigProvider locale={enGB} theme={{ token: { colorPrimary: "#000" } }}>
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
                        <Route path="/" element={<Resources />} />
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
