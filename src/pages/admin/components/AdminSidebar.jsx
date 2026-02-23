import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    MdDomain,
    MdStore,
    MdPersonAdd,
    MdLocalShipping,
    MdExitToApp,
} from "react-icons/md";
import { FaUserShield, FaUserCircle, FaBuilding } from "react-icons/fa";
import axiosInstance from "../../../components/axios";

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axiosInstance.get("user/profile/");
            if (response.data.status === "success") {
                setProfile(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load admin profile:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.href = "/login";
    };

    const navItems = [
        { path: "/admin/hub", label: "Hubs", icon: <MdDomain /> },
        { path: "/admin/branch", label: "Branches", icon: <MdStore /> },
        { path: "/admin/user", label: "Users", icon: <MdPersonAdd /> },
        { path: "/admin/employee", label: "Employees", icon: <MdLocalShipping /> },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-logo">
                    <FaUserShield size={24} />
                    <span>FDC Admin</span>
                </div>
            </div>

            {profile && (
                <div className="admin-profile-summary">
                    <div className="admin-profile-icon">
                        <FaUserCircle />
                    </div>
                    <div className="admin-profile-info">
                        <p className="admin-username">{profile.username}</p>
                        {profile.branch_name && (
                            <p className="admin-branch-info">{profile.branch_name}</p>
                        )}
                        {profile.related_hub_name && (
                            <p className="admin-hub-info">
                                <FaBuilding size={10} /> {profile.related_hub_name}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <nav className="admin-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <MdExitToApp className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
