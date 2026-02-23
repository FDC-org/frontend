import { useEffect, useState } from "react";
import { MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Spinner } from "../../components/spinner/spinner";
import axiosInstance from "../../components/axios";

const BranchOnboard = () => {
    const [hubs, setHubs] = useState([]);
    const [branches, setBranches] = useState([]);
    const [formData, setFormData] = useState({
        branchname: "",
        hub: "",
        location: "",
        address: "",
        phone_number: "",
        incharge_name: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setFetchingData(true);
        try {
            const [hubsRes, branchesRes] = await Promise.all([
                axiosInstance.get("onboard/hub/"),
                axiosInstance.get("onboard/branch/")
            ]);

            if (hubsRes.data.status === "success") setHubs(hubsRes.data.data);
            if (branchesRes.data.status === "success") setBranches(branchesRes.data.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setFetchingData(false);
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
            const response = await axiosInstance.post("onboard/branch/", formData);

            if (response.data.status === "success") {
                showToast("Branch onboarded successfully", "success");
                setFormData({
                    branchname: "",
                    hub: "",
                    location: "",
                    address: "",
                    phone_number: "",
                    incharge_name: "",
                });
                setShowForm(false);
                fetchAllData();
            } else {
                showToast("Failed to onboard branch", "error");
            }
        } catch (error) {
            console.error("Branch onboarding failed:", error);
            showToast(error.response?.data?.message || "Failed to onboard branch", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter branches based on search query
    const filteredBranches = branches.filter(branch =>
        branch.branchname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.branch_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (branch.hub_name || branch.hub)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBranches = filteredBranches.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="admin-container">
            <div className="admin-actions-bar">
                <button
                    className={`btn-primary ${showForm ? 'btn-secondary' : ''}`}
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) setSearchQuery("");
                    }}
                >
                    {showForm ? "Back to List" : "+ Add New Branch"}
                </button>
            </div>

            {showForm ? (
                <div className="admin-card animate-in">
                    <h2 className="card-title">Onboard New Branch</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Branch Name</label>
                                <input
                                    type="text"
                                    name="branchname"
                                    className="form-input"
                                    value={formData.branchname}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. North Branch"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Linked Hub</label>
                                <select
                                    name="hub"
                                    className="form-select"
                                    value={formData.hub}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Hub</option>
                                    {hubs.map((hub) => (
                                        <option key={hub.id || hub.hub_code} value={hub.hub_code}>
                                            {hub.hubname} ({hub.hub_code})
                                        </option>
                                    ))}
                                </select>
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
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Spinner size="sm" color="white" /> : "Create Branch"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-card animate-in">
                    <div className="admin-table-actions">
                        <h3 className="card-title">Existing Branches</h3>
                        <div className="search-wrapper">
                            <MdSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search branches..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Branch Name</th>
                                    <th>Code</th>
                                    <th>Linked Hub</th>
                                    <th>Location</th>
                                    <th>Incharge</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchingData ? (
                                    <tr><td colSpan="6" className="text-center"><Spinner size="sm" /> Loading...</td></tr>
                                ) : currentBranches.length > 0 ? (
                                    currentBranches.map((branch) => (
                                        <tr key={branch.id || branch.branch_code}>
                                            <td>{branch.branchname}</td>
                                            <td><span className="badge-code">{branch.branch_code}</span></td>
                                            <td>{branch.hub_name || branch.hub}</td>
                                            <td>{branch.location}</td>
                                            <td>{branch.incharge_name}</td>
                                            <td>{branch.phone_number}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">
                                            {searchQuery ? "No matching branches found" : "No branches found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBranches.length)} of {filteredBranches.length} branches
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

export default BranchOnboard;
