"use client";

import { DashboardLayout } from "@/src/components/layout";
import { Assistant } from "@/src/components/ui/Assistant";
import { ROUTES } from "@/src/config/constants";
import { AuthProvider, useAuth, useRequireAuth } from "@/src/features/auth";
import { ThemeProvider } from "@/src/contexts/ThemeContext";
import { useAssistantPreference } from "@/src/hooks/useAssistantPreference";
import { useRouter } from "next/navigation";
import "@/src/components/ui/shepherd-styles.css";

function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { loading } = useRequireAuth();
  const router = useRouter();
  const { assistantEnabled, isLoaded } = useAssistantPreference();

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
      {isLoaded && assistantEnabled && (
        <Assistant tourName="completo" enabled={true} />
      )}
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
      <ThemeProvider>
        <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}
