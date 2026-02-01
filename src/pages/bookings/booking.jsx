import { useRef, useState, useEffect } from "react";
import axiosInstance from "../../components/axios";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import "./booking.css";

const Booking = () => {
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    awbno: "",
    date: new Date().toISOString().slice(0, 10),
    doc_type: "",
    pcs: "",
    wt: "",
    sendername: "",
    receivername: "",
    senderphone: "",
    receiverphone: "",
    senderaddress: "",
    receiveraddress: "",
    destination_code: "",
    mode: "",
    contents: "",
    pincode: "",
  });

  const [destinations, setDestinations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");

    const fetchDestinations = async () => {
      try {
        const res = await axiosInstance.get("gethublist/", {
          headers: {
            Authorization: "Token " + localStorage.getItem("token"),
          },
        });
        setDestinations(res.data.hub);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDest(false);
      }
    };

    fetchDestinations();
  }, [navigate]);

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "awbno") {
      if (/^\d{0,10}$/.test(value)) setFormData({ ...formData, awbno: value });
      return;
    }

    if (name === "senderphone" || name === "receiverphone") {
      if (/^\d{0,10}$/.test(value)) setFormData({ ...formData, [name]: value });
      return;
    }

    if (name === "doc_type") {
      if (value === "docx") {
        setFormData({
          ...formData,
          doc_type: value,
          wt: "0.250",
          pcs: "1",
        });
      } else {
        setFormData({
          ...formData,
          doc_type: value,
          wt: "",
          pcs: "",
        });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    if (formData.awbno.length !== 10) {
      setToast({ message: "AWB must be 10 digits", type: "error" });
      return false;
    }

    if (!formData.destination_code) {
      setToast({ message: "Select destination", type: "error" });
      return false;
    }

    if (formData.senderphone.length !== 10) {
      setToast({ message: "Sender phone must be 10 digits", type: "error" });
      return false;
    }

    if (formData.receiverphone.length !== 10) {
      setToast({ message: "Receiver phone must be 10 digits", type: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitLoading(true);

      const response = await axiosInstance.post("booking/", formData, {
        headers: {
          Authorization: "Token " + localStorage.getItem("token"),
        },
      });

      if (response.data.status === "success") {
        setRecentBookings((prev) => [
          {
            ...formData,
            displayDate: new Date().toLocaleDateString(),
          },
          ...prev,
        ]);

        setToast({ message: "Booking Created Successfully", type: "success" });

        setFormData({
          ...formData,
          awbno: "",
          pcs: "",
          wt: "",
        });
      } else if (response.data.status === "exists") {
        setToast({ message: "AWB already exists", type: "error" });
      } else {
        setToast({ message: "Error creating booking", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Server error", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loadingDest) return <Spinner />;

  return (
    <div className="booking-page">
      <h2>Retail Booking</h2>

      <div className="grid-3">
        <div className="form-group">
          <label>Document Number *</label>
          <input
            name="awbno"
            value={formData.awbno}
            onChange={handleChange}
            ref={(el) => (inputRefs.current[0] = el)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
          />
        </div>

        <div className="form-group">
          <label>Destination *</label>
          <select
            name="destination_code"
            value={formData.destination_code}
            onChange={handleChange}
          >
            <option value="">Select Destination</option>
            {destinations.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h3 className="section-title">Sender Details</h3>
      <div className="grid-4">
        <input
          name="sendername"
          value={formData.sendername}
          onChange={handleChange}
          placeholder="Sender Name"
        />
        <input
          name="senderaddress"
          value={formData.senderaddress}
          onChange={handleChange}
          placeholder="Sender Address"
        />
        <input
          name="senderphone"
          value={formData.senderphone}
          onChange={handleChange}
          placeholder="Sender Phone"
        />
      </div>

      <h3 className="section-title">Receiver Details</h3>
      <div className="grid-4">
        <input
          name="receivername"
          value={formData.receivername}
          onChange={handleChange}
          placeholder="Receiver Name"
        />
        <input
          name="receiveraddress"
          value={formData.receiveraddress}
          onChange={handleChange}
          placeholder="Receiver Address"
        />
        <input
          name="receiverphone"
          value={formData.receiverphone}
          onChange={handleChange}
          placeholder="Receiver Phone"
        />
      </div>

      <h3 className="section-title">Service Details</h3>
      <div className="grid-4">
        <select
          name="doc_type"
          value={formData.doc_type}
          onChange={handleChange}
        >
          <option value="">Select Type</option>
          <option value="docx">DOX</option>
          <option value="nondocx">NON DOX</option>
        </select>

        <input
          name="wt"
          value={formData.wt}
          onChange={handleChange}
          placeholder="Weight"
        />

        <input
          name="pcs"
          value={formData.pcs}
          onChange={handleChange}
          placeholder="Pieces"
        />

        <select name="mode" value={formData.mode} onChange={handleChange}>
          <option value="">Select Mode</option>
          <option value="SURFACE">SURFACE</option>
          <option value="AIR">AIR</option>
        </select>
      </div>

      <div className="confirm-section">
        <button className="button" onClick={handleSubmit}>
          {submitLoading ? <Spinner /> : "CONFIRM BOOKING"}
        </button>
      </div>

      <div className="recent-section" style={{margin:"10px"}}>
        <h3>Recent Bookings <span  style={{fontSize:"16px",float:"right",cursor:"pointer"}}>View All</span></h3>
        <table className="recent-table"  style={{margin:"10px"}}>
          <thead>
            <tr>
              <th>Sl</th>
              <th>AWB</th>
              <th>Date</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Type</th>
              <th>Wt</th>
              <th>Pcs</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.length === 0 ? (
              <tr>
                <td colSpan="8">No data</td>
              </tr>
            ) : (
              recentBookings.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.awbno}</td>
                  <td>{item.displayDate}</td>
                  <td>{item.sendername}</td>
                  <td>{item.receivername}</td>
                  <td>{item.doc_type}</td>
                  <td>{item.wt}</td>
                  <td>{item.pcs}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onclose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Booking;
