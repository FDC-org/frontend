import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../components/auth";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import Toast from "../../components/toast/toast";
import {
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdSettings,
  MdDelete,
  MdSearch,
  MdAdd,
  MdClose,
} from "react-icons/md";
import "./clients.css";

const Clients = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    fetchClients();
  }, [navigate]);

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("clients/");
      if (res.data.status === "success") {
        setClients(res.data.data || []);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      showToast("Failed to load clients", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({ ...prev, phone: value }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      showToast("Client name is required", "error");
      return false;
    }
    if (formData.phone.length !== 10) {
      showToast("Phone number must be exactly 10 digits", "error");
      return false;
    }
    if (!formData.address.trim()) {
      showToast("Client address is required", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("clients/", formData);
      if (res.data.status === "success") {
        showToast("Client added successfully!", "success");
        setFormData({ name: "", phone: "", address: "" });
        fetchClients();
      } else {
        showToast(res.data.message || "Failed to add client", "error");
      }
    } catch (err) {
      console.error("Failed to add client:", err);
      showToast("Failed to add client", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (clientCode) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await axiosInstance.delete("clients/", {
        data: { client_code: clientCode },
      });
      if (res.data.status === "success") {
        showToast("Client deleted successfully!", "success");
        fetchClients();
      } else {
        showToast(res.data.message || "Failed to delete client", "error");
      }
    } catch (err) {
      console.error("Failed to delete client:", err);
      showToast("Failed to delete client", "error");
    }
  };

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.client_code.toLowerCase().includes(term) ||
      client.phone_number.includes(term)
    );
  });

  return (
    <div className="clients-page">
      <div className="clients-page__container">
        
        {/* Header Banner */}
        <header className="clients-page__header">
          <div className="header-left">
            <MdSettings className="header-main-icon" />
            <div>
              <h1 className="clients-page__title">Client Settings</h1>
              <p className="clients-page__subtitle">Register and manage credit/corporate clients</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="clients-page__loading">
            <Spinner size="lg" />
            <p>Loading client directory...</p>
          </div>
        ) : (
          <div className="clients-page__layout">
            
            {/* Left Card: Add Client Form */}
            <div className="clients-page__form-side">
              <div className="clients-card">
                <h2 className="clients-card-title">
                  <MdAdd className="card-icon" />
                  <span>Register New Client</span>
                </h2>
                <form onSubmit={handleSubmit} className="clients-form">
                  <div className="form-field">
                    <label htmlFor="name" className="form-field__label">
                      Client Name <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <MdPerson className="input-field-icon" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="form-field__input"
                        placeholder="Enter full client name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone" className="form-field__label">
                      Phone Number <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <MdPhone className="input-field-icon" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="form-field__input"
                        placeholder="10-digit number"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="address" className="form-field__label">
                      Client Address <span className="required">*</span>
                    </label>
                    <div className="input-with-icon">
                      <MdLocationOn className="input-field-icon" />
                      <textarea
                        id="address"
                        name="address"
                        className="form-field__textarea"
                        placeholder="Full billing/registered address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="clients-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" color="white" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      "Register Client"
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Card: Clients Directory */}
            <div className="clients-page__list-side">
              <div className="clients-card">
                <div className="clients-list-header">
                  <h2 className="clients-card-title">
                    <MdPerson className="card-icon" />
                    <span>Client Directory</span>
                  </h2>
                  <span className="client-count-badge">
                    {filteredClients.length} Registered
                  </span>
                </div>

                {/* Search box */}
                <div className="clients-search-box">
                  <MdSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, code, or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="search-clear-btn" onClick={() => setSearchTerm("")}>
                      <MdClose />
                    </button>
                  )}
                </div>

                {/* Client List */}
                {filteredClients.length === 0 ? (
                  <div className="clients-empty-state">
                    <MdPerson className="empty-icon" />
                    <p className="empty-message">
                      {searchTerm ? "No matching clients found" : "No clients registered yet"}
                    </p>
                  </div>
                ) : (
                  <div className="clients-table-wrapper">
                    <table className="clients-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Client Details</th>
                          <th>Billing Address</th>
                          <th className="th-actions">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client) => (
                          <tr key={client.client_code}>
                            <td className="td-client-code">{client.client_code}</td>
                            <td>
                              <div className="client-info-cell">
                                <span className="client-name-bold">{client.name}</span>
                                <span className="client-phone-sub">
                                  <MdPhone className="phone-icon-inline" /> {client.phone_number}
                                </span>
                              </div>
                            </td>
                            <td className="td-address">{client.address}</td>
                            <td className="td-actions">
                              <button
                                className="clients-action-btn delete"
                                onClick={() => handleDelete(client.client_code)}
                                title="Delete Client"
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

export default Clients;
