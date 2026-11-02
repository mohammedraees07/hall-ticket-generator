import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden w-full max-w-full transition-colors duration-150">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full min-w-0 mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
