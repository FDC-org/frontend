import { useEffect, useState } from "react";
import { MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";

const EmployeeOnboard = () => {
    const [units, setUnits] = useState([]); // Hubs and Branches
    const [employees, setEmployees] = useState([]);
    const [unitType, setUnitType] = useState("HUB"); // Default to HUB
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        address: "",
        code: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchUnits(unitType);
    }, [unitType]);

    const fetchEmployees = async () => {
        setFetchingData(true);
        try {
            const response = await axiosInstance.get("onboard/employee/");
            if (response.data.status === "success") {
                setEmployees(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchUnits = async (type) => {
        setUnits([]);
        try {
            const endpoint = type === "HUB" ? "onboard/hub/" : "onboard/branch/";
            const response = await axiosInstance.get(endpoint);
            if (response.data.status === "success") {
                setUnits(response.data.data);
            }
        } catch (error) {
            console.error(`Failed to fetch ${type} list:`, error);
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
            const response = await axiosInstance.post("onboard/employee/", formData);

            if (response.data.status === "success") {
                showToast("Employee onboarded successfully", "success");
                setFormData({
                    name: "",
                    phone_number: "",
                    address: "",
                    code: "",
                });
                setShowForm(false);
                fetchEmployees();
            } else {
                showToast("Failed to onboard employee", "error");
            }
        } catch (error) {
            console.error("Employee onboarding failed:", error);
            showToast(error.response?.data?.message || "Failed to onboard employee", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter employees based on search query
    const filteredEmployees = employees.filter(emp =>
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.unit_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

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
                    {showForm ? "Back to List" : "+ Add New Employee"}
                </button>
            </div>

            {showForm ? (
                <div className="admin-card animate-in">
                    <h2 className="card-title">Register New Employee</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Employee Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Full Name"
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
                                <label className="form-label">Work Location Type</label>
                                <select
                                    className="form-select"
                                    value={unitType}
                                    onChange={(e) => setUnitType(e.target.value)}
                                >
                                    <option value="HUB">Hub</option>
                                    <option value="BRANCH">Branch</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">
                                    Assign to {unitType === "HUB" ? "Hub" : "Branch"}
                                </label>
                                <select
                                    name="code"
                                    className="form-select"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select {unitType === "HUB" ? "Hub" : "Branch"}</option>
                                    {units.map((unit) => {
                                        const code = unit.hub_code || unit.branch_code;
                                        const name = unit.hubname || unit.branchname;
                                        return (
                                            <option key={code} value={code}>
                                                {name} ({code})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    className="form-textarea"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    placeholder="Residential address"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Spinner size="sm" color="white" /> : "Register Employee"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-card animate-in">
                    <div className="admin-table-actions">
                        <h3 className="card-title">Employee Directory</h3>
                        <div className="search-wrapper">
                            <MdSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search employees by name, phone, unit..."
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
                                    <th>Employee Name</th>
                                    <th>Phone</th>
                                    <th>Work Unit</th>
                                    <th>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchingData ? (
                                    <tr><td colSpan="4" className="text-center"><Spinner size="sm" /> Loading...</td></tr>
                                ) : currentEmployees.length > 0 ? (
                                    currentEmployees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td>{emp.name}</td>
                                            <td>{emp.phone_number}</td>
                                            <td>{emp.unit_name || emp.code} ({emp.code})</td>
                                            <td>{emp.address}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            {searchQuery ? "No matching employees found" : "No employees found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
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

export default EmployeeOnboard;
