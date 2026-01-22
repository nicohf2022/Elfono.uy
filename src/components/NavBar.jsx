import { Link } from "react-router-dom";
import { useState } from "react";
import { FaSearch, FaUser, FaBookmark, FaShoppingBag, FaBars } from "react-icons/fa";
import { TopBanner } from "./TopBanner";
import { CartDrawer } from "./CartDrawer";   // ⭐ NUEVO
import { useCart } from "./CartContext";     // ⭐ NUEVO
import "./Navbar.css";
import { useNavigate } from "react-router-dom";
import { CategoryPage } from "../pages/CategoryPage";

export const Navbar = ({ onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);       // menú lateral

  const { totalItems } = useCart();                  // cantidad carrito


  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const anuncios = [
    "¡ENVÍOS GRATIS EN COMPRAS > $1500!",
    " 2 x $500 EN SILICON",
    "RETIROS EN PUNTA DEL ESTE SIN COSTOS",
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <TopBanner messages={anuncios} intervalMs={5000} />

      <nav className="navbar">

        {/* ☰ Menú lateral */}
        <div className="navbar-left" onClick={toggleMenu}>
          <FaBars className="icon" />
          <span className="menu-text">Shop</span>
        </div>

        {/* 🏠 Logo */}
        <div className="navbar-center">
          <Link to="/">
            <img
              src="/assets/logo.webp"
              alt="ElFono.uy - Phone Spot"
              className="logo-img"
            />
          </Link>
        </div>

        {/* 🔍 ⭐ 🛍 Icons derecha */}
        <div className="navbar-right">





          {/* 🛍 CARRITO */}
          <div className="icon-wrapper" onClick={onOpenCart}>
            <FaShoppingBag className="icon" />
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </div>

        </div>
      </nav>



      {/* 🔸 Menú lateral */}
{isOpen && (
  <div className="menu-overlay" onClick={toggleMenu}>
    <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
      <h3>Categorías</h3>
      <ul>
        <li>
          <Link to="/categoria/fundas" onClick={toggleMenu} >
            Cases
          </Link>
        </li>
        <li>
          <Link to="/categoria/cargadores" onClick={toggleMenu} >
            Cargadores
          </Link>
        </li>
        <li>
          <Link to="categoria/auriculares" onClick={toggleMenu}>
            Auriculares
          </Link>
        </li>
        <li>
          <Link to="categoria/accesorios" onClick={toggleMenu}>
            Accesorios 
          </Link>
        </li>
        <li>
          <Link to="/envios" onClick={toggleMenu}>
            Envios
          </Link>
        </li>
         <li>
          <Link to="/nosotros" onClick={toggleMenu}>
            Nosotros
          </Link>
        </li>
      </ul>
    </div>
  </div>
)}
    </>
  );
};