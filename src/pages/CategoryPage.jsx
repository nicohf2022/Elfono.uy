import { useParams } from "react-router-dom";
import { useState } from "react";
import products from "../data/products.json";
import { ProductCard } from "../components/ProductCard";
import "./CategoryPage.css";

const CATEGORY_CONFIG = {
    fundas: {
        title: "Fundas",
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

export const CategoryPage = () => {
    const { slug } = useParams();
    const category = CATEGORY_CONFIG[slug];
    const [sortBy, setSortBy] = useState("name-asc");

    if (!category) {
        return (
            <section className="category-page">
                <h2>Categoría no encontrada</h2>
                <p>La categoría que buscás no existe.</p>
            </section>
        );
    }

    const filteredProducts = products.filter(
        (p) => p.category === slug
    );

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

    return (
        <section className="category-page">
            <div className="category-header">
                <h1 className="category-title">{category.title}</h1>
                <p className="category-description">{category.description}</p>
                <p className="category-count">
                    {filteredProducts.length} productos
                </p>
            </div>

            <div className="category-controls">
                <label>
                    Ordenar por precio:
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        {/* opción oculta para mantener el default */}
                        <option value="name-asc" hidden>
                            Nombre (A–Z)
                        </option>

                        <option value="price-asc">Menor a mayor</option>
                        <option value="price-desc">Mayor a menor</option>
                    </select>
                </label>
            </div>
            <div className="products-grid">
                {sortedProducts.length === 0 ? (
                    <p>No hay productos en esta categoría.</p>
                ) : (
                    sortedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </section>
    );
};