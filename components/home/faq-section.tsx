'use client';

import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export type FaqItem = {
  question: string;
  href: string;
};

type FaqSectionProps = {
  title: string;
  subtitle?: string;
  items: FaqItem[];
};

export function FaqSection({ title, subtitle, items }: FaqSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="faq-heading">
      <div className="space-y-2">
        <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
      </div>
      {items.length ? (
        <div className="grid gap-3" role="list">
          {items.map(({ question, href }) => (
            <Button
              key={question}
              type="button"
              variant="outline"
              asChild
              className="justify-start rounded-2xl border border-border/70 bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:border-primary/60 hover:shadow-md"
            >
              <Link href={href}>{question}</Link>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
      )}
    </section>
  );
}
