import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjectCreateSchema, ProjectUpdateSchema, type ProjectCreateInput, type ProjectUpdateInput, StatusEnum } from '@shared/schemas/project';
import { useMe, useUsers } from '../api/hooks';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export type ProjectFormValues = ProjectCreateInput | ProjectUpdateInput;

export default function ProjectForm({ initial, onSubmit, statusOnly = false }: { initial?: Partial<ProjectFormValues & { _id?: string; members?: string[] }>; onSubmit: (v: any) => void; statusOnly?: boolean }) {
  const me = useMe();
  const isEdit = !!(initial as any)?._id;
  const schema = isEdit ? ProjectUpdateSchema : ProjectCreateSchema;
  const { data: usersData } = useUsers();
  const allUsers = usersData?.items || [];
  function toIds(arr: any[] = []) { return arr.map((m: any) => (typeof m === 'string' ? m : (m?._id || m?.id))).filter(Boolean); }
  const [members, setMembers] = useState<string[]>(toIds(((initial as any)?.members || []) as any[]));

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: initial as any,
  });

  useEffect(() => {
    reset(initial as any);
    setMembers(toIds(((initial as any)?.members || []) as any[]));
  }, [initial, reset]);

  const disableFields = statusOnly && !(me?.role === 'ADMIN');

  function onLocalSubmit(values: any) {
    const payload = { ...values };
    if (me?.role === 'ADMIN' && !statusOnly) (payload as any).members = members;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(onLocalSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input {...register('title' as any)} placeholder="Project title" disabled={disableFields} />
          {errors.title && <p className="text-red-600 text-xs">{String(errors.title.message)}</p>}
        </div>
        <div className="space-y-2">
          <Label>Client</Label>
          <Input {...register('client' as any)} placeholder="Client name" disabled={disableFields} />
          {errors.client && <p className="text-red-600 text-xs">{String(errors.client.message)}</p>}
        </div>
        <div className="space-y-2">
          <Label>Budget</Label>
          <Input type="number" {...register('budget' as any, { valueAsNumber: true })} placeholder="e.g. 12000" disabled={disableFields} />
          {errors.budget && <p className="text-red-600 text-xs">{String(errors.budget.message)}</p>}
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status' as any)}>
            {StatusEnum.options.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {me?.role === 'ADMIN' && !statusOnly && (
        <div className="space-y-2">
          <Label>Members</Label>
          <div className="max-h-48 overflow-auto rounded-md border p-3 bg-muted/30 space-y-2">
            {allUsers.map((u: any) => {
              const id = (u._id || u.id) as string;
              const active = members.includes(id);
              return (
                <label key={id} className="flex items-center justify-between gap-3 rounded-md bg-background px-2 py-1 hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4" checked={active} onChange={() => setMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])} />
                    <span className="text-sm">{u.email}</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{u.role}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
