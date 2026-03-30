import type { Page } from '../../types';

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: 'overview', label: 'Overview', icon: '\u{1F4CA}' },
  { page: 'timeline', label: 'Timeline', icon: '\u{1F4C8}' },
  { page: 'compare', label: 'Compare', icon: '\u{1F504}' },
  { page: 'table', label: 'Data Table', icon: '\u{1F4CB}' },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-52 bg-dashboard-surface border-r border-dashboard-border flex flex-col shrink-0">
      <div className="p-4 border-b border-dashboard-border">
        <h1 className="font-mono font-bold text-sm text-dashboard-accent tracking-wider uppercase">
          ARMAMENT TRACKER
        </h1>
        <p className="text-[10px] text-dashboard-muted mt-1 font-mono">
          2026 IRAN WAR
        </p>
      </div>
      <nav className="flex-1 p-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full text-left px-3 py-2.5 rounded-md text-sm mb-1 flex items-center gap-2.5 transition-colors ${
              activePage === item.page
                ? 'bg-dashboard-accent/10 text-dashboard-accent border border-dashboard-accent/20'
                : 'text-dashboard-muted hover:text-dashboard-text hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-dashboard-border">
        <p className="text-[10px] text-dashboard-muted font-mono leading-relaxed">
          OPS: EPIC FURY / ROARING LION
        </p>
        <p className="text-[10px] text-dashboard-muted font-mono">
          DATA: MULTI-SOURCE RECONCILED
        </p>
      </div>
    </aside>
  );
}
