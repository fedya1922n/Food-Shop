import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Homepage from './components/Pages/Homapage';
import ProductDetails from './components/Products/ProductDetails';
import { CartProvider } from "./components/context/CartContext";
import Cart from './components/Products/Cart';
import SuccesPurchase from './components/Products/SuccesPurchase';
import ProductsMenu from './components/Products/ProductsMenu';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/Pages/NotFound';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <CartProvider>
      <ErrorBoundary>
        <Router>
          <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Routes>
            <Route path="/" element={<Homepage searchQuery={searchQuery} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success-purchase" element={<SuccesPurchase />} />
            <Route path="/products/:type" element={<ProductsMenu />} />
            <Route path="*" element={<NotFound />} /> {/* <-- Вот этот маршрут */}
          </Routes>
        </Router>
      </ErrorBoundary>
    </CartProvider>
  );
};

export default App;
