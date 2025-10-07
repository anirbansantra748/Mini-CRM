import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Download, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useCreateProject, useUpdateProject, useDeleteProject, useSetProjectMembers, useMe, useProjects, type Project } from '../api/hooks';
import ProjectForm from '../components/ProjectForm';
import StatusBadge from '../components/StatusBadge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Skeleton } from '../components/ui/skeleton';

function downloadCSV(rows: any[], filename: string) {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Projects() {
  const me = useMe();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const size = 10;
  const { data, isLoading } = useProjects({ q, status: status as any, page, size });
  const typed = data as { items: Project[]; total: number; page: number; size: number } | undefined;

  const [editing, setEditing] = useState<Project | null>(null);
  const create = useCreateProject();
  const update = useUpdateProject(editing?._id || '');
  const setProjectMembers = useSetProjectMembers(editing?._id || '');
  const del = useDeleteProject();

  const canDelete = me?.role === 'ADMIN';

  async function onSubmit(values: any) {
    if (editing) {
      const { members, ...rest } = values || {};
      try {
        // Update members first if provided (admin only)
        if (Array.isArray(members) && me?.role === 'ADMIN') {
          await setProjectMembers.mutateAsync(members);
        }
        await update.mutateAsync(rest);
        toast.success('Project updated');
        setEditing(null);
      } catch (e: any) {
        toast.error('Update failed');
      }
    } else {
      create.mutate(values as any, { onSuccess: () => { toast.success('Project created'); } });
    }
  }

  const exportRows = useMemo(() => (typed?.items || []).map(p => ({
    Title: p.title,
    Client: p.client,
    Budget: p.budget,
    Status: p.status,
    OwnerId: p.ownerId,
    UpdatedAt: p.updatedAt,
  })), [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 gap-2">
          <Input className="max-w-xs" placeholder="Search title or client..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <select className="h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All status</option>
            <option value="LEAD">Lead</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV(exportRows, 'projects.csv')}><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm onSubmit={onSubmit} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-6 w-1/4" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && typed?.items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="p-6 text-center text-sm text-muted-foreground">No projects found</div>
                  </TableCell>
                </TableRow>
              )}
              {typed?.items?.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium"><Link to={`/projects/${p._id}`} className="hover:underline inline-flex items-center gap-1">{p.title} <ExternalLink className="h-3 w-3" /></Link></TableCell>
                  <TableCell>{p.client}</TableCell>
                  <TableCell>${p.budget}</TableCell>
                  <TableCell><StatusBadge status={p.status} updatedAt={p.updatedAt} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{(p as any).ownerId?.email || String(p.ownerId).slice(0,6)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(me?.role === 'ADMIN' || (me as any)?.id === p.ownerId || (me as any)?._id === p.ownerId) && (
                        <Dialog onOpenChange={(o) => !o && setEditing(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" onClick={() => setEditing(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Project</DialogTitle>
                            </DialogHeader>
                            <ProjectForm
                              initial={editing || p}
                              statusOnly={me?.role !== 'ADMIN' && (p.ownerId !== (me as any)?.id && p.ownerId !== (me as any)?._id)}
                              onSubmit={onSubmit}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl border bg-card p-6">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete project?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="mt-4 flex justify-end gap-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => del.mutate(p._id, { onSuccess: () => toast.success('Project deleted') })}>Delete</AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Page {typed?.page || 1} / {Math.ceil((typed?.total || 0) / (typed?.size || size)) || 1}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={(typed?.page || 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" disabled={(typed?.page || 1) >= Math.ceil((typed?.total || 0) / (typed?.size || size))} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
