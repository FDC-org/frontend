import { useEffect, useState } from "react";
import "./viewinscan.css";
import { format } from "date-fns";
import axios from "axios";
import { Spinner } from "../../components/spinner/spinner";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import { MdCalendarToday, MdVisibility } from "react-icons/md";

const ViewInscan = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchInscanData(date);
  }, [navigate]);

  const fetchInscanData = (selectedDate) => {
    setdatarednder(true);
    axios
      .get(import.meta.env.VITE_API_LINK + "inscan/" + selectedDate, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success") {
          if (r.data.data != 0) {
            setData(r.data.data);
          } else {
            setData({});
          }
        }
        setdatarednder(false);
      })
      .catch((e) => {
        console.error("Error fetching inscan data:", e);
        setdatarednder(false);
      });
  };

  const handlechange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    fetchInscanData(selectedDate);
  };

  const formatdate = (datef) => {
    const [date, timeWithMs] = datef.split("T");
    const time = timeWithMs.split(".")[0];
    return date + ", " + time;
  };

  const totalItems = data ? Object.keys(data).length : 0;

  return (
    <div className="viewinscan">
      <div className="viewinscan__container">
        {/* Header Card */}
        <div className="viewinscan__header-card">
          <div className="viewinscan__header-content">
            <div className="viewinscan__header-left">
              <MdVisibility className="viewinscan__header-icon" />
              <div>
                <h1 className="viewinscan__title">View Inscan</h1>
                <p className="viewinscan__subtitle">
                  Review inscanned packages
                </p>
              </div>
            </div>
            <div className="viewinscan__counter">
              <span className="viewinscan__counter-label">TOTAL ITEMS</span>
              <span className="viewinscan__counter-value">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="viewinscan__filter-card">
          <label className="viewinscan__filter-label">
            <MdCalendarToday className="viewinscan__filter-icon" />
            Select Date
          </label>
          <input
            type="date"
            name="date"
            className="viewinscan__date-input"
            value={date}
            onChange={handlechange}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        {/* Table Card */}
        <div className="viewinscan__table-card">
          <h2 className="viewinscan__table-title">
            Inscan Records - {format(new Date(date), "dd MMM yyyy")}
          </h2>

          <div className="viewinscan__table-content">
            {datarender ? (
              <div className="viewinscan__loading">
                <Spinner />
                <p>Loading data...</p>
              </div>
            ) : totalItems === 0 ? (
              <div className="viewinscan__empty">
                <MdVisibility className="viewinscan__empty-icon" />
                <p className="viewinscan__empty-text">
                  No inscan records found for this date
                </p>
              </div>
            ) : (
              <div className="viewinscan__table-wrapper">
                <table className="viewinscan__table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Date & Time</th>
                      <th>AWB Number</th>
                      <th>Type</th>
                      <th>Pieces</th>
                      <th>Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data).map((value, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{formatdate(value[1].date)}</td>
                        <td
                          onClick={() => navigate("/track/" + value[1].awbno)}
                          className="viewinscan__awb-link"
                        >
                          {value[1].awbno}
                        </td>
                        <td>
                          <span className="viewinscan__type-badge">
                            {value[1].type}
                          </span>
                        </td>
                        <td>{value[1].pcs}</td>
                        <td>{value[1].wt}</td>
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

export default ViewInscan;
