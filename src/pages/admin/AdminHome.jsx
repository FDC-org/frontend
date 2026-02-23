import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import { MdDomain, MdStore, MdPerson, MdLocalShipping, MdArrowForward } from "react-icons/md";

const AdminHome = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        hubs: [],
        branches: [],
        users: [],
        employees: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllRecentData = async () => {
            setLoading(true);
            try {
                const [hubs, branches, users, employees] = await Promise.all([
                    axiosInstance.get("onboard/hub/"),
                    axiosInstance.get("onboard/branch/"),
                    axiosInstance.get("onboard/user/"),
                    axiosInstance.get("onboard/employee/")
                ]);

                setData({
                    hubs: hubs.data.data?.slice(0, 5) || [],
                    branches: branches.data.data?.slice(0, 5) || [],
                    users: users.data.data?.slice(0, 5) || [],
                    employees: employees.data.data?.slice(0, 5) || []
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllRecentData();
    }, []);

    const SummaryCard = ({ title, icon, list, path, columns }) => (
        <div className="admin-summary-card animate-in">
            <div className="summary-header">
                <div className="summary-title-group">
                    {icon}
                    <h3>{title}</h3>
                </div>
                <button className="btn-view-all" onClick={() => navigate(path)}>
                    View All <MdArrowForward />
                </button>
            </div>
            <div className="table-responsive">
                <table className="admin-table mini-table">
                    <thead>
                        <tr>
                            {columns.map(col => <th key={col.key}>{col.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {list.length > 0 ? (
                            list.map((item, idx) => (
                                <tr key={idx}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {typeof col.render === 'function' ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={columns.length} className="text-center">No records</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="admin-home-loading">
                <Spinner size="lg" />
                <p>Loading Dashboard Summary...</p>
            </div>
        );
    }

    return (
        <div className="admin-home-dashboard">
            <div className="admin-summary-grid">
                <SummaryCard
                    title="Recent Hubs"
                    icon={<MdDomain />}
                    list={data.hubs}
                    path="/admin/hub"
                    columns={[
                        { key: 'hubname', label: 'Name' },
                        { key: 'hub_code', label: 'Code', render: (h) => <span className="badge-code">{h.hub_code}</span> },
                        { key: 'location', label: 'Location' }
                    ]}
                />

                <SummaryCard
                    title="Recent Branches"
                    icon={<MdStore />}
                    list={data.branches}
                    path="/admin/branch"
                    columns={[
                        { key: 'branchname', label: 'Name' },
                        { key: 'branch_code', label: 'Code', render: (b) => <span className="badge-code">{b.branch_code}</span> },
                        { key: 'hub', label: 'Hub' }
                    ]}
                />

                <SummaryCard
                    title="Recent Users"
                    icon={<MdPerson />}
                    list={data.users}
                    path="/admin/user"
                    columns={[
                        { key: 'username', label: 'User' },
                        { key: 'type', label: 'Role', render: (u) => <span className={`badge-role ${u.type?.toLowerCase()}`}>{u.type}</span> },
                        { key: 'code', label: 'Unit' }
                    ]}
                />

                <SummaryCard
                    title="Recent Employees"
                    icon={<MdLocalShipping />}
                    list={data.employees}
                    path="/admin/employee"
                    columns={[
                        { key: 'name', label: 'Name' },
                        { key: 'phone_number', label: 'Phone' },
                        { key: 'code', label: 'Unit' }
                    ]}
                />
            </div>
        </div>
    );
};

export default AdminHome;
