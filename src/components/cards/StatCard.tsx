import { formatNumber, formatCost } from '../../utils/formatters';

interface StatCardProps {
  label: string;
  value: number;
  isCost?: boolean;
  color: string;
  subtitle?: string;
}

export function StatCard({ label, value, isCost, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4">
      <p className="text-xs text-dashboard-muted font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-mono font-bold" style={{ color }}>
        {isCost ? formatCost(value) : formatNumber(value)}
      </p>
      {subtitle && <p className="text-[11px] text-dashboard-muted mt-1">{subtitle}</p>}
    </div>
  );
}
