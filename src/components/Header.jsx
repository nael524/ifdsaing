import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo2.png";
import "../styles/Header.css";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">

        <Link to="/" className="logo-area">
          <img src={logo} alt="Logo" />
          <div>
            <h2>IF D SIANG</h2>
            <span>Angkatan 2024</span>
          </div>
        </Link>

        <nav className={open ? "nav active" : "nav"}>
          <Link to="/" onClick={() => setOpen(false)}>Beranda</Link>
          <Link to="/laporan" onClick={() => setOpen(false)}>Laporan</Link>
          <Link to="/Data" onClick={() => setOpen(false)}>Data IF D Siang</Link>
          <Link to="/Cash" onClick={() => setOpen(false)}>Uang Cash</Link>


        </nav>



        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

      </div>
    </header>
  );
}

export default Header;