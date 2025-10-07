import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject, useProjects, useUpdateProject } from '../api/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './partials/Tabs';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import { useMe, useSetProjectMembers, useUsers } from '../api/hooks';
import { Button as UIButton } from '../components/ui/button';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProjects({ q: '', status: '' as any, page: 1, size: 100 });
  const typed = data as { items: any[]; total: number; page: number; size: number } | undefined;
  const project = useMemo(() => typed?.items.find((p: any) => p._id === id), [typed, id]);
  const update = useUpdateProject(id || '');
  const setMembers = useSetProjectMembers(id || '');
  const del = useDeleteProject();
  const { data: usersData } = useUsers();
  const users = usersData?.items || [];
  const me = useMe();

  const [title, setTitle] = useState(project?.title || '');
  const [client, setClient] = useState(project?.client || '');
  const [budget, setBudget] = useState(project?.budget || 0);
  const [status, setStatus] = useState(project?.status || 'LEAD');

  if (isLoading) return <div className="space-y-3"><SkeletonLine /><SkeletonLine /><SkeletonLine /></div>;
  if (!project) return <div className="text-sm text-muted-foreground">Project not found.</div>;

  const isOwner = project.ownerId === (me as any)?.id || project.ownerId === (me as any)?._id;
  const isAdmin = me?.role === 'ADMIN';
  const isAssigned = (project.members || []).includes(((me as any)?.id || (me as any)?._id));
  const fieldsDisabled = !isAdmin && !isOwner; // member (assigned or not) cannot edit fields

  function onSave() {
    const payload = fieldsDisabled ? { status } : { title, client, budget, status };
    update.mutate(payload as any, { onSuccess: () => toast.success('Saved') });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{project.title}</h1>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} disabled={fieldsDisabled} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={client} disabled={fieldsDisabled} onChange={(e) => setClient(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Budget</Label>
                <Input type="number" value={budget} disabled={fieldsDisabled} onChange={(e) => setBudget(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="LEAD">Lead</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-end gap-2">
            {isAdmin && (
              <Button variant="destructive" onClick={() => del.mutate(id!, { onSuccess: () => { toast.success('Project deleted'); navigate('/projects'); } })}>Delete</Button>
            )}
            <Button onClick={onSave}>Save changes</Button>
          </div>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Activity feed requires admin audit log access.</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader><CardTitle>Team</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(project.members || []).length === 0 && <div className="text-sm text-muted-foreground">No members assigned.</div>}
                <ul className="space-y-2">
                  {(project.members || []).map((m: any) => {
                    const id = (typeof m === 'string') ? m : (m._id || m.id);
                    const email = (typeof m === 'string') ? (users.find((x: any) => (x._id || x.id) === m)?.email) : (m.email);
                    return <li key={id} className="text-sm">{email || id}</li>;
                  })}
                </ul>
                {me?.role === 'ADMIN' && (
                  <MemberPicker allUsers={users} selected={project.members || []} onSave={(ids) => setMembers.mutate(ids, { onSuccess: () => toast.success('Members updated') })} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SkeletonLine() {
  return <div className="h-6 w-1/2 rounded bg-muted animate-pulse" />;
}

function MemberPicker({ allUsers, selected, onSave }: { allUsers: any[]; selected: string[]; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState<string[]>(selected);
  function toggle(id: string) {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  return (
    <div className="rounded-lg border p-3">
      <div className="text-sm font-medium mb-2">Assign members</div>
      <div className="max-h-56 overflow-auto space-y-2">
        {allUsers.map((u) => {
          const id = (u._id || u.id) as string;
          const active = ids.includes(id);
          return (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={active} onChange={() => toggle(id)} />
              <span>{u.email}</span>
              <span className="text-xs text-muted-foreground">({u.role})</span>
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex justify-end">
        <UIButton onClick={() => onSave(ids)}>Save members</UIButton>
      </div>
    </div>
  );
}
