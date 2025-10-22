import { cn } from '@/lib/utils';

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn('border-t border-border/80 bg-background/80', className)}>
      <div className="container flex flex-col gap-2 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} Suvinil • Central de Ajuda •{' '}
          <a href="#" className="font-medium text-primary hover:underline">
            Política de privacidade
          </a>
        </p>
        <p>
          <span className="font-medium text-foreground">Dica:</span> pressione <kbd>⌘</kbd>
          <kbd>K</kbd> ou <kbd>Ctrl</kbd>
          <kbd>K</kbd> para pesquisar.
        </p>
      </div>
    </footer>
  );
}
