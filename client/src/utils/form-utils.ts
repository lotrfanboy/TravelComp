/**
 * Utilitários para manipulação de formulários
 */
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

/**
 * Cria um validador para formulários com mensagens de erro em português
 * @param schema Schema zod para validação
 * @returns Resolver para usar com useForm
 */
export const createFormResolver = <T extends z.ZodType>(schema: T) => {
  return zodResolver(schema);
};

/**
 * Função helper para mapear erros de formulário em um formato mais amigável
 * @param form Objeto do formulário retornado pelo useForm
 * @returns Objeto com chaves de campo e mensagens de erro
 */
export const getFormErrors = <T extends FieldValues>(
  form: UseFormReturn<T>
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  const { errors } = form.formState;
  
  Object.keys(errors).forEach((field) => {
    if (errors[field]?.message) {
      result[field] = errors[field]?.message as string;
    }
  });
  
  return result;
};

/**
 * Hook para obter regras de validação comuns com mensagens traduzidas
 */
export const useValidationRules = () => {
  const { t } = useTranslation();
  
  return {
    /**
     * Regra para campos obrigatórios
     * @param fieldName Nome do campo (opcional)
     * @returns Validação required
     */
    required: (fieldName?: string) => {
      const message = fieldName 
        ? t("O campo {{field}} é obrigatório", { field: fieldName })
        : t("Este campo é obrigatório");
        
      return {
        required: {
          value: true, 
          message
        }
      };
    },
    
    /**
     * Regra para validação de email
     * @returns Validação de email
     */
    email: () => ({
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: t("Email inválido")
      }
    }),
    
    /**
     * Regra para comprimento mínimo
     * @param length Comprimento mínimo
     * @param fieldName Nome do campo (opcional)
     * @returns Validação de minLength
     */
    minLength: (length: number, fieldName?: string) => {
      const message = fieldName 
        ? t("{{field}} deve ter pelo menos {{length}} caracteres", { field: fieldName, length })
        : t("Este campo deve ter pelo menos {{length}} caracteres", { length });
        
      return {
        minLength: {
          value: length,
          message
        }
      };
    },
    
    /**
     * Regra para valor mínimo
     * @param min Valor mínimo
     * @returns Validação de min
     */
    min: (min: number) => ({
      min: {
        value: min,
        message: t("O valor deve ser maior ou igual a {{min}}", { min })
      }
    }),
    
    /**
     * Regra para valor máximo
     * @param max Valor máximo
     * @returns Validação de max
     */
    max: (max: number) => ({
      max: {
        value: max,
        message: t("O valor deve ser menor ou igual a {{max}}", { max })
      }
    })
  };
};

/**
 * Cria um schema Zod para validação de datas
 * @param errorMessage Mensagem de erro customizada
 * @returns Schema de validação Zod para datas
 */
export const createDateSchema = (errorMessage?: string) => {
  return z.string()
    .refine((value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    }, {
      message: errorMessage || "Data inválida"
    });
};

/**
 * Regra para validação de datas no passado
 * @param fieldName Nome do campo para mensagem de erro
 * @returns Validação para datas no passado
 */
export const dateNotInPast = (fieldName?: string) => {
  return (value: string) => {
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isValid = !isNaN(date.getTime()) && date >= today;
    
    return isValid || (fieldName 
      ? `${fieldName} não pode ser uma data no passado`
      : "A data não pode ser no passado");
  };
};

/**
 * Função para criar schema Zod para validação de moeda
 * @param errorMessage Mensagem de erro personalizada
 * @returns Schema Zod para validação de moeda
 */
export const createCurrencySchema = (errorMessage?: string) => {
  return z.string()
    .transform((val) => val.replace(/[^\d.,]/g, "").replace(",", "."))
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: errorMessage || "Valor monetário inválido"
    });
};