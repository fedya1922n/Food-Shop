
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './styles/Cart.css';

const SuccesPurchase: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const storedPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    setPurchases(storedPurchases);
  }, []);

  const clearPurchaseHistory = () => {
    localStorage.setItem('purchases', JSON.stringify([]));
    setPurchases([]);
  };

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748,
    en: 0.00007874,
    uz: 1,
  };

  const currentLanguage = i18n.language;
  const currencyRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const getCurrencySymbol = (lang: string) => {
    switch (lang) {
      case 'ru':
        return '₽';
      case 'en':
        return '$';
      case 'uz':
        return 'soʻm';
      default:
        return 'soʻm';
    }
  };

  const currencySymbol = getCurrencySymbol(currentLanguage);

  const calculatePrice = (item: any) => {
    if (!item || !item.price || !item.quantity) {
      console.warn('Invalid item data:', item);
      return 0;
    }
    const validDiscount = item.discount && item.discount > 0 && item.discount <= 100;
    const basePrice = validDiscount
      ? item.price - (item.price * item.discount) / 100
      : item.price;
    return basePrice * item.quantity * currencyRate;
  };

  const calculateTotalPrice = (totalPrice: any) => {
    const numericPrice = typeof totalPrice === 'number' ? totalPrice : parseFloat(totalPrice || 0);
    return (numericPrice * currencyRate).toFixed(2);
  };

  return (
    <div className="success-container">
      <h2>{t('cart.successPurchase') || 'Thank you for your purchase!'}</h2>
      
      {purchases.length > 0 ? (
        <div className="purchase-history">
          <h3>{t('cart.purchaseHistory') || 'Your Purchase History'}</h3>
          <button className="clear-history-button" onClick={clearPurchaseHistory}>
            {t('cart.clearHistory') || 'Clear History'}
          </button>
          <div className="purchase-list">
            {purchases.map((purchase, index) => (
              <div key={index} className="purchase-card">
                <div className="purchase-header">
                  <h4>{t('cart.purchase')} #{index + 1}</h4>
                  <p className="purchase-date">
                    {new Date(purchase.date).toLocaleString()}
                  </p>
                </div>
                <ul className="purchase-items">
                  {(purchase.items || []).map((item: any) => {
                    const itemPrice = calculatePrice(item);
                    return (
                      <li key={item.id} className="purchase-item">
                        <span>{item.name || 'Unknown Item'}</span>
                        <span>
                          {(item.quantity || 0)} x {(itemPrice / (item.quantity || 1)).toFixed(2)} {currencySymbol}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="purchase-total">
                  <strong>{t('cart.totalPrice')}:</strong> 
                  {calculateTotalPrice(purchase.totalPrice)} {currencySymbol}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>{t('cart.noPurchaseHistory') || 'No purchase history available.'}</p>
      )}
    </div>
  );
};

export default React.memo(SuccesPurchase);