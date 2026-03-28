// src/components/CategoryCard.jsx
import "./CategoryCard.css";

export const CategoryCard = ({ category, image, onClick }) => {
  const isLCP = category === "Cases";

  return (
    <div className="category-card" onClick={onClick}>
      <div className="category-image">
        <img
          src={image}
          alt={category}
          width="320"
          height="320"
          loading={isLCP ? "eager" : "lazy"}
          fetchPriority={isLCP ? "high" : "auto"}
          decoding="async"
        />
      </div>

      <h3 className="category-title">{category}</h3>
    </div>
  );
};