// src/components/CategoryCard.jsx
import "./CategoryCard.css";

export const CategoryCard = ({ category, image, onClick }) => {
  return (
    <div className="category-card" onClick={onClick}>
      <div className="category-image">
        <img src={image} alt={category} />
      </div>

      <h3 className="category-title">{category}</h3>
    </div>
  );
};