import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../components/axios";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import { format } from "date-fns";
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

    const list = Array.from(selectedAwb); // freeze immediately
    setPopupAwbs(list);

    resetForm();
    setShowPopup(true);
  };

  // ---------------- OPEN POPUP (SINGLE ROW) ----------------
  const openPopupForSingle = (awbno) => {
    setPopupAwbs([awbno]); // only this awb
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

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("awbno", JSON.stringify(popupAwbs)); // 🔥 FIXED
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

  return (
    <div className="inscan">
      {/* ---------------- TOP BAR ---------------- */}
      <div
        style={{
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          fontWeight: "bold",
        }}
      >
        <div>
          DRS No : {drsno} &nbsp;&nbsp;| &nbsp;&nbsp; Date :{" "}
          {drsDate ? format(new Date(drsDate), "dd-MM-yyyy") : ""}
        </div>

        {selectedAwb.size > 0 && (
          <button
            onClick={openPopupForBulk}
            style={{
              padding: "8px 25px",
              background: "#1f2a37",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Update ({selectedAwb.size})
          </button>
        )}
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="inscan_table" style={{ width: "70%" }}>
        <table className="inscan_table1">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>AWB No</th>
              <th>Pcs</th>
              <th>Wt</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {awbList.map((row) => {
              const checked = selectedAwb.has(row.awbno);

              return (
                <tr key={row.awbno}>
                  <td>
                    <input
                      type="checkbox"
                      disabled={row.status !== "ofd"}
                      checked={checked}
                      onChange={() => toggleSelect(row.awbno)}
                    />
                  </td>

                  <td>{row.awbno}</td>
                  <td>{row.pcs}</td>
                  <td>{row.wt}</td>

                  <td>
                    {row.status === "delivered" && (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        Delivered
                      </span>
                    )}
                    {row.status === "rto" && (
                      <span style={{ color: "orange", fontWeight: "bold" }}>
                        RTO
                      </span>
                    )}
                    {row.status === "undelivered" && (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Undelivered
                      </span>
                    )}
                    {row.status === "ofd" && <span>OFD</span>}
                  </td>

                  {/* ACTION BUTTON */}
                  <td>
                    {row.status === "ofd" && (
                      <button
                        onClick={() => openPopupForSingle(row.awbno)}
                        style={{
                          color: "white",
                          backgroundColor: "#2563eb",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
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

      {/* ---------------- DELIVERY UPDATE POPUP ---------------- */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Delivery Update</h3>

            <div style={{ fontSize: "12px", marginBottom: "10px" }}>
              Updating AWBs: {popupAwbs.join(", ")}
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid black",
                marginBottom: "15px",
              }}
            >
              <option value="">Select Status</option>
              <option value="delivered">Delivered</option>
              <option value="undelivered">Undelivered</option>
              <option value="rto">RTO</option>
            </select>

            {status === "delivered" && (
              <>
                <input
                  type="text"
                  placeholder="Receiver Name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
                />

                <input
                  type="text"
                  placeholder="Receiver Phone"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
                />

                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    style={{
                      maxWidth: "120px",
                      maxHeight: "120px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      marginBottom: "8px",
                    }}
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImagePick}
                />
              </>
            )}

            {(status === "undelivered" || status === "rto") && (
              <input
                type="text"
                placeholder="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
              />
            )}

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button className="button" onClick={() => setShowPopup(false)}>Cancel</button>
              <button onClick={handleSubmitUpdate} disabled={submitting} className="button">
                {submitting ? "Updating..." : "Update"}
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
  );
};

export default DeliveryDRSList;
