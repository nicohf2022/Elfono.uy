import { useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import products from "../data/products.json";
import "./ProductPage.css";
import { useCart } from "../components/CartContext";
import { useStock } from "../components/StockContext";

export const ProductPage = ({ onOpenCart }) => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  const { addToCart } = useCart();
  const {
    loading: loadingAllStock,
    getProductStock,
    getVariantStock,
  } = useStock();

  const isSiliconCase = (product?.name || "")
    .toLowerCase()
    .includes("silicon case");

  const [selectedModel, setSelectedModel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product?.image);

  const images = useMemo(() => {
    if (!product) return [];
    return Array.from(
      new Set([product.image, ...(product.gallery || [])].filter(Boolean))
    );
  }, [product]);

  useEffect(() => {
    setMainImage(product?.image);
    setSelectedModel("");
    setQuantity(1);
  }, [product?.id]);

  if (!product) return <p>Producto no encontrado</p>;

  const productStock = getProductStock(product.id);

  const realModelVariants = useMemo(() => {
    const variants = Array.isArray(productStock?.variants)
      ? productStock.variants
      : [];

    return variants.filter(
      (v) => String(v.model || "").trim().toLowerCase() !== "unico"
    );
  }, [productStock]);

  const needsModel = realModelVariants.length > 0;

  const availableVariants = useMemo(() => {
    if (!needsModel) return [];
    return realModelVariants.filter((v) => Number(v.stock || 0) > 0);
  }, [needsModel, realModelVariants]);

  const selectedVariant = useMemo(() => {
    if (!needsModel || !selectedModel) return null;
    return getVariantStock(product.id, selectedModel);
  }, [needsModel, selectedModel, product.id, getVariantStock]);

  const currentStock = useMemo(() => {
    if (!product) return 0;

    if (needsModel) {
      if (!selectedModel) return 0;
      return Number(selectedVariant?.stock || 0);
    }

    const unico = getVariantStock(product.id, "Unico");
    return Number(unico?.stock || 0);
  }, [product, needsModel, selectedModel, selectedVariant, getVariantStock]);

  const displayPrice = useMemo(() => {
    const base = product?.price ?? 0;

    if (!isSiliconCase) return base;
    if (!selectedVariant) return base;

    return selectedVariant.price ?? base;
  }, [product, isSiliconCase, selectedVariant]);

  useEffect(() => {
    setQuantity((q) => {
      if (currentStock <= 0) return 1;
      return Math.min(q, currentStock);
    });
  }, [currentStock]);

  const addToCartHandler = () => {
    if (needsModel && !selectedModel) {
      alert("Seleccioná un modelo.");
      return;
    }

    if (loadingAllStock) {
      alert("Cargando stock... probá en un segundo.");
      return;
    }

    if (currentStock <= 0) {
      alert("Sin stock disponible.");
      return;
    }

    if (quantity > currentStock) {
      setQuantity(Math.min(quantity, currentStock));
      alert("La cantidad supera el stock disponible.");
      return;
    }

    addToCart(product, {
      model: needsModel ? selectedModel : null,
      quantity,
      unitPrice: displayPrice,
    });

    if (onOpenCart) onOpenCart();
  };

  const canShowQty =
    !loadingAllStock &&
    currentStock > 0 &&
    (!needsModel || !!selectedModel);

  return (
    <div className="product-layout">
      <div className="gallery-column">
        {images.map((img, i) => (
          <img
            key={`${img}-${i}`}
            src={img}
            alt="preview"
            className={`thumb ${mainImage === img ? "active" : ""}`}
            onClick={() => setMainImage(img)}
            width="80"
            height="80"
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>

      <div className="main-image-container">
        <img
          src={mainImage}
          alt={product.name}
          className="main-image"
          width="600"
          height="600"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="info-panel">
        <h2 className="title">{product.name.toUpperCase()}</h2>
        <p className="price">${displayPrice}</p>

        {needsModel && (
          <div className="field">
            <label>Modelo</label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setQuantity(1);
              }}
              disabled={loadingAllStock || availableVariants.length === 0}
            >
              <option value="">
                {loadingAllStock
                  ? "Cargando modelos..."
                  : availableVariants.length === 0
                  ? "Sin modelos con stock"
                  : "Seleccionar modelo disponible"}
              </option>

              {availableVariants.map((v) => (
                <option key={v.model} value={v.model}>
                  {v.model}
                </option>
              ))}
            </select>

            {isSiliconCase && selectedModel && selectedVariant?.price != null && (
              <p style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                Precio para {selectedModel}: ${displayPrice}
              </p>
            )}
          </div>
        )}

        {(!needsModel || selectedModel) && (
          <p style={{ marginTop: "8px", opacity: 0.8 }}>
            {loadingAllStock
              ? "Cargando stock..."
              : currentStock <= 0
              ? "Sin stock"
              : null}
          </p>
        )}

        {canShowQty && (
          <div className="field">
            <label>Cantidad</label>
            <div className="qty-wrapper">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                disabled={quantity >= currentStock}
              >
                +
              </button>
            </div>
          </div>
        )}

        <button
          className="add-btn"
          disabled={
            loadingAllStock ||
            currentStock <= 0 ||
            (needsModel && !selectedModel) ||
            quantity > currentStock
          }
          onClick={addToCartHandler}
        >
          {loadingAllStock ? "Cargando..." : "Agregar al carrito"}
        </button>

        {product.description && (
          <p className="description">{product.description}</p>
        )}

        <p className="image-note">
          Las imágenes son ilustrativas. El modelo de iPhone mostrado puede no
          corresponder al modelo seleccionado.
        </p>

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