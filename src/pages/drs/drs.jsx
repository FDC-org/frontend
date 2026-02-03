import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import { format } from "date-fns";
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaUserTie,
  FaBarcode,
  FaPlus,
  FaTimes,
  FaFileAlt,
  FaSearch,
} from "react-icons/fa";
import "./drs.css";

const CreateDRS = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // ---------------- CREATE DRS STATES ----------------
  const [issueDate] = useState(format(new Date(), "dd-MM-yyyy"));

  const [boys, setBoys] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBoy, setSelectedBoy] = useState("");

  const [docInput, setDocInput] = useState("");
  const [docList, setDocList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState("");

  // ---------------- MANAGE DRS STATES ----------------
  const [drsList, setDrsList] = useState([]);
  const [drsLoading, setDrsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Auth + Load Areas & Boys
  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");

    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("get_boy_loc/");

        if (
          res.data.error === "invalid token" ||
          res.data.error === "token expired"
        ) {
          navigate("/login");
          return;
        }

        if (res.data.status === "success") {
          const data = res.data.data[0];

          setBoys(
            data.boy_code.map((e) => ({
              code: e.boy_code.toString(),
              name: e.name.toString(),
            })),
          );

          setLocations(
            data.location.map((e) => ({
              code: e.loc_code.toString(),
              name: e.location.toString(),
            })),
          );
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 🔹 Load TODAY DRS list on page load
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    fetchDRS(today);
  }, []);

  // ---------------- ADD DOCUMENT ----------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDocument();
    }
  };

  const addDocument = () => {
    const value = docInput.trim();

    if (!value) return;

    if (docList.includes(value)) {
      setStatus("Document already added");
      setToast(true);
      return;
    }
    if (value.length !== 10) {
      setStatus("Document Number must be exactly 10 digits");
      setToast(true);
      return;
    }

    if (!/^\d{10}$/.test(value)) {
      setStatus("Document Number must contain only digits");
      setToast(true);
      return;
    }

    setDocList((prev) => [...prev, value]);
    setDocInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const removeDocument = (value) => {
    setDocList((list) => list.filter((item) => item !== value));
  };

  // ---------------- CREATE DRS API ----------------
  const handleCreateDRS = async () => {
    if (docList.length === 0) {
      setStatus("Add AWB No.");
      setToast(true);
      return;
    }

    if (!selectedArea) {
      setStatus("Select Location");
      setToast(true);
      return;
    }

    if (!selectedBoy) {
      setStatus("Select Delivery Boy");
      setToast(true);
      return;
    }

    try {
      setUpdating(true);

      const res = await axiosInstance.post("drs/", {
        awbno: docList,
        date: format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
        location: selectedArea,
        delivery_boy: selectedBoy,
      });

      if (
        res.data.error === "invalid token" ||
        res.data.error === "token expired"
      ) {
        navigate("/login");
        return;
      }

      if (res.data.status === "success") {
        setStatus("Successfully Added");
        setToast(true);

        setDocList([]);
        setSelectedArea("");
        setSelectedBoy("");

        const today = format(new Date(), "yyyy-MM-dd");
        fetchDRS(today);
      } else if (res.data.status === "exists") {
        setStatus(`${res.data.awbno}: Delivered or Out For Delivery`);
        setToast(true);
      } else {
        setStatus("Error, Try Again");
        setToast(true);
      }
    } catch (err) {
      console.log(err);
      setStatus("Server Error");
      setToast(true);
    } finally {
      setUpdating(false);
    }
  };

  // ---------------- FETCH DRS LIST ----------------
  const fetchDRS = async (date) => {
    try {
      setDrsLoading(true);

      const res = await axiosInstance.get(`drs/${date}`);

      if (
        res.data.error === "invalid token" ||
        res.data.error === "token expired"
      ) {
        navigate("/login");
        return;
      }

      if (res.data.status === "success") {
        setDrsList(res.data.data);
      } else {
        setDrsList([]);
      }
    } catch (err) {
      console.log(err);
      setDrsList([]);
    } finally {
      setDrsLoading(false);
    }
  };

  // Filter DRS list based on search
  const filteredDrsList = drsList.filter((row) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      row.drsno.toLowerCase().includes(searchLower) ||
      row.boy.toLowerCase().includes(searchLower) ||
      row.location.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="large" color="primary" />
      </div>
    );
  }

  return (
    <div className="drs-page">
      <div className="drs-container">
        {/* ---------------- CREATE DRS SECTION ---------------- */}
        <div className="drs-create-section">
          <div className="section-header">
            <div className="section-title">
              <FaFileAlt className="section-icon" />
              <h2>Create DRS</h2>
            </div>
            <p className="section-subtitle">
              Create a new Delivery Receipt Sheet
            </p>
          </div>

          <div className="drs-form">
            {/* Row 1: Date, Area, Delivery Boy */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaCalendar className="label-icon" />
                  Date
                </label>
                <input
                  type="text"
                  value={issueDate}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="label-icon" />
                  Select Area *
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose area...</option>
                  {locations.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaUserTie className="label-icon" />
                  Select Delivery Boy *
                </label>
                <select
                  value={selectedBoy}
                  onChange={(e) => setSelectedBoy(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose delivery boy...</option>
                  {boys.map((boy) => (
                    <option key={boy.code} value={boy.code}>
                      {boy.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Input */}
            <div className="form-group">
              <label className="form-label">
                <FaBarcode className="label-icon" />
                Document Number
              </label>
              <div className="doc-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter 10-digit document number or scan barcode"
                  value={docInput}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setDocInput(value);
                  }}
                  onKeyDown={handleKeyDown}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="form-input doc-input"
                />
                <button
                  type="button"
                  onClick={addDocument}
                  className="add-doc-btn"
                  disabled={!docInput.trim()}
                >
                  <FaPlus />
                  Add
                </button>
              </div>
              <span className="input-hint">
                Press Enter or click Add button
              </span>
            </div>

            {/* Document Tags */}
            {docList.length > 0 && (
              <div className="doc-tags-section">
                <div className="doc-tags-header">
                  <span className="doc-count-badge">
                    {docList.length}{" "}
                    {docList.length === 1 ? "Document" : "Documents"}
                  </span>
                </div>
                <div className="doc-tags-list">
                  {docList.map((doc, index) => (
                    <div key={index} className="doc-tag">
                      <span className="doc-tag-number">{doc}</span>
                      <button
                        className="doc-tag-remove"
                        onClick={() => removeDocument(doc)}
                        aria-label="Remove document"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="form-actions">
              <div className="total-docs">
                Total Documents: <strong>{docList.length}</strong>
              </div>
              {updating ? (
                <div className="action-spinner">
                  <Spinner size="small" color="primary" />
                </div>
              ) : (
                <button
                  onClick={handleCreateDRS}
                  className="btn-create-drs"
                  disabled={docList.length === 0}
                >
                  <FaFileAlt />
                  Create DRS
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- MANAGE DRS TABLE ---------------- */}
        <div className="drs-table-section">
          <div className="section-header">
            <div className="section-title">
              <FaFileAlt className="section-icon" />
              <h2>DRS Records</h2>
            </div>
          </div>

          {/* Filters */}
          <div className="table-filters">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by DRS No, Boy, or Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="date-filter">
              <FaCalendar className="date-icon" />
              <input
                type="date"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => fetchDRS(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            {drsLoading ? (
              <div className="table-loading">
                <Spinner size="large" color="primary" />
              </div>
            ) : filteredDrsList.length === 0 ? (
              <div className="empty-state">
                <FaFileAlt className="empty-icon" />
                <p className="empty-message">
                  {searchTerm
                    ? "No matching DRS found"
                    : "No DRS records for this date"}
                </p>
              </div>
            ) : (
              <table className="drs-table">
                <thead>
                  <tr>
                    <th className="th-narrow">#</th>
                    <th>DRS Number</th>
                    <th>Date</th>
                    <th>Delivery Boy</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrsList.map((row, index) => (
                    <tr
                      key={row.drsno}
                      className="table-row-clickable"
                      onClick={() =>
                        navigate("/delivery/" + row.drsno, {
                          state: {
                            date: row.date,
                            drsno: row.drsno,
                            awbdata: row.awbdata,
                          },
                        })
                      }
                    >
                      <td className="td-narrow">{index + 1}</td>
                      <td className="td-drs-number">{row.drsno}</td>
                      <td>{format(new Date(row.date), "dd-MM-yyyy")}</td>
                      <td>{row.boy}</td>
                      <td>{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination info */}
          {filteredDrsList.length > 0 && (
            <div className="table-footer">
              <p className="table-info">
                Showing {filteredDrsList.length}{" "}
                {filteredDrsList.length === 1 ? "record" : "records"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={status}
          type={status === "Successfully Added" ? "success" : "error"}
          onclose={() => setToast(false)}
        />
      )}
    </div>
  );
};

export default CreateDRS;
