import { useState, useMemo, useEffect } from "react";
import { useCart } from "./CartContext";
import "./CartDrawer.css";
import { STOCK_API_URL } from "../config/stockApi";

const SHIPPING_OPTIONS = [
  { id: "retiro", label: "Retiro en Punta del Este (sin costo)", cost: 0 },
  { id: "maldonado", label: "Envío en Maldonado", cost: 150 },
  { id: "agencia", label: "Envío por agencia (todo el país)", cost: 250 },
];

const buildInstagramMessage = (items, shipping, total, totalWithShipping) => {
  let lines = [];
  lines.push("Hola! Quiero hacer este pedido desde la web:");
  lines.push("");

  items.forEach((item) => {
    const line = `- ${item.name}${item.model ? " (" + item.model + ")" : ""} x${
      item.quantity
    } = $${item.price * item.quantity}`;
    lines.push(line);
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

export const CartDrawer = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } =
    useCart();

  const [shippingId, setShippingId] = useState("retiro");

  // Stock “vivo” por item.key
  const [stockByKey, setStockByKey] = useState({});
  const [loadingStocks, setLoadingStocks] = useState(false);

  const shipping = useMemo(
    () =>
      SHIPPING_OPTIONS.find((opt) => opt.id === shippingId) ||
      SHIPPING_OPTIONS[0],
    [shippingId]
  );

  const totalWithShipping = totalAmount + (shipping?.cost || 0);

  const fetchStock = async ({ productId, model, color = "Unico" }) => {
    const url =
      `${STOCK_API_URL}?action=stock&product_id=${productId}` +
      `&model=${encodeURIComponent(model)}` +
      `&color=${encodeURIComponent(color)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) return 0;
    return Number(data.stock || 0);
  };

  // ✅ Al abrir el carrito, refrescamos stock real desde Sheets
  useEffect(() => {
    const run = async () => {
      if (!isOpen) return;
      if (!items.length) {
        setStockByKey({});
        return;
      }

      setLoadingStocks(true);
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            // Si no hay modelo, no podemos consultar variante (en tu caso casi siempre hay)
            if (!item.model) return { key: item.key, stock: null };

            const stock = await fetchStock({
              productId: item.id,
              model: item.model,
              color: "Unico",
            });

            return { key: item.key, stock };
          })
        );

        const map = {};
        results.forEach((r) => {
          map[r.key] = r.stock; // null => desconocido (sin modelo)
        });

        setStockByKey(map);

        // Si alguien tenía qty > stock real, recortamos la cantidad
        results.forEach((r) => {
          if (typeof r.stock === "number") {
            const item = items.find((it) => it.key === r.key);
            if (item && item.quantity > r.stock) {
              const newQty = Math.max(1, r.stock);
              // Si stock = 0, bajamos a 1 igual pero marcamos sin stock (y bloqueamos el pedido)
              updateQuantity(r.key, newQty);
            }
          }
        });
      } catch (e) {
        console.error("Error refrescando stocks del carrito", e);
      } finally {
        setLoadingStocks(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    if (items.length === 0) return;

    // Bloqueo duro si hay problemas de stock
    if (loadingStocks) {
      alert("Cargando stock... probá en un segundo.");
      return;
    }
    if (hasStockProblems) {
      alert(
        "Hay productos sin stock o con cantidad mayor al stock disponible. Ajustá el carrito antes de copiar el pedido."
      );
      return;
    }

    const message = buildInstagramMessage(
      items,
      shipping,
      totalAmount,
      totalWithShipping
    );

    try {
      await navigator.clipboard.writeText(message);
      alert("Tu pedido fue copiado. Pegalo en el chat de Instagram.");
    } catch (e) {
      console.error("No se pudo copiar al portapapeles", e);
    }

    window.open("https://instagram.com/elfone.uy", "_blank");
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
          El resumen de tu pedido se va a convertir en un texto listo para pegar
          y enviar por Instagram. Podés revisar los productos, elegir el método
          de envío y después copiar el mensaje.
        </p>

        {loadingStocks && items.length > 0 && (
          <p style={{ opacity: 0.8, marginTop: 8 }}>Actualizando stock...</p>
        )}

        {hasStockProblems && items.length > 0 && (
          <p style={{ marginTop: 8, color: "crimson" }}>
            Atención: hay productos sin stock o con cantidad inválida. Ajustá el
            carrito antes de copiar el pedido.
          </p>
        )}

        {items.length === 0 ? (
          <p className="cart-empty">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="cart-items">
              {items.map((item) => {
                const stock = stockByKey[item.key]; // number | null | undefined
                const outOfStock = typeof stock === "number" && stock <= 0;
                const maxed = typeof stock === "number" && item.quantity >= stock;

                return (
                  <li key={item.key} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-main">
                        <span className="cart-item-name">{item.name}</span>
                        {item.model && (
                          <span className="cart-item-model">{item.model}</span>
                        )}
                      </div>

                      {/* Stock info */}
                      
                    

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
                            className={outOfStock || maxed ? "disabled-btn" : ""}
                          >
                            +
                          </button>
                        </div>

                        <span className="cart-item-subtotal">
                          ${item.quantity * item.price}
                        </span>
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
              <label>Método de envío:</label>
              <select
                value={shippingId}
                onChange={(e) => setShippingId(e.target.value)}
              >
                {SHIPPING_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} {opt.cost > 0 ? `(+ $${opt.cost})` : "(sin costo)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="cart-summary">
              <div className="line">
                <span>Subtotal</span>
                <span>${totalAmount}</span>
              </div>
              <div className="line">
                <span>Envío</span>
                <span>{shipping.cost > 0 ? `$${shipping.cost}` : "Sin costo"}</span>
              </div>
              <div className="line total">
                <span>Total</span>
                <span>${totalWithShipping}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button className="btn-secondary" onClick={clearCart}>
                Vaciar carrito
              </button>

              <button
                className="btn-primary"
                onClick={handleCopyAndOpenInstagram}
                disabled={loadingStocks || hasStockProblems}
              >
                Copiar texto y abrir Instagram
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};