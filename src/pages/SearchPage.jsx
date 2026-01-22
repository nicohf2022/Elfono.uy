import { useSearchParams } from "react-router-dom";
import products from "../data/products.json";
import { ProductCard } from "../components/ProductCard";
import { matchesSearch } from "../utils/searchUtils";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = products.filter((product) =>
    matchesSearch(product, query)
  );

  return (
    <section className="category-page">
      <h2>Resultados para “{query}”</h2>

      {results.length === 0 ? (
        <p>No se encontraron productos.</p>
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