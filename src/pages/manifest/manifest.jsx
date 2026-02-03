import { useEffect, useState } from "react";
import "./manifest.css";
import { format } from "date-fns";
import axios from "axios";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import { MdCalendarToday, MdVisibility, MdLocalShipping } from "react-icons/md";

const Manifest = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/login");
      return;
    }
    fetchOutscanData(date);
  }, [nav]);

  const fetchOutscanData = (selectedDate) => {
    setdatarednder(true);
    axiosInstance
      .get("outscan/" + selectedDate, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success") {
          console.log(r.data.data);
          if (r.data.data != 0) {
            setData(r.data.data);
          } else {
            setData({});
          }
        }
        setdatarednder(false);
      })
      .catch((e) => {
        console.error("Error fetching outscan data:", e);
        setdatarednder(false);
      });
  };

  const handlechange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    fetchOutscanData(selectedDate);
  };

  const formatdate = (datef) => {
    const [date, timeWithMs] = datef.split("T");
    const time = timeWithMs.split(".")[0];
    return date + ", " + time;
  };

  const totalItems = data ? Object.keys(data).length : 0;

  return (
    <div className="viewoutscan">
      <div className="viewoutscan__container">
        {/* Header Card */}
        <div className="viewoutscan__header-card">
          <div className="viewoutscan__header-content">
            <div className="viewoutscan__header-left">
              <MdLocalShipping className="viewoutscan__header-icon" />
              <div>
                <h1 className="viewoutscan__title">View Manifest</h1>
                <p className="viewoutscan__subtitle">
                  Review outscanned packages
                </p>
              </div>
            </div>
            <div className="viewoutscan__counter">
              <span className="viewoutscan__counter-label">TOTAL ITEMS</span>
              <span className="viewoutscan__counter-value">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="viewoutscan__filter-card">
          <label className="viewoutscan__filter-label">
            <MdCalendarToday className="viewoutscan__filter-icon" />
            Select Date
          </label>
          <input
            type="date"
            name="date"
            className="viewoutscan__date-input"
            value={date}
            onChange={handlechange}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        {/* Table Card */}
        <div className="viewoutscan__table-card">
          <h2 className="viewoutscan__table-title">
            Outscan Records - {format(new Date(date), "dd MMM yyyy")}
          </h2>

          <div className="viewoutscan__table-content">
            {datarender ? (
              <div className="viewoutscan__loading">
                <Spinner />
                <p>Loading data...</p>
              </div>
            ) : totalItems === 0 ? (
              <div className="viewoutscan__empty">
                <MdLocalShipping className="viewoutscan__empty-icon" />
                <p className="viewoutscan__empty-text">
                  No outscan records found for this date
                </p>
              </div>
            ) : (
              <div className="viewoutscan__table-wrapper">
                <table className="viewoutscan__table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Date & Time</th>
                      <th>Manifest Number</th>
                      <th>Destination Hub</th>
                      <th>Vehicle Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data).map((value, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{formatdate(value[1].date)}</td>
                        <td
                          onClick={() =>
                            nav("/manifest/" + value[1].manifestnumber)
                          }
                          className="viewoutscan__manifest-link"
                        >
                          {value[1].manifestnumber}
                        </td>
                        <td>
                          <span className="viewoutscan__hub-badge">
                            {value[1].tohub}
                          </span>
                        </td>
                        <td className="viewoutscan__vehicle">
                          {value[1].vehicle_number.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manifest;
