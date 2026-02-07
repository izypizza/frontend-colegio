export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};

export const validateLoginForm = (
  email: string,
  password: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!validateEmail(email)) {
    errors.email = 'Email inválido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else {
    const passwordError = validatePassword(password);
    if (passwordError) {
      errors.password = passwordError;
    }
  }

  return errors;
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Re-exportar funciones de api-helpers para mantener compatibilidad
export { normalizePaginatedResponse, isPaginatedResponse, extractData } from './api-helpers';
