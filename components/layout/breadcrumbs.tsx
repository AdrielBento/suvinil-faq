import Link from 'next/link';
import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Navegação por trilha" className={cn('w-full', className)}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${index}`;

          return (
            <li key={key} className="flex items-center gap-2">
              {index > 0 ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 font-medium text-foreground"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
