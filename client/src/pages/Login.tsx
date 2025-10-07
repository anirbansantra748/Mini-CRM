import { useState } from 'react';
import { useLogin } from '../api/hooks';
import { api } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Login() {
  const { mutateAsync, isPending, error } = useLogin();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin@123');
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isSignup) {
        await api.post('/auth/signup', { email, password, role });
        await mutateAsync({ email, password });
        toast.success('Account created. Welcome!');
      } else {
        await mutateAsync({ email, password });
        toast.success('Welcome back');
      }
      window.location.href = '/';
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Authentication failed');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? 'Create account' : 'Sign in'}</CardTitle>
          <p className="text-sm text-muted-foreground">Mini CRM</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
            </div>
            {isSignup && (
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value as any)}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}
            {error && <p className="text-sm text-destructive">Invalid credentials</p>}
            <Button disabled={isPending} type="submit" className="w-full">{isSignup ? 'Sign up and login' : 'Login'}</Button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>Try member: member@demo.com / Member@123</p>
              <button type="button" className="underline" onClick={() => setIsSignup(s => !s)}>
                {isSignup ? 'Have an account? Sign in' : 'New here? Create account'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
