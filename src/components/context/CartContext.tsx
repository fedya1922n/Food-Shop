import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

interface CartContextType {
  cart: Product[];
  setCart: React.Dispatch<React.SetStateAction<Product[]>>;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const MAX_CART_ITEMS = 50;

export const isValidImageUrl = (url: string): boolean => {
  return /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/.test(url) || /^\/.*\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/.test(url);
};

export const isValidProduct = (product: Product): boolean => {
  return (
    typeof product.id === 'string' &&
    product.id.trim().length > 0 &&
    typeof product.name === 'string' &&
    product.name.trim().length > 0 &&
    typeof product.price === 'number' &&
    product.price >= 0 &&
    typeof product.image === 'string' &&
    isValidImageUrl(product.image)
  );
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (!savedCart) return [];
      const parsedCart = JSON.parse(savedCart);
      return Array.isArray(parsedCart) ? parsedCart.filter(isValidProduct) : [];
    } catch (error) {
      return [];
    }
  });

  const [showNotification, setShowNotification] = useState(false);

  const saveCart = debounce((cart: Product[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      //
    }
  }, 500);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

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