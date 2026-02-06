import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { isLoggedIn } from "../../components/auth";
import Toast from "../../components/toast/toast";
import { Spinner } from "../../components/spinner/spinner";
import {
  FaUser,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTie,
  FaPlus,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaMapPin,
} from "react-icons/fa";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // User & Branch Info
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    branch_code: "",
    branch_name: "",
    branch_type: "",
  });

  // Delivery Boys
  const [boys, setBoys] = useState([]);
  const [showBoyModal, setShowBoyModal] = useState(false);
  const [boyForm, setBoyForm] = useState({
    boyname: "",
    phone: "",
    address: "",
  });

  // Areas
  const [areas, setAreas] = useState([]);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [areaForm, setAreaForm] = useState({
    area: "",
  });

  // Loading & Toast
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    fetchProfileData();
  }, [navigate]);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch user info (you'll need to create this endpoint)
      const userRes = await axiosInstance.get("user/profile/");
      if (userRes.data.status === "success") {
        setUserInfo(userRes.data.data);
      }

      // Fetch delivery boys
      const boysRes = await axiosInstance.get("adddelboy/");
      if (boysRes.data.status === "success") {
        setBoys(boysRes.data.data);
      }

      // Fetch areas
      const areasRes = await axiosInstance.get("addloc/");
      if (areasRes.data.status === "success") {
        setAreas(areasRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
      showToast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add Delivery Boy
  const handleAddBoy = async () => {
    if (!boyForm.boyname.trim()) {
      showToast("Boy name is required", "error");
      return;
    }

    if (!boyForm.phone.trim()) {
      showToast("Phone number is required", "error");
      return;
    }

    if (boyForm.phone.length !== 10) {
      showToast("Phone number must be 10 digits", "error");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axiosInstance.post("adddelboy/", boyForm);

      if (res.data.status === "success") {
        showToast("Delivery boy added successfully", "success");
        setShowBoyModal(false);
        setBoyForm({ boyname: "", phone: "", address: "" });
        fetchProfileData(); // Refresh list
      } else {
        showToast("Failed to add delivery boy", "error");
      }
    } catch (err) {
      console.error("Error adding boy:", err);
      showToast("Server error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Area
  const handleAddArea = async () => {
    if (!areaForm.area.trim()) {
      showToast("Area name is required", "error");
      return;
    }

    try {
      setSubmitting(true);

      const res = await axiosInstance.post("addloc/", areaForm);

      if (res.data.status === "success") {
        showToast("Area added successfully", "success");
        setShowAreaModal(false);
        setAreaForm({ area: "" });
        fetchProfileData(); // Refresh list
      } else {
        showToast("Failed to add area", "error");
      }
    } catch (err) {
      console.error("Error adding area:", err);
      showToast("Server error occurred", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBoyPhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setBoyForm((prev) => ({ ...prev, phone: value }));
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <Spinner size="large" color="primary" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar">
              <FaUser />
            </div>
            <div className="profile-header-info">
              <h1 className="profile-title">My Profile</h1>
              <p className="profile-subtitle">
                Manage your account and settings
              </p>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaUser className="section-icon" />
              User Information
            </h2>
          </div>
          <div className="info-card">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard className="info-icon" />
                  Username
                </div>
                <div className="info-value">{userInfo.username || "N/A"}</div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaEnvelope className="info-icon" />
                  Email
                </div>
                <div className="info-value">{userInfo.email || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Branch/Hub Information Card */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaBuilding className="section-icon" />
              Branch / Hub Details
            </h2>
          </div>
          <div className="info-card">
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <FaIdCard className="info-icon" />
                  Branch Code
                </div>
                <div className="info-value">
                  {userInfo.branch_code || "N/A"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaBuilding className="info-icon" />
                  Branch Name
                </div>
                <div className="info-value">
                  {userInfo.branch_name || "N/A"}
                </div>
              </div>
              <div className="info-item">
                <div className="info-label">
                  <FaMapMarkerAlt className="info-icon" />
                  Type
                </div>
                <div className="info-value">
                  <span
                    className={`type-badge type-${userInfo.branch_type?.toLowerCase()}`}
                  >
                    {userInfo.branch_type || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Boys Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaUserTie className="section-icon" />
              Delivery Boys ({boys.length})
            </h2>
            <button className="btn-add" onClick={() => setShowBoyModal(true)}>
              <FaPlus />
              Add Boy
            </button>
          </div>

          {boys.length === 0 ? (
            <div className="empty-state">
              <FaUserTie className="empty-icon" />
              <p>No delivery boys added yet</p>
              <button
                className="btn-add-empty"
                onClick={() => setShowBoyModal(true)}
              >
                <FaPlus />
                Add First Delivery Boy
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {boys.map((boy) => (
                <div key={boy.boy_code} className="card-item">
                  <div className="card-header-row">
                    <div className="card-icon-wrapper">
                      <FaUserTie />
                    </div>
                    <span className="card-code">{boy.boy_code}</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-name">{boy.name}</h3>
                    <div className="card-detail">
                      <FaPhone className="detail-icon" />
                      <span>{boy.phone_number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Areas Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <FaMapPin className="section-icon" />
              Delivery Areas ({areas.length})
            </h2>
            <button className="btn-add" onClick={() => setShowAreaModal(true)}>
              <FaPlus />
              Add Area
            </button>
          </div>

          {areas.length === 0 ? (
            <div className="empty-state">
              <FaMapPin className="empty-icon" />
              <p>No delivery areas added yet</p>
              <button
                className="btn-add-empty"
                onClick={() => setShowAreaModal(true)}
              >
                <FaPlus />
                Add First Area
              </button>
            </div>
          ) : (
            <div className="cards-grid">
              {areas.map((area) => (
                <div key={area.area_code} className="card-item">
                  <div className="card-header-row">
                    <div className="card-icon-wrapper card-icon-area">
                      <FaMapPin />
                    </div>
                    <span className="card-code">{area.area_code}</span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-name">{area.area}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Delivery Boy Modal */}
      {showBoyModal && (
        <div className="modal-overlay" onClick={() => setShowBoyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FaUserTie />
                Add Delivery Boy
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowBoyModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="label-icon" />
                  Boy Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter delivery boy name"
                  value={boyForm.boyname}
                  onChange={(e) =>
                    setBoyForm((prev) => ({ ...prev, boyname: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="label-icon" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="10-digit phone number"
                  value={boyForm.phone}
                  onChange={handleBoyPhoneChange}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="label-icon" />
                  Address
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter address (optional)"
                  value={boyForm.address}
                  onChange={(e) =>
                    setBoyForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowBoyModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleAddBoy}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="small" color="white" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Boy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Area Modal */}
      {showAreaModal && (
        <div className="modal-overlay" onClick={() => setShowAreaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FaMapPin />
                Add Delivery Area
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAreaModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  <FaMapPin className="label-icon" />
                  Area Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter area/location name"
                  value={areaForm.area}
                  onChange={(e) => setAreaForm({ area: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAreaModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                onClick={handleAddArea}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="small" color="white" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Add Area
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
          message={toast.message}
          type={toast.type}
          onclose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Profile;
