import "./Nosotros.css";
import siliconImg from "/assets/siliconIMG.webp" // ajustá la ruta

export const Nosotros = () => {
  return (
    <div className="page">
      <div className="page-container page-grid">

        {/* TEXTO */}
        <div className="page-content">
          <h1 className="page-title">Nosotros</h1>

          <p className="page-text">
            En <strong>ELFono.UY</strong> nos especializamos en accesorios para iPhone.
            Trabajamos con productos seleccionados que ofrecen calidad, diseño y compatibilidad real.
          </p>

          <p className="page-text">
            Empezamos como un pequeño emprendimiento atendiendo pedidos por Instagram
            y hoy seguimos creciendo gracias a la confianza de nuestros clientes.
            Nuestra misión es brindarte productos modernos, funcionales y duraderos,
            acompañados por una atención rápida y cercana.
          </p>

          <p className="page-text">
            Cada pedido es preparado con cuidado y verificado antes de ser entregado
            o despachado. Queremos que tu experiencia de compra sea simple, segura
            y totalmente transparente.
          </p>

          {/* CTA */}
          <div className="page-cta">
            <p className="page-cta-text">¿Querés ver nuestros productos?</p>
            <a href="/" className="page-cta-button">Ver productos</a>
          </div>
        </div>

        {/* IMAGEN */}
        <div className="page-image">
          <img src={siliconImg} alt="Cases de silicona ELFono.UY" />
        </div>

      </div>
    </div>
  );
};