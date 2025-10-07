import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from './button';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogOverlay = AlertDialogPrimitive.Overlay;
export const AlertDialogContent = AlertDialogPrimitive.Content;
export const AlertDialogHeader = (props: React.HTMLAttributes<HTMLDivElement>) => <div className="space-y-2" {...props} />;
export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;
export const AlertDialogCancel = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <Button variant="outline" {...props} />;
export const AlertDialogAction = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <Button variant="destructive" {...props} />;