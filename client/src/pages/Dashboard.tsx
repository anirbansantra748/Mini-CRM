import { useProjects } from '../api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';

export default function Dashboard() {
  const { data, isLoading } = useProjects({ q: '', status: '' as any, page: 1, size: 10 });
  const typed = data as { items: any[]; total: number; page: number; size: number } | undefined;
  const total = typed?.total || 0;
  const done = typed?.items.filter(i => i.status === 'DONE').length || 0;
  const inProgress = typed?.items.filter(i => i.status === 'IN_PROGRESS').length || 0;
  const lead = typed?.items.filter(i => i.status === 'LEAD').length || 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Projects" value={isLoading ? null : total} />
        <StatCard title="Done" value={isLoading ? null : done} />
        <StatCard title="In Progress" value={isLoading ? null : inProgress} />
        <StatCard title="Leads" value={isLoading ? null : lead} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | null }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader>
      <CardContent>
        {value === null ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-semibold">{value}</div>}
      </CardContent>
    </Card>
  );
}
