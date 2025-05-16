import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar o idioma na aplicação.
 * Permite mudar facilmente entre português e inglês, salvando a
 * preferência do usuário no localStorage.
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const savedLanguage = localStorage.getItem('language') || 'pt-BR';
  const [currentLanguage, setCurrentLanguage] = useState(savedLanguage);

  // Inicializa o idioma baseado na preferência salva ou detectada
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  // Função para alternar entre português e inglês
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'pt-BR' ? 'en' : 'pt-BR';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  // Função para definir um idioma específico
  const changeLanguage = (language: 'pt-BR' | 'en') => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  };

  return {
    currentLanguage,
    isPortuguese: currentLanguage === 'pt-BR',
    isEnglish: currentLanguage === 'en',
    toggleLanguage,
    changeLanguage
  };
}