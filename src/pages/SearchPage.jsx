import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products.json";
import { ProductCard } from "../components/ProductCard";
import {
  matchesGeneralSearch,
  getRemainingModelQuery,
  getGeneralQuery,
  modelMatchesSearch,
  hasGeneralProductWordsInQuery,
} from "../components/searchUtils";
import { useStock } from "../components/StockContext";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { loading, getProductStock, stockCache } = useStock();

  const results = useMemo(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    return products.filter((product) => {
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

      const remainingModelQuery = getRemainingModelQuery(product, cleanQuery);
      const generalQuery = getGeneralQuery(product, cleanQuery);
      const matchesProductFields = matchesGeneralSearch(product, generalQuery);
      const hasGeneralWords = hasGeneralProductWordsInQuery(product, cleanQuery);

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
    });
  }, [query, stockCache]);

  return (
    <section className="category-page">
      <h2>Resultados para “{query}”</h2>

      {loading ? (
        <p>Cargando stock...</p>
      ) : results.length === 0 ? (
        <p>No se encontraron productos con stock para esa búsqueda.</p>
      ) : (
        <div className="products-grid">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};