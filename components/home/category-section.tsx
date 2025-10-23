'use client';

import * as React from 'react';
import Link from 'next/link';

import type { Category } from '@/lib/data';
import { Button } from '@/components/ui/button';

type CategorySectionProps = {
  categories: Category[];
};

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="category-heading">
      <div className="space-y-2">
        <h2 id="category-heading" className="text-2xl font-semibold tracking-tight">
          Navegue por categorias
        </h2>
        <p className="text-muted-foreground">Escolha um tema para ver perguntas frequentes sobre cada assunto.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            type="button"
            variant="outline"
            asChild
            className="flex h-auto flex-col items-start gap-3 rounded-2xl border border-border/70 bg-card px-4 py-5 text-left shadow-sm transition hover:border-primary/60 hover:shadow-md"
          >
            <Link href={`/categories/${category.slug}`} className="flex h-full w-full flex-col items-start gap-3">
              <span className="text-2xl">{category.icon}</span>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <span className="text-sm font-medium text-primary underline-offset-2 hover:underline">
                Abrir página da categoria
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
