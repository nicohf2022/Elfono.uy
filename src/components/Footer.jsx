import { Link } from "react-router-dom";
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">

        {/* Marca + links */}
        <div className="footer-left">
          <img
            src="/assets/logo.webp"
            alt="ElFono.uy"
            className="footer-logo-img"
          />

          <nav className="footer-links">
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/envios">Envíos</Link>
          </nav>
        </div>

        {/* Info */}
        <div className="footer-right">
          <div className="footer-block">
            <h5>Envíos / Retiros</h5>
            <p>Envíos a todo Uruguay</p>
            <p>Retiros en Maldonado y Punta del Este</p>
            <p>Retiros en Montevideo</p>
          </div>

          <div className="footer-block">
            <h5>Seguinos</h5>
            <p>Instagram</p>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2025 ELFono.UY
      </div>
    </footer>
  );
};