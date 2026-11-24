"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { UserRole } from "@/src/types";

export default function PlanificacionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user?.role === UserRole.ADMIN) {
      router.replace("/dashboard/planificacion/carga");
      return;
    }

    if (user?.role === UserRole.PADRE) {
      router.replace("/dashboard/padre/horarios");
      return;
    }

    router.replace("/dashboard/planificacion/horario");
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#04ADBF]" />
    </div>
  );
}
