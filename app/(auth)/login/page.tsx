'use client';

import { AuthProvider, LoginForm, useRedirectIfAuth } from '@/src/features/auth';

function LoginContent() {
  const { loading } = useRedirectIfAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2F0CE] to-[#FEFCD6]">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-12 h-12 border-4 border-[#04ADBF] border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
