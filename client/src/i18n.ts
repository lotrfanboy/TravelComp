import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importando os arquivos de tradução
import translationPT from './locales/pt-BR/common.json';
import translationEN from './locales/en/common.json';

// Recursos de idiomas disponíveis
const resources = {
  'pt-BR': {
    translation: translationPT
  },
  en: {
    translation: translationEN
  }
};

// Inicializando i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR', // Português como idioma padrão
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;