import "./navbar.css";
import { IoIosNotifications } from "react-icons/io";
import profileimg from "../../assets/profileimg.png";
import { AiOutlineLogout } from "react-icons/ai";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../auth";
import axios from "axios";
import Toast from "../toast/toast";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const [token, setToken] = useState();
  const [isLogged, setIsLogged] = useState(false);
  const [hubname, setHubname] = useState("");
  const [NAME, setNAME] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token") === "undefined") {
      localStorage.removeItem("token");
      window.location.reload();
    }
    if (isLoggedIn()) {
      setIsLogged(true);
      setToken(localStorage.getItem("token"));
      axios
        .get(import.meta.env.VITE_API_LINK + "userdetails/", {
          headers: { Authorization: "Token " + localStorage.getItem("token") },
        })
        .then((response) => {
          if (response.data.error === "invalid token") {
            localStorage.removeItem("token");
            window.location.reload();
          }
          if (response.data.new_token !== "none") {
            console.log(response.data.new_token);
            localStorage.removeItem("token");
            localStorage.setItem("token", response.data.new_token);
            window.location.reload();
          }
          setHubname(response.data.code_name);
          setType(response.data.type);
          setNAME(response.data.name);
          localStorage.setItem("type", response.data.type);
          localStorage.setItem("hubname", response.data.code_name);
          localStorage.setItem("user", response.data.name);
        })
        .catch(
          (e) => (
            localStorage.removeItem("token"), (window.location.href = "/login")
          )
        );
    }
  }, [isLoggedIn, setToken, setIsLogged, token]);

  return (
    <nav>
      <div className="nav_logo">
        <div className="nav_title">FDC</div>
        <div className="nav_subtitle">courier & cargo</div>
      </div>
      {isLogged && (
        <div className="nav_name">
          {type} :<div className="nav_hubname">{hubname}</div>
        </div>
      )}
      <div className="nav_right">
        <div className="nav_track">
          <input type="search" />
          <div className="nav_button">Track</div>
        </div>
        {isLogged && (
          <div className="nav_login">
            <div className="nav_notiv">
              <IoIosNotifications />
            </div>
            <div className="nav_profile">
              <img src={profileimg} alt="" />
              <div className="nav_profilename">{NAME}</div>
            </div>
            <div
              className="nav_logouticon"
              onClick={() => {
                localStorage.removeItem("token");
                <Toast />;
                window.location.reload();
              }}
            >
              <AiOutlineLogout />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
