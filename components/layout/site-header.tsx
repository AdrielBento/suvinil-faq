'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowLeft, MessageCircle, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';

export type SiteHeaderProps = {
  variant?: 'default' | 'home' | 'chat';
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearchSubmit?: (event?: React.FormEvent<HTMLFormElement>) => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
  onPrimaryAction?: () => void;
  primaryActionHref?: string;
  className?: string;
};

export function SiteHeader({
  variant = 'default',
  searchTerm = '',
  onSearchTermChange,
  onSearchSubmit,
  searchInputRef,
  onPrimaryAction,
  primaryActionHref,
  className
}: SiteHeaderProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const pathname = usePathname();

  const handleToggleTheme = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  const showSearch = variant === 'home';
  const primaryLabel = variant === 'chat' ? 'Central de ajuda' : 'Ir para o chat';
  const primaryIcon = variant === 'chat' ? ArrowLeft : MessageCircle;
  const PrimaryIcon = primaryIcon;

  const handlePrimaryAction = React.useCallback(() => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    const fallbackHref = variant === 'chat' ? '/' : '/chat';
    const href = primaryActionHref ?? fallbackHref;
    router.push(href);
  }, [onPrimaryAction, primaryActionHref, router, variant]);

  const activeCategorySlug = React.useMemo(() => {
    if (!pathname) {
      return null;
    }

    if (pathname.startsWith('/categories/')) {
      const [, , slug] = pathname.split('/');
      return slug ?? null;
    }

    if (pathname.startsWith('/questions/')) {
      const [, , slug] = pathname.split('/');
      if (!slug) {
        return null;
      }
      const match = categories.find((category) => category.questions.some((question) => question.slug === slug));
      return match?.slug ?? null;
    }

    return null;
  }, [pathname]);

  const renderNavItems = React.useMemo(
    () =>
      categories.map((category) => {
        const href = `/categories/${category.slug}`;
        const isActive = activeCategorySlug === category.slug;
        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors',
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary/40 hover:text-primary'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {category.title}
          </Link>
        );
      }),
    [activeCategorySlug]
  );

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur', className)}>
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3 md:max-w-xl">
          <Link href="/" className="flex items-center gap-3" aria-label="Página inicial da Suvinil">
            <div className="relative h-10 w-28">
              <Image src="/suvinil-logo.svg" alt="Logotipo da Suvinil" fill className="object-contain" sizes="112px" priority />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Suvinil</p>
              <p className="text-base font-semibold leading-tight">Central de Ajuda</p>
            </div>
          </Link>
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1" aria-label="Categorias principais">
            {renderNavItems}
          </nav>
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
            onClick={handlePrimaryAction}
            className="w-full gap-2 rounded-full px-4 py-2 text-sm md:w-auto"
          >
            <PrimaryIcon className="h-4 w-4" />
            <span>{primaryLabel}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
