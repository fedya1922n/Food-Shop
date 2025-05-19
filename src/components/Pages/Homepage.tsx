/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProductList from '../Products/ProductList';
import Recommendations from '../Products/Recommendations';
import mockProducts from '../../../mockProducts';
import { isValidProduct,} from '../context/cartUtils';
import DOMPurify from 'dompurify';
import { debounce } from 'lodash';
import '../Products/styles/Homepage.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category: string;
  imageQuery: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  type: string;
}

const Homepage: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const sanitizeString = (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  };

  const sanitizeRoute = (route: string): string => {
    return route.replace(/[^a-zA-Z0-9-_]/g, '');
  };

  const shuffleArray = (array: Product[]): Product[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      await new Promise((resolve) => setTimeout(resolve, 500));
      let data = mockProducts.filter((product) =>
        isValidProduct({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          discount: product.discount,
        })
      );

      data = shuffleArray(data); 

      localStorage.setItem('cachedProducts', JSON.stringify(data));

      setProducts(data);
      setFilteredProducts(data);
      setProgress(100);
    } catch (error: any) {
      setError(error.message || t('error.failedToLoad') || 'Не удалось загрузить продукты');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const debouncedFilterProducts = debounce((query: string) => {
    const sanitizedQuery = sanitizeString(query);
    if (products.length > 0 && sanitizedQuery) {
      setFilteredProducts(
        products.filter((product) => {
          const translatedName = sanitizeString(
            t(`products.${product.name}`, { defaultValue: product.name })
          );
          return translatedName.toLowerCase().includes(sanitizedQuery.toLowerCase());
        })
      );
    } else {
      setFilteredProducts(products);
    }
  }, 300);

  useEffect(() => {
    debouncedFilterProducts(searchQuery);
    return () => {
      debouncedFilterProducts.cancel();
    };
  }, [searchQuery, products, t]);

  const recommendationCategories = [
    'forDiet', 'forMassGain', 'forEvening', 'forBreakfast', 'forLunch',
    'forDinner', 'forSnacks', 'forKids', 'forVegans', 'forAthletes',
    'forParties', 'forDesserts', 'forHealthy'
  ];

  const getProductsForCategory = (category: string) => {
    let categoryProducts = products.filter((product) => product.category === category);

    if (categoryProducts.length === 0) {
      categoryProducts = products.slice(0, 5);
    }

    while (categoryProducts.length < 5 && products.length > 0) {
      const remainingCount = 5 - categoryProducts.length;
      const additionalProducts = products.slice(0, remainingCount);
      categoryProducts = [...categoryProducts, ...additionalProducts];
    }

    return categoryProducts.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="container">
        <p>{t('error.uploading')} {progress}%</p>
        <div style={{ width: '100%', height: '10px', background: '#E0E0E0', borderRadius: '5px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#00A651',
              borderRadius: '5px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p>{sanitizeString(error)}</p>
        <button onClick={() => fetchProducts()}>
          {t('error.retryUpload') || 'Попробовать снова'}
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="fade-in">{t('homepage.title')}</h1>
      <ProductList products={filteredProducts} />
      <h2 className="fade-in">{t('homepage.recommendations')}</h2>
      {recommendationCategories.map((category) => {
        const sanitizedCategory = sanitizeRoute(category);
        const categoryProducts = getProductsForCategory(sanitizedCategory);
        if (categoryProducts.length === 0) return null;
        return (
          <div key={sanitizedCategory} id={sanitizedCategory}>
            <Recommendations
              title={sanitizedCategory}
              products={categoryProducts}
            />
          </div>
        );
      })}
      <footer style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>
          Photos By{' '}
          <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">
            Pexels
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Homepage;