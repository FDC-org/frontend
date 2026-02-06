import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../components/axios";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import { format } from "date-fns";
import {
  FaFileAlt,
  FaCalendar,
  FaCheck,
  FaTimes,
  FaUndo,
  FaTruck,
  FaUser,
  FaPhone,
  FaCamera,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import "./delivery.css";

const DeliveryDRSList = () => {
  const navigate = useNavigate();
  const { drsno } = useParams();
  const location = useLocation();

  // Data from previous page
  const awbdata = location.state?.awbdata || [];
  const drsDate = location.state?.date || "";

  const [awbList, setAwbList] = useState([]);
  const [selectedAwb, setSelectedAwb] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Popup AWB list (FREEZED)
  const [popupAwbs, setPopupAwbs] = useState([]);

  // Popup form states
  const [showPopup, setShowPopup] = useState(false);
  const [status, setStatus] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [reason, setReason] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!awbdata || awbdata.length === 0) {
      setStatusMsg("No AWB data found");
      setToast(true);
      return;
    }
    setAwbList(awbdata);
  }, [awbdata]);

  // ---------------- SELECT ALL ----------------
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      const newSet = new Set();
      awbList.forEach((item) => {
        if (item.status === "ofd") newSet.add(item.awbno);
      });
      setSelectedAwb(newSet);
    } else {
      setSelectedAwb(new Set());
    }
  };

  // ---------------- SINGLE CHECK ----------------
  const toggleSelect = (awbno) => {
    const newSet = new Set(selectedAwb);
    newSet.has(awbno) ? newSet.delete(awbno) : newSet.add(awbno);
    setSelectedAwb(newSet);
    setSelectAll(false);
  };

  // ---------------- OPEN POPUP (BULK) ----------------
  const openPopupForBulk = () => {
    if (selectedAwb.size === 0) return;

    const list = Array.from(selectedAwb);
    setPopupAwbs(list);

    resetForm();
    setShowPopup(true);
  };

  // ---------------- OPEN POPUP (SINGLE ROW) ----------------
  const openPopupForSingle = (awbno) => {
    setPopupAwbs([awbno]);
    resetForm();
    setShowPopup(true);
  };

  const resetForm = () => {
    setStatus("");
    setReceiverName("");
    setReceiverPhone("");
    setReason("");
    setImage(null);
  };

  // ---------------- IMAGE PICK ----------------
  const handleImagePick = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // ---------------- SUBMIT DELIVERY UPDATE ----------------
  const handleSubmitUpdate = async () => {
    if (!status) {
      setStatusMsg("Select Status");
      setToast(true);
      return;
    }

    if (status === "delivered" && !image) {
      setStatusMsg("Upload image");
      setToast(true);
      return;
    }

    if ((status === "undelivered" || status === "rto") && !reason) {
      setStatusMsg("Select a reason");
      setToast(true);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("awbno", JSON.stringify(popupAwbs));
      formData.append("status", status);
      formData.append("date", format(new Date(), "yyyy-MM-dd"));

      if (status === "delivered") {
        formData.append("image", image);
        formData.append("receivername", receiverName);
        formData.append("receivernumber", receiverPhone);
      } else {
        formData.append("reason", reason);
      }

      const res = await axiosInstance.post("delivery/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (
        res.data.error === "invalid token" ||
        res.data.error === "token expired"
      ) {
        navigate("/login");
        return;
      }

      if (res.data.status === "success") {
        setStatusMsg("Success");
        setToast(true);

        // Mark updated rows locally
        setAwbList((prev) =>
          prev.map((row) =>
            popupAwbs.includes(row.awbno) ? { ...row, status: status } : row,
          ),
        );

        setSelectedAwb(new Set());
        setSelectAll(false);
        setShowPopup(false);
      } else if (res.data.status === "already delivered") {
        setStatusMsg("Already Delivered");
        setToast(true);
      } else {
        setStatusMsg("Error: Try Again");
        setToast(true);
      }
    } catch (err) {
      console.log(err);
      setStatusMsg("Server Error");
      setToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Statistics
  const stats = {
    total: awbList.length,
    delivered: awbList.filter((item) => item.status === "delivered").length,
    ofd: awbList.filter((item) => item.status === "ofd").length,
    rto: awbList.filter((item) => item.status === "rto").length,
    undelivered: awbList.filter((item) => item.status === "undelivered").length,
  };

  return (
    <div className="delivery-page">
      <div className="delivery-container">
        {/* ---------------- HEADER WITH STATS ---------------- */}
        <div className="delivery-header">
          <div className="header-info">
            <div className="drs-info-card">
              <FaFileAlt className="info-icon" />
              <div className="info-details">
                <span className="info-label">DRS Number</span>
                <span className="info-value">{drsno}</span>
              </div>
            </div>
            <div className="drs-info-card">
              <FaCalendar className="info-icon" />
              <div className="info-details">
                <span className="info-label">Date</span>
                <span className="info-value">
                  {drsDate ? format(new Date(drsDate), "dd-MM-yyyy") : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            <div className="stat-card stat-delivered">
              <div className="stat-icon">
                <FaCheckCircle />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.delivered}</span>
                <span className="stat-label">Delivered</span>
              </div>
            </div>

            <div className="stat-card stat-ofd">
              <div className="stat-icon">
                <FaTruck />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.ofd}</span>
                <span className="stat-label">Out for Delivery</span>
              </div>
            </div>

            <div className="stat-card stat-undelivered">
              <div className="stat-icon">
                <FaTimesCircle />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.undelivered}</span>
                <span className="stat-label">Undelivered</span>
              </div>
            </div>

            <div className="stat-card stat-rto">
              <div className="stat-icon">
                <FaUndo />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.rto}</span>
                <span className="stat-label">RTO</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- BULK UPDATE BUTTON ---------------- */}
        {selectedAwb.size > 0 && (
          <div className="bulk-update-bar">
            <span className="selected-count">
              {selectedAwb.size} item{selectedAwb.size > 1 ? "s" : ""} selected
            </span>
            <button onClick={openPopupForBulk} className="btn-bulk-update">
              <FaEdit />
              Bulk Update ({selectedAwb.size})
            </button>
          </div>
        )}

        {/* ---------------- TABLE ---------------- */}
        <div className="delivery-table-section">
          <div className="table-container">
            <table className="delivery-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="checkbox-input"
                    />
                  </th>
                  <th>AWB Number</th>
                  <th className="th-narrow">Pieces</th>
                  <th className="th-narrow">Weight</th>
                  <th>Status</th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {awbList.map((row) => {
                  const checked = selectedAwb.has(row.awbno);

                  return (
                    <tr
                      key={row.awbno}
                      className={row.status !== "ofd" ? "row-disabled" : ""}
                    >
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          disabled={row.status !== "ofd"}
                          checked={checked}
                          onChange={() => toggleSelect(row.awbno)}
                          className="checkbox-input"
                        />
                      </td>

                      <td className="td-awb">{row.awbno}</td>
                      <td className="td-narrow">{row.pcs}</td>
                      <td className="td-narrow">{row.wt}</td>

                      <td>
                        {row.status === "delivered" && (
                          <span className="status-badge status-delivered">
                            <FaCheckCircle />
                            Delivered
                          </span>
                        )}
                        {row.status === "rto" && (
                          <span className="status-badge status-rto">
                            <FaUndo />
                            RTO
                          </span>
                        )}
                        {row.status === "undelivered" && (
                          <span className="status-badge status-undelivered">
                            <FaTimesCircle />
                            Undelivered
                          </span>
                        )}
                        {row.status === "ofd" && (
                          <span className="status-badge status-ofd">
                            <FaTruck />
                            Out for Delivery
                          </span>
                        )}
                      </td>

                      <td className="td-action">
                        {row.status === "ofd" && (
                          <button
                            onClick={() => openPopupForSingle(row.awbno)}
                            className="btn-update-single"
                          >
                            <FaEdit />
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------- DELIVERY UPDATE POPUP ---------------- */}
        {showPopup && (
          <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3 className="popup-title">
                  <FaEdit />
                  Delivery Update
                </h3>
                <button
                  className="popup-close"
                  onClick={() => setShowPopup(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="popup-body">
                <div className="awb-list-box">
                  <span className="awb-list-label">Updating AWBs:</span>
                  <div className="awb-chips">
                    {popupAwbs.map((awb) => (
                      <span key={awb} className="awb-chip">
                        {awb}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaTruck className="label-icon" />
                    Delivery Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Status...</option>
                    <option value="delivered">✓ Delivered</option>
                    <option value="undelivered">✗ Undelivered</option>
                    <option value="rto">↻ RTO (Return to Origin)</option>
                  </select>
                </div>

                {status === "delivered" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        <FaUser className="label-icon" />
                        Receiver Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter receiver name"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaPhone className="label-icon" />
                        Receiver Phone
                      </label>
                      <input
                        type="text"
                        placeholder="Enter phone number"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaCamera className="label-icon" />
                        Proof of Delivery *
                      </label>

                      {image && (
                        <div className="image-preview">
                          <img
                            src={URL.createObjectURL(image)}
                            alt="preview"
                            className="preview-img"
                          />
                          <button
                            className="remove-image"
                            onClick={() => setImage(null)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      )}

                      <label className="file-upload-label">
                        <FaCamera />
                        {image ? "Change Image" : "Upload Image"}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImagePick}
                          className="file-input"
                        />
                      </label>
                    </div>
                  </>
                )}

                {(status === "undelivered" || status === "rto") && (
                  <div className="form-group">
                    <label className="form-label">
                      <FaEdit className="label-icon" />
                      Reason *
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select reason...</option>
                      <option value="PENDING COMPANY TIME OVER">
                        PENDING COMPANY TIME OVER
                      </option>
                      <option value="PO NOT READY">PO NOT READY</option>
                      <option value="SHORT ADDRESS">SHORT ADDRESS</option>
                      <option value="WEEKLY DELIVERY">WEEKLY DELIVERY</option>
                      <option value="WITH CUSTOMS">WITH CUSTOMS</option>
                      <option value="WRONG SORTING">WRONG SORTING</option>
                      <option value="WRONG SORTING / CENTER">
                        WRONG SORTING / CENTER
                      </option>
                      <option value="DAMAGED & POOR PACKING">
                        DAMAGED & POOR PACKING
                      </option>
                      <option value="DEPARTMENT NOT MENTIONED">
                        DEPARTMENT NOT MENTIONED
                      </option>
                      <option value="DOOR CLOSED">DOOR CLOSED</option>
                      <option value="HOLD">HOLD</option>
                      <option value="INSUFFICIANT PAPER">
                        INSUFFICIANT PAPER
                      </option>
                      <option value="OFFICE DELIVERY PENDING">
                        OFFICE DELIVERY PENDING
                      </option>
                      <option value="PARTY NOT AVAILABLE">
                        PARTY NOT AVAILABLE
                      </option>
                      <option value="PARTY NOT COLLECTED FROM OFFICE">
                        PARTY NOT COLLECTED FROM OFFICE
                      </option>
                      <option value="COD AMOUNT NOT READY">
                        COD AMOUNT NOT READY
                      </option>
                      <option value="CONSIGNEE NOT RESPONDING">
                        CONSIGNEE NOT RESPONDING
                      </option>
                      <option value="COMPANY PERSONAL COURIER CALL NOT ATTENT">
                        COMPANY PERSONAL COURIER CALL NOT ATTENT
                      </option>
                      <option value="CONSIGNEE OUT OF STATION">
                        CONSIGNEE OUT OF STATION
                      </option>
                      <option value="CONTAINMENT (COVID-19) AREA">
                        CONTAINMENT (COVID-19) AREA
                      </option>
                      <option value="CUSTOMER COLLECT FROM OFFICE">
                        CUSTOMER COLLECT FROM OFFICE
                      </option>
                      <option value="CUSTOMER REJECTED - CANCELLED">
                        CUSTOMER REJECTED - CANCELLED
                      </option>
                      <option value="CUSTOMER REQUESTED NEXT DAY DELIVERY">
                        CUSTOMER REQUESTED NEXT DAY DELIVERY
                      </option>
                    </select>
                  </div>
                )}
              </div>

              <div className="popup-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowPopup(false)}
                  disabled={submitting}
                >
                  <FaTimes />
                  Cancel
                </button>
                <button
                  className="btn-submit"
                  onClick={handleSubmitUpdate}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner size="small" color="white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={statusMsg}
            type={statusMsg === "Success" ? "success" : "error"}
            onclose={() => setToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DeliveryDRSList;
