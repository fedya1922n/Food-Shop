import React from 'react';
import { Link, useParams } from 'react-router-dom';
import mockProducts from '../../../mockProducts';
import './styles/ProductsMenu.css';
import { useTranslation } from 'react-i18next';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import DOMPurify from 'dompurify';

const ProductsMenu: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748, 
    en: 0.00007874, 
    uz: 1, 
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  if (!type || typeof type !== 'string') {
    console.error('Некорректный или отсутствующий тип продукта');
    return <div>{t('products.invalidType')}</div>;
  }

  const filteredProducts = mockProducts.filter((product) => product.type === type);

  const translatedType = DOMPurify.sanitize(t(`productTypes.${type}`, { defaultValue: type }));

  return (
    <div className="products-menu">
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products-message">{t('products.noProducts')}</p>
        ) : (
          filteredProducts.map((product) => {
            if (!product.id || !product.name || !product.price || !product.image) {
              console.error('Некорректные данные продукта:', product);
              return null;
            }

            const basePrice = product.discount
              ? product.price - (product.price * product.discount) / 100
              : product.price;
            const convertedPrice = basePrice * conversionRate;

            return (
              <div key={product.id} className="product-card">
                <img
                  src={product.image}
                  alt={DOMPurify.sanitize(product.name)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback-image.png';
                  }}
                />
                <h3>{DOMPurify.sanitize(t(`products.${product.name}`, { defaultValue: product.name }))}</h3>
                <p>
                  {t('product.price')}: {convertedPrice.toFixed(2)} {t('money.currency')}
                </p>
                {product.discount && (
                  <p className="discount">
                    {t('product.off')} {product.discount}%
                  </p>
                )}
                <div className="product-card-buttons">
                  <button onClick={() => addToCart(product)}>
                    <FaShoppingCart /> {t('product.addToCart')}
                  </button>
                  <Link to={`/product/${product.id}`}>
                    <button className="details-button">{t('product.details')}</button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductsMenu);