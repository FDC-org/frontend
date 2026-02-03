import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  MdDashboard,
  MdBookOnline,
  MdLogin,
  MdLogout,
  MdDescription,
  MdLocalShipping,
} from "react-icons/md";
import "./quickmenubar.css";

const QuickMenuBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      path: "/",
    },
    {
      id: "booking",
      label: "Booking",
      icon: MdBookOnline,
      dropdown: [
        { label: "New Booking", path: "/booking" },
        { label: "View Bookings", path: "/booking/view" },
      ],
    },
    {
      id: "inscan",
      label: "Inscan",
      icon: MdLogin,
      dropdown: [
        { label: "New Inscan", path: "/inscan" },
        { label: "View Inscans", path: "/inscan/view" },
      ],
    },
    {
      id: "outscan",
      label: "Outscan",
      icon: MdLogout,
      dropdown: [
        { label: "New Outscan", path: "/outscan" },
        { label: "View Outscans", path: "/outscan/view" },
      ],
    },
    {
      id: "manifest",
      label: "Manifest",
      icon: MdDescription,
      path: "/manifest",
    },
    {
      id: "drs",
      label: "DRS",
      icon: MdLocalShipping,
      path: "/drs",
    },
  ];

  return (
    <nav className="quickmenu">
      <div className="quickmenu__nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`quickmenu__item ${
              item.dropdown ? "quickmenu__item--dropdown" : ""
            } ${activeDropdown === item.id ? "quickmenu__item--active" : ""}`}
            onMouseEnter={() => item.dropdown && setActiveDropdown(item.id)}
            onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
          >
            {item.dropdown ? (
              <>
                <button className="quickmenu__button">
                  {item.icon && <item.icon className="quickmenu__icon" />}
                  <span>{item.label}</span>
                </button>
                <div className="quickmenu__dropdown">
                  {item.dropdown.map((dropdownItem, index) => (
                    <button
                      key={index}
                      className="quickmenu__dropdown-item"
                      onClick={() => handleNavigation(dropdownItem.path)}
                    >
                      {dropdownItem.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button
                className="quickmenu__button"
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon && <item.icon className="quickmenu__icon" />}
                <span>{item.label}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="quickmenu__datetime">
        <time className="quickmenu__date" dateTime={currentTime.toISOString()}>
          {format(currentTime, "EEEE, dd-MM-yy")}
        </time>
        <time className="quickmenu__time" dateTime={currentTime.toISOString()}>
          {format(currentTime, "hh:mm:ss a")}
        </time>
      </div>
    </nav>
  );
};

export default QuickMenuBar;
