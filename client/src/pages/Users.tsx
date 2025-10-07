import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useMe } from '../api/hooks';
import { useUsers, useUpdateUserRole } from '../api/hooks';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Users() {
  const me = useMe();
  const { data, isLoading } = useUsers();
  const items = data?.items || [];

  if (me?.role !== 'ADMIN') {
    return <div className="text-sm text-muted-foreground">You do not have permission to view users.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <Card>
        <CardHeader><CardTitle>Team</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <Skeleton className="h-10 w-full" />}
          {!isLoading && items.length === 0 && <div className="text-sm text-muted-foreground">No users</div>}
          {items.map((u) => (
            <UserRow key={u._id || u.id} id={(u._id || u.id)!} email={u.email} role={u.role} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRow({ id, email, role }: { id: string; email: string; role: 'ADMIN' | 'MEMBER' }) {
  const mutation = useUpdateUserRole(id);
  const nextRole = role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="text-sm font-medium">{email}</div>
        <div className="text-xs text-muted-foreground">ID: {id}</div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="uppercase text-xs">{role}</Badge>
        <Button variant="outline" onClick={() => mutation.mutate(nextRole, { onSuccess: () => toast.success('Role updated') })}>Make {nextRole}</Button>
      </div>
    </div>
  );
}
