import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import products from "../data/products.json";
import {
  matchesGeneralSearch,
  getRemainingModelQuery,
  getGeneralQuery,
  modelMatchesSearch,
  hasGeneralProductWordsInQuery,
} from "../components/searchUtils.jsx";
import { useStock } from "../components/StockContext";
import "./HomeSearch.css";

export const HomeSearch = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { loading, getProductStock, stockCache } = useStock();

  const suggestions = useMemo(() => {
    const cleanValue = search.trim();
    if (cleanValue.length < 2) return [];

    return products
      .filter((product) => {
        const productStock = getProductStock(product.id);
        const stockVariants = Array.isArray(productStock?.variants)
          ? productStock.variants
          : [];

        const variantsWithStock = stockVariants.filter(
          (variant) => Number(variant.stock || 0) > 0
        );

        if (variantsWithStock.length === 0) return false;

        const modelVariantsWithStock = variantsWithStock.filter(
          (variant) =>
            String(variant.model || "").trim().toLowerCase() !== "unico"
        );

        const remainingModelQuery = getRemainingModelQuery(product, cleanValue);
        const generalQuery = getGeneralQuery(product, cleanValue);
        const matchesProductFields = matchesGeneralSearch(product, generalQuery);
        const hasGeneralWords = hasGeneralProductWordsInQuery(product, cleanValue);

        if (remainingModelQuery) {
          const matchesVariant = modelVariantsWithStock.some((variant) =>
            modelMatchesSearch(variant.model || "", remainingModelQuery)
          );

          if (hasGeneralWords) {
            return matchesProductFields && matchesVariant;
          }

          return matchesVariant;
        }

        return matchesProductFields;
      })
      .slice(0, 5);
  }, [search, stockCache]);

  const goToSearch = (value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;

    navigate(`/buscar?q=${encodeURIComponent(cleanValue)}`);
    setSearch("");
  };

  return (
    <div className="home-search">
      <input
        type="text"
        placeholder="Buscar fundas, cargadores, iPhone 14..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && search.trim()) {
            goToSearch(search);
          }
        }}
      />

      {!loading && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((product) => {
            const productStock = getProductStock(product.id);
            const stockVariants = Array.isArray(productStock?.variants)
              ? productStock.variants
              : [];

            const variantsWithStock = stockVariants.filter(
              (variant) => Number(variant.stock || 0) > 0
            );

            const modelVariantsWithStock = variantsWithStock.filter(
              (variant) =>
                String(variant.model || "").trim().toLowerCase() !== "unico"
            );

            const remainingModelQuery = getRemainingModelQuery(product, search);

            const matchedVariant = modelVariantsWithStock.find((variant) =>
              remainingModelQuery
                ? modelMatchesSearch(variant.model || "", remainingModelQuery)
                : true
            );

            const firstAvailableVariant =
              modelVariantsWithStock[0] || variantsWithStock[0];

            return (
              <div
                key={product.id}
                className="suggestion-item"
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                <img src={product.image} alt={product.name} />
                <div>
                  <span>{product.name}</span>

                  {matchedVariant ? (
                    <small>Disponible para: {matchedVariant.model}</small>
                  ) : firstAvailableVariant ? (
                    <small>Disponible para: {firstAvailableVariant.model}</small>
                  ) : (
                    <small>${product.price}</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};