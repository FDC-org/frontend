import { useEffect, useState } from "react";
import Button from "../../components/button/button";
import "./login.css";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { isLoggedIn } from "../../components/auth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import getCookie from "../../components/getCookies";

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
      axios
        .post(import.meta.env.VITE_API_LINK + "login/", {
          username: username,
          password: password,
        })
        .then(async (response) => {
          localStorage.setItem("token", response.data.token);
          setToast(true);
          seterror("success");
          await axios
            .get(import.meta.env.VITE_API_LINK + "csrf/", {
              withCredentials: true,
              headers: {
                Authorization: "Token " + localStorage.getItem("token"),
              },
            })
            .then((r) => console.log(r.data))
            .catch((e) => console.log(e));
          console.log(localStorage.getItem("token"));
          console.log(getCookie());

          setTimeout(() => {
            window.location.reload();
            navigate("/");
          }, 1000);
        })
        .catch((e) => {
          seterror("invalid username or password");
          setToast(true);
          setLoginclick(false);
        });
    } else {
      if (username == "") seterror("username required");
      else seterror("password required");
      setLoginclick(false);
      setToast(true);
    }
  };

  return (
    <div className="login_cointainer">
      <div className="login">
        <div className="login_name">LOGIN</div>
        <div className="login_form">
          <div className="login_input_field">
            <label> Username *</label>
            <div className="input_field">
              <input
                type="text"
                name="username"
                className="login_input"
                onChange={(e) => setusername(e.target.value)}
              />
              <FaLock />
            </div>
          </div>
          <div className="login_input_field">
            <label> Password *</label>
            <div className="input_field">
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                className="login_input"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div onClick={() => setShowpassword(!showpassword)}>
                {!showpassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>
          {loginclick ? <Spinner /> : <Button name="Login" onclick={login} />}
        </div>
      </div>
      {toast && (
        <Toast
          message={error}
          type={error == "success" ? "success" : "error"}
          onclose={() => setToast(false)}
        />
      )}
    </div>
  );
};
export default Login;
