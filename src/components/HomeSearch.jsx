import { useState } from "react";
import { useNavigate } from "react-router-dom";
import products from "../data/products.json";
import { matchesSearch } from "../utils/searchUtils";
import "./HomeSearch.css";

export const HomeSearch = () => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const handleChange = (value) => {
    setSearch(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = products
      .filter((p) => matchesSearch(p, value))
      .slice(0, 5);

    setSuggestions(results);
  };

  const goToSearch = (value) => {
    navigate(`/buscar?q=${value}`);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <div className="home-search">
      <input
        type="text"
        placeholder="Buscar fundas, cargadores, iPhone 14..."
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && search.trim()) {
            goToSearch(search);
          }
        }}
      />

      {suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((product) => (
            <div
              key={product.id}
              className="suggestion-item"
              onClick={() => goToSearch(product.name)}
            >
              <img src={product.image} alt={product.name} />
              <div>
                <span>{product.name}</span>
                <small>${product.price}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};