/**
 * Utilitários para manipulação de formulários
 */
import { z } from 'zod';
import { useState, useEffect } from 'react';

/**
 * Mensagens de erro traduzidas para validação de formulários
 */
export const zodErrorMessages = {
  required: "Este campo é obrigatório",
  email: "Email inválido",
  min: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  max: (max: number) => `Deve ter no máximo ${max} caracteres`,
  minDate: "A data não pode ser anterior a hoje",
  invalid: "Valor inválido",
};

/**
 * Funções auxiliares para criar validações Zod 
 */
export const zodValidations = {
  /**
   * Campo de texto obrigatório com validações de comprimento
   */
  requiredString: (options?: { min?: number; max?: number }) => {
    let schema = z.string().min(1, zodErrorMessages.required);
    
    if (options?.min) {
      schema = schema.min(options.min, zodErrorMessages.min(options.min));
    }
    
    if (options?.max) {
      schema = schema.max(options.max, zodErrorMessages.max(options.max));
    }
    
    return schema;
  },
  
  /**
   * Campo de email com validação
   */
  email: () => {
    return z.string().email(zodErrorMessages.email);
  },
  
  /**
   * Data com validação de data mínima
   */
  date: (options?: { minDate?: Date }) => {
    let schema = z.string().refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: zodErrorMessages.invalid });
    
    if (options?.minDate) {
      schema = schema.refine(val => {
        const date = new Date(val);
        return date >= options.minDate!;
      }, { message: zodErrorMessages.minDate });
    }
    
    return schema;
  },
  
  /**
   * Número com validações
   */
  number: (options?: { min?: number; max?: number }) => {
    let schema = z.number();
    
    if (options?.min !== undefined) {
      schema = schema.min(options.min);
    }
    
    if (options?.max !== undefined) {
      schema = schema.max(options.max);
    }
    
    return schema;
  },
};

/**
 * Hook personalizado para gerenciar o estado de um formulário de pesquisa com debounce
 * @param initialValues Valores iniciais do formulário
 * @param delay Tempo de delay para o debounce em milissegundos
 * @returns Estado e manipuladores do formulário
 */
export function useSearchForm<T extends Record<string, any>>(
  initialValues: T,
  delay: number = 500
) {
  const [values, setValues] = useState<T>(initialValues);
  const [debouncedValues, setDebouncedValues] = useState<T>(initialValues);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Atualiza os valores com debounce
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedValues(values);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [values, delay]);

  // Manipulador de mudança de campo
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    
    // Converte valor para checkbox
    if (type === 'checkbox' && 'checked' in e.target) {
      newValue = (e.target as HTMLInputElement).checked;
    }
    
    // Converte valor para número
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    
    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Manipulador para alteração programática
  const setValue = (name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Função para redefinir o formulário
  const reset = () => {
    setValues(initialValues);
    setDebouncedValues(initialValues);
  };

  return {
    values,
    debouncedValues,
    isDebouncing,
    handleChange,
    setValue,
    reset,
  };
}