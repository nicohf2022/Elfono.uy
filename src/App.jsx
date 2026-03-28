import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { useState } from "react";
//pagina principal
import { Catalog } from "./pages/Catalog";
import { ScrollToTop } from "./components/ScrollToTop";

//paginas

import { CartProvider } from "./components/CartContext";
import { Nosotros } from "./pages/Nosotros";
import { Envios } from "./pages/Envios";
import { ProductPage } from "./pages/ProductPage";
import { CartDrawer } from "./components/CartDrawer";
import { CategoryPage } from "./pages/CategoryPage";
import { SearchPage } from "./pages/SearchPage";
import { StockProvider } from "./components/StockContext";







function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  return (

    <CartProvider>
      <StockProvider>
 <ScrollToTop />
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route
          path="/producto/:id"
          element={<ProductPage onOpenCart={() => setIsCartOpen(true)} />}
        />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/envios" element={<Envios />} />
        <Route path="/buscar" element={<SearchPage />} />



      </Routes>

      <Footer />
      </StockProvider>
    </CartProvider>
  );
}

export default App;