import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import mockProducts from '../../../mockProducts';
import { isValidImageUrl } from '../context/cartUtils';
import './styles/ProductDetails.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category: string;
  ingredients: string[];
  nutritionalInfo: { calories: number; protein: number; fat: number; carbs: number };
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const foundProduct = mockProducts.find((p: Product) => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
    } else if (state?.product && state.product.id === id) {
      setProduct(state.product);
    } else {
      console.error('Product not found');
    }
  }, [id, state]);

  if (!product) {
    return <div>{t('details.productNotFound')}</div>;
  }

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748,
    en: 0.00007874,
    uz: 1,
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const validDiscount = typeof product.discount === 'number' && product.discount > 0 && product.discount <= 100;
  const discountedPrice = validDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;
  const convertedPrice = discountedPrice * conversionRate;

  return (
    <div className="product-details fade-in">
      <h2>{DOMPurify.sanitize(t(`products.${product.name}`, { defaultValue: product.name }))}</h2>
      <img
        src={isValidImageUrl(product.image) ? product.image : '/fallback-image.png'}
        alt={DOMPurify.sanitize(product.name)}
      />
      <p>
        {t('product.price')}: {convertedPrice.toFixed(2)} {t('money.currency')}
      </p>
      {validDiscount && (
        <p className="discount">
          {t('product.off')} {product.discount}%
        </p>
      )}
      <h3>{t('details.ingredients')}</h3>
      <ul>
        {product.ingredients.map((ingredient, index) => (
          <li key={index}>{t(`ingredients.${ingredient}`, { defaultValue: ingredient })}</li>
        ))}
      </ul>
      <h3>{t('details.nutritional')}</h3>
      <p>{t('details.calories')}: {product.nutritionalInfo.calories} {t('details.kcal')}</p>
      <p>{t('details.protein')}: {product.nutritionalInfo.protein} {t('details.grams')}</p>
      <p>{t('details.fat')}: {product.nutritionalInfo.fat} {t('details.grams')}</p>
      <p>{t('details.carbs')}: {product.nutritionalInfo.carbs} {t('details.grams')}</p>
    </div>
  );
};

export default React.memo(ProductDetails);