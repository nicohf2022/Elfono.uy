import "./Envios.css";
import { Link } from "react-router-dom";

export const Envios = () => {
  return (
    <div className="page envios-page">
      <div className="page-container envios-container">

        <h1 className="page-title">Envíos</h1>

        <section className="envios-section">
          <h2 className="envios-section-title">📍 Maldonado / Punta del Este</h2>
          <p className="envios-text">
            Realizamos entregas en <strong>Maldonado</strong>,{" "}
            <strong>Punta del Este</strong> y zonas cercanas.
          </p>
          <ul className="envios-list">
            <li>Envío <strong>gratis</strong> en compras mayores a <strong>$600</strong>.</li>
            <li>Retiro en punto de encuentro coordinando por Instagram.</li>
          </ul>
        </section>

        <section className="envios-section">
          <h2 className="envios-section-title">🚚 Envíos a todo el país</h2>
          <p className="envios-text">
            Enviamos a todo Uruguay por <strong>agencia a conveniencia</strong>
            (DAC, Mirtrans, UES, Correo, etc.).
          </p>
          <ul className="envios-list">
            <li>Demora estimada: <strong>24 a 48 horas</strong>.</li>
            <li>El envío se cobra al destinatario.</li>
            <li>En compras mayores a <strong>$1400</strong>, el envío es gratis.</li>
          </ul>
        </section>

        <section className="envios-section">
          <h2 className="envios-section-title">💳 Medios de pago</h2>
          <ul className="envios-list">
            <li>Transferencia bancaria</li>
            <li>Mercado Pago</li>
            <li>Giro</li>
            <li>Depósito</li>
          </ul>
        </section>

        <section className="envios-section">
          <h2 className="envios-section-title">📦 Proceso de preparación</h2>
          <ul className="envios-list">
            <li>Pedido preparado con <strong>protección extra</strong>.</li>
            <li>Foto del producto antes de despacharlo (opcional).</li>
            <li>Número de seguimiento una vez enviado.</li>
          </ul>
        </section>

        {/* CTA SUAVE */}
        <div className="page-cta">
          <p className="page-cta-text">
            ¿Querés ver nuestros productos disponibles?
          </p>
          <Link to="/" className="page-cta-button">
            Ver productos
          </Link>
        </div>

      </div>
    </div>
  );
};