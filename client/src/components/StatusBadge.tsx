import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Badge } from './ui/badge';
dayjs.extend(relativeTime);

export default function StatusBadge({ status, updatedAt }: { status: string; updatedAt?: string }) {
  const color =
    status === 'DONE' ? 'bg-green-100 text-green-800 border-green-200' :
    status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200' :
    status === 'ON_HOLD' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    'bg-gray-100 text-gray-800 border-gray-200';
  const label = status.replace('_',' ');
  return (
    <div className="flex items-center gap-2">
      <Badge className={`whitespace-nowrap ${color}`}>{label}</Badge>
      {updatedAt && <span className="text-xs text-muted-foreground">{dayjs(updatedAt).fromNow()}</span>}
    </div>
  );
}
