import { CardHeader, CardTitle } from '../ui/card';

export default function PageContent({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const showTitle = title || actions;
  return (
    <>
      {showTitle && (
        <div className="grid gap-3 md:flex md:items-center md:justify-between">
          <CardHeader className="mb-1 mt-2 space-y-0 p-0">
            <CardTitle>{title}</CardTitle>
            {/* <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription> */}
          </CardHeader>
          <div>
            <div className="inline-flex gap-x-2">{actions}</div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
