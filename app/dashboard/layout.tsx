'use client';

import { DashboardLayout } from '@/src/components/layout';
import { ROUTES } from '@/src/config/constants';
import { AuthProvider, useAuth, useRequireAuth } from '@/src/features/auth';
import { useRouter } from 'next/navigation';

function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { loading } = useRequireAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(ROUTES.LOGIN);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userName={user?.name} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </AuthProvider>
  );
}
