import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

/**
 * Componente que permite aos usuários alternar entre idiomas.
 * Por padrão, apresenta um menu dropdown com opções para português e inglês.
 */
export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('common.language', 'Idioma')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('pt-BR')}
          className={currentLanguage === 'pt-BR' ? 'bg-accent' : ''}
        >
          🇧🇷 Português
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Versão simplificada do alternador de idiomas.
 * Mostra apenas um botão que alterna diretamente entre os idiomas.
 */
export function SimpleLanguageSwitcher() {
  const { toggleLanguage, isPortuguese } = useLanguage();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2"
    >
      {isPortuguese ? '🇧🇷 PT' : '🇬🇧 EN'}
    </Button>
  );
}