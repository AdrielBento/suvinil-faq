import * as React from 'react';
import { PenLine, Plus, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import type { ChatThread } from './types';

type ChatSidebarProps = {
  threads: ChatThread[];
  activeThreadId: string | null;
  filter: string;
  onFilterChange: (value: string) => void;
  onCreateThread: () => void;
  onSelectThread: (threadId: string) => void;
  onRenameThread: (thread: ChatThread) => void;
  onDeleteThread: (threadId: string) => void;
};

export function ChatSidebar({
  threads,
  activeThreadId,
  filter,
  onFilterChange,
  onCreateThread,
  onSelectThread,
  onRenameThread,
  onDeleteThread
}: ChatSidebarProps) {
  const filteredThreads = React.useMemo(() => {
    const term = filter.trim().toLowerCase();
    return threads
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
      .filter((thread) => {
        if (!term) return true;
        const title = (thread.title ?? '').toLowerCase();
        const preview = (thread.preview ?? '').toLowerCase();
        return title.includes(term) || preview.includes(term);
      });
  }, [filter, threads]);

  return (
    <Card className="flex h-full flex-col border-border/80 bg-card/80">
      <CardHeader className="shrink-0 space-y-4">
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          Conversas
          <Button type="button" size="sm" className="gap-2" onClick={onCreateThread}>
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </CardTitle>
        <Input
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          placeholder="Buscar conversa"
          aria-label="Buscar conversa"
        />
      </CardHeader>
      <CardContent className="flex-1 space-y-2 overflow-y-auto pr-2">
        {filteredThreads.length ? (
          <nav className="flex flex-col gap-2" role="list">
            {filteredThreads.map((thread) => {
              const count = thread.messages.length;
              const lastRole = thread.messages[count - 1]?.role ?? 'assistant';
              const who = lastRole === 'assistant' ? 'assistente' : 'você';
              const stamp = new Date(thread.updatedAt || thread.createdAt).toLocaleString('pt-BR');
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  className={cn(
                    'group flex w-full items-start justify-between gap-3 rounded-xl border border-transparent bg-muted/40 p-3 text-left transition hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive && 'border-primary/70 bg-primary/10'
                  )}
                  role="listitem"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-semibold text-foreground">{thread.title || 'Conversa'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {count} msg{count !== 1 ? 's' : ''} • último: {who} • {stamp}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {count}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRenameThread(thread);
                        }}
                        aria-label="Renomear conversa"
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteThread(thread.id);
                        }}
                        aria-label="Excluir conversa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
