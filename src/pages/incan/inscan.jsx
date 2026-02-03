import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { isLoggedIn } from "../../components/auth";
import InputField from "../../components/input/input";
import Button from "../../components/button/button";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";
import { MdDelete, MdQrCodeScanner } from "react-icons/md";
import "./inscan.css";

const Inscan = () => {
  const navigate = useNavigate();

  const [scannedItems, setScannedItems] = useState([]);
  const [savefortable, setSavefortable] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleDelete = (value) => {
    setScannedItems((prev) => prev.filter((item) => item !== value));
    setSavefortable((prev) => prev.filter((item) => item !== value));
  };

  const handleSubmit = async () => {
    if (!scannedItems || scannedItems.length === 0) {
      setToast({
        message: "Please scan at least one AWB number",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("inscanmobile/", {
        awbno: savefortable,
        date: format(new Date(), "dd-MM-yyyy, HH:mm:ss"),
      });

      if (response.data.status === "success") {
        setToast({
          message: `Successfully inscanned ${scannedItems.length} item(s)`,
          type: "success",
        });
        setScannedItems([]);
        setSavefortable([]);
      } else {
        setToast({
          message: response.data.message || "Failed to process inscan",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Inscan error:", error);
      setToast({
        message: error.response?.data?.message || "Server error occurred",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    if (scannedItems.length > 0) {
      if (window.confirm(`Clear all ${scannedItems.length} scanned items?`)) {
        setScannedItems([]);
        setSavefortable([]);
      }
    }
  };

  return (
    <div className="inscan">
      <div className="inscan__container">
        {/* Header Card */}
        <div className="inscan__header-card">
          <div className="inscan__header-content">
            <div className="inscan__header-left">
              <MdQrCodeScanner className="inscan__header-icon" />
              <div>
                <h1 className="inscan__title">Inscan</h1>
                <p className="inscan__subtitle">
                  Scan packages arriving at your hub
                </p>
              </div>
            </div>
            <div className="inscan__counter">
              <span className="inscan__counter-label">SCANNED</span>
              <span className="inscan__counter-value">
                {scannedItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="inscan__input-card">
          <div className="inscan__input-wrapper">
            <label className="inscan__label">
              AWB Number <span className="inscan__required">*</span>
            </label>
            <InputField
              name=""
              type="text"
              required={true}
              onclick={setScannedItems}
              prevalues={scannedItems}
              ondelete={handleDelete}
              setSavefortable={setSavefortable}
              savefortable={savefortable}
            />
          </div>

          <div className="inscan__button-group">
            {isSubmitting ? (
              <button
                className="inscan__submit-btn inscan__submit-btn--loading"
                disabled
              >
                <Spinner size="sm" color="light" />
                <span>Processing...</span>
              </button>
            ) : (
              <>
                <button
                  className="inscan__submit-btn"
                  onClick={handleSubmit}
                  disabled={scannedItems.length === 0}
                >
                  Submit Inscan
                </button>
                {scannedItems.length > 0 && (
                  <button
                    className="inscan__clear-btn"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Scanned Items Card */}
        <div className="inscan__items-card">
          <h2 className="inscan__items-title">Scanned Items</h2>

          <div className="inscan__items-content">
            {scannedItems.length === 0 ? (
              <div className="inscan__empty">
                <MdQrCodeScanner className="inscan__empty-icon" />
                <p className="inscan__empty-text">No items scanned yet</p>
              </div>
            ) : (
              <div className="inscan__table-wrapper">
                <table className="inscan__table">
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
                        <td className="inscan__awb">{value}</td>
                        <td>
                          <button
                            className="inscan__delete-btn"
                            onClick={() => handleDelete(value)}
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

export default Inscan;
