import { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { Button, Form, Input, Typography } from "antd";

import { useLogin } from "../../hooks/useLogin";

import "./Login.scss";
import { userStorage } from "../../utils/storage";

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

const { Text } = Typography;

const Login = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useLogin();

  useEffect(() => {
    const token = userStorage.getAccessToken();
    if (token) {
      window.location.replace("/");
    }
  }, []);

  async function onFinish(values: FieldType) {
    const { email, password } = values;
    if (!email || !password) return;
    const { data, error } = await login(email, password);
    if (data) {
      window.location.replace("/");
    } else {
      setErrorMessage(error?.description || "Login failed");
    }
  }

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <Form
          className="login-form"
          name="basicLogin"
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          onFieldsChange={() => setErrorMessage(null)}
          autoComplete="on"
          requiredMark={false}
        >
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
            style={{ marginBottom: 12, marginTop: -4 }}
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

          <Form.Item label={null} style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" className="login-button">
              Login
            </Button>
          </Form.Item>
        </Form>
        {errorMessage && <Text type="danger">{errorMessage}</Text>}
      </div>
    </div>
  );
};

export default Login;
