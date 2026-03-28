import { useState, useMemo } from "react";
import { useCart } from "./CartContext";
import { useStock } from "./StockContext";
import "./CartDrawer.css";

const INSTAGRAM_OFFICIAL_URL =
  "https://www.instagram.com/elfono.uy?igsh=MTE3NWt1Mm5jNmttMg%3D%3D&utm_source=qr";

/* =========================
   ENVÍOS
========================= */
const SHIPPING_OPTIONS = [
  { id: "retiro", label: "Retiro en Punta del Este y Montevideo (sin costo)", cost: 0 },
  { id: "maldonado", label: "Envío en Maldonado y Montevideo ($180)" , cost: 180 },
  { id: "agencia", label: "Envío por agencia (Costo de envio)"},
];

/* =========================
   HELPERS
========================= */
const getItemUnitPrice = (item) => {
  const p =
    item?.unitPrice != null ? Number(item.unitPrice) : Number(item?.price || 0);
  return Number.isFinite(p) ? p : 0;
};

/* =========================
   MENSAJE INSTAGRAM
========================= */
const buildInstagramMessage = (items, shipping, total, totalWithShipping) => {
  const lines = [];
  lines.push("Hola! Quiero hacer este pedido desde la web:");
  lines.push("");

  items.forEach((item) => {
    const unitPrice = getItemUnitPrice(item);
    const lineTotal = unitPrice * (item.quantity || 0);

    lines.push(
      `- ${item.name}${item.model ? " (" + item.model + ")" : ""} x${
        item.quantity
      } = $${lineTotal}`
    );
  });

  lines.push("");
  lines.push(`Subtotal: $${total}`);
  lines.push(
    `Envío: ${
      shipping.cost === 0
        ? "sin costo (" + shipping.label + ")"
        : "$" + shipping.cost
    }`
  );
  lines.push(`Total: $${totalWithShipping}`);
  lines.push("");
  lines.push("Método de envío elegido: " + shipping.label);

  return lines.join("\n");
};

/* =========================
   COPIADO ROBUSTO
========================= */
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) {}

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";

    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
};

/* =========================
   COMPONENTE
========================= */
export const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } =
    useCart();

  const { loading: loadingAllStock, getVariantStock } = useStock();

  const [shippingId, setShippingId] = useState("retiro");

  const shipping = useMemo(
    () =>
      SHIPPING_OPTIONS.find((opt) => opt.id === shippingId) ||
      SHIPPING_OPTIONS[0],
    [shippingId]
  );

  const totalWithShipping = totalAmount + (shipping?.cost || 0);

  const stockByKey = useMemo(() => {
    const map = {};

    items.forEach((item) => {
      const model = item.model || "Unico";
      const variant = getVariantStock(item.id, model);

      map[item.key] =
        variant != null ? Number(variant.stock || 0) : null;
    });

    return map;
  }, [items, getVariantStock]);

  const hasOutOfStock = items.some((item) => {
    const s = stockByKey[item.key];
    return typeof s === "number" && s <= 0;
  });

  const hasQtyOverStock = items.some((item) => {
    const s = stockByKey[item.key];
    return typeof s === "number" && item.quantity > s;
  });

  const hasStockProblems = hasOutOfStock || hasQtyOverStock;

  const handleCopyAndOpenInstagram = async () => {
    if (!items.length) return;

    if (loadingAllStock) {
      alert("Cargando stock... probá en un segundo.");
      return;
    }

    if (hasStockProblems) {
      alert(
        "Hay productos sin stock o con cantidad inválida. Ajustá el carrito antes de copiar el pedido."
      );
      return;
    }

    const message = buildInstagramMessage(
      items,
      shipping,
      totalAmount,
      totalWithShipping
    );

    const ok = await copyText(message);

    if (ok) {
      alert("✅ Pedido copiado. Pegalo en el chat de Instagram.");
      window.open("https://instagram.com", "_blank");
    } else {
      alert(
        "⚠️ No se pudo copiar automáticamente. Te abrimos Instagram igual."
      );
      window.open(INSTAGRAM_OFFICIAL_URL, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">Tu pedido</h2>
          <button className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="cart-description">
          El pedido se copia como texto para enviarlo por Instagram.
        </p>

        {loadingAllStock && <p>Cargando stock…</p>}
        {hasStockProblems && (
          <p style={{ color: "crimson" }}>
            Hay productos sin stock o con cantidad inválida.
          </p>
        )}

        {items.length === 0 ? (
          <p className="cart-empty">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => {
                const stock = stockByKey[item.key];
                const outOfStock = typeof stock === "number" && stock <= 0;
                const maxed = typeof stock === "number" && item.quantity >= stock;

                const unitPrice = getItemUnitPrice(item);
                const lineTotal = unitPrice * (item.quantity || 0);

                return (
                  <li key={item.key} className="cart-item">
                    <div className="cart-item-info">
                      <div>
                        <strong>{item.name}</strong>
                        {item.model && <div>{item.model}</div>}

                        <div style={{ opacity: 0.8, fontSize: 13 }}>
                          ${unitPrice} c/u
                        </div>

                        
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-qty-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            disabled={outOfStock || maxed}
                          >
                            +
                          </button>
                        </div>

                        <span>${lineTotal}</span>
                      </div>
                    </div>

                    <button
                      className="cart-delete"
                      onClick={() => removeFromCart(item.key)}
                    >
                      🗑
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="cart-shipping">
              <label>Método de envío</label>
              <select
                value={shippingId}
                onChange={(e) => setShippingId(e.target.value)}
              >
                {SHIPPING_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="cart-summary">
              <div>
                <span>Total</span>
                <strong>${totalWithShipping}</strong>
              </div>
            </div>

            <div className="cart-actions">
              <button className="btn-secondary" onClick={onClose}>
                Seguir comprando
              </button>

              <button className="btn-secondary" onClick={clearCart}>
                Vaciar carrito
              </button>

              <button
                className="btn-primary"
                onClick={handleCopyAndOpenInstagram}
                disabled={loadingAllStock || hasStockProblems}
              >
                Copiar pedido y abrir Instagram
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};