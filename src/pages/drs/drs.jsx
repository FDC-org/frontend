import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import { format } from "date-fns";
import "./drs.css"; // reuse SAME styling as Inscan

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
            }))
          );

          setLocations(
            data.location.map((e) => ({
              code: e.loc_code.toString(),
              name: e.location.toString(),
            }))
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

  if (loading) return <Spinner />;

  return (
    <div className="inscan">
      {/* ---------------- CREATE DRS ---------------- */}
      <div className="inscan_con" style={{ width: "70%" }}>
        <h3>Create DRS</h3>

        <div className="inscan_form" style={{ flexWrap: "wrap", gap: "30px" }}>
          {/* Issue Date */}
          <div style={{ flex: 1 }}>
            <label>Date</label>
            <input
              type="text"
              value={issueDate}
              disabled
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                background: "#eaeaea",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Area */}
          <div style={{ flex: 1 }}>
            <label>Select Area *</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid black",
                background: "#FCFDFE",
              }}
            >
              <option value="">Select Area</option>
              {locations.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Boy */}
          <div style={{ flex: 1 }}>
            <label>Select Delivery Boy *</label>
            <select
              value={selectedBoy}
              onChange={(e) => setSelectedBoy(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid black",
                background: "#FCFDFE",
              }}
            >
              <option value="">Select Delivery Boy</option>
              {boys.map((boy) => (
                <option key={boy.code} value={boy.code}>
                  {boy.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Document Input */}
        <div style={{ marginTop: "20px" }}>
          <label>Document No</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter Document No (or scan barcode)"
            value={docInput}
            maxLength={10}
            onChange={(e) => {
              // Allow ONLY digits
              const value = e.target.value.replace(/\D/g, "");
              setDocInput(value);
            }}
            onKeyDown={handleKeyDown}
            inputMode="numeric"
            pattern="[0-9]*"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid black",
              background: "#FCFDFE",
            }}
          />
        </div>

        {/* Added Docs */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginTop: "15px",
          }}
        >
          {docList.map((doc, index) => (
            <div
              key={index}
              style={{
                fontSize: "12px",
                background: "#B7C7D9",
                color: "black",
                padding: "4px 8px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: "bold",
              }}
            >
              {doc}
              <span
                style={{ cursor: "pointer", color: "red" }}
                onClick={() => removeDocument(doc)}
              >
                ✖
              </span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            Total Documents: {docList.length}
          </div>

          {updating ? (
            <Spinner />
          ) : (
            <button
              onClick={handleCreateDRS}
              style={{
                padding: "10px 25px",
                background: "#1f2a37",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Create DRS
            </button>
          )}
        </div>
      </div>

      {/* ---------------- MANAGE DRS TABLE ---------------- */}
      <div className="inscan_table" style={{ width: "70%", marginTop: "30px" }}>
        {/* Date filter on RIGHT */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
        >
          <input
            type="date"
            defaultValue={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => fetchDRS(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid black",
              background: "#FCFDFE",
            }}
          />
        </div>

        {drsLoading ? (
          <Spinner />
        ) : drsList.length === 0 ? (
          <p style={{ textAlign: "center" }}>No DRS Found</p>
        ) : (
          <table className="inscan_table1">
            <thead>
              <tr>
                <th>#</th>
                <th>DRS No</th>
                <th>Date</th>
                <th>Boy</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {drsList.map((row, index) => (
                <tr
                  key={row.drsno}
                  className="onclick"
                  style={{ textDecoration: "none" }}
                >
                  <td>{index + 1}</td>
                  <td
                    style={{ textDecoration: "underline", cursor: "pointer" }}
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
                    {row.drsno}
                  </td>
                  <td>{format(new Date(row.date), "dd-MM-yyyy")}</td>
                  <td>{row.boy}</td>
                  <td>{row.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
