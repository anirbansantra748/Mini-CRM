import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

function DiffList({ diff }: { diff: Record<string, any> }) {
  const entries = Object.entries(diff || {});
  if (entries.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  function renderValue(val: any) {
    if (Array.isArray(val)) return `[${val.length}]`;
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return String(val);
  }

  function arrayDelta(from: any[], to: any[]) {
    const a = new Set((from || []).map(String));
    const b = new Set((to || []).map(String));
    const added: string[] = [];
    const removed: string[] = [];
    for (const x of b) if (!a.has(x)) added.push(x);
    for (const x of a) if (!b.has(x)) removed.push(x);
    return { added, removed };
  }

  return (
    <ul className="space-y-1 text-xs">
      {entries.map(([k, v]) => {
        const from = v?.from;
        const to = v?.to;
        const isArray = Array.isArray(from) || Array.isArray(to);
        return (
          <li key={k} className="flex items-start gap-2">
            <Badge className="border-gray-200 bg-gray-100 text-gray-800 mt-0.5">{k}</Badge>
            {!isArray ? (
              <div className="flex items-center gap-1">
                <span className="line-through text-muted-foreground">{renderValue(from)}</span>
                <span>→</span>
                <span>{renderValue(to)}</span>
              </div>
            ) : (
              <div className="space-x-2">
                <span className="text-muted-foreground">{`from: [${(from || []).length}]`}</span>
                <span>{`to: [${(to || []).length}]`}</span>
                {Array.isArray(from) && Array.isArray(to) && (() => {
                  const { added, removed } = arrayDelta(from, to);
                  return (
                    <span className="ml-2">
                      {added.length > 0 && <Badge className="bg-green-100 text-green-800 border-green-200 mr-1">+{added.length}</Badge>}
                      {removed.length > 0 && <Badge className="bg-red-100 text-red-800 border-red-200">-{removed.length}</Badge>}
                    </span>
                  );
                })()}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function AuditLog() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit'],
    queryFn: async () => {
      const { data } = await api.get('/audit');
      return data as { items: any[] };
    }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Audit Log</h1>
      <Card>
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5}><Skeleton className="h-6 w-1/2 m-4" /></TableCell></TableRow>
              )}
              {!isLoading && data?.items?.length === 0 && (
                <TableRow><TableCell colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No logs</TableCell></TableRow>
              )}
              {data?.items?.map((l) => (
                <TableRow key={l._id}>
                  <TableCell className="font-medium"><Badge className={l.action === 'delete' ? 'bg-red-100 text-red-800 border-red-200' : l.action === 'update' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'}>{l.action}</Badge></TableCell>
                  <TableCell className="text-xs">{l.userId?.email} ({l.userId?.role})</TableCell>
                  <TableCell className="text-xs">{l.projectId?.title || l.projectId}</TableCell>
                  <TableCell className="text-xs">{new Date(l.at).toLocaleString()}</TableCell>
                  <TableCell><DiffList diff={l.diff} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
