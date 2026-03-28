import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const STORAGE_KEY = "elfone_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Cargar desde localStorage al inicio
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error("Error cargando carrito desde localStorage", e);
    }
  }, []);

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Error guardando carrito en localStorage", e);
    }
  }, [items]);

  /**
   * addToCart(product, { model, quantity, unitPrice })
   * - unitPrice: precio final (ej: silicon iPhone 17 = 319)
   * - Si no viene unitPrice, cae a product.price (compatibilidad)
   */
  const addToCart = (product, { model, quantity = 1, unitPrice } = {}) => {
    const finalUnitPrice =
      unitPrice != null && Number.isFinite(Number(unitPrice))
        ? Number(unitPrice)
        : Number(product?.price || 0);

    setItems((prev) => {
      // ✅ IMPORTANTE: el precio también forma parte de la identidad
      // porque Silicon Case puede tener distinto precio por modelo.
      const key = `${product.id}-${model || "no-model"}-${finalUnitPrice}`;

      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          image: product.image,
          model: model || null,
          quantity,

          // ✅ Guardamos unitPrice (precio congelado)
          unitPrice: finalUnitPrice,

          // (Opcional) dejo price por compatibilidad con tu UI vieja si en algún lado lo usás
          // pero idealmente en la UI uses item.unitPrice.
          price: finalUnitPrice,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  // Ahora solo validamos que la cantidad sea >= 1.
  // El límite real de stock lo vamos a aplicar al abrir el carrito (con la API) en el próximo paso.
  const updateQuantity = (key, newQty) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const qty = Number(newQty);
        if (!Number.isFinite(qty) || qty < 1) return { ...item, quantity: 1 };

        return { ...item, quantity: qty };
      })
    );
  };

  const clearCart = () => setItems([]);

  // ✅ Totales (unitPrice primero, si no existe cae a price)
  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + (item.quantity || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((acc, item) => {
        const priceToUse =
          item.unitPrice != null ? Number(item.unitPrice) : Number(item.price || 0);
        return acc + (item.quantity || 0) * priceToUse;
      }, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);