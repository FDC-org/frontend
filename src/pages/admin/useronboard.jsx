import { useEffect, useState } from "react";
import { MdSearch, MdChevronLeft, MdChevronRight } from "react-icons/md";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";

const UserOnboard = () => {
    const [units, setUnits] = useState([]); // Hubs or Branches
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        type: "",
        code: "",
        firstname: "",
        lastname: "",
        phone_number: "",
        code_name: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (formData.type) {
            fetchUnits(formData.type);
        }
    }, [formData.type]);

    const fetchUsers = async () => {
        setFetchingData(true);
        try {
            const response = await axiosInstance.get("onboard/user/");
            if (response.data.status === "success") {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
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
        const { name, value } = e.target;
        if (name === "code") {
            const selectedUnit = units.find(u => (u.hub_code || u.branch_code) === value);
            const unitName = selectedUnit ? (selectedUnit.hubname || selectedUnit.branchname) : "";
            setFormData({
                ...formData,
                [name]: value,
                code_name: unitName
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post("onboard/user/", formData);

            if (response.data.status === "success") {
                showToast("User onboarded successfully", "success");
                setFormData({
                    username: "",
                    password: "",
                    type: "",
                    code: "",
                    firstname: "",
                    lastname: "",
                    phone_number: "",
                    code_name: "",
                });
                setShowForm(false);
                fetchUsers();
            } else {
                showToast("Failed to onboard user", "error");
            }
        } catch (error) {
            console.error("User onboarding failed:", error);
            showToast(error.response?.data?.message || "Failed to onboard user", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on search query
    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.code_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current items for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
                    {showForm ? "Back to List" : "+ Add New User"}
                </button>
            </div>

            {showForm ? (
                <div className="admin-card animate-in">
                    <h2 className="card-title">Onboard New System User</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="form-input"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. john.doe"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Secure password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">User Type</label>
                                <select
                                    name="type"
                                    className="form-select"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="HUB">Hub User</option>
                                    <option value="BRANCH">Branch User</option>
                                </select>
                            </div>

                            {formData.type !== "ADMIN" && formData.type !== "" && (
                                <div className="form-group">
                                    <label className="form-label">
                                        Assign to {formData.type === "HUB" ? "Hub" : "Branch"}
                                    </label>
                                    <select
                                        name="code"
                                        className="form-select"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required={formData.type !== "ADMIN"}
                                    >
                                        <option value="">Select {formData.type === "HUB" ? "Hub" : "Branch"}</option>
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
                            )}

                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    className="form-input"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    className="form-input"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                    placeholder="Last Name"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    className="form-input"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    maxLength={10}
                                    placeholder="10-digit number"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? <Spinner size="sm" color="white" /> : "Create User"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="admin-card animate-in">
                    <div className="admin-table-actions">
                        <h3 className="card-title">System User Directory</h3>
                        <div className="search-wrapper">
                            <MdSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search users by name, role, etc..."
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
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Unit</th>
                                    <th>Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fetchingData ? (
                                    <tr><td colSpan="5" className="text-center"><Spinner size="sm" /> Loading...</td></tr>
                                ) : currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.firstname} {user.lastname}</td>
                                            <td>{user.username}</td>
                                            <td><span className={`badge-role ${user.type?.toLowerCase()}`}>{user.type}</span></td>
                                            <td>{user.code_name || "N/A"} ({user.code || "N/A"})</td>
                                            <td>{user.phone_number || "N/A"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            {searchQuery ? "No matching users found" : "No users found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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

export default UserOnboard;
