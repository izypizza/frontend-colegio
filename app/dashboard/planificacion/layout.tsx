"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { UserRole } from "@/src/types";

interface Pestana {
  href: string;
  etiqueta: string;
  detalle: string;
  roles: UserRole[];
}

const PESTANAS: Pestana[] = [
  {
    href: "/dashboard/planificacion/carga",
    etiqueta: "Carga académica",
    detalle: "Quién dicta cada curso",
    roles: [UserRole.ADMIN],
  },
  {
    href: "/dashboard/planificacion/horario",
    etiqueta: "Horario",
    detalle: "Cuándo se dicta cada curso",
    roles: [
      UserRole.ADMIN,
      UserRole.AUXILIAR,
      UserRole.DOCENTE,
      UserRole.ESTUDIANTE,
    ],
  },
];

export default function PlanificacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const pestanasVisibles = PESTANAS.filter(
    (pestana) => !user || pestana.roles.includes(user.role),
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Planificación</h1>
        <p className="text-gray-600 mt-1">
          {pestanasVisibles.length > 1
            ? "La carga académica y el horario en un mismo lugar."
            : "Consulta y gestión de horarios del colegio."}
        </p>
      </div>

      {pestanasVisibles.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Secciones de planificación"
        >
          {pestanasVisibles.map((pestana) => {
            const activa = pathname?.startsWith(pestana.href);

            return (
              <Link
                key={pestana.href}
                href={pestana.href}
                role="tab"
                aria-selected={activa}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  activa
                    ? "bg-[#04ADBF] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pestana.etiqueta}
                <span
                  className={`block text-xs font-normal ${
                    activa ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {pestana.detalle}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}
