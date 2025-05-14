import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaSearch, FaArrowLeft, FaHome, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './Navbar.css';

const Navbar: React.FC<{ searchQuery: string; setSearchQuery: (query: string) => void }> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const { t, i18n } = useTranslation();
  const { cart } = useCart();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<{ name: string; lang: string }[]>([]);
  const [showLanguageNotification, setShowLanguageNotification] = useState<string | false>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const catalogRef = useRef<HTMLDivElement>(null);
  const notificationTimeout = useRef<NodeJS.Timeout | null>(null);

  const changeLanguage = (lng: string) => {
    const allowedLanguages = ['ru', 'en', 'uz'];
    if (allowedLanguages.includes(lng)) {
      i18n.changeLanguage(lng);
      setShowLanguageNotification(false);
    }
  };

  const recommendationCategories = [
    'forDiet', 'forMassGain', 'forEvening', 'forBreakfast', 'forLunch',
    'forDinner', 'forSnacks', 'forKids', 'forVegans', 'forAthletes',
    'forParties', 'forDesserts', 'forHealthy'
  ];

  const productTypes = [
    { name: "vegetables", type: "vegetables" },
    { name: "fruits", type: "fruits" },
    { name: "meat", type: "meat" },
    { name: "fish/seafood", type: "fish/seafood" },
    { name: "grains/cereals", type: "grains/cereals" },
    { name: "dairy", type: "dairy" },
    { name: "beverages", type: "beverages" },
    { name: "sweets/desserts", type: "sweets/desserts" },
    { name: "snacks", type: "snacks" },
    { name: "legumes", type: "legumes" },
    { name: "nuts/seeds", type: "nuts/seeds" },
    { name: "bakery", type: "bakery" },
    { name: "sauces/condiments", type: "sauces/condiments" },
    { name: "eggs", type: "eggs" },
    { name: "other", type: "other" },
  ];

  const sanitizeRoute = (route: string): string => {
    return route.replace(/[^a-zA-Z0-9-_]/g, '');
  };

  const handleCategoryClick = (category: string) => {
    const allowedCategories = recommendationCategories;
    const sanitizedCategory = sanitizeRoute(category);
    if (allowedCategories.includes(sanitizedCategory)) {
      setIsCatalogOpen(false);
      navigate(`/#${sanitizedCategory}`);
      setTimeout(() => {
        const element = document.getElementById(sanitizedCategory);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleTypeClick = (type: string) => {
    const allowedTypes = productTypes.map((product) => product.type);
    const sanitizedType = sanitizeRoute(type);
    if (allowedTypes.includes(sanitizedType)) {
      setIsCatalogOpen(false);
      navigate(`/products/${sanitizedType}`);
    }
  };

  const getAllProducts = () => {
    const languages = ['ru', 'en', 'uz'];
    const allProducts: { name: string; lang: string }[] = [];

    languages.forEach((lang) => {
      const products = i18n.getResource(lang, 'translation', 'products');
      if (products && typeof products === 'object') {
        Object.values(products).forEach((product: string) => {
          allProducts.push({ name: product, lang });
        });
      }
    });

    return allProducts;
  };

  const detectQueryLanguage = (query: string): string => {
    const cyrillicPattern = /[а-яА-ЯЁё]/;
    const latinPattern = /[a-zA-Z]/;
    if (cyrillicPattern.test(query)) {
      return 'ru';
    } else if (latinPattern.test(query)) {
      const uzbekPattern = /[oʻgʻ]/i;
      return uzbekPattern.test(query) ? 'uz' : 'en';
    }
    return ''; 
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let query = e.target.value;
    if (query.length > 100) {
      query = query.slice(0, 100);
    }
    const sanitizedQuery = DOMPurify.sanitize(query) || '';
    setSearchQuery(sanitizedQuery);

    if (!sanitizedQuery) {
      setFilteredProducts([]);
      setShowLanguageNotification(false);
      return;
    }

    const queryLang = detectQueryLanguage(sanitizedQuery);
    const allProducts = getAllProducts();

    const newFilteredProducts = allProducts.filter((product) => {
      if (queryLang && product.lang !== queryLang) return false;
      return product.name.toLowerCase().includes(sanitizedQuery.toLowerCase());
    });

    setFilteredProducts(newFilteredProducts);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredProducts([]);
    setShowLanguageNotification(false); 
  };

  const handleProductSelect = (product: { name: string; lang: string }) => {
    const sanitizedProduct = DOMPurify.sanitize(product.name) || '';
    setSearchQuery(sanitizedProduct);

    const productLang = product.lang;
    if (productLang && productLang !== i18n.language && ['ru', 'en', 'uz'].includes(productLang)) {
      setShowLanguageNotification(productLang);
    }

    setFilteredProducts([]);
  };

  const handleLanguageDecision = (accept: boolean) => {
    if (accept && showLanguageNotification) {
      changeLanguage(showLanguageNotification);
    } else {
      setShowLanguageNotification(false);
    }
  };


  useEffect(() => {
    if (showLanguageNotification) {
      notificationTimeout.current = setTimeout(() => {
        setShowLanguageNotification(false);
      }, 6000);
    }

    return () => {
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, [showLanguageNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };

    if (isCatalogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCatalogOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {location.pathname !== '/' && (
          <>
            <button
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> {t('navbar.back')}
            </button>
            <button
              className="home-button"
              onClick={() => navigate('/')}
            >
              <FaHome /> {t('navbar.home')}
            </button>
          </>
        )}
      </div>
      <div className="navbar-search">
        <FaSearch className="navbar-search-icon" />
        <input
          type="text"
          placeholder={t('navbar.search')}
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <button
            className="navbar-clear-search"
            onClick={handleClearSearch}
            title={t('navbar.clearSearch')}
          >
            <FaTimes />
          </button>
        )}
        {searchQuery && filteredProducts.length > 0 && (
          <ul className="search-suggestions">
            {filteredProducts.map((product, index) => (
              <li
                key={`${product.name}-${index}`}
                onClick={() => handleProductSelect(product)}
              >
                {DOMPurify.sanitize(product.name)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="navbar-actions">
        <div className="navbar-catalog" ref={catalogRef}>
          <button
            className="navbar-catalog-button"
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          >
            {t('navbar.catalog')}
          </button>
          
          {isCatalogOpen && (
            <div className="navbar-catalog-dropdown">
              <div className="catalog-section">
                <h4>{t('homepage.recommendations')}</h4>
                <div className="catalog-items">
                  {recommendationCategories.map((category) => (
                    <Link
                      key={category}
                      to={`/#${sanitizeRoute(category)}`}
                      className="navbar-catalog-item"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {t(`recommendations.${category}`)}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="catalog-section">
                <h4>{t('homepage.productTypes')}</h4>
                <div className="catalog-items">
                  {productTypes.map((type) => (
                    <button
                      key={type.type}
                      className="navbar-catalog-item"
                      onClick={() => handleTypeClick(type.type)}
                    >
                      {t(`productTypes.${type.type}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="uz">Oʻzbek</option>
        </select>
        
        <Link to="/cart" className="navbar-cart">
          <FaShoppingCart />
          <span>{t('cart.title')}</span>
          {cart.length > 0 && <span className="navbar-cart-count">{cart.length}</span>}
        </Link>
      </div>
      {showLanguageNotification && searchQuery && (
        <div className="language-notification fade-enter-active">
          <p>{t('navbar.switchLanguagePrompt', { lang: showLanguageNotification.toUpperCase() })}</p>
          <div>
            <button className="notification-button" onClick={() => handleLanguageDecision(true)}>
              {t('navbar.yes')}
            </button>
            <button className="notification-button" onClick={() => handleLanguageDecision(false)}>
              {t('navbar.no')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);