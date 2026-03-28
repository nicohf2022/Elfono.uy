import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STOCK_API_URL } from "../config/stockApi";

const StockContext = createContext(null);

const CACHE_KEY = "stock_cache_all_v1";
const CACHE_TTL_MS = 1000 * 60 * 8; // 3 minutos

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (!parsed?.timestamp || !parsed?.stock || typeof parsed.stock !== "object") {
      return null;
    }

    const expired = Date.now() - parsed.timestamp > CACHE_TTL_MS;
    if (expired) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error leyendo cache de stock", error);
    return null;
  }
};

const writeCache = (stock) => {
  try {
    const payload = {
      timestamp: Date.now(),
      stock,
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error("Error guardando cache de stock", error);
    return null;
  }
};

export const StockProvider = ({ children }) => {
  const initialCache = readCache();

  const [stockCache, setStockCache] = useState(initialCache?.stock || {});
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(initialCache?.timestamp || null);

  const fetchAllStock = async ({ force = false } = {}) => {
    const cached = readCache();

    if (!force && cached) {
      setStockCache(cached.stock);
      setLastUpdated(cached.timestamp);
      setLoading(false);
      return cached.stock;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${STOCK_API_URL}?action=all_stock`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.ok && data.stock && typeof data.stock === "object") {
        setStockCache(data.stock);

        const saved = writeCache(data.stock);
        setLastUpdated(saved?.timestamp || Date.now());

        return data.stock;
      }

      setStockCache({});
      const saved = writeCache({});
      setLastUpdated(saved?.timestamp || Date.now());

      return {};
    } catch (err) {
      console.error("Error cargando todo el stock", err);
      setError(err);
      return stockCache;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStock();
  }, []);

  const refreshAllStock = async () => {
    return fetchAllStock({ force: true });
  };

  const getProductStock = (productId) => {
    return stockCache[String(productId)] || null;
  };

  const getVariantStock = (productId, model = "Unico") => {
    const productStock = stockCache[String(productId)];
    if (!productStock) return null;

    const variants = Array.isArray(productStock.variants)
      ? productStock.variants
      : [];

    return (
      variants.find(
        (variant) => String(variant.model || "").trim() === String(model).trim()
      ) || null
    );
  };

  const hasStock = (productId, model = null) => {
    const productStock = getProductStock(productId);
    if (!productStock) return false;

    const variants = Array.isArray(productStock.variants)
      ? productStock.variants
      : [];

    if (model) {
      const variant = getVariantStock(productId, model);
      return Number(variant?.stock || 0) > 0;
    }

    return variants.some((variant) => Number(variant.stock || 0) > 0);
  };

  const value = useMemo(
    () => ({
      stockCache,
      loading,
      error,
      lastUpdated,
      fetchAllStock,
      refreshAllStock,
      getProductStock,
      getVariantStock,
      hasStock,
    }),
    [stockCache, loading, error, lastUpdated]
  );

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);

  if (!context) {
    throw new Error("useStock debe usarse dentro de StockProvider");
  }

  return context;
};