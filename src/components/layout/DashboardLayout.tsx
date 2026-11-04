"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userName,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          userName={userName}
          onLogout={onLogout}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 pb-28 sm:p-4 sm:pb-28 md:p-6 md:pb-28 lg:p-8 lg:pb-28">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
