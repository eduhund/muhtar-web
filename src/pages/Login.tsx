import React from "react";

const Login = () => {
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.replace("/");
    }
  }, []);
  return <div>Login page</div>;
};

export default Login;
