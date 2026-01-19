"use client";

import { ROUTES } from "@/src/config/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./useAuth";

export const useRedirectIfAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // No redirigir si venimos de maintenance
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/login"
    ) {
      const fromMaintenance = document.referrer.includes("/maintenance");
      if (fromMaintenance) {
        return;
      }
    }

    if (!loading && isAuthenticated) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, loading, router]);

  return { loading };
};

export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, loading, router]);

  return { loading, isAuthenticated };
};
