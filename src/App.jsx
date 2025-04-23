import { useState, useEffect } from "react";
import "./App.css";
import { isLoggedIn } from "./components/auth";
import NavBar from "./components/navbar/navbar";
import QuickMenuBar from "./components/quickmenubar/quickmenubar";
import PageRoutes from "./pages/routes";

function App() {
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    if (isLoggedIn()) setLogged(true);
  }, [isLoggedIn]);

  return (
    <div className="root">
      <NavBar />
      {logged && <QuickMenuBar />}
      <PageRoutes />
    </div>
  );
}

export default App;
