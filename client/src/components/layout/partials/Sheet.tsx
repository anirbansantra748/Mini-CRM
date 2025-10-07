import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '../../../lib/utils';

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

export function SheetContent({ className, side = 'right', ...props }: any) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <SheetPrimitive.Content className={cn('fixed z-50 bg-card p-6 shadow-lg border', side === 'left' ? 'left-0 top-0 h-full w-80' : 'right-0 top-0 h-full w-80', className)} {...props} />
    </SheetPrimitive.Portal>
  );
}
