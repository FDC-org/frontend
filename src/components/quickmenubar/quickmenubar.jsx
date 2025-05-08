import { useEffect, useState } from "react";
import "./quickmenubar.css";
import { format } from "date-fns";

const QuickMenuBar = () => {
  const [CurrentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [setCurrentTime]);

  return (
    <div className="quickmenu_con">
      <div className="quickmenu_left">
        <div
          className="quickmenu_items"
          onClick={() => (window.location.href = "/")}
        >
          Dashboard
        </div>
        <div className="quickmenu_items">Booking</div>
        <div className="quickmenu_dropdown">
          <div className="quickmenu_items">Inscan</div>
          <div className="quickmenu_dropdown-content">
            <div
              className="quickmenu_dropdown-item"
              onClick={() => (window.location.href = "/inscan")}
            >
              Inscan
            </div>
            <div
              className="quickmenu_dropdown-item"
              onClick={() => (window.location.href = "/inscan/view")}
            >
              View Inscan
            </div>
          </div>
        </div>
        <div className="quickmenu_dropdown">
          <div className="quickmenu_items">Outscan</div>
          <div className="quickmenu_dropdown-content">
            <div
              className="quickmenu_dropdown-item"
              onClick={() => (window.location.href = "/outscan")}
            >
              OutScan
            </div>
            <div
              className="quickmenu_dropdown-item"
              onClick={() => (window.location.href = "/outscan/view")}
            >
              View Outscan
            </div>
          </div>
        </div>
        <div
          className="quickmenu_items"
          onClick={() => (window.location.href = "/manifest")}
        >
          Manifest
        </div>
        <div className="quickmenu_items">DRS</div>
        <div className="quickmenu_items">Delivery</div>
        <div className="quickmenu_dropdown">
          <div className="quickmenu_items">Reports</div>
          <div className="quickmenu_dropdown-content">
            <div className="quickmenu_dropdown-item">Inscan vs Outscan</div>
          </div>
        </div>
      </div>
      <div className="quickmenu_right">
        <div className="quickmenu_date">
          {format(CurrentTime, "EEEE, dd-MM-yy")}
        </div>
        <div className="quickmenu_time">
          {format(CurrentTime, "hh:mm:ss a")}
        </div>
      </div>
    </div>
  );
};

export default QuickMenuBar;
