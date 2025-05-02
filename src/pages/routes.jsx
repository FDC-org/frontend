import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import { Dashboard } from "./dashboard/dashbaord";
import Inscan from "./incan/inscan";
import ViewInscan from "./incan/view_inscan";
import OutScan from "./outscan/outscan";
import ViewOutscan from "./outscan/outscanview";
import ManifestByNumber from "./manifest/manifestbynumber";
import Manifest from "./manifest/manifest";

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
        <Route
          path="/manifest/:manifestnumber"
          element={<ManifestByNumber />}
        />
      </Routes>
    </Router>
  );
};
export default PageRoutes;
