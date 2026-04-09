import { Link } from "react-router-dom";
import { useState } from "react";
import { FaShoppingBag, FaBars } from "react-icons/fa";
import { TopBanner } from "./TopBanner";
import { useCart } from "./CartContext";
import "./NavBar.css";

export const Navbar = ({ onOpenCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const anuncios = [
    "¡ENVÍOS GRATIS EN COMPRAS > $1500!",
    "2 x $500 EN SILICON",
    "RETIROS EN PUNTA DEL ESTE SIN COSTOS",
  ];

  const modelosIphone = [
    "IPhone 11",
    "IPhone 11 pro",
    "IPhone 11 pro Max",
    "IPhone 12",
    "IPhone 12 mini",
    "IPhone 12/ 12 pro",
    "IPhone 12 pro Max",
    "IPhone 13",
    "IPhone 13 mini",
    "IPhone 13 pro",
    "IPhone 13 pro Max",
    "IPhone 14",
    "IPhone 14 pro",
    "IPhone 14 Plus",
    "IPhone 14 pro Max",
    "IPhone 15",
    "IPhone 15 Plus",
    "IPhone 15 pro",
    "IPhone 15  pro Max",
    "IPhone 16 Plus",
    "IPhone 16",
    "IPhone 16e",
    "IPhone 16 pro",
    "IPhone 16 pro Max",
    "IPhone 17 Air",
    "IPhone 17 pro",
    "IPhone 17",
    "IPhone 17 pro Max",
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <TopBanner messages={anuncios} intervalMs={5000} />

      <nav className="navbar">
        <div className="navbar-left" onClick={toggleMenu}>
          <FaBars className="icon" />
          <span className="menu-text">Shop</span>
        </div>

        <div className="navbar-center">
          <Link to="/">
            <img
              src="/assets/logo.webp"
              alt="ElFono.uy - Phone Spot"
              className="logo-img"
            />
          </Link>
        </div>

        <div className="navbar-right">
          <div className="icon-wrapper" onClick={onOpenCart}>
            <FaShoppingBag className="icon" />
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </div>
        </div>
      </nav>

      {isOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Categorías</h3>

            <div className="menu-scroll-area">
              <ul className="menu-list">
                <li className="has-submenu">
                  <Link to="/categoria/fundas" onClick={closeMenu}>
                    Cases
                  </Link>

                  <div className="side-submenu">
                    <ul>
                      {modelosIphone.map((modelo) => (
                        <li key={modelo}>
                          <Link
                            to={`/categoria/fundas?q=${encodeURIComponent(modelo)}`}
                            onClick={closeMenu}
                          >
                            {modelo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>

                <li>
                  <Link to="/categoria/cargadores" onClick={closeMenu}>
                    Cargadores
                  </Link>
                </li>

                <li>
                  <Link to="/categoria/auriculares" onClick={closeMenu}>
                    Auriculares
                  </Link>
                </li>

                <li>
                  <Link to="/categoria/accesorios" onClick={closeMenu}>
                    Accesorios
                  </Link>
                </li>

                <li>
                  <Link to="/envios" onClick={closeMenu}>
                    Envíos
                  </Link>
                </li>

                <li>
                  <Link to="/nosotros" onClick={closeMenu}>
                    Nosotros
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};