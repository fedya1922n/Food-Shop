import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import uz from '../locales/uz.json';

const getStoredLanguage = () => {
  const storedLang = localStorage.getItem('language');

  const supportedLangs = ['en', 'ru', 'uz'];
  return storedLang && supportedLangs.includes(storedLang) ? storedLang : 'ru';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    lng: getStoredLanguage(), 
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });


i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;