'use client';

import { PaperclipIcon } from '@phosphor-icons/react';

export function CardDetail({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="shadow-base rounded-lg border bg-card text-card-foreground">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-bold leading-none tracking-tight">
            {title}
          </h3>

          {action}
        </div>
      </div>
      <div className="px-6">
        <dl className="divide-y divide-gray-100">{children}</dl>
      </div>
    </div>
  );
}

function List({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm/6 font-medium text-gray-900">{title}</dt>
      <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
        {children}
      </dd>
    </div>
  );
}

function Attachments({ children }: { children: React.ReactNode }) {
  return (
    <ul
      role="list"
      className="divide-y divide-gray-200 rounded-md border border-gray-200!"
    >
      {children}
    </ul>
  );
}

function AttachmentItem({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm/6">
      <div className="flex w-0 flex-1 items-center">
        <PaperclipIcon
          aria-hidden="true"
          className="size-3.5 shrink-0 text-gray-400"
        />
        <div className="ml-4 flex min-w-0 flex-1 gap-2">
          <span className="truncate font-medium">{title}</span>
          <span className="shrink-0 text-gray-400">{description}</span>
        </div>
      </div>
      {actions && <div className="ml-4 shrink-0">{actions}</div>}
    </li>
  );
}

CardDetail.List = List;
CardDetail.Attachments = Attachments;
CardDetail.AttachmentItem = AttachmentItem;
