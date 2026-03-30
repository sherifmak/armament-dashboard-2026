import type { DailyTrackingEntry } from '../types';
import { DataTable } from '../components/tables/DataTable';

interface TablePageProps {
  data: DailyTrackingEntry[];
}

export function TablePage({ data }: TablePageProps) {
  return (
    <div className="space-y-5">
      <h2 className="font-mono text-lg font-bold text-dashboard-text">DATA TABLE</h2>
      <DataTable data={data} />
    </div>
  );
}
