'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

export type FaqItem = {
  question: string;
  category: string;
};

type FaqSectionProps = {
  title: string;
  subtitle?: string;
  items: FaqItem[];
  onQuestionSelect: (question: string) => void;
};

export function FaqSection({ title, subtitle, items, onQuestionSelect }: FaqSectionProps) {
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
          {items.map(({ question }) => (
            <Button
              key={question}
              type="button"
              variant="outline"
              onClick={() => onQuestionSelect(question)}
              className="justify-start rounded-2xl border border-border/70 bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:border-primary/60 hover:shadow-md"
            >
              {question}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
      )}
    </section>
  );
}
