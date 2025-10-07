import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useProfile, useUpdateProfile } from '../api/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Settings() {
  const { data } = useProfile();
  const update = useUpdateProfile();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  useEffect(() => {
    if (data) { setName(data.name || ''); setCompany(data.company || ''); }
  }, [data]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => update.mutate({ name, company }, { onSuccess: () => toast.success('Profile saved') })}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
