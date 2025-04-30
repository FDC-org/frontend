import "./navbar.css";
import { IoIosNotifications } from "react-icons/io";
import profileimg from "../../assets/profileimg.png";
import { AiOutlineLogout } from "react-icons/ai";
import { useEffect, useState } from "react";
import { isLoggedIn } from "../auth";
import axios from "axios";
import Toast from "../toast/toast";
import { useNavigate } from "react-router-dom";

function NavBar_login() {
  return (
    <nav>
      <div className="nav_logo">
        <div className="nav_title">FDC</div>
        <div className="nav_subtitle">courier & cargo</div>
      </div>

      <div className="nav_right">
        <div className="nav_track">
          <input type="search" />
          <div className="nav_button">Track</div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar_login;
