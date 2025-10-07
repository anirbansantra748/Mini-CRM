import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { ProjectCreateInput, ProjectUpdateInput, ProjectQueryInput } from '@shared/schemas/project';

export function useLogin() {
  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user as { id: string; email: string; role: 'ADMIN' | 'MEMBER' };
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    qc.clear();
    window.location.href = '/login';
  };
}

export function useMe() {
  const user = localStorage.getItem('user');
  return user ? (JSON.parse(user) as { id: string; email: string; role: 'ADMIN' | 'MEMBER'; name?: string; company?: string }) : null;
}

export function useProfile() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/me');
      return data as { id: string; email: string; role: 'ADMIN' | 'MEMBER'; name: string; company: string };
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name?: string; company?: string }) => {
      const { data } = await api.patch('/me', values);
      return data as { id: string; email: string; role: 'ADMIN' | 'MEMBER'; name: string; company: string };
    },
    onSuccess: (data) => {
      const local = localStorage.getItem('user');
      if (local) {
        const parsed = JSON.parse(local);
        localStorage.setItem('user', JSON.stringify({ ...parsed, name: data.name, company: data.company }));
      }
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export type Project = {
  _id: string;
  title: string;
  client: string;
  budget: number;
  status: 'LEAD' | 'IN_PROGRESS' | 'ON_HOLD' | 'DONE';
  ownerId: string;
  members?: string[];
  createdAt: string;
  updatedAt: string;
};

export function useProjects(params: ProjectQueryInput) {
  return useQuery<{ items: Project[]; total: number; page: number; size: number }>({
    queryKey: ['projects', params],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params });
      return data as { items: Project[]; total: number; page: number; size: number };
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProjectCreateInput) => {
      const { data } = await api.post('/projects', values);
      return data as Project;
    },
    onMutate: async (values) => {
      // Optimistic update: add temp item to first page cache
      await qc.cancelQueries({ queryKey: ['projects'] });
      const prev = qc.getQueriesData<{ items: Project[]; total: number }>({ queryKey: ['projects'] });
      prev.forEach(([key, value]) => {
        if (!value) return;
        const temp: Project = {
          _id: 'temp_' + Math.random().toString(36).slice(2),
          title: values.title,
          client: values.client,
          budget: values.budget,
          status: values.status ?? 'LEAD',
          ownerId: 'me',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        qc.setQueryData(key as any, { ...value, items: [temp, ...value.items], total: value.total + 1 });
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev.forEach(([key, value]) => qc.setQueryData(key as any, value));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ProjectUpdateInput) => {
      const { data } = await api.patch(`/projects/${id}`, values);
      return data as Project;
    },
    onMutate: async (values) => {
      await qc.cancelQueries({ queryKey: ['projects'] });
      const prev = qc.getQueriesData<{ items: Project[] }>({ queryKey: ['projects'] });
      prev.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData(key as any, {
          ...value,
          items: value.items.map((p) => (p._id === id ? { ...p, ...values, updatedAt: new Date().toISOString() } : p)),
        });
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => ctx?.prev.forEach(([key, value]) => qc.setQueryData(key as any, value)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export type User = { id: string; _id?: string; email: string; role: 'ADMIN' | 'MEMBER' };
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data as { items: User[] };
    },
  });
}
export function useUpdateUserRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (role: 'ADMIN' | 'MEMBER') => {
      const { data } = await api.patch(`/users/${id}/role`, { role });
      return data as User;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useSetProjectMembers(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberIds: string[]) => {
      const { data } = await api.patch(`/projects/${id}/members`, { memberIds });
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
