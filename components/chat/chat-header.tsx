import { Loader2, MessageCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';

type ChatHeaderProps = {
  isResponding: boolean;
};

export function ChatHeader({ isResponding }: ChatHeaderProps) {
  return (
    <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground shadow">
            S
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Assistente Suvinil</CardTitle>
            <p className="text-xs text-muted-foreground">Produtos • Aplicação • Cores • Trocas</p>
          </div>
        </div>
        <Badge variant={isResponding ? 'secondary' : 'outline'} className="gap-2 text-xs">
          {isResponding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
          {isResponding ? 'Respondendo…' : 'Online'}
        </Badge>
      </div>
    </CardHeader>
  );
}
