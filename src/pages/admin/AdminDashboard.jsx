import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import axiosInstance from "../../components/axios";
import { Spinner } from "../../components/spinner/spinner";
import "./admin.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await axiosInstance.get("userdetails/");
            if (response.data.type === "ADMIN") {
                setIsAuthorized(true);
            } else {
                navigate("/access-denied"); // Create this or redirect to home with error
            }
        } catch (error) {
            console.error("Access check failed:", error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard-loading">
                <Spinner size="lg" color="primary" />
                <p>Verifying Admin Access...</p>
            </div>
        );
    }

    if (!isAuthorized) return null;

    // Map routes to titles
    const getPageTitle = (pathname) => {
        if (pathname.includes("/admin/hub")) return "Processing Hubs";
        if (pathname.includes("/admin/branch")) return "Branch Offices";
        if (pathname.includes("/admin/user")) return "System Users";
        if (pathname.includes("/admin/employee")) return "Employee Directory";
        return "Admin Dashboard";
    };

    const getPageSubtitle = (pathname) => {
        if (pathname.includes("/admin/hub")) return "Manage and monitor processing hubs";
        if (pathname.includes("/admin/branch")) return "Manage branch office locations";
        if (pathname.includes("/admin/user")) return "Manage system access and user roles";
        if (pathname.includes("/admin/employee")) return "Manage delivery personnel records";
        return "Select an option from the sidebar";
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <main className="admin-content">
                <header className="page-header">
                    <h1 className="page-title">{getPageTitle(location.pathname)}</h1>
                    <p className="page-subtitle">{getPageSubtitle(location.pathname)}</p>
                </header>
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
