import { useParams, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import products from "../data/products.json";
import { ProductCard } from "../components/ProductCard";
import { useStock } from "../components/StockContext";
import { modelMatchesSearch } from "../components/searchUtils.jsx";
import "./CategoryPage.css";

const CATEGORY_CONFIG = {
  fundas: {
    title: "CASE",
    description: "Protegé tu iPhone con estilo y máxima protección",
  },
  cargadores: {
    title: "Cargadores",
    description: "Carga rápida y segura para todos tus dispositivos",
  },
  accesorios: {
    title: "Accesorios",
    description: "Todo lo que suma a tu experiencia diaria",
  },
  auriculares: {
    title: "Auriculares",
    description: "Sonido claro, cómodo y potente",
  },
};

const normalizeText = (text = "") =>
  String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedModel = searchParams.get("q") || "";

  const category = CATEGORY_CONFIG[slug];
  const [sortBy, setSortBy] = useState("name-asc");

  const { loading, getProductStock, stockCache } = useStock();

  const baseProducts = useMemo(() => {
    return products.filter((p) => p.category === slug);
  }, [slug]);

  const availableModels = useMemo(() => {
    if (slug !== "fundas") return [];

    const modelMap = new Map();

    baseProducts.forEach((product) => {
      const productStock = getProductStock(product.id);

      const stockVariants = Array.isArray(productStock?.variants)
        ? productStock.variants
        : [];

      stockVariants.forEach((variant) => {
        const model = String(variant.model || "").trim();
        const normalizedModel = normalizeText(model);
        const stock = Number(variant.stock || 0);

        if (!model || normalizedModel === "unico" || stock <= 0) return;

        if (!modelMap.has(normalizedModel)) {
          modelMap.set(normalizedModel, model);
        }
      });
    });

    return Array.from(modelMap.values()).sort((a, b) => a.localeCompare(b));
  }, [slug, baseProducts, getProductStock, stockCache]);

  const filteredProducts = useMemo(() => {
    if (!selectedModel) {
      return baseProducts;
    }

    return baseProducts.filter((product) => {
      const productStock = getProductStock(product.id);

      const stockVariants = Array.isArray(productStock?.variants)
        ? productStock.variants
        : [];

      const variantsWithStock = stockVariants.filter(
        (variant) => Number(variant.stock || 0) > 0
      );

      if (variantsWithStock.length === 0) return false;

      const modelVariantsWithStock = variantsWithStock.filter(
        (variant) => normalizeText(variant.model || "") !== "unico"
      );

      return modelVariantsWithStock.some((variant) =>
        modelMatchesSearch(variant.model || "", selectedModel)
      );
    });
  }, [baseProducts, selectedModel, getProductStock, stockCache]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleModelChange = (e) => {
    const value = e.target.value;

    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set("q", value);
    } else {
      newParams.delete("q");
    }

    setSearchParams(newParams);
  };

  if (!category) {
    return (
      <section className="category-page">
        <h2>Categoría no encontrada</h2>
        <p>La categoría que buscás no existe.</p>
      </section>
    );
  }

  return (
    <section className="category-page">
      <div className="category-header">
        <h1 className="category-title">
          {category.title}
          {selectedModel ? ` - ${selectedModel}` : ""}
        </h1>

        <p className="category-description">{category.description}</p>

        <p className="category-count">
          {loading
            ? "Cargando productos..."
            : `${filteredProducts.length} productos`}
        </p>
      </div>

      <div className="category-controls">
        {slug === "fundas" && (
          <label>
            Filtrar por modelo:
            <select value={selectedModel} onChange={handleModelChange}>
              <option value="">Todos los modelos</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </label>
        )}

      
      </div>

      <div className="products-grid">
        {loading ? (
          <p>Cargando stock...</p>
        ) : sortedProducts.length === 0 ? (
          <p>
            {selectedModel
              ? `No hay productos con stock para ${selectedModel}.`
              : "No hay productos en esta categoría."}
          </p>
        ) : (
          sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedModel={selectedModel}
            />
          ))
        )}
      </div>
    </section>
  );
};