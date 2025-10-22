'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRightSquare,
  MessageCircle,
  PenLine,
  Plus,
  Trash2
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSuggestions, knowledgeBase } from '@/lib/data';
import { cn } from '@/lib/utils';

export type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  preview: string;
};

const THREADS_KEY = 'suv-threads';
const ACTIVE_KEY = 'suv-active-thread';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function formatMessage(content: string) {
  const escaped = escapeHtml(content);
  const withBreaks = escaped.replace(/\n/g, '<br />');
  const withBold = withBreaks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withBold.replace(/\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');
}

function normalisePreview(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function findKnowledgeAnswer(query: string) {
  const lower = query.toLowerCase();
  const hit = knowledgeBase.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return hit?.answer ?? null;
}

export function ChatApp() {
  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [threadFilter, setThreadFilter] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [hasLoadedThreads, setHasLoadedThreads] = React.useState(false);
  const [pendingQuestion, setPendingQuestion] = React.useState<string | null>(null);

  const chatBodyRef = React.useRef<HTMLDivElement | null>(null);
  const chatInputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const searchParams = useSearchParams();

  const activeThread = React.useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  const filteredThreads = React.useMemo(() => {
    const term = threadFilter.trim().toLowerCase();
    return threads
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
      .filter((thread) => {
        if (!term) return true;
        const title = (thread.title ?? '').toLowerCase();
        const preview = (thread.preview ?? '').toLowerCase();
        return title.includes(term) || preview.includes(term);
      });
  }, [threadFilter, threads]);

  const appendMessage = React.useCallback((threadId: string, message: ChatMessage) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;
        const updatedMessages = [...thread.messages, message];
        const preview = normalisePreview(message.content).slice(0, 160);
        let title = thread.title;
        if ((!title || title === 'Nova conversa') && message.role === 'user') {
          title = normalisePreview(message.content).slice(0, 48) || 'Conversa';
        }
        return {
          ...thread,
          title,
          messages: updatedMessages,
          updatedAt: Date.now(),
          preview
        };
      })
    );
  }, []);

  const createThread = React.useCallback((title = 'Nova conversa') => {
    const id = uid('t');
    const welcome: ChatMessage = {
      id: uid('m'),
      role: 'bot',
      content: 'Olá! Sou o **Assistente Suvinil**. Como posso ajudar hoje?',
      createdAt: Date.now()
    };
    const newThread: ChatThread = {
      id,
      title,
      messages: [welcome],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preview: normalisePreview(welcome.content).slice(0, 160)
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const sendTextToAssistant = React.useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setChatInput('');

      let threadId = activeThreadId;
      if (!threadId) {
        threadId = createThread('Nova conversa');
      }
      if (!threadId) return;

      setActiveThreadId(threadId);

      const userMessage: ChatMessage = {
        id: uid('m'),
        role: 'user',
        content: trimmed,
        createdAt: Date.now()
      };
      appendMessage(threadId, userMessage);

      const answer = findKnowledgeAnswer(trimmed);
      const response = answer
        ? `${answer}\n\n<small style="color:var(--muted-foreground)">Dica: pergunte por <em>produtos</em>, <em>aplicação</em>, <em>cores</em> ou <em>trocas</em>.</small>`
        : 'Posso ajudar com **produtos**, **aplicação**, **cores** e **trocas/devoluções**. Descreva sua dúvida ou clique em uma sugestão acima.';

      const botMessage: ChatMessage = {
        id: uid('m'),
        role: 'bot',
        content: response,
        createdAt: Date.now()
      };
      appendMessage(threadId, botMessage);
    },
    [activeThreadId, appendMessage, createThread]
  );

  const handleSend = React.useCallback(() => {
    const value = chatInput.trim();
    if (!value) return;
    sendTextToAssistant(value);
  }, [chatInput, sendTextToAssistant]);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      const stored = localStorage.getItem(THREADS_KEY);
      const active = localStorage.getItem(ACTIVE_KEY);
      if (stored) {
        const parsed: ChatThread[] = JSON.parse(stored);
        setThreads(
          parsed.map((thread) => ({
            ...thread,
            createdAt: thread.createdAt || Date.now(),
            updatedAt: thread.updatedAt || thread.createdAt || Date.now(),
            messages: (thread.messages || []).map((message) => ({
              ...message,
              createdAt: message.createdAt || Date.now()
            }))
          }))
        );
      }
      if (active) {
        setActiveThreadId(active);
      }
    } catch {
      setThreads([]);
      setActiveThreadId(null);
    } finally {
      setHasLoadedThreads(true);
    }
  }, [isHydrated]);

  React.useEffect(() => {
    if (!isHydrated) return;
    if (threads.length) {
      try {
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(THREADS_KEY);
    }
    if (activeThreadId) {
      try {
        localStorage.setItem(ACTIVE_KEY, activeThreadId);
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeThreadId, isHydrated, threads]);

  React.useEffect(() => {
    if (!isHydrated || !hasLoadedThreads) return;
    if (!threads.length) {
      createThread('Nova conversa');
    }
  }, [createThread, hasLoadedThreads, isHydrated, threads.length]);

  React.useEffect(() => {
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [activeThread?.messages.length]);

  React.useEffect(() => {
    const question = searchParams.get('query');
    if (question) {
      setPendingQuestion(question);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!pendingQuestion || !hasLoadedThreads) return;
    sendTextToAssistant(pendingQuestion);
    setPendingQuestion(null);
  }, [hasLoadedThreads, pendingQuestion, sendTextToAssistant]);

  React.useEffect(() => {
    if (!chatInputRef.current) return;
    const element = chatInputRef.current;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }, [chatInput]);

  const handleRenameThread = React.useCallback((thread: ChatThread) => {
    const current = window.prompt('Novo título da conversa:', thread.title || 'Conversa');
    if (current !== null) {
      const trimmed = current.trim();
      if (trimmed) {
        setThreads((prev) =>
          prev.map((item) => (item.id === thread.id ? { ...item, title: trimmed, updatedAt: Date.now() } : item))
        );
      }
    }
  }, []);

  const handleDeleteThread = React.useCallback((threadId: string) => {
    setThreads((prev) => {
      const next = prev.filter((item) => item.id !== threadId);
      if (threadId === activeThreadId) {
        setActiveThreadId(next[0]?.id ?? null);
      }
      return next;
    });
  }, [activeThreadId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Card className="border-border/80 bg-card/80">
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center justify-between text-lg font-semibold">
            Conversas
            <Button type="button" size="sm" className="gap-2" onClick={() => createThread('Nova conversa')}>
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </CardTitle>
          <Input
            value={threadFilter}
            onChange={(event) => setThreadFilter(event.target.value)}
            placeholder="Buscar conversa"
            aria-label="Buscar conversa"
          />
        </CardHeader>
        <CardContent className="space-y-2 overflow-y-auto pr-2">
          {filteredThreads.length ? (
            <nav className="flex flex-col gap-2" role="list">
              {filteredThreads.map((thread) => {
                const count = thread.messages.length;
                const lastRole = thread.messages[count - 1]?.role ?? 'bot';
                const who = lastRole === 'bot' ? 'assistente' : 'você';
                const stamp = new Date(thread.updatedAt || thread.createdAt).toLocaleString('pt-BR');
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={cn(
                      'group flex w-full items-start justify-between gap-3 rounded-xl border border-transparent bg-muted/40 p-3 text-left transition hover:border-primary/40 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive && 'border-primary/70 bg-primary/10'
                    )}
                    role="listitem"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {thread.title || 'Conversa'}
                      </p>
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
                            handleRenameThread(thread);
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
                            handleDeleteThread(thread.id);
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

      <Card className="flex min-h-[520px] flex-col border-border/80 bg-card/80">
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
            <Badge variant="outline" className="gap-1 text-xs">
              <MessageCircle className="h-3.5 w-3.5" />
              Online
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div ref={chatBodyRef} className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-6">
            {activeThread?.messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'bot' ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground shadow">
                    S
                  </div>
                ) : null}
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl border px-4 py-3 text-sm shadow-sm sm:max-w-[75%]',
                    message.role === 'user'
                      ? 'rounded-br-none border-primary bg-primary text-primary-foreground'
                      : 'rounded-bl-none border-border/80 bg-background'
                  )}
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                {message.role === 'user' ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    😊
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border/60 bg-background/60 p-6">
            <div className="flex flex-wrap gap-2">
              {chatSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => sendTextToAssistant(suggestion)}
                >
                  <ArrowUpRightSquare className="mr-1 h-3.5 w-3.5" />
                  {suggestion}
                </Button>
              ))}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <Textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escreva sua dúvida (Shift+Enter para nova linha)…"
                aria-label="Mensagem"
                className="min-h-[80px] flex-1"
              />
              <Button type="button" onClick={handleSend} className="md:self-stretch md:px-6">
                Enviar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
