import type { ReactNode } from 'react';
import type { Page, FilterState } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  children: ReactNode;
}

export function DashboardLayout({
  activePage,
  onNavigate,
  filters,
  onFiltersChange,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header filters={filters} onFiltersChange={onFiltersChange} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
