import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import InputField from "../../components/input/input";
import Button from "../../components/button/button";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import "./outscan.css";
import axiosInstance from "../../components/axios";
import Select from "react-select";
import Modal from "react-modal";
import { format } from "date-fns";
import OutScanInputField from "../../components/input/outscaninput";
import { MdQrCodeScanner, MdLocalShipping, MdDelete } from "react-icons/md";

const OutScan = () => {
  const [prevalues, setPrevalues] = useState([]);
  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState("");
  const [click, setClick] = useState(false);
  const [savefortable, setSavefortable] = useState([]);
  const [openmodel, setopenmodel] = useState(false);
  const [manifestnumber, setmanifestnumber] = useState("");
  const [vehiclenumberdata, setVehiclenumberdata] = useState([]);
  const [tohubdata, setTohubdata] = useState([]);
  const [vehiclenumber, setVehiclenumber] = useState("");
  const [tohub, setTohub] = useState("");
  const [vehiclenumberupdate, setVehiclenumberupdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalerror, setModalerror] = useState("");
  const [oldmanifestnumber, setoldmanifestnumber] = useState("");
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleNumber, setNewVehicleNumber] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  const navigate = useNavigate();

  const ondelete = (value) => {
    setPrevalues((prevalues) => prevalues.filter((item) => item !== value));
    setSavefortable((savefortable) =>
      savefortable.filter((item) => item !== value),
    );
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    setLoading(true);

    // Fetch manifest number
    axiosInstance
      .get("getmanifestnumber/", { withCredentials: true })
      .then((r) => {
        setmanifestnumber(r.data.manifestno);
        setoldmanifestnumber(r.data.manifestno);
      })
      .catch((e) => console.log(e));

    // Fetch hub list
    axiosInstance
      .get("gethublist/", { withCredentials: true })
      .then((r) => {
        const details = r.data.hub.map((item) => ({
          value: item.code,
          label: item.name,
        }));
        setTohubdata([...details]);
      })
      .catch((e) => {
        console.log(e);
      });

    // Fetch vehicle list
    axiosInstance
      .get("vehicledetails/", { withCredentials: true })
      .then((r) => {
        const vehicles = r.data.data.map((vehicle) => ({
          value: vehicle,
          label: vehicle,
        }));
        // Add "Add New Vehicle" option at the end
        vehicles.push({
          value: "__add_new__",
          label: "+ Add New Vehicle",
        });
        setVehiclenumberdata(vehicles);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  }, [navigate]);

  const handleVehicleChange = (selected) => {
    if (selected.value === "__add_new__") {
      setShowAddVehicleModal(true);
    } else {
      setVehiclenumber(selected.value);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicleNumber.trim()) {
      setStatus("Vehicle number is required");
      setToast(true);
      return;
    }

    setAddingVehicle(true);

    try {
      const res = await axiosInstance.post("vehicledetails/", {
        vehicle_number: newVehicleNumber.toUpperCase(),
      });

      if (res.data.status === "added") {
        setStatus("Vehicle added successfully");
        setToast(true);

        // Refresh vehicle list
        const vehiclesRes = await axiosInstance.get("vehicledetails/");
        const vehicles = vehiclesRes.data.data.map((vehicle) => ({
          value: vehicle,
          label: vehicle,
        }));
        vehicles.push({
          value: "__add_new__",
          label: "+ Add New Vehicle",
        });
        setVehiclenumberdata(vehicles);

        // Set the newly added vehicle as selected
        setVehiclenumber(newVehicleNumber.toUpperCase());

        // Close modal and reset form
        setShowAddVehicleModal(false);
        setNewVehicleNumber("");
      } else {
        setStatus("Failed to add vehicle");
        setToast(true);
      }
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setStatus("Server error occurred");
      setToast(true);
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleSumit = () => {
    if (!prevalues || prevalues.length === 0) {
      setStatus("Enter at least one AWB number");
      setToast(true);
      return;
    }

    if (tohub === "") {
      setStatus("Select destination hub");
      setToast(true);
      return;
    }

    if (vehiclenumber === "") {
      setStatus("Select vehicle number");
      setToast(true);
      return;
    }

    setClick(true);
    axiosInstance
      .post("outscanmobile/", {
        awbno: savefortable,
        manifest_number: manifestnumber,
        tohub: tohub,
        vehicle_number: vehiclenumber,
        date: format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
      })
      .then((r) => {
        if (r.data.status === "success") {
          setStatus("Successfully outscanned items");
          setToast(true);
          setClick(false);
          setSavefortable([]);
          setPrevalues([]);
          setoldmanifestnumber(manifestnumber);
          setmanifestnumber(r.data.manifest_number);
        }
      })
      .catch((r) => {
        setStatus("Error processing outscan");
        console.log(r);
        setToast(true);
        setClick(false);
      });
  };

  const handleClearAll = () => {
    if (prevalues.length > 0) {
      if (window.confirm(`Clear all ${prevalues.length} scanned items?`)) {
        setPrevalues([]);
        setSavefortable([]);
      }
    }
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#134d0a" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(19, 77, 10, 0.1)" : "none",
      "&:hover": {
        borderColor: "#134d0a",
      },
      minHeight: "42px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 25,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#134d0a"
        : state.isFocused
          ? "#f3f4f6"
          : "white",
      color: state.isSelected ? "white" : "#1f2937",
    }),
  };

  return loading ? (
    <div className="outscan__loading-wrapper">
      <Spinner />
    </div>
  ) : (
    <div className="outscan">
      <div className="outscan__container">
        {/* Header Card */}
        <div className="outscan__header-card">
          <div className="outscan__header-content">
            <div className="outscan__header-left">
              <MdLocalShipping className="outscan__header-icon" />
              <div>
                <h1 className="outscan__title">Outscan</h1>
                <p className="outscan__subtitle">
                  Scan packages leaving your hub
                </p>
              </div>
            </div>
            <div className="outscan__counter">
              <span className="outscan__counter-label">SCANNED</span>
              <span className="outscan__counter-value">{prevalues.length}</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="outscan__main-grid">
          {/* Left Column - Input Card */}
          <div className="outscan__input-card">
            {/* Manifest, Hub, and Vehicle Selection */}
            <div className="outscan__details-section">
              <div className="outscan__form-group">
                <label className="outscan__label">Manifest Number</label>
                <input
                  type="text"
                  className="outscan__input outscan__input--disabled"
                  disabled
                  value={manifestnumber}
                />
              </div>

              <div className="outscan__form-group">
                <label className="outscan__label">
                  Destination Hub <span className="outscan__required">*</span>
                </label>
                <Select
                  options={tohubdata}
                  className="outscan__select"
                  onChange={(e) => setTohub(e.value)}
                  placeholder="Select destination hub"
                  styles={customSelectStyles}
                />
              </div>

              <div className="outscan__form-group">
                <label className="outscan__label">
                  Vehicle Number <span className="outscan__required">*</span>
                </label>
                <Select
                  options={vehiclenumberdata}
                  className="outscan__select"
                  onChange={handleVehicleChange}
                  placeholder="Select vehicle number"
                  styles={customSelectStyles}
                  value={
                    vehiclenumber
                      ? { value: vehiclenumber, label: vehiclenumber }
                      : null
                  }
                />
              </div>
            </div>

            {/* AWB Input */}
            <div className="outscan__awb-section">
              <label className="outscan__label">
                AWB Number <span className="outscan__required">*</span>
              </label>
              <OutScanInputField
                name=""
                type="text"
                required={true}
                onclick={setPrevalues}
                prevalues={prevalues}
                ondelete={ondelete}
                setSavefortable={setSavefortable}
                savefortable={savefortable}
                manifestnumber={manifestnumber}
                to_hub={tohub}
              />
            </div>

            {/* Action Buttons */}
            <div className="outscan__button-group">
              {click ? (
                <button
                  className="outscan__submit-btn outscan__submit-btn--loading"
                  disabled
                >
                  <Spinner size="sm" color="light" />
                  <span>Processing...</span>
                </button>
              ) : (
                <>
                  <button
                    className="outscan__submit-btn"
                    onClick={handleSumit}
                    disabled={prevalues.length === 0}
                  >
                    Submit Outscan
                  </button>
                  {prevalues.length > 0 && (
                    <button
                      className="outscan__clear-btn"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Scanned Items */}
          <div className="outscan__items-card">
            <h2 className="outscan__items-title">Scanned Items</h2>

            <div className="outscan__items-content">
              {prevalues.length === 0 ? (
                <div className="outscan__empty">
                  <MdQrCodeScanner className="outscan__empty-icon" />
                  <p className="outscan__empty-text">No items scanned yet</p>
                </div>
              ) : (
                <div className="outscan__table-wrapper">
                  <table className="outscan__table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>AWB Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savefortable.map((value, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td className="outscan__awb">{value}</td>
                          <td>
                            <button
                              className="outscan__delete-btn"
                              onClick={() => ondelete(value)}
                              title="Remove item"
                            >
                              <MdDelete />
                            </button>
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

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div
          className="outscan__modal-overlay"
          onClick={() => setShowAddVehicleModal(false)}
        >
          <div
            className="outscan__modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="outscan__modal-header">
              <h3 className="outscan__modal-title">Add New Vehicle</h3>
              <button
                className="outscan__modal-close"
                onClick={() => setShowAddVehicleModal(false)}
              >
                ×
              </button>
            </div>

            <div className="outscan__modal-body">
              <div className="outscan__form-group">
                <label className="outscan__label">
                  Vehicle Number <span className="outscan__required">*</span>
                </label>
                <input
                  type="text"
                  className="outscan__input"
                  placeholder="Enter vehicle number (e.g., KA01AB1234)"
                  value={newVehicleNumber}
                  onChange={(e) =>
                    setNewVehicleNumber(e.target.value.toUpperCase())
                  }
                  autoFocus
                />
                <small className="outscan__form-helper">
                  Vehicle number will be automatically converted to uppercase
                </small>
              </div>
            </div>

            <div className="outscan__modal-footer">
              <button
                className="outscan__modal-btn outscan__modal-btn--cancel"
                onClick={() => setShowAddVehicleModal(false)}
                disabled={addingVehicle}
              >
                Cancel
              </button>
              <button
                className="outscan__modal-btn outscan__modal-btn--submit"
                onClick={handleAddVehicle}
                disabled={addingVehicle}
              >
                {addingVehicle ? (
                  <>
                    <Spinner size="sm" color="white" />
                    <span>Adding...</span>
                  </>
                ) : (
                  "Add Vehicle"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={status}
          type={
            status.includes("Success") || status === "success"
              ? "success"
              : "error"
          }
          onclose={() => setToast(false)}
        />
      )}
    </div>
  );
};

export default OutScan;
