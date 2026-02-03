import { useEffect, useState } from "react";
import Button from "../../components/button/button";
import "./login.css";
import { FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import axios from "axios";
import { isLoggedIn } from "../../components/auth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import axiosInstance from "../../components/axios";

const Login = () => {
  const [showpassword, setShowpassword] = useState(false);
  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [error, seterror] = useState("");
  const [loginclick, setLoginclick] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) navigate("/");
  }, [isLoggedIn, navigate]);

  const login = async () => {
    seterror("");

    if (username !== "" && password !== "") {
      setLoginclick(true);
      await axios
        .post(import.meta.env.VITE_API_LINK + "login/", {
          username: username,
          password: password,
        })
        .then(async (response) => {
          localStorage.setItem("token", response.data.token);
          setToast(true);
          seterror("success");
          await axiosInstance
            .get("csrf/", {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
                Authorization: "Token " + localStorage.getItem("token"),
              },
            })
            .then((r) => console.log(r.data))
            .catch((e) => console.log(e));
          setTimeout(() => {
            console.log(localStorage.getItem("token"));
            window.location.href = "/";
          }, 1000);
        })
        .catch((e) => {
          seterror("invalid username or password");
          setToast(true);
          setLoginclick(false);
        });
    } else {
      if (username === "") seterror("username required");
      else seterror("password required");
      setLoginclick(false);
      setToast(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loginclick) {
      login();
    }
  };

  return (
    <div className="login_container">
      <div className="login_wrapper">
        <div className="login_card">
          <div className="login_header">
            <div className="login_icon">
              <FaLock />
            </div>
            <h1 className="login_title">Welcome Back</h1>
            <p className="login_subtitle">
              Sign in to continue to your account
            </p>
          </div>

          <div className="login_form">
            <div className="login_input_group">
              <label className="login_label">Username</label>
              <div className="input_wrapper">
                <div className="input_icon">
                  <FaUser />
                </div>
                <input
                  type="text"
                  name="username"
                  className="login_input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loginclick}
                />
              </div>
            </div>

            <div className="login_input_group">
              <label className="login_label">Password</label>
              <div className="input_wrapper">
                <div className="input_icon">
                  <FaLock />
                </div>
                <input
                  type={showpassword ? "text" : "password"}
                  name="password"
                  className="login_input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loginclick}
                />
                <button
                  type="button"
                  className="password_toggle"
                  onClick={() => setShowpassword(!showpassword)}
                  disabled={loginclick}
                  aria-label={showpassword ? "Hide password" : "Show password"}
                >
                  {!showpassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div className="login_actions">
              {loginclick ? (
                <div className="spinner_wrapper">
                  <Spinner />
                </div>
              ) : (
                <Button name="Sign In" onclick={login} />
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={error}
          type={error === "success" ? "success" : "error"}
          onclose={() => setToast(false)}
        />
      )}
    </div>
  );
};

export default Login;
