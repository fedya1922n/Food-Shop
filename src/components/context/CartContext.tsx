import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Product, isValidProduct, MAX_CART_ITEMS } from './cartUtils';

interface CartContextType {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      const parsedCart = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? parsedCart.filter(isValidProduct) : [];
    } catch {
      return [];
    }
  });

  const [showNotification, setShowNotification] = useState(false);

  const saveCart = debounce((cart: Product[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {
      //
    }
  }, 500);

  useEffect(() => {
    saveCart(cart);
  }, [cart, saveCart]);

  const addToCart = (product: Product) => {
    if (!isValidProduct(product)) {
      return;
    }
    if (cart.length >= MAX_CART_ITEMS) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }
    setCart([...cart, product]);
  };

  const removeFromCart = (id: string) => {
    if (!id) {
      return;
    }
    setCart(cart.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
      {children}
      {showNotification && (
        <div className="cart-notification fade-enter-active">
          {t('cart.fullNotification') || 'Корзина заполнена!'}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
};