'use client';

import * as React from 'react';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type HeroSectionProps = {
  quickSearches: readonly string[];
  onQuickSearch: (value: string) => void;
};

const heroImage =
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop';

export function HeroSection({ quickSearches, onQuickSearch }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-md">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-primary/10 via-transparent to-primary/30" />
      <div className="relative grid gap-8 p-8 md:grid-cols-[1fr,320px] md:items-center">
        <div className="space-y-6">
          <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
            Como podemos ajudar?
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Tire dúvidas sobre produtos, aplicação e cores da Suvinil
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Pesquise por palavras-chave, navegue por categorias ou converse diretamente com nosso assistente virtual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Sugestões rápidas">
            {quickSearches.map((item) => (
              <Button key={item} type="button" variant="secondary" className="rounded-full" onClick={() => onQuickSearch(item)}>
                {item}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative hidden h-64 overflow-hidden rounded-2xl border border-border/60 bg-muted/40 md:block">
          <Image
            src={heroImage}
            alt="Pessoa pintando parede com rolo"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>
    </section>
  );
}
