import { useEffect, useState } from "react";
import "./manifestbynumber.css";
import { format } from "date-fns";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";
import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import {
  MdDescription,
  MdLocalShipping,
  MdCalendarToday,
  MdLocationOn,
} from "react-icons/md";

const ManifestByNumber = () => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState({});
  const [datarender, setdatarednder] = useState(false);
  const [vehicle_number, setVehicle_number] = useState("");
  const [tohub, setTohub] = useState("");
  const nav = useNavigate();
  const { manifestnumber } = useParams();

  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/login");
      return;
    }
    setdatarednder(true);
    axiosInstance
      .get("manifestdata/" + manifestnumber, {
        headers: { Authorization: "Token " + localStorage.getItem("token") },
      })
      .then((r) => {
        if (r.data.status === "success") {
          if (r.data.awb != 0) {
            setData(r.data.awbno);
            setTohub(r.data.tohub);
            setDate(r.data.date);
            setVehicle_number(r.data.vehicle_number);
          } else {
            setData({});
          }
        }
        setdatarednder(false);
      })
      .catch((e) => {
        console.error("Error fetching manifest data:", e);
        setdatarednder(false);
      });
  }, [nav, manifestnumber]);

  const totalItems = data ? Object.keys(data).length : 0;

  return (
    <div className="manifest">
      <div className="manifest__container">
        {/* Header Card */}
        <div className="manifest__header-card">
          <div className="manifest__header-content">
            <div className="manifest__header-left">
              <MdDescription className="manifest__header-icon" />
              <div>
                <h1 className="manifest__title">Manifest Details</h1>
                <p className="manifest__subtitle">Manifest #{manifestnumber}</p>
              </div>
            </div>
            <div className="manifest__counter">
              <span className="manifest__counter-label">TOTAL ITEMS</span>
              <span className="manifest__counter-value">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="manifest__details-card">
          <h2 className="manifest__details-title">Manifest Information</h2>
          <div className="manifest__details-grid">
            <div className="manifest__detail-item">
              <div className="manifest__detail-icon">
                <MdDescription />
              </div>
              <div className="manifest__detail-content">
                <span className="manifest__detail-label">Manifest Number</span>
                <span className="manifest__detail-value">{manifestnumber}</span>
              </div>
            </div>

            <div className="manifest__detail-item">
              <div className="manifest__detail-icon">
                <MdCalendarToday />
              </div>
              <div className="manifest__detail-content">
                <span className="manifest__detail-label">Date</span>
                <span className="manifest__detail-value">
                  {date ? format(new Date(date), "dd MMM yyyy") : "N/A"}
                </span>
              </div>
            </div>

            <div className="manifest__detail-item">
              <div className="manifest__detail-icon">
                <MdLocalShipping />
              </div>
              <div className="manifest__detail-content">
                <span className="manifest__detail-label">Vehicle Number</span>
                <span className="manifest__detail-value">
                  {vehicle_number ? vehicle_number.toUpperCase() : "N/A"}
                </span>
              </div>
            </div>

            <div className="manifest__detail-item">
              <div className="manifest__detail-icon">
                <MdLocationOn />
              </div>
              <div className="manifest__detail-content">
                <span className="manifest__detail-label">Destination Hub</span>
                <span className="manifest__detail-value">
                  {tohub ? tohub.toUpperCase() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="manifest__table-card">
          <h2 className="manifest__table-title">AWB Items</h2>

          <div className="manifest__table-content">
            {datarender ? (
              <div className="manifest__loading">
                <Spinner />
                <p>Loading manifest data...</p>
              </div>
            ) : totalItems === 0 ? (
              <div className="manifest__empty">
                <MdDescription className="manifest__empty-icon" />
                <p className="manifest__empty-text">
                  No items found in this manifest
                </p>
              </div>
            ) : (
              <div className="manifest__table-wrapper">
                <table className="manifest__table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>AWB Number</th>
                      <th>Pieces</th>
                      <th>Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data).map((value, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td
                          onClick={() => nav("/track/" + value[1].awbno)}
                          className="manifest__awb-link"
                        >
                          {value[1].awbno}
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

export default ManifestByNumber;
