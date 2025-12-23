'use client';

import { Alert, Button, Card, Input } from '@/src/components/ui';
import { ROUTES } from '@/src/config/constants';
import { validateLoginForm } from '@/src/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');

    const validationErrors = validateLoginForm(formData.email, formData.password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await login(formData);
      setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md" shadow="xl">
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
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
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
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} fullWidth>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Olvidaste tu contraseña?{' '}
          <a href="#" className="text-blue-600 hover:underline font-semibold">
            Recupérala aquí
          </a>
        </div>

        <div className="mt-4 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-semibold">Credenciales de prueba:</p>
            <p>Admin: admin@colegio.pe / password</p>
            <p>Docente: docente@colegio.pe / password</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
