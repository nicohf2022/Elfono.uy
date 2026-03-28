import { ProductCard } from "../components/ProductCard";
import { CategoryCard } from "../components/CategoryCard.jsx";
import { HomeSearch } from "../components/HomeSearch";
import products from "../data/products.json";
import { useNavigate } from "react-router-dom";
import "./Catalog.css";

export const Catalog = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Cases", image: "/assets/Cases.webp", route: "/categoria/fundas" },
    { name: "Cargadores", image: "/assets/Cargadores.webp", route: "/categoria/cargadores" },
    { name: "Accesorios", image: "/assets/Accesorios.webp", route: "/categoria/accesorios" },
    { name: "Auriculares", image: "/assets/Auriculares.webp", route: "/categoria/auriculares" },
  ];

  const offers = products.filter((p) => p.isOffer);

  return (
    <div className="catalog">
      {/* 🔍 BUSCADOR */}
      <HomeSearch />

      {/* ⭐ CATEGORÍAS */}
      <h1>Categorías de productos</h1>

      <div className="grid categories-grid">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.name}
            category={cat.name}
            image={cat.image}
            onClick={() => navigate(cat.route)}
          />
        ))}
      </div>

      {/* ⭐ PROMOS 
      <h1 style={{ marginTop: "3rem" }}>Promociones irresistibles</h1>

      <div className="grid offers-grid">
        {offers.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      */}
    </div>

  );
};