import { useEffect, useState } from "react";
import { MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";
import axiosInstance from "../../components/axios";

const HubOnboard = () => {
    const [formData, setFormData] = useState({
        hubname: "",
        location: "",
        address: "",
        phone_number: "",
        incharge_name: "",
        state: "",
        region: "",
    });

    const [hubs, setHubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        try {
            const response = await axiosInstance.get("onboard/hub/");
            if (response.data.status === "success") {
                setHubs(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch hubs:", error);
        }
    };

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post("onboard/hub/", formData);

            if (response.data.status === "success") {
                showToast("Hub onboarded successfully", "success");
                setFormData({
                    hubname: "",
                    location: "",
                    address: "",
                    phone_number: "",
                    incharge_name: "",
                    state: "",
                    region: "",
                });
                setShowForm(false);
                fetchHubs(); // Refresh list
            } else {
                showToast("Failed to onboard hub", "error");
            }
        } catch (error) {
            console.error("Hub onboarding failed:", error);
            showToast(error.response?.data?.message || "Failed to onboard hub", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter hubs based on search query
    const filteredHubs = hubs.filter(hub =>
        hub.hubname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.hub_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentHubs = filteredHubs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="admin-container">
            <div className="admin-actions-bar">
                <button
                    className={`btn-primary ${showForm ? 'btn-secondary' : ''}`}
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) setSearchQuery(""); // Clear search when opening form
                    }}
                >
                    {showForm ? "Back to List" : "+ Add New Hub"}
                </button>
            </div>

            {showForm ? (
                <div className="admin-card animate-in">
                    <h2 className="card-title">Onboard New Hub</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Hub Name</label>
                                <input
                                    type="text"
                                    name="hubname"
                                    className="form-input"
                                    value={formData.hubname}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Central Hub"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="City/Area"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    className="form-textarea"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Full address"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    className="form-input"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    maxLength={10}
                                    placeholder="10-digit number"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Incharge Name</label>
                                <input
                                    type="text"
                                    name="incharge_name"
                                    className="form-input"
                                    value={formData.incharge_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Person in charge"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    className="form-input"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    placeholder="State"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Region</label>
                                <input
                                    type="text"
                                    name="region"
                                    className="form-input"
                                    value={formData.region}
                                    onChange={handleChange}
                                    required
                                    placeholder="Region"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Spinner size="sm" color="white" /> : "Create Hub"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-card animate-in">
                    <div className="admin-table-actions">
                        <h3 className="card-title">Existing Hubs</h3>
                        <div className="search-wrapper">
                            <MdSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, code or location..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Hub Name</th>
                                    <th>Code</th>
                                    <th>Location</th>
                                    <th>Incharge</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentHubs.length > 0 ? (
                                    currentHubs.map((hub) => (
                                        <tr key={hub.id || hub.hub_code}>
                                            <td>{hub.hubname}</td>
                                            <td><span className="badge-code">{hub.hub_code}</span></td>
                                            <td>{hub.location}</td>
                                            <td>{hub.incharge_name}</td>
                                            <td>{hub.phone_number}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            {searchQuery ? "No matching hubs found" : "No hubs found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHubs.length)} of {filteredHubs.length} hubs
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="btn-page"
                                    disabled={currentPage === 1}
                                    onClick={() => paginate(currentPage - 1)}
                                >
                                    <MdChevronLeft />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        className={`btn-page ${currentPage === idx + 1 ? 'active' : ''}`}
                                        onClick={() => paginate(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    className="btn-page"
                                    disabled={currentPage === totalPages}
                                    onClick={() => paginate(currentPage + 1)}
                                >
                                    <MdChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
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

export default HubOnboard;
