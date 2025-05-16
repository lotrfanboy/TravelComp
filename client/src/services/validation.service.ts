/**
 * Serviço de validação centralizado
 * Contém funções para validação de dados em diferentes contextos
 */

// Validações relacionadas a viagens
export const tripValidations = {
  /**
   * Verifica se as datas de uma viagem são válidas
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Objeto com resultado da validação
   */
  validateTripDates: (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Remove time portion for date comparisons
    today.setHours(0, 0, 0, 0);
    
    const errors: string[] = [];
    
    if (isNaN(start.getTime())) {
      errors.push('A data de ida é inválida');
    }
    
    if (isNaN(end.getTime())) {
      errors.push('A data de volta é inválida');
    }
    
    if (start < today) {
      errors.push('A data de ida não pode ser anterior a hoje');
    }
    
    if (end < start) {
      errors.push('A data de volta não pode ser anterior à data de ida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Verifica se o orçamento é válido
   * @param budget Valor do orçamento
   * @returns Objeto com resultado da validação
   */
  validateBudget: (budget: string | number) => {
    const budgetValue = typeof budget === 'string' ? parseFloat(budget) : budget;
    
    if (isNaN(budgetValue) || budgetValue <= 0) {
      return {
        isValid: false,
        errors: ['O orçamento deve ser um valor positivo']
      };
    }
    
    return {
      isValid: true,
      errors: []
    };
  },
  
  /**
   * Verifica se os dados básicos da viagem estão preenchidos
   * @param data Dados da viagem
   * @returns Objeto com resultado da validação
   */
  validateBasicTripInfo: (data: {
    name?: string;
    destination?: string;
    startDate?: string | Date;
    endDate?: string | Date;
  }) => {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length < 3) {
      errors.push('Nome da viagem deve ter pelo menos 3 caracteres');
    }
    
    if (!data.destination || data.destination.trim().length === 0) {
      errors.push('Destino é obrigatório');
    }
    
    if (!data.startDate) {
      errors.push('Data de ida é obrigatória');
    }
    
    if (!data.endDate) {
      errors.push('Data de volta é obrigatória');
    }
    
    if (data.startDate && data.endDate) {
      const dateValidation = tripValidations.validateTripDates(
        data.startDate,
        data.endDate
      );
      
      errors.push(...dateValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Validações relacionadas a usuários
export const userValidations = {
  /**
   * Valida um endereço de email
   * @param email Email para validar
   * @returns Verdadeiro se o email for válido
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Verifica a força de uma senha
   * @param password Senha para validar
   * @returns Objeto com resultado da validação
   */
  validatePassword: (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: password.length >= 10 && errors.length === 0 ? 'strong' : 
                password.length >= 8 && errors.length <= 2 ? 'medium' : 'weak'
    };
  }
};

// Validações genéricas
export const commonValidations = {
  /**
   * Verifica se uma string não está vazia
   * @param value Valor para validar
   * @param fieldName Nome do campo para mensagem de erro
   * @returns Objeto com resultado da validação
   */
  isNotEmpty: (value: string, fieldName: string) => {
    const isValid = value !== undefined && value !== null && value.trim() !== '';
    
    return {
      isValid,
      error: isValid ? null : `${fieldName} é obrigatório`
    };
  },
  
  /**
   * Verifica comprimento mínimo de uma string
   * @param value Valor para validar
   * @param minLength Comprimento mínimo
   * @param fieldName Nome do campo para mensagem de erro
   * @returns Objeto com resultado da validação
   */
  minLength: (value: string, minLength: number, fieldName: string) => {
    const isValid = value && value.length >= minLength;
    
    return {
      isValid,
      error: isValid ? null : `${fieldName} deve ter pelo menos ${minLength} caracteres`
    };
  }
};