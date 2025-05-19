// src/components/Products/Recommendations.tsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { SwiperProps } from 'swiper/react';
import ProductCard from './ProductCard';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import './styles/Recommendations.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const Recommendations: React.FC<{ products: Product[]; title: string }> = ({ products, title }) => {
  const { t } = useTranslation();

  const swiperOptions: SwiperProps = {
    modules: [Navigation, Autoplay],
    spaceBetween: 20,
    slidesPerView: 4,
    navigation: true,
    loop: true,
    autoplay: { delay: 3000 },
  };

  return (
    <div className="recommendations fade-in">
      <h2 className="fade-in">{DOMPurify.sanitize(t(`recommendations.${title}`, { defaultValue: title }))}</h2>
      <Swiper {...swiperOptions}>
        {products.map((product) => {
          if (!product.id || !product.name || !product.price || !product.image) {
            console.error('Некорректные данные продукта:', product);
            return null;
          }

          return (
            <SwiperSlide key={product.id}>
              <ProductCard
                product={{
                  ...product,
                  name: DOMPurify.sanitize(
                    t(`products.${product.name}`, { defaultValue: product.name })
                  ),
                }}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default React.memo(Recommendations);