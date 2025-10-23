'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowLeft, MessageCircle, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const logoTextColor = isDark ? '#FFFFFF' : '#000105';

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur', className)}>
      <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3 md:max-w-xl">
          <Link href="/" className="flex items-center gap-3" aria-label="Página inicial da Suvinil">
            <div className="relative h-10 w-28">
              <svg viewBox="0 0 147 33" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" role="img" aria-hidden>
                <title>Logotipo da Suvinil</title>
                <path d="M33.393 7.883h-8.52l6.32 13.842-21.271 10.13h23.471V7.882Z" fill="#C30A2D" />
                <path d="M24.874 7.883 21.274 0 0 10.13l9.92 21.724V7.883h14.954Z" fill="#FFD200" />
                <path d="M24.874 7.883H9.92v23.971h.002l21.272-10.129-6.32-13.842Z" fill="#FF6900" />
                <path
                  d="M46.282 32.172c-1.032 0-2-.137-2.904-.412-.906-.276-1.63-.616-2.175-1.024v-5.253c.427.387 1.011.738 1.75 1.054.74.315 1.587.473 2.541.473 1.187 0 2.068-.26 2.642-.779.574-.52.862-1.084.862-1.695 0-.509-.142-.977-.424-1.405-.282-.427-.803-.834-1.562-1.221l-1.956-1.07c-1.167-.63-2.107-1.39-2.817-2.275-.711-.886-1.066-2-1.066-3.344 0-1.955.768-3.58 2.307-4.872 1.537-1.293 3.61-1.94 6.218-1.94.993 0 1.85.082 2.569.245.72.163 1.275.366 1.664.61v5.223c-.37-.264-.86-.504-1.474-.717a5.845 5.845 0 0 0-1.941-.32c-.954 0-1.713.182-2.278.549-.564.366-.847.865-.847 1.497 0 .427.132.793.395 1.1.262.304.696.61 1.3.915l1.868 1.008c1.361.733 2.379 1.609 3.05 2.627.672 1.018 1.008 2.199 1.008 3.543 0 2.056-.73 3.817-2.19 5.284-1.46 1.466-3.64 2.199-6.54 2.199ZM66.41 32.172c-2.627 0-4.685-.754-6.174-2.26-1.49-1.507-2.234-3.563-2.234-6.17v-8.827h5.81V24.2c0 .937.214 1.69.642 2.26.428.57 1.08.855 1.957.855.914 0 1.59-.284 2.029-.855.438-.57.657-1.323.657-2.26v-9.285h5.78v8.827c0 2.607-.744 4.663-2.233 6.17-1.49 1.506-3.567 2.26-6.233 2.26ZM94.118 14.915 85.826 32.05h-.614l-8.29-17.135h5.692l2.92 7.453 2.89-7.453h5.694ZM96.57 31.683h5.663V14.915h-5.664v16.768ZM112.714 22.673v9.01h-5.898V14.915h5.577v2.81c.486-.896 1.235-1.67 2.248-2.321 1.012-.651 2.16-.978 3.445-.978 1.79 0 3.23.58 4.321 1.742 1.09 1.16 1.635 2.748 1.635 4.765v10.75h-5.897V22.49c0-.998-.225-1.782-.672-2.352-.448-.57-1.081-.855-1.898-.855-.836 0-1.523.305-2.058.916-.536.61-.803 1.435-.803 2.474ZM128.538 31.683h5.664V14.915h-5.664v16.768ZM138.777 26.826V7.845h5.668v17.79c0 .448.117.774.35.977.234.204.497.306.789.306.253 0 .458-.026.614-.076.156-.051.282-.108.379-.168v4.798c-.253.183-.652.347-1.097.489a6.556 6.556 0 0 1-1.666.214c-1.85 0-3.136-.54-3.856-1.62-.721-1.08-1.081-2.323-1.081-3.729ZM99.387 12.6c1.937 0 3.111-1.005 3.111-2.854 0-1.848-1.174-2.853-3.111-2.853-1.905 0-3.112 1.005-3.112 2.853 0 1.848 1.207 2.854 3.112 2.854ZM131.366 12.61c1.937 0 3.112-1.005 3.112-2.853 0-1.848-1.175-2.853-3.112-2.853-1.905 0-3.111 1.005-3.111 2.853 0 1.848 1.206 2.853 3.111 2.853Z"
                  fill={logoTextColor}
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
            </div>
          </Link>
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
