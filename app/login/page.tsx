'use client';

import React from 'react';
import { LoginForm } from '@/app/components/auth/LoginForm';
import { useRedirectIfAuth } from '@/app/hooks/useAuth';

export default function LoginPage() {
  const { loading } = useRedirectIfAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}
