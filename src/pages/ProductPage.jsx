import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import products from "../data/products.json";
import "./ProductPage.css";
import { useCart } from "../components/CartContext";
import { STOCK_API_URL } from "../config/stockApi";

export const ProductPage = ({ onOpenCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));

  const { addToCart } = useCart();

  const [selectedModel, setSelectedModel] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product?.image);
  const [loadingStock, setLoadingStock] = useState(false);

  // ✅ Galería sin duplicados
  const images = useMemo(() => {
    if (!product) return [];
    return Array.from(
      new Set([product.image, ...(product.gallery || [])].filter(Boolean))
    );
  }, [product]);

  // Si el producto cambia (por ruta), actualizar imagen principal
  useEffect(() => {
    setMainImage(product?.image);
    setSelectedModel("");
    setCurrentStock(0);
    setQuantity(1);
  }, [product?.id]);

  // Helper: pedir stock a la API
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

  // Stock vivo desde Sheets (solo cuando hay modelo elegido)
  useEffect(() => {
    const run = async () => {
      if (!product) return;

      // Productos sin variantes (si existieran)
      if (!product.variants) {
        setCurrentStock(product.stock ?? 0);
        return;
      }

      // Con variantes: si no hay modelo, no consultamos
      if (!selectedModel) {
        setCurrentStock(0);
        return;
      }

      setLoadingStock(true);
      try {
        const stock = await fetchStock({
          productId: product.id,
          model: selectedModel,
          color: "Unico",
        });

        setCurrentStock(stock);
        setQuantity(1);
      } catch (err) {
        console.error("Error consultando stock", err);
        setCurrentStock(0);
      } finally {
        setLoadingStock(false);
      }
    };

    run();
  }, [product, selectedModel]);

  if (!product) return <p>Producto no encontrado</p>;

  const addToCartHandler = () => {
    if (product.variants && !selectedModel) {
      alert("Seleccioná un modelo.");
      return;
    }
    if (loadingStock) {
      alert("Cargando stock... probá en un segundo.");
      return;
    }
    if (currentStock === 0) {
      alert("Sin stock disponible.");
      return;
    }

    addToCart(product, {
      model: selectedModel || null,
      quantity,
      // Si más adelante agregás colores, acá también se manda color
      // color: selectedColor || "Unico",
    });

    if (onOpenCart) onOpenCart();
  };

  return (
    <div className="product-layout">
      {/* Galería izquierda */}
      <div className="gallery-column">
        {images.map((img, i) => (
          <img
            key={`${img}-${i}`}
            src={img}
            alt="preview"
            className={`thumb ${mainImage === img ? "active" : ""}`}
            onClick={() => setMainImage(img)}
          />
        ))}
      </div>

      {/* Imagen principal */}
      <div className="main-image-container">
        <img src={mainImage} alt={product.name} className="main-image" />
      </div>

      {/* Panel derecho */}
      <div className="info-panel">
        <h2 className="title">{product.name.toUpperCase()}</h2>
        <p className="price">${product.price}</p>

        {/* Modelo */}
        {product.variants && (
          <div className="field">
            <label>Modelo</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="">Seleccionar modelo</option>
              {product.variants.map((v) => (
                <option key={v.model} value={v.model}>
                  {v.model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stock (opcional pero útil para debug) */}
        {product.variants && selectedModel && (
          <p style={{ marginTop: "8px", opacity: 0.8 }}>
            {loadingStock
              ? "Cargando stock..."
              : currentStock > 0
              ? `Stock disponible: ${currentStock}`
              : "Sin stock"}
          </p>
        )}

        {/* Cantidad */}
        {currentStock > 0 && !loadingStock && (
          <div className="field">
            <label>Cantidad</label>
            <div className="qty-wrapper">
              <button
                onClick={() => setQuantity((q) => q - 1)}
                disabled={quantity <= 1}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((q) => q + 1)}
                disabled={quantity >= currentStock}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Botón agregar */}
        <button
          className="add-btn"
          disabled={loadingStock || currentStock === 0}
          onClick={addToCartHandler}
        >
          {loadingStock ? "Cargando..." : "Agregar al carrito"}
        </button>

        {/* Descripción */}
        {product.description && (
          <p className="description">{product.description}</p>
        )}

        {/* Acordeones */}
        <details className="accordion">
          <summary>Envíos</summary>
          <p>Envíos a todo el país. Maldonado GRATIS desde $600...</p>
        </details>

        <details className="accordion">
          <summary>Medios de pago</summary>
          <p>Transferencia, depósito, Mercado Pago, giro...</p>
        </details>
      </div>
    </div>
  );
};