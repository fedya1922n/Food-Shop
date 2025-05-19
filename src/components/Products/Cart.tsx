/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {useCart } from "../context/CartContext";
import mockProducts from "../../../mockProducts";
import { isValidImageUrl } from "../context/cartUtils";
import DOMPurify from "dompurify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";

const Cart: React.FC = () => {
  const { cart, setCart } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [cardNumberError, setCardNumberError] = useState('');
  const [cardHolderError, setCardHolderError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const conversionRates: { [key: string]: number } = {
    ru: 0.00748,
    en: 0.00007874,
    uz: 1,
  };

  const currentLanguage = i18n.language;
  const conversionRate = conversionRates[currentLanguage] || conversionRates['uz'];

  const groupedCart = cart.reduce((acc: { [key: string]: any }, item) => {
    const product = mockProducts.find((p) => p.id === item.id);
    if (!product) {
      console.warn(`Продукт с ID ${item.id} не найден в mockProducts.`);
      return acc;
    }
    if (acc[item.id]) {
      acc[item.id].quantity += 1;
    } else {
      acc[item.id] = {
        id: item.id,
        quantity: 1,
        price: product.price,
        discount: product.discount,
        name: product.name,
        image: product.image,
      };
    }
    return acc;
  }, {});
  const groupedCartItems = Object.values(groupedCart);

  const calculatePrice = (item: any) => {
    const validDiscount = item.discount && item.discount > 0 && item.discount <= 100;
    const basePrice = validDiscount
      ? item.price - (item.price * item.discount) / 100
      : item.price;
    return basePrice * item.quantity * conversionRate;
  };

  const calculateBasePrice = (item: any) => {
    const validDiscount = item.discount && item.discount > 0 && item.discount <= 100;
    const basePrice = validDiscount
      ? item.price - (item.price * item.discount) / 100
      : item.price;
    return basePrice * item.quantity; 
  };

  const totalPrice = groupedCartItems.reduce((total: number, item: any) => {
    return total + calculatePrice(item);
  }, 0);

  const baseTotalPrice = groupedCartItems.reduce((total: number, item: any) => {
    return total + calculateBasePrice(item);
  }, 0); 

  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
  };

  const removeOneFromCart = (id: string) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      updatedCart.splice(itemIndex, 1);
      setCart(updatedCart);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    const isCardNumberValid = validateCardNumber();
    const isCardHolderValid = validateCardHolder();
    const isExpiryDateValid = validateExpiryDate();

    if (isCardNumberValid && isCardHolderValid && isExpiryDateValid && cvv.length === 3) {

      const purchaseData = {
        date: new Date().toISOString(), 
        items: groupedCartItems.map((item: any) => ({
          id: item.id,
          name: DOMPurify.sanitize(t(`products.${item.name}`, { defaultValue: item.name })),
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })), 
        totalPrice: baseTotalPrice, 
        currency: t('money.currency'),
      };

      const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');

      existingPurchases.push(purchaseData);

      localStorage.setItem('purchases', JSON.stringify(existingPurchases));

      clearCart();
      try {
        navigate('/success-purchase', { replace: true });
      } catch (error) {
        console.error('Ошибка при навигации:', error);
      }
    }
  };

  useEffect(() => {
    if (cart.length === 0) {
      setShowPayment(false);
    }
  }, [cart]);

  const validateCardNumber = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16 || !/^\d{16}$/.test(cleanCardNumber)) {
      setCardNumberError(t('cart.invalidCardNumber') || 'Invalid card number.');
      return false;
    }
    setCardNumberError('');
    return true;
  };

  const validateCardHolder = () => {
    const cleanCardHolder = cardHolder.trim();
    if (cleanCardHolder.length < 4 || cleanCardHolder.length > 25 || !/^[A-Z\s]+$/.test(cleanCardHolder)) {
      setCardHolderError(t('cart.invalidCardHolder') || 'Invalid card holder name.');
      return false;
    }
    setCardHolderError('');
    return true;
  };

  const validateExpiryDate = () => {
    const cleanExpiry = expiryDate.replace('/', '');
    if (cleanExpiry.length !== 4) {
      setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      return false;
    }
    const [month, year] = expiryDate.split('/').map(Number);
    if (!month || month < 1 || month > 12) {
      setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      return false;
    }
    const fullYear = year + 2000;
    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      setExpiryDateError(t('cart.expiredCard') || 'Ошибка, карта устарела.');
      return false;
    }
    if (fullYear > currentYear + 10) {
      setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      return false;
    }
    setExpiryDateError('');
    return true;
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = cleanValue
      .match(/.{1,4}/g)
      ?.join(' ')
      .trim() || cleanValue;
    return formattedValue;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleCardHolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperCaseValue = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '');
    setCardHolder(upperCaseValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    let formattedValue = '';

    if (value.length === 0) {
      formattedValue = ''; 
    } else if (value.length <= 2) {
      let month = value;
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) {
        month = '01'; 
      }
      formattedValue = month;
    } else {
      let month = value.slice(0, 2);
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) {
        month = '01'; 
      }
      const year = value.slice(2);
      formattedValue = `${month}/${year}`;
    }

    setExpiryDate(formattedValue);

    if (value.length === 4) {
      const month = parseInt(value.slice(0, 2), 10);
      const year = parseInt(value.slice(2), 10);
      const fullYear = year + 2000;

      if (month < 1 || month > 12) setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      else if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) setExpiryDateError(t('cart.expiredCard') || 'Ошибка, карта устарела.');
      else if (fullYear > currentYear + 10) setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      else setExpiryDateError('');
    } else if (value.length > 0 && value.length < 4) {
      const month = parseInt(value.slice(0, 2), 10);
      if (value.length >= 2 && (month < 1 || month > 12)) setExpiryDateError(t('cart.invalidExpiryDate') || 'Ошибка карты, введите корректную дату.');
      else setExpiryDateError('');
    } else {
      setExpiryDateError('');
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    setCvv(value);
  };

  return (
    <div className="cart">
      <h2>{t('cart.title')}</h2>
      {groupedCartItems.length === 0 ? (
        <p>{t('cart.empty')}</p>
      ) : (
        <>
          <ul>
            {groupedCartItems.map((item: any) => (
              <li key={item.id} className="cart-item">
                <img
                  src={isValidImageUrl(item.image) ? item.image : '/fallback-image.png'}
                  alt={DOMPurify.sanitize(t(`products.${item.name}`, { defaultValue: item.name }))}
                />
                <div>
                  <h3>{DOMPurify.sanitize(t(`products.${item.name}`, { defaultValue: item.name }))}</h3>
                  <p>
                    {t('product.price')}: {calculatePrice(item).toFixed(2)} {t('money.currency')}
                  </p>
                  {item.discount && (
                    <p className="discount">
                      {t('product.discount')}: {item.discount}% {t('product.off')}
                    </p>
                  )}
                  {item.quantity > 1 && <p>{t('cart.quantity')}: {item.quantity}</p>}
                  <button onClick={() => removeOneFromCart(item.id)}>{t('cart.remove')}</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <h3>{t('cart.totalPrice')}</h3>
            <p>{totalPrice.toFixed(2)} {t('money.currency')}</p>
            <button className="clear-cart-button" onClick={clearCart}>{t('cart.clear')}</button>
            <button className="pay-button" onClick={() => setShowPayment(true)}>{t('cart.pay')}</button>
          </div>
        </>
      )}

      {showPayment && (
        <div className="payment-form">
          <h3>{t('cart.payment')}</h3>
          <form onSubmit={handlePayment}>
            <div>
              <label>{t('cart.cardNumber')}</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
              {cardNumberError && <p className="error">{cardNumberError}</p>}
            </div>
            <div>
              <label>{t('cart.cardHolder')}</label>
              <input
                type="text"
                value={cardHolder}
                onChange={handleCardHolderChange}
                placeholder="JOHN DOE"
                maxLength={25}
                required
              />
              {cardHolderError && <p className="error">{cardHolderError}</p>}
            </div>
            <div>
              <label>{t('cart.expiryDate')}</label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
              {expiryDateError && <p className="error">{expiryDateError}</p>}
            </div>
            <div className="cvv-container">
              <label>{t('cart.cvv')}</label>
              <div className="cvv-input-wrapper">
                <input
                  type={showCvv ? "text" : "password"}
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  maxLength={3}
                  required
                />
                <button
                  type="button"
                  className="toggle-cvv-visibility"
                  onClick={() => setShowCvv(!showCvv)}
                >
                  {showCvv ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit">{t('cart.confirmPayment')}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;