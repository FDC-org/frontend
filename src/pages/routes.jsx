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
import HubOnboard from "./admin/HubOnbaord.jsx";
import UserOnboard from "./admin/useronboard.jsx";
import CreateDRS from "./drs/drs.jsx";
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
        <Route
          path="/manifest/:manifestnumber"
          element={<ManifestByNumber />}
        />
        <Route path="/track/:awbno" element={<Track />} />
        <Route path="/delivery/:drsno" element={<DeliveryUpdate />} />

        <Route path="admin/hubonboard" element={<HubOnboard />} />
        <Route path="admin/useronboard" element={<UserOnboard />} />
      </Routes>
    </Router>
  );
};
export default PageRoutes;
