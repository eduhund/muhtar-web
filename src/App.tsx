import { Route, Routes } from "react-router-dom";

import { ConfigProvider } from "antd";
import ruRU from "antd/lib/locale/ru_RU";

import { Summary, UserTimeboard } from "./pages";

import "./App.css";

const App = () => {
  return (
    <ConfigProvider locale={ruRU}>
      <Routes>
        <Route path={"/"} element={<Summary />} />
        <Route path={"/users/:userId"} element={<UserTimeboard />} />
      </Routes>
    </ConfigProvider>
  );
};

export default App;
