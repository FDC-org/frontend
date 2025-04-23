import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login/login";
import { Dashboard } from "./dashboard/dashbaord";
import Inscan from "./incan/inscan";
import ViewInscan from "./incan/view_inscan";

const PageRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<Dashboard />}></Route>
        <Route path="/test" />
        <Route path="/inscan/" element={<Inscan />} />
        <Route path="/inscan/viewinscan" element={<ViewInscan />} />
        <Route path="/outscan" />
      </Routes>
    </Router>
  );
};
export default PageRoutes;
