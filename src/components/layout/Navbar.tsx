"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { UserRole } from "@/src/types";

interface NavbarProps {
  onMenuClick: () => void;
  userName?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  userName,
  onLogout,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <header className="bg-gradient-to-r from-[#04ADBF] to-[#038a9a] shadow-lg sticky top-0 z-10">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 md:py-4">
        {/* Left side - Menu button + Title mobile */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors text-white flex-shrink-0"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Title for mobile */}
          <div className="lg:hidden flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate">
              I.E. N° 51006 Túpac Amaru
            </h1>
          </div>

          {/* Title for desktop */}
          <div className="hidden lg:block">
            <h1 className="text-lg xl:text-xl font-bold text-white">
              I.E. N° 51006 Túpac Amaru
            </h1>
            <p className="text-xs text-white/80">Sistema de Gestión Escolar</p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings button - Solo para admin */}
          {isAdmin && (
            <Link
              href="/dashboard/configuraciones"
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              title="Configuración del sistema"
              aria-label="Configuración del sistema"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
          )}

          {/* User info and logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block text-right max-w-[150px] lg:max-w-none">
              <p className="text-xs lg:text-sm font-semibold text-white truncate">
                {userName || "Usuario"}
              </p>
              <p className="text-[10px] lg:text-xs text-white/80 truncate">
                Panel de Control
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg bg-[#F22727] text-white hover:bg-[#c91f1f] transition-colors text-sm"
              aria-label="Cerrar sesión"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline text-xs sm:text-sm">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
