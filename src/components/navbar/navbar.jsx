import "./navbar.css";
import { IoIosNotifications } from "react-icons/io";
import profileimg from "../../assets/profileimg.png";
import { AiOutlineLogout } from "react-icons/ai";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../auth";
import axios from "axios";
import Toast from "../toast/toast";
import axiosInstance from "../axios";
import { Spinner } from "../spinner/spinner";

function NavBar() {
  const [token, setToken] = useState();
  const [isLogged, setIsLogged] = useState(false);
  const [hubname, setHubname] = useState("");
  const [NAME, setNAME] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [track_awbno, setTrackAwbno] = useState("");
  useEffect(() => {
    if (localStorage.getItem("token") === "undefined") {
      localStorage.removeItem("token");
      window.location.reload();
    }
    if (isLoggedIn()) {
      setIsLogged(true);
      setToken(localStorage.getItem("token"));
      if (
        !!localStorage.getItem("type") &&
        !!localStorage.getItem("hubname") &&
        !!localStorage.getItem("user")
      ) {
        setHubname(localStorage.getItem("hubname"));
        setType(localStorage.getItem("type"));
        setNAME(localStorage.getItem("user"));
        axiosInstance
          .get("verify_token/")
          .then((r) => {
            if (r.data.status === "new_token") {
              localStorage.removeItem("token");
              localStorage.setItem("token", r.data.new_token);
            }
          })
          .catch((e) => console.log(e));
      } else {
        setLoading(true);
        axios
          .get(import.meta.env.VITE_API_LINK + "userdetails/", {
            headers: {
              Authorization: "Token " + localStorage.getItem("token"),
            },
          })
          .then((response) => {
            if (response.data.error === "invalid token") {
              localStorage.removeItem("token");
              window.location.reload();
            }
            if (response.data.new_token !== "none") {
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
            setLoading(false);
          });
        axiosInstance.get("csrf/", { withCredentials: true });
      }
    }
  }, [isLoggedIn, setToken, setIsLogged, token]);

  return (
    <nav>
      <div className="nav_logo" onClick={() => (window.location.href = "/")}>
        <div className="nav_title">FDC</div>
        <div className="nav_subtitle">courier & cargo</div>
      </div>
      {isLogged &&
        (loading ? (
          <Spinner />
        ) : (
          <div className="nav_name">
            {type.toUpperCase()} :
            <div className="nav_hubname">{hubname.toUpperCase()}</div>
          </div>
        ))}
      <div className="nav_right">
        <div className="nav_track">
          <input
            type="search"
            onChange={(e) => setTrackAwbno(e.target.value)}
          />
          <div
            className="nav_button"
            onClick={() => (window.location.href = "/track/" + track_awbno)}
          >
            Track
          </div>
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
                localStorage.removeItem("type");
                localStorage.removeItem("hubname");
                localStorage.removeItem("user");
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
