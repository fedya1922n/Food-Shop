import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { isValidImageUrl, isValidProduct } from '../context/cartUtils';
import './styles/ProductCard.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category?: string;
  ingredients?: string[];
  nutritionalInfo?: { calories: number; protein: number; fat: number; carbs: number };
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  if (!isValidProduct(product)) {
    console.error(`ProductCard: Invalid product:`, product);
    return null;
  }

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748,
    en: 0.00007874,
    uz: 1,
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const validDiscount = typeof product.discount === 'number' && product.discount > 0 && product.discount <= 100;
  const finalPrice = validDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;
  const convertedPrice = finalPrice * conversionRate;

  const handleAddToCart = () => {
    try {
      const sanitizedProduct: Product = {
        id: product.id,
        name: DOMPurify.sanitize(product.name),
        price: product.price,
        image: product.image,
        discount: product.discount,
        category: product.category,
        ingredients: product.ingredients,
        nutritionalInfo: product.nutritionalInfo,
      };
      addToCart(sanitizedProduct);
    } catch (error) {
      console.error('ProductCard: Error adding to cart:', error);
    }
  };

  const truncatedName = product.name.length > 50
    ? `${product.name.slice(0, 50)}...`
    : product.name;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <img
          src={isValidImageUrl(product.image) ? product.image : '/fallback-image.png'}
          alt={DOMPurify.sanitize(product.name)}
        />
      </Link>
      <div className="product-card-info">
        <Link to={`/product/${product.id}`}>
          <h3>{DOMPurify.sanitize(truncatedName)}</h3>
        </Link>
        <p>
          {t('product.price')}: {convertedPrice.toFixed(2)} {t('money.currency')}
        </p>
        {validDiscount && (
          <p className="discount">
            {t('product.off')} {product.discount}%
          </p>
        )}
      </div>
      <div className="product-card-buttons">
        <button onClick={handleAddToCart}>
          <FaShoppingCart /> {t('product.addToCart')}
        </button>
        <Link to={`/product/${product.id}`}>
          <button className="details-button">{t('product.details')}</button>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);