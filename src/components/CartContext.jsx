import { createContext, useContext, useEffect, useState } from "react";

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

  const addToCart = (product, { model, quantity = 1 } = {}) => {
    setItems((prev) => {
      const key = `${product.id}-${model || "no-model"}`;
      const existing = prev.find((item) => item.key === key);

      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          model: model || null,
          quantity,
          // NO guardamos stock acá: el stock real viene de Google Sheets (API)
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

  const totalItems = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
    0
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