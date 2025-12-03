'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Card, Button, Input, Alert } from '@/app/components/common';
import { validateLoginForm } from '@/app/utils/validation';
import { ROUTES } from '@/app/constants';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    // Validate form
    const validationErrors = validateLoginForm(formData.email, formData.password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(formData);
      setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
          <p className="text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-4" />
        )}

        {authError && (
          <Alert 
            type="error" 
            title="Error en el inicio de sesión"
            message={authError}
            className="mb-4"
            onClose={() => {}}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            type="password"
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Olvidaste tu contraseña? <a href="#" className="text-blue-600 hover:underline">Recupérala aquí</a>
        </div>

        <div className="mt-4 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          Usa las credenciales de demostración para probar
        </div>
      </Card>
    </div>
  );
};
