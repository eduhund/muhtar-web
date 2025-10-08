import { useEffect } from "react";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";

import "./Login.scss";
import { authAPI } from "../../api";

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

const Login = () => {
  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    if (token) {
      window.location.replace("/");
    }
  }, []);

  async function onFinish(values: FieldType) {
    const { email, password } = values;
    if (!email || !password) return;
    const response = await authAPI.login(email, password);
    console.log("Success:", response);
  }

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-page">
      <img width={128} height={128} src="/assets/img/muhtar_logo.png"></img>
      <Form
        className="login-form"
        name="basicLogin"
        layout="inline"
        size="large"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
        requiredMark={false}
      >
        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
