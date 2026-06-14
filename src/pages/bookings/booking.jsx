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
  MdClose,
  MdDashboard,
  MdDateRange,
  MdLock,
} from "react-icons/md";
import { FaBoxes, FaBarcode, FaArrowRight, FaPlane, FaTruck, FaFileInvoice, FaWeightHanging, FaListAlt } from "react-icons/fa";
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
    reference: "",
    courier_charges: "",
    gst: "",
    packing_charges: "",
    freight_charges: "",
    others: "",
    volumetric_weight: "",
  });

  const courierVal = parseFloat(formData.courier_charges) || 0;
  const packingVal = parseFloat(formData.packing_charges) || 0;
  const freightVal = parseFloat(formData.freight_charges) || 0;
  const othersVal = parseFloat(formData.others) || 0;

  const calculatedGst = ((courierVal + packingVal + freightVal + othersVal) * 0.18).toFixed(2);

  const calculatedTotal = (
    courierVal +
    packingVal +
    freightVal +
    othersVal +
    parseFloat(calculatedGst)
  ).toFixed(2);

  const [destinations, setDestinations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [bookingType, setBookingType] = useState("retail"); // "retail" or "credit"
  const [clients, setClients] = useState([]);
  const [selectedClientCode, setSelectedClientCode] = useState("");

  // Child pieces modal
  const [showChildModal, setShowChildModal] = useState(false);
  const [childStartNumber, setChildStartNumber] = useState("");

  // Child pieces popup
  const [showChildPopup, setShowChildPopup] = useState(false);
  const [childPiecesStart, setChildPiecesStart] = useState("");

  // E-way bill popup states
  const [hasEwayBill, setHasEwayBill] = useState(false);
  const [showEwayPopup, setShowEwayPopup] = useState(false);
  const [ewayData, setEwayData] = useState({
    eway_bill_no: "",
    invoice_no: "",
    invoice_date: "",
    invoice_amount: "",
  });

  // Volumetric weight calculator states
  const [hasVolumetricWeight, setHasVolumetricWeight] = useState(false);
  const [showVolumetricPopup, setShowVolumetricPopup] = useState(false);
  const [volumetricData, setVolumetricData] = useState({
    height: "",
    width: "",
    breadth: "",
    divisorType: "surface",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    fetchDestinations();
    fetchClients();
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

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("clients/");
      if (res.data.status === "success") {
        setClients(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (index === 0) { // Enter from AWB -> skip disabled Date and go to Destination
        inputRefs.current[2]?.focus();
        return;
      }

      if (index === 7) { // Enter from Mode -> go to Contents Description
        inputRefs.current[20]?.focus();
        return;
      }

      if (index === 20) { // Enter from Contents Description
        if (bookingType === "credit") {
          inputRefs.current[14]?.focus();
        } else {
          inputRefs.current[8]?.focus();
        }
        return;
      }

      if (index === 14) { // Enter from Client Select
        inputRefs.current[11]?.focus();
        return;
      }

      if (index === 13) { // Enter from Receiver Address
        inputRefs.current[15]?.focus();
        return;
      }

      if (index === 18) { // Enter from Others (last editable billing field) -> Submit
        handleSubmit();
        return;
      }

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

  const handleClientChange = (e) => {
    const clientCode = e.target.value;
    setSelectedClientCode(clientCode);

    if (clientCode) {
      const client = clients.find((c) => c.client_code === clientCode);
      if (client) {
        setFormData((prev) => ({
          ...prev,
          sendername: client.name,
          senderphone: client.phone_number,
          senderaddress: client.address,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        sendername: "",
        senderphone: "",
        senderaddress: "",
      }));
    }
  };

  const handleBookingTypeChange = (type) => {
    setBookingType(type);
    setSelectedClientCode("");
    setFormData((prev) => ({
      ...prev,
      sendername: "",
      senderphone: "",
      senderaddress: "",
    }));
  };

  const validate = () => {
    if (formData.awbno.length !== 10) {
      showToast("AWB number must be exactly 10 digits", "error");
      return false;
    }

    if (bookingType === "credit" && !selectedClientCode) {
      showToast("Please select a client for credit booking", "error");
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

    if (!formData.receivername.trim()) {
      showToast("Receiver name is required", "error");
      return false;
    }

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

    // Show E-way bill details popup if checkbox is checked
    if (hasEwayBill) {
      setShowEwayPopup(true);
      return;
    }

    // If pieces > 1, show child pieces popup next
    if (parseInt(formData.pcs) > 1) {
      setShowChildPopup(true);
      setChildPiecesStart("");
      return;
    }

    // If neither, submit directly
    await submitBooking();
  };

  const handleEwayPopupSubmit = async () => {
    if (!ewayData.eway_bill_no.trim()) {
      showToast("E-way Bill Number is required", "error");
      return;
    }
    if (!ewayData.invoice_no.trim()) {
      showToast("Invoice Number is required", "error");
      return;
    }
    if (!ewayData.invoice_amount || parseFloat(ewayData.invoice_amount) <= 0) {
      showToast("Please enter a valid Invoice Amount", "error");
      return;
    }

    setShowEwayPopup(false);

    // If pieces > 1, show child pieces popup next
    if (parseInt(formData.pcs) > 1) {
      setShowChildPopup(true);
      setChildPiecesStart("");
    } else {
      // Otherwise, submit directly!
      await submitBooking("", ewayData);
    }
  };

  const getDivisorValue = (type) => {
    if (type === "air") return 3000;
    if (type === "logistics") return 4000;
    return 5000; // surface
  };

  const calculateVolumetricWeight = () => {
    const h = parseFloat(volumetricData.height) || 0;
    const w = parseFloat(volumetricData.width) || 0;
    const b = parseFloat(volumetricData.breadth) || 0;
    const div = getDivisorValue(volumetricData.divisorType);
    return ((h * w * b) / div).toFixed(3);
  };

  const handleVolumetricPopupConfirm = () => {
    if (!volumetricData.height || parseFloat(volumetricData.height) <= 0) {
      showToast("Please enter a valid height", "error");
      return;
    }
    if (!volumetricData.width || parseFloat(volumetricData.width) <= 0) {
      showToast("Please enter a valid width", "error");
      return;
    }
    if (!volumetricData.breadth || parseFloat(volumetricData.breadth) <= 0) {
      showToast("Please enter a valid breadth", "error");
      return;
    }

    const calculatedWt = calculateVolumetricWeight();
    setFormData((prev) => ({ ...prev, volumetric_weight: calculatedWt }));
    setShowVolumetricPopup(false);
    setHasVolumetricWeight(true);
    showToast(`Volumetric weight (${calculatedWt} kg) calculated!`, "success");
  };

  const handleVolumetricPopupCancel = () => {
    setShowVolumetricPopup(false);
    if (!formData.volumetric_weight) {
      setHasVolumetricWeight(false);
    }
  };

  const handleChildPopupSubmit = async () => {
    if (!childPiecesStart || childPiecesStart.trim() === "") {
      showToast("Please enter child pieces starting number", "error");
      return;
    }

    await submitBooking(childPiecesStart, hasEwayBill ? ewayData : null);
  };

  const submitBooking = async (childStart = "", ewayFields = null) => {
    setSubmitLoading(true);

    try {
      const bookingData = {
        ...formData,
        gst: calculatedGst,
        total: calculatedTotal,
        booking_type: bookingType,
        client_code: selectedClientCode,
        child_pieces_start: childStart,
        eway_bill_no: ewayFields ? ewayFields.eway_bill_no : "",
        invoice_no: ewayFields ? ewayFields.invoice_no : "",
        invoice_date: ewayFields ? ewayFields.invoice_date : "",
        invoice_amount: ewayFields ? ewayFields.invoice_amount : "",
      };

      const response = await axiosInstance.post("booking/", bookingData, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.status === "success") {
        setRecentBookings((prev) => [
          {
            ...bookingData,
            displayDate: new Date().toLocaleDateString("en-IN"),
          },
          ...prev.slice(0, 9),
        ]);

        showToast("Booking created successfully!", "success");

        // Close popups and reset E-way bill state
        setShowChildPopup(false);
        setChildPiecesStart("");
        setShowEwayPopup(false);
        setEwayData({
          eway_bill_no: "",
          invoice_no: "",
          invoice_date: "",
          invoice_amount: "",
        });
        setHasEwayBill(false);

        // Reset volumetric weight calculator state
        setHasVolumetricWeight(false);
        setShowVolumetricPopup(false);
        setVolumetricData({
          height: "",
          width: "",
          breadth: "",
          divisorType: "surface",
        });

        // Reset form fields
        setFormData((prev) => ({
          ...prev,
          awbno: "",
          pcs: formData.doc_type === "docx" ? "1" : "",
          wt: formData.doc_type === "docx" ? "0.250" : "",
          reference: "",
          contents: "",
          courier_charges: "",
          gst: "",
          packing_charges: "",
          freight_charges: "",
          others: "",
        }));

        // Focus on AWB input
        inputRefs.current[0]?.focus();
      } else if (response.data.status === "exists") {
        showToast("AWB number already exists", "error");
      } else if (response.data.status === "child exists") {
        showToast("Child pieces already exist for this booking", "error");
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

  const todayStats = {
    count: recentBookings.length,
    pcs: recentBookings.reduce((sum, b) => sum + (parseInt(b.pcs) || 0), 0),
    weight: recentBookings.reduce((sum, b) => sum + (parseFloat(b.wt) || 0), 0).toFixed(3)
  };

  const selectedDestName = destinations.find(
    (d) => d.code === formData.destination_code
  )?.name || "";

  return (
    <div className="booking">
      <div className="booking__container">
        <header className="booking__header">
          <div className="header-left">
            <h1 className="booking__title">
              {bookingType === "credit" ? "Credit Booking" : "Retail Booking"}
            </h1>
            <p className="booking__subtitle">Create and manage shipment bookings instantly</p>
          </div>
        </header>

        {/* Dashboard Stats Panel */}
        {recentBookings.length > 0 && (
          <div className="booking__stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper count">
                <FaListAlt />
              </div>
              <div className="stat-info">
                <span className="stat-title">Recent Bookings</span>
                <span className="stat-value">{todayStats.count}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper pcs">
                <FaBoxes />
              </div>
              <div className="stat-info">
                <span className="stat-title">Total Pieces</span>
                <span className="stat-value">{todayStats.pcs}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper weight">
                <FaWeightHanging />
              </div>
              <div className="stat-info">
                <span className="stat-title">Total Weight</span>
                <span className="stat-value">{todayStats.weight} kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Two-column responsive layout */}
        <div className="booking__layout">

          {/* Left Column: Form Details (Single Screen Compact Layout) */}
          <div className="booking__form-side">
            <form className="booking__form" onSubmit={(e) => e.preventDefault()}>

              <div className="compact-booking-card">

                {/* Section 1: Document Details */}
                <div className="compact-section">
                  <h3 className="compact-section-title">
                    <MdDescription className="section-icon" />
                    <span>Document Details</span>
                  </h3>
                  <div className="booking__form-grid booking__form-grid--document">

                    <div className="form-field">
                      <label htmlFor="date" className="form-field__label">
                        Booking Date <span className="required">*</span>
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        className="form-field__input"
                        value={formData.date}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-field__label">Booking Type</label>
                      <div className="booking__type-toggle-group compact-toggle">
                        <button
                          type="button"
                          className={`toggle-btn ${bookingType === "retail" ? "active" : ""}`}
                          onClick={() => handleBookingTypeChange("retail")}
                        >
                          Retail
                        </button>
                        <button
                          type="button"
                          className={`toggle-btn ${bookingType === "credit" ? "active" : ""}`}
                          onClick={() => handleBookingTypeChange("credit")}
                        >
                          Credit
                        </button>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="awbno" className="form-field__label">
                        AWB Number <span className="required">*</span>
                      </label>
                      <div className="input-with-icon">
                        <FaBarcode className="input-field-icon" />
                        <input
                          id="awbno"
                          name="awbno"
                          type="text"
                          className="form-field__input"
                          placeholder="AWB"
                          value={formData.awbno}
                          onChange={handleChange}
                          ref={(el) => (inputRefs.current[0] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 0)}
                          maxLength={10}
                          autoFocus
                        />
                      </div>
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
                        <option value="">Select</option>
                        {destinations.map((dest) => (
                          <option key={dest.code} value={dest.code}>
                            {dest.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="reference" className="form-field__label">
                        Reference Number
                      </label>
                      <input
                        id="reference"
                        name="reference"
                        type="text"
                        className="form-field__input"
                        placeholder="Reference (opt)"
                        value={formData.reference}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[3] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 3)}
                      />
                    </div>

                    <div className="form-field checkbox-field-container">
                      <label className="form-field__label">E-way Bill</label>
                      <label className="checkbox-label-styled compact-switch">
                        <input
                          type="checkbox"
                          className="checkbox-input-hidden"
                          checked={hasEwayBill}
                          onChange={(e) => setHasEwayBill(e.target.checked)}
                        />
                        <span className="checkbox-custom-switch"></span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Section 2: Service Details */}
                <div className="compact-section">
                  {/* <h3 className="compact-section-title">
                    <MdLocalShipping className="section-icon" />
                    <span>Service Details</span>
                  </h3> */}
                  <div className="booking__form-grid booking__form-grid--service">

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
                        ref={(el) => (inputRefs.current[4] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 4)}
                      >
                        <option value="">Select</option>
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
                        ref={(el) => (inputRefs.current[5] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 5)}
                        min="0.001"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="volumetric_weight" className="form-field__label">
                        Volumetric Wt
                      </label>
                      <input
                        id="volumetric_weight"
                        name="volumetric_weight"
                        type="text"
                        className="form-field__input"
                        placeholder="0.000"
                        value={formData.volumetric_weight}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="form-field checkbox-field-container">
                      <div className="label-with-action">
                        <label className="form-field__label">Calc Volumetric</label>
                        {hasVolumetricWeight && (
                          <button
                            type="button"
                            className="edit-link-btn"
                            onClick={() => {
                              let defaultDivisor = "surface";
                              if (formData.mode === "AIR") {
                                defaultDivisor = "air";
                              }
                              setVolumetricData(prev => ({
                                ...prev,
                                divisorType: prev.divisorType || defaultDivisor
                              }));
                              setShowVolumetricPopup(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <label className="checkbox-label-styled compact-switch">
                        <input
                          type="checkbox"
                          className="checkbox-input-hidden"
                          checked={hasVolumetricWeight}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setHasVolumetricWeight(checked);
                            if (checked) {
                              let defaultDivisor = "surface";
                              if (formData.mode === "AIR") {
                                defaultDivisor = "air";
                              }
                              setVolumetricData(prev => ({
                                ...prev,
                                divisorType: prev.divisorType || defaultDivisor
                              }));
                              setShowVolumetricPopup(true);
                            } else {
                              setFormData((prev) => ({ ...prev, volumetric_weight: "" }));
                            }
                          }}
                        />
                        <span className="checkbox-custom-switch"></span>
                      </label>
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
                        placeholder="Pcs"
                        value={formData.pcs}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[6] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 6)}
                        min="1"
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
                        ref={(el) => (inputRefs.current[7] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 7)}
                      >
                        <option value="">Select</option>
                        <option value="SURFACE">SURFACE</option>
                        <option value="AIR">AIR</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label htmlFor="contents" className="form-field__label">
                        Contents Description
                      </label>
                      <input
                        id="contents"
                        name="contents"
                        type="text"
                        className="form-field__input"
                        placeholder="Package contents description..."
                        value={formData.contents}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[20] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 20)}
                      />
                    </div>

                  </div>
                </div>

                {/* Section 2: Sender Details */}
                <div className="compact-section">
                  {/* <h3 className="compact-section-title"> */}
                  {/* <MdPerson className="section-icon" />
                    <span>Sender Details</span> */}
                  {bookingType === "credit" && (
                    <span className="locked-badge compact">
                      <MdLock className="badge-icon" /> Locked (Credit Client)
                    </span>
                  )}
                  {/* </h3> */}
                  <div className={`booking__form-grid booking__form-grid--sender ${bookingType === "credit" ? "credit-grid" : "retail-grid"}`}>
                    {bookingType === "credit" && (
                      <div className="form-field">
                        <label htmlFor="clientSelect" className="form-field__label">
                          Select Client <span className="required">*</span>
                        </label>
                        <select
                          id="clientSelect"
                          name="clientSelect"
                          className="form-field__select"
                          value={selectedClientCode}
                          onChange={handleClientChange}
                          ref={(el) => (inputRefs.current[14] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 14)}
                        >
                          <option value="">Select a client</option>
                          {clients.map((client) => (
                            <option key={client.client_code} value={client.client_code}>
                              {client.name} ({client.client_code})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-field">
                      <label htmlFor="sendername" className="form-field__label">
                        Sender Name <span className="required">*</span>
                      </label>
                      <input
                        id="sendername"
                        name="sendername"
                        type="text"
                        className="form-field__input"
                        placeholder={bookingType === "credit" ? "Select client" : "Sender's full name"}
                        value={formData.sendername}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[8] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 8)}
                        readOnly={bookingType === "credit"}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="senderphone" className="form-field__label">
                        Sender Phone Number
                      </label>
                      <div className="input-with-icon">
                        <span className="input-prefix-icon"><MdPhone /></span>
                        <input
                          id="senderphone"
                          name="senderphone"
                          type="tel"
                          className="form-field__input with-prefix"
                          placeholder={bookingType === "credit" ? "Select client" : "10-digit number"}
                          value={formData.senderphone}
                          onChange={handleChange}
                          ref={(el) => (inputRefs.current[9] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 9)}
                          maxLength={10}
                          readOnly={bookingType === "credit"}
                        />
                      </div>
                    </div>

                    <div className="form-field sender-address-field">
                      <label htmlFor="senderaddress" className="form-field__label">
                        Sender Address
                      </label>
                      <input
                        id="senderaddress"
                        name="senderaddress"
                        type="text"
                        className="form-field__input"
                        placeholder={bookingType === "credit" ? "Select client" : "Sender's address"}
                        value={formData.senderaddress}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[10] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 10)}
                        readOnly={bookingType === "credit"}
                      />
                    </div>

                  </div>
                </div>

                {/* Section 3: Receiver Details */}
                <div className="compact-section">
                  {/* <h3 className="compact-section-title"> */}
                  {/* <MdLocationOn className="section-icon" />
                    <span>Receiver Details</span> */}
                  {/* </h3> */}
                  <div className="booking__form-grid booking__form-grid--receiver">

                    <div className="form-field">
                      <label htmlFor="receivername" className="form-field__label">
                        Receiver Name <span className="required">*</span>
                      </label>
                      <input
                        id="receivername"
                        name="receivername"
                        type="text"
                        className="form-field__input"
                        placeholder="Receiver's full name"
                        value={formData.receivername}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[11] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 11)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="receiverphone" className="form-field__label">
                        Receiver Phone Number
                      </label>
                      <div className="input-with-icon">
                        <span className="input-prefix-icon"><MdPhone /></span>
                        <input
                          id="receiverphone"
                          name="receiverphone"
                          type="tel"
                          className="form-field__input with-prefix"
                          placeholder="10-digit number"
                          value={formData.receiverphone}
                          onChange={handleChange}
                          ref={(el) => (inputRefs.current[12] = el)}
                          onKeyDown={(e) => handleKeyDown(e, 12)}
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div className="form-field receiver-address-field">
                      <label htmlFor="receiveraddress" className="form-field__label">
                        Receiver Address
                      </label>
                      <input
                        id="receiveraddress"
                        name="receiveraddress"
                        type="text"
                        className="form-field__input"
                        placeholder="Receiver's address"
                        value={formData.receiveraddress}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[13] = el)}
                        onKeyDown={(e) => handleKeyDown(e, 13)}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Dynamic Label Preview & Sticky Submission Summary */}
          <div className="booking__sidebar-side">
            <div className="sticky-sidebar-container">
              {/* Billing Details Card */}
              <div className="booking__card billing-card">
                <h2 className="booking__section-title">
                  <FaFileInvoice className="section-icon" />
                  <span>Billing Details</span>
                </h2>
                <div className="billing-grid">
                  <div className="form-field">
                    <label htmlFor="courier_charges" className="form-field__label">
                      Courier Charges
                    </label>
                    <input
                      id="courier_charges"
                      name="courier_charges"
                      type="number"
                      step="0.01"
                      className="form-field__input"
                      placeholder="0.00"
                      value={formData.courier_charges}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[15] = el)}
                      onKeyDown={(e) => handleKeyDown(e, 15)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="packing_charges" className="form-field__label">
                      Packing Charges
                    </label>
                    <input
                      id="packing_charges"
                      name="packing_charges"
                      type="number"
                      step="0.01"
                      className="form-field__input"
                      placeholder="0.00"
                      value={formData.packing_charges}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[16] = el)}
                      onKeyDown={(e) => handleKeyDown(e, 16)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="freight_charges" className="form-field__label">
                      Freight Charges
                    </label>
                    <input
                      id="freight_charges"
                      name="freight_charges"
                      type="number"
                      step="0.01"
                      className="form-field__input"
                      placeholder="0.00"
                      value={formData.freight_charges}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[17] = el)}
                      onKeyDown={(e) => handleKeyDown(e, 17)}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="others" className="form-field__label">
                      Others
                    </label>
                    <input
                      id="others"
                      name="others"
                      type="number"
                      step="0.01"
                      className="form-field__input"
                      placeholder="0.00"
                      value={formData.others}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[18] = el)}
                      onKeyDown={(e) => handleKeyDown(e, 18)}
                    />
                  </div>

                  <div className="form-field gst-field">
                    <label htmlFor="gst" className="form-field__label">
                      GST (18%)
                    </label>
                    <input
                      id="gst"
                      name="gst"
                      type="number"
                      className="form-field__input"
                      value={calculatedGst}
                      readOnly
                    />
                  </div>

                  <div className="form-field total-field">
                    <label htmlFor="total" className="form-field__label total-label">
                      Total Amount
                    </label>
                    <input
                      id="total"
                      name="total"
                      type="number"
                      className="form-field__input total-input"
                      value={calculatedTotal}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Action Card */}
              <div className="sidebar-action-card">
                <button
                  type="button"
                  className="booking-action-btn-primary"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      <span>Booking in progress...</span>
                    </>
                  ) : (
                    "Confirm & Create Booking"
                  )}
                </button>
                <p className="sidebar-disclaimer">
                  * Verify all details before confirming. Fields marked with <span className="required">*</span> are mandatory.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Recent Bookings Section */}
        {recentBookings.length > 0 && (
          <section className="booking__recent">
            <div className="booking__recent-header">
              <h2 className="booking__section-title">
                <FaListAlt className="section-icon" />
                <span>Recent Bookings</span>
              </h2>
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
                    <th>Destination</th>
                    <th>Reference</th>
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
                        {destinations.find(
                          (d) => d.code === booking.destination_code,
                        )?.name || booking.destination_code}
                      </td>
                      <td>{booking.reference || "-"}</td>
                      <td>
                        <span
                          className={`booking__badge booking__badge--${booking.doc_type}`}
                        >
                          {booking.doc_type?.toUpperCase()}
                        </span>
                      </td>
                      <td>{booking.wt} kg</td>
                      <td>
                        {booking.pcs}
                        {parseInt(booking.pcs) > 1 && (
                          <span className="pieces-multi"> (Multi)</span>
                        )}
                      </td>
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

      {/* E-way Bill Details Popup */}
      {showEwayPopup && (
        <div className="popup-overlay" onClick={() => setShowEwayPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">
                <FaFileInvoice />
                E-way Bill Details
              </h3>
              <button
                className="popup-close"
                onClick={() => setShowEwayPopup(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="popup-body">
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">E-way Bill Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 12-digit E-way Bill Number"
                  value={ewayData.eway_bill_no}
                  onChange={(e) => setEwayData(prev => ({ ...prev, eway_bill_no: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Invoice Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter Invoice Number"
                  value={ewayData.invoice_no}
                  onChange={(e) => setEwayData(prev => ({ ...prev, invoice_no: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label">Invoice Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={ewayData.invoice_date}
                  onChange={(e) => setEwayData(prev => ({ ...prev, invoice_date: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="Enter Invoice Amount (Rs.)"
                  value={ewayData.invoice_amount}
                  onChange={(e) => setEwayData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="popup-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEwayPopup(false)}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleEwayPopupSubmit}
                disabled={submitLoading}
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volumetric Weight Calculator Popup */}
      {showVolumetricPopup && (
        <div className="popup-overlay" onClick={handleVolumetricPopupCancel}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">
                <FaWeightHanging />
                Volumetric Weight Calculator
              </h3>
              <button
                className="popup-close"
                onClick={handleVolumetricPopupCancel}
              >
                <MdClose />
              </button>
            </div>

            <div className="popup-body">
              <div className="popup-info">
                <p className="popup-info-text">
                  Formula: <strong>(Height × Width × Breadth) / {getDivisorValue(volumetricData.divisorType)}</strong> (dimensions in cm)
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600", color: "var(--neutral-text)", textTransform: "uppercase" }}>Shipment Mode / Divisor *</label>
                <select
                  className="form-field__select"
                  value={volumetricData.divisorType}
                  onChange={(e) => setVolumetricData(prev => ({ ...prev, divisorType: e.target.value }))}
                  style={{ width: "100%", height: "38px" }}
                >
                  <option value="surface">Surface (5000)</option>
                  <option value="air">Air (3000)</option>
                  <option value="logistics">Logistics (4000)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600", color: "var(--neutral-text)", textTransform: "uppercase" }}>Height (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  placeholder="Height in cm"
                  value={volumetricData.height}
                  onChange={(e) => setVolumetricData(prev => ({ ...prev, height: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600", color: "var(--neutral-text)", textTransform: "uppercase" }}>Width (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  placeholder="Width in cm"
                  value={volumetricData.width}
                  onChange={(e) => setVolumetricData(prev => ({ ...prev, width: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600", color: "var(--neutral-text)", textTransform: "uppercase" }}>Breadth (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="form-input"
                  placeholder="Breadth in cm"
                  value={volumetricData.breadth}
                  onChange={(e) => setVolumetricData(prev => ({ ...prev, breadth: e.target.value }))}
                />
              </div>

              <div className="calculated-result-box" style={{ background: "hsl(210, 40%, 96%)", border: "1.5px solid var(--border-color)", padding: "14px", borderRadius: "10px", textAlign: "center", marginTop: "20px" }}>
                <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "hsl(215, 16%, 47%)", marginBottom: "4px" }}>Calculated Weight</span>
                <strong style={{ fontSize: "1.25rem", color: "var(--primary)", fontWeight: "800" }}>{calculateVolumetricWeight()} kg</strong>
              </div>
            </div>

            <div className="popup-footer">
              <button
                className="btn-cancel"
                onClick={handleVolumetricPopupCancel}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleVolumetricPopupConfirm}
              >
                Apply Weight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Pieces Popup */}
      {showChildPopup && (
        <div className="popup-overlay" onClick={() => setShowChildPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3 className="popup-title">
                <FaBoxes />
                Child Pieces Configuration
              </h3>
              <button
                className="popup-close"
                onClick={() => setShowChildPopup(false)}
              >
                <MdClose />
              </button>
            </div>

            <div className="popup-body">
              <div className="popup-info">
                <p className="popup-info-text">
                  This shipment has <strong>{formData.pcs} pieces</strong>.
                  Please enter the starting number for child piece numbering.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaBoxes className="label-icon" />
                  Child Pieces Starting Number *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter starting number (e.g., 1)"
                  value={childPiecesStart}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setChildPiecesStart(value);
                    }
                  }}
                  autoFocus
                />
                <small className="form-help">
                  Child pieces will be numbered from this value onwards (e.g.,
                  start: 1 → pieces: C001, C002, C003...)
                </small>
              </div>
            </div>

            <div className="popup-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowChildPopup(false)}
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleChildPopupSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <Spinner size="small" color="white" />
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
