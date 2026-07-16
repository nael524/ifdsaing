import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import logo1 from "./assets/logo2.png";
import HeroSelection from "./pages/HeroSelection";
import Data from "./pages/Data";
import Header from "./components/Header";
import "./App.css";
import Bendahara from "./pages/Bendahara";
import Login from "./pages/Login";
import Cash from "./pages/Cash";
import Laporan from "./pages/Laporan";
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="splash-screen">
        <div className="logo-wrapper">
          <img src={logo1} alt="Logo" className="logo" />
          <h1>IF D SIANG</h1>
        </div>
      </div>
    );
  }

  return (
    <>

      <Routes>
        <Route path="/" element={<HeroSelection />} />
        <Route path="/cash" element={<Cash />} />
        <Route path="/Data" element={<Data />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bendahara" element={<Bendahara />} />
        <Route path="/laporan" element={<Laporan />} />
      </Routes>
    </>
  );
}

export default App;