import { useState, useEffect } from "react";
import "./App.css";
import { isLoggedIn } from "./components/auth";
import NavBar from "./components/navbar/navbar";
import QuickMenuBar from "./components/quickmenubar/quickmenubar";
import PageRoutes from "./pages/routes";
import Footer from "./components/bottom/bottom";
import BottomNav from "./components/bottom/bottom";

function App() {
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    if (isLoggedIn()) setLogged(true);
  }, [isLoggedIn]);

  return (
    <div className="root">
      <NavBar />
      {logged && (
        <>
          <QuickMenuBar />
        </>
      )}
      <PageRoutes />
      <BottomNav />
    </div>
  );
}

export default App;
