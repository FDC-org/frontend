import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import { Dashboard } from "./dashboard/dashbaord";
import Inscan from "./incan/inscan";
import ViewInscan from "./incan/view_inscan";
import OutScan from "./outscan/outscan";
import ViewOutscan from "./outscan/outscanview";
import ManifestByNumber from "./manifest/manifestbynumber";
import Manifest from "./manifest/manifest";
import Track from "./track/track";
import AdminHome from "./admin/AdminHome";
import AdminDashboard from "./admin/AdminDashboard";
import HubOnboard from "./admin/HubOnboard";
import BranchOnboard from "./admin/BranchOnboard";
import UserOnboard from "./admin/UserOnboard.jsx";
import EmployeeOnboard from "./admin/EmployeeOnboard";
import Profile from "./profile/profile";
import CreateDRS from "./drs/drs.jsx";
import AllBookings from "./bookings/view_bookings.jsx";
import Booking from "./bookings/booking.jsx";
import DeliveryUpdate from "./delivery/delivery.jsx";

const PageRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/test" />
        <Route path="/inscan/" element={<Inscan />} />
        <Route path="/inscan/view" element={<ViewInscan />} />
        <Route path="/outscan" element={<OutScan />} />
        <Route path="/outscan/view" element={<ViewOutscan />} />
        <Route path="/manifest" element={<Manifest />} />
        <Route path="/drs" element={<CreateDRS />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/view" element={<AllBookings />} />
        <Route
          path="/manifest/:manifestnumber"
          element={<ManifestByNumber />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/track/:awbno" element={<Track />} />
        <Route path="/delivery/:drsno" element={<DeliveryUpdate />} />

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="hub" element={<HubOnboard />} />
          <Route path="branch" element={<BranchOnboard />} />
          <Route path="user" element={<UserOnboard />} />
          <Route path="employee" element={<EmployeeOnboard />} />
        </Route>

        {/* <Route path="landing" element={<Landing />} /> */}
      </Routes>
    </Router>
  );
};
export default PageRoutes;
