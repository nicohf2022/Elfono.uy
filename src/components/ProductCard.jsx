import "./ProductCard.css";
import { useNavigate } from "react-router-dom";

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const hasVariants = Array.isArray(product.variants);

  const totalStock = hasVariants
    ? product.variants.reduce((acc, v) => acc + v.stock, 0)
    : product.stock;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/producto/${product.id}`)}
    >
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          width="320"
          height="320"
          loading="lazy"
          decoding="async"
        />
      </div>

      <h3 className="product-name">{product.name}</h3>

      <p className="product-price">${product.price}</p>


    </div>
  );
};