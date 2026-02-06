import { cn } from '@/utils/cn';

export default function PageContentCard({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm',
        props.className,
      )}
    >
      <div className="h-full px-6 py-4">{children}</div>
    </div>
  );
}
