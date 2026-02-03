import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { isLoggedIn } from "../../components/auth";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import {
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdDescription,
  MdLocalShipping,
} from "react-icons/md";
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
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    fetchDestinations();
  }, [navigate]);

  const fetchDestinations = async () => {
    try {
      const res = await axiosInstance.get("gethublist/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      setDestinations(res.data.hub || []);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
      showToast("Failed to load destinations", "error");
    } finally {
      setLoadingDest(false);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate AWB number (10 digits only)
    if (name === "awbno") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, awbno: value }));
      }
      return;
    }

    // Validate phone numbers (10 digits only)
    if (name === "senderphone" || name === "receiverphone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Auto-fill for document type
    if (name === "doc_type") {
      if (value === "docx") {
        setFormData((prev) => ({
          ...prev,
          doc_type: value,
          wt: "0.250",
          pcs: "1",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          doc_type: value,
          wt: "",
          pcs: "",
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (formData.awbno.length !== 10) {
      showToast("AWB number must be exactly 10 digits", "error");
      return false;
    }

    if (!formData.destination_code) {
      showToast("Please select a destination", "error");
      return false;
    }

    if (!formData.sendername.trim()) {
      showToast("Sender name is required", "error");
      return false;
    }

    // if (formData.senderphone.length !== 10) {
    //   showToast("Sender phone must be 10 digits", "error");
    //   return false;
    // }

    if (!formData.receivername.trim()) {
      showToast("Receiver name is required", "error");
      return false;
    }

    // if (formData.receiverphone.length !== 10) {
    //   showToast("Receiver phone must be 10 digits", "error");
    //   return false;
    // }

    if (!formData.doc_type) {
      showToast("Please select document type", "error");
      return false;
    }

    if (!formData.wt || parseFloat(formData.wt) <= 0) {
      showToast("Please enter a valid weight", "error");
      return false;
    }

    if (!formData.pcs || parseInt(formData.pcs) <= 0) {
      showToast("Please enter valid number of pieces", "error");
      return false;
    }

    if (!formData.mode) {
      showToast("Please select shipment mode", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitLoading(true);

    try {
      const response = await axiosInstance.post("booking/", formData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === "success") {
        setRecentBookings((prev) => [
          {
            ...formData,
            displayDate: new Date().toLocaleDateString("en-IN"),
          },
          ...prev.slice(0, 9), // Keep only last 10 bookings
        ]);

        showToast("Booking created successfully!", "success");

        // Reset only necessary fields
        setFormData((prev) => ({
          ...prev,
          awbno: "",
          pcs: formData.doc_type === "docx" ? "1" : "",
          wt: formData.doc_type === "docx" ? "0.250" : "",
        }));

        // Focus on AWB input
        inputRefs.current[0]?.focus();
      } else if (response.data.status === "exists") {
        showToast("AWB number already exists", "error");
      } else {
        showToast("Failed to create booking", "error");
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      showToast(
        err.response?.data?.message || "Server error occurred",
        "error",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate("/booking/view");
  };

  if (loadingDest) {
    return (
      <div className="booking">
        <div className="booking__loading">
          <Spinner size="lg" />
          <p>Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking">
      <div className="booking__container">
        <header className="booking__header">
          <div>
            <h1 className="booking__title">Retail Booking</h1>
            <p className="booking__subtitle">Create a new shipment booking</p>
          </div>
        </header>

        <form className="booking__form" onSubmit={(e) => e.preventDefault()}>
          {/* Document Details */}
          <section className="booking__section">
            <h2 className="booking__section-title">
              <MdDescription />
              Document Details
            </h2>
            <div className="booking__grid booking__grid--3">
              <div className="form-field">
                <label htmlFor="awbno" className="form-field__label">
                  AWB Number <span className="required">*</span>
                </label>
                <input
                  id="awbno"
                  name="awbno"
                  type="text"
                  className="form-field__input"
                  placeholder="Enter 10-digit AWB"
                  value={formData.awbno}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[0] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  maxLength={10}
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="date" className="form-field__label">
                  Date
                </label>
                <input
                  disabled
                  id="date"
                  name="date"
                  type="date"
                  className="form-field__input"
                  value={formData.date}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[1] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="destination" className="form-field__label">
                  Destination <span className="required">*</span>
                </label>
                <select
                  id="destination"
                  name="destination_code"
                  className="form-field__select"
                  value={formData.destination_code}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[2] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                >
                  <option value="">Select destination</option>
                  {destinations.map((dest) => (
                    <option key={dest.code} value={dest.code}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Sender Details */}
          <section className="booking__section">
            <h2 className="booking__section-title">
              <MdPerson />
              Sender Details
            </h2>
            <div className="booking__grid booking__grid--3">
              <div className="form-field">
                <label htmlFor="sendername" className="form-field__label">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="sendername"
                  name="sendername"
                  type="text"
                  className="form-field__input"
                  placeholder="Sender name"
                  value={formData.sendername}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[3] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="senderphone" className="form-field__label">
                  Phone <span className="required"></span>
                </label>
                <input
                  id="senderphone"
                  name="senderphone"
                  type="tel"
                  className="form-field__input"
                  placeholder="10-digit phone"
                  value={formData.senderphone}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[4] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                  maxLength={10}
                />
              </div>

              <div className="form-field">
                <label htmlFor="senderaddress" className="form-field__label">
                  Address
                </label>
                <input
                  id="senderaddress"
                  name="senderaddress"
                  type="text"
                  className="form-field__input"
                  placeholder="Sender address"
                  value={formData.senderaddress}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[5] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 5)}
                />
              </div>
            </div>
          </section>

          {/* Receiver Details */}
          <section className="booking__section">
            <h2 className="booking__section-title">
              <MdLocationOn />
              Receiver Details
            </h2>
            <div className="booking__grid booking__grid--3">
              <div className="form-field">
                <label htmlFor="receivername" className="form-field__label">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="receivername"
                  name="receivername"
                  type="text"
                  className="form-field__input"
                  placeholder="Receiver name"
                  value={formData.receivername}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[6] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 6)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="receiverphone" className="form-field__label">
                  Phone <span className="required"></span>
                </label>
                <input
                  id="receiverphone"
                  name="receiverphone"
                  type="tel"
                  className="form-field__input"
                  placeholder="10-digit phone"
                  value={formData.receiverphone}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[7] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 7)}
                  maxLength={10}
                />
              </div>

              <div className="form-field">
                <label htmlFor="receiveraddress" className="form-field__label">
                  Address
                </label>
                <input
                  id="receiveraddress"
                  name="receiveraddress"
                  type="text"
                  className="form-field__input"
                  placeholder="Receiver address"
                  value={formData.receiveraddress}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[8] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 8)}
                />
              </div>
            </div>
          </section>

          {/* Service Details */}
          <section className="booking__section">
            <h2 className="booking__section-title">
              <MdLocalShipping />
              Service Details
            </h2>
            <div className="booking__grid booking__grid--4">
              <div className="form-field">
                <label htmlFor="doc_type" className="form-field__label">
                  Type <span className="required">*</span>
                </label>
                <select
                  id="doc_type"
                  name="doc_type"
                  className="form-field__select"
                  value={formData.doc_type}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[9] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 9)}
                >
                  <option value="">Select type</option>
                  <option value="docx">DOX</option>
                  <option value="nondocx">NON DOX</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="wt" className="form-field__label">
                  Weight (kg) <span className="required">*</span>
                </label>
                <input
                  id="wt"
                  name="wt"
                  type="number"
                  step="0.001"
                  className="form-field__input"
                  placeholder="0.000"
                  value={formData.wt}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[10] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 10)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="pcs" className="form-field__label">
                  Pieces <span className="required">*</span>
                </label>
                <input
                  id="pcs"
                  name="pcs"
                  type="number"
                  className="form-field__input"
                  placeholder="0"
                  value={formData.pcs}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[11] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 11)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="mode" className="form-field__label">
                  Mode <span className="required">*</span>
                </label>
                <select
                  id="mode"
                  name="mode"
                  className="form-field__select"
                  value={formData.mode}
                  onChange={handleChange}
                  ref={(el) => (inputRefs.current[12] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 12)}
                >
                  <option value="">Select mode</option>
                  <option value="SURFACE">SURFACE</option>
                  <option value="AIR">AIR</option>
                </select>
              </div>
            </div>

            <div className="booking__grid booking__grid--1">
              <div className="form-field">
                <label htmlFor="contents" className="form-field__label">
                  Contents Description
                </label>
                <textarea
                  id="contents"
                  name="contents"
                  className="form-field__textarea"
                  placeholder="Describe package contents"
                  value={formData.contents}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="booking__actions">
            <button
              type="button"
              className="booking__button booking__button--primary"
              onClick={handleSubmit}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <Spinner size="sm" color="light" />
                  <span>Creating Booking...</span>
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </div>
        </form>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <section className="booking__recent">
            <div className="booking__recent-header">
              <h2 className="booking__section-title">Recent Bookings</h2>
              <button className="booking__view-all" onClick={handleViewAll}>
                View All
              </button>
            </div>

            <div className="booking__table-wrapper">
              <table className="booking__table">
                <thead>
                  <tr>
                    <th>Sl</th>
                    <th>AWB</th>
                    <th>Date</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Type</th>
                    <th>Weight</th>
                    <th>Pieces</th>
                    <th>Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="booking__table-awb">{booking.awbno}</td>
                      <td>{booking.displayDate}</td>
                      <td>{booking.sendername}</td>
                      <td>{booking.receivername}</td>
                      <td>
                        <span
                          className={`booking__badge booking__badge--${booking.doc_type}`}
                        >
                          {booking.doc_type?.toUpperCase()}
                        </span>
                      </td>
                      <td>{booking.wt} kg</td>
                      <td>{booking.pcs}</td>
                      <td>
                        <span
                          className={`booking__badge booking__badge--${booking.mode?.toLowerCase()}`}
                        >
                          {booking.mode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
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
