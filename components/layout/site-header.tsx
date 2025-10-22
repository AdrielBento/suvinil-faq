'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { ArrowLeft, MessageCircle, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SiteHeaderProps = {
  variant?: 'home' | 'chat';
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearchSubmit?: (event?: React.FormEvent<HTMLFormElement>) => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
  onPrimaryAction: () => void;
  className?: string;
};

export function SiteHeader({
  variant = 'home',
  searchTerm = '',
  onSearchTermChange,
  onSearchSubmit,
  searchInputRef,
  onPrimaryAction,
  className
}: SiteHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const handleToggleTheme = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const showSearch = variant === 'home';

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur', className)}>
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground shadow">
            S
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Suvinil</p>
            <p className="text-base font-semibold leading-tight">Central de Ajuda</p>
          </div>
        </div>

        {showSearch ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearchSubmit?.(event);
            }}
            className="flex w-full flex-col gap-2 md:max-w-xl md:flex-row"
          >
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(event) => onSearchTermChange?.(event.target.value)}
              placeholder="Digite sua dúvida…"
              aria-label="Pesquisar artigos"
              type="search"
            />
            <Button type="submit" className="whitespace-nowrap">
              Pesquisar
            </Button>
          </form>
        ) : null}

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            type="button"
            variant="ghost"
            className="w-full gap-2 rounded-full border border-transparent px-3 py-2 text-sm md:w-auto"
            onClick={handleToggleTheme}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>Tema</span>
          </Button>
          <Button
            type="button"
            onClick={onPrimaryAction}
            className="w-full gap-2 rounded-full px-4 py-2 text-sm md:w-auto"
          >
            {variant === 'home' ? (
              <>
                <MessageCircle className="h-4 w-4" />
                <span>Ir para o chat</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Central de ajuda</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
