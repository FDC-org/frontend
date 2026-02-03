import { IoIosNotifications } from "react-icons/io";
import { AiOutlineLogout } from "react-icons/ai";
import { useEffect, useState } from "react";
import axios from "axios";
import { isLoggedIn } from "../auth";
import axiosInstance from "../axios";
import Toast from "../toast/toast";
import { Spinner } from "../spinner/spinner";
import profileimg from "../../assets/profileimg.png";
import "./navbar.css";

function NavBar() {
  const [isLogged, setIsLogged] = useState(false);
  const [hubname, setHubname] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackAwbNo, setTrackAwbNo] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Clean up invalid token
    if (token === "undefined") {
      localStorage.removeItem("token");
      window.location.reload();
      return;
    }

    if (!isLoggedIn()) {
      setIsLogged(false);
      return;
    }

    setIsLogged(true);

    const cachedType = localStorage.getItem("type");
    const cachedHubname = localStorage.getItem("hubname");
    const cachedUser = localStorage.getItem("user");

    // Use cached data if available
    if (cachedType && cachedHubname && cachedUser) {
      setHubname(cachedHubname);
      setUserType(cachedType);
      setUserName(cachedUser);

      // Verify token in background
      axiosInstance
        .get("verify_token/")
        .then((response) => {
          if (response.data.status === "new_token") {
            localStorage.setItem("token", response.data.new_token);
          } else if (
            response.data.status === "invalid" ||
            response.data.error === "invalid token"
          ) {
            handleLogout();
          }
        })
        .catch((error) => console.error("Token verification failed:", error));
    } else {
      // Fetch user details
      fetchUserDetails();
    }

    // Get CSRF token
    axiosInstance.get("csrf/", { withCredentials: true });
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_LINK + "userdetails/",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        },
      );

      const { error, status, new_token, code_name, type, name } = response.data;

      // Handle invalid token
      if (
        error === "invalid token" ||
        error === "token expired" ||
        status === "invalid"
      ) {
        handleLogout();
        return;
      }

      // Handle token refresh
      if (new_token && new_token !== "none") {
        localStorage.setItem("token", new_token);
        window.location.reload();
        return;
      }

      // Update state and cache
      setHubname(code_name);
      setUserType(type);
      setUserName(name);
      localStorage.setItem("type", type);
      localStorage.setItem("hubname", code_name);
      localStorage.setItem("user", name);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      Toast({ type: "error", message: "Failed to load user details" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("type");
    localStorage.removeItem("hubname");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleTrackSubmit = () => {
    const awbNo = trackAwbNo.trim();

    if (!awbNo) {
      Toast({
        type: "error",
        message: "Enter AWB number to track",
      });
      return;
    }

    handleNavigation(`/track/${awbNo}`);
  };

  const handleTrackKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTrackSubmit();
    }
  };

  return (
    <nav className="navbar">
      <div
        className="navbar__brand"
        onClick={() => handleNavigation("/")}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavigation("/");
          }
        }}
      >
        <h1 className="navbar__title">FDC</h1>
        <span className="navbar__subtitle">courier & cargo</span>
      </div>

      {isLogged && (
        <div className="navbar__info">
          {loading ? (
            <Spinner size="sm" color="light" />
          ) : (
            <>
              <span className="navbar__type">{userType.toUpperCase()}</span>
              <span className="navbar__separator">:</span>
              <span className="navbar__hubname">{hubname.toUpperCase()}</span>
            </>
          )}
        </div>
      )}

      <div className="navbar__actions">
        <div className="navbar__track">
          <input
            type="search"
            className="navbar__track-input"
            placeholder="Enter AWB number"
            value={trackAwbNo}
            onChange={(e) => setTrackAwbNo(e.target.value)}
            onKeyPress={handleTrackKeyPress}
            aria-label="Track AWB number"
          />
          <button
            className="navbar__track-button"
            onClick={handleTrackSubmit}
            aria-label="Track shipment"
          >
            Track
          </button>
        </div>

        {isLogged && (
          <div className="navbar__user">
            <button
              className="navbar__notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <IoIosNotifications />
            </button>

            <div className="navbar__profile">
              <img
                src={profileimg}
                alt={userName}
                className="navbar__profile-image"
              />
              <span className="navbar__profile-name">{userName}</span>
            </div>

            <button
              className="navbar__logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <AiOutlineLogout />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
