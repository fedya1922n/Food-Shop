import React from 'react';
import ProductCard from './ProductCard';
import './styles/ProductsList.css';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const ProductList: React.FC<{ products: Product[] | undefined }> = ({ products }) => {
  const { t } = useTranslation();

  if (!Array.isArray(products) || products.some(product => !product.id || !product.name || !product.price)) {
    console.error('Invalid product data:', products);
    return <p>{t('error.invalidData')}</p>;
  }

  return (
    <div className="product-list">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              name: DOMPurify.sanitize(t(`products.${product.name}`, { defaultValue: product.name })),
            }}
          />
        ))
      ) : (
        <p>{t('error.noProductsAvailable')}</p>
      )}
    </div>
  );
};

export default React.memo(ProductList);