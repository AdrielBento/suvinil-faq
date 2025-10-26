'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRightSquare, CircleAlert, Loader2, MessageCircle, PenLine, Plus, Trash2 } from 'lucide-react';

import { useChat, UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSuggestions } from '@/lib/data';
import { cn } from '@/lib/utils';

const THREADS_KEY = 'suv-threads-v2';
const ACTIVE_KEY = 'suv-active-thread';

const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:3000/rag/ask';
const CHAT_API_HEADERS = parseHeaders(process.env.NEXT_PUBLIC_CHAT_API_HEADERS);
const CHAT_API_CREDENTIALS = process.env.NEXT_PUBLIC_CHAT_API_CREDENTIALS as RequestCredentials | undefined;

type StoredMessageV1 = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  createdAt?: number;
};

type StoredThreadV1 = {
  id: string;
  title?: string;
  messages: StoredMessageV1[];
  createdAt?: number;
  updatedAt?: number;
  preview?: string;
};

type StoredThreadV2 = {
  id: string;
  title?: string;
  messages: UIMessage[];
  createdAt?: number;
  updatedAt?: number;
  preview?: string;
};

type ChatThread = {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
  preview: string;
};

function parseHeaders(raw: string | undefined): Record<string, string> | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, value == null ? '' : String(value)])
    );
  } catch (error) {
    console.warn('[chat] Invalid NEXT_PUBLIC_CHAT_API_HEADERS JSON. Ignoring value.', error);
    return undefined;
  }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function createWelcomeMessage(): UIMessage {
  return {
    id: uid('m'),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: 'Olá! Sou o Assistente Suvinil. Como posso ajudar hoje?'
      }
    ]
  };
}

function normalisePreview(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractTextFromMessage(message: UIMessage | undefined): string {
  if (!message) return '';
  return message.parts
    .map((part) => {
      if (part.type === 'text') {
        return part.text;
      }
      if (part.type === 'reasoning') {
        return part.text;
      }
      if (part.type === 'tool' || part.type === 'dynamic-tool') {
        return part.toolName ?? '';
      }
      if (part.type === 'data') {
        try {
          return typeof part.data === 'string' ? part.data : JSON.stringify(part.data);
        } catch {
          return '';
        }
      }
      return '';
    })
    .join(' ')
    .trim();
}

function cloneMessages(messages: UIMessage[]): UIMessage[] {
  try {
    return structuredClone(messages);
  } catch {
    return JSON.parse(JSON.stringify(messages)) as UIMessage[];
  }
}

function migrateStoredMessage(message: UIMessage | StoredMessageV1): UIMessage {
  if ('parts' in message) {
    return {
      ...message,
      id: message.id ?? uid('m'),
      role: message.role ?? 'assistant',
      parts: Array.isArray(message.parts)
        ? message.parts.map((part) => {
            if (part && typeof part === 'object' && 'type' in part) {
              if (part.type === 'text') {
                return {
                  type: 'text',
                  text: (part as { text?: string }).text ?? ''
                } as UIMessage['parts'][number];
              }
              return part as UIMessage['parts'][number];
            }
            return {
              type: 'text',
              text: String(part ?? '')
            } as UIMessage['parts'][number];
          })
        : []
    } satisfies UIMessage;
  }

  const legacy = message as StoredMessageV1;
  const role = legacy.role === 'user' ? 'user' : 'assistant';
  return {
    id: legacy.id ?? uid('m'),
    role,
    parts: legacy.content
      ? [
          {
            type: 'text',
            text: legacy.content
          }
        ]
      : []
  } satisfies UIMessage;
}

function migrateStoredThread(thread: StoredThreadV1 | StoredThreadV2): ChatThread {
  const messages = Array.isArray(thread.messages)
    ? thread.messages.map((message) => migrateStoredMessage(message as UIMessage | StoredMessageV1))
    : [createWelcomeMessage()];

  const previewSource = messages[messages.length - 1];
  const preview = normalisePreview(extractTextFromMessage(previewSource)).slice(0, 160);
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const derivedTitle = normalisePreview(extractTextFromMessage(firstUserMessage)).slice(0, 48);

  return {
    id: thread.id ?? uid('t'),
    title: thread.title && thread.title.trim() ? thread.title : derivedTitle || 'Nova conversa',
    messages,
    createdAt: thread.createdAt ?? Date.now(),
    updatedAt: thread.updatedAt ?? thread.createdAt ?? Date.now(),
    preview
  } satisfies ChatThread;
}

function createTransport() {
  return new DefaultChatTransport({
    api: CHAT_API_URL,
    // headers: CHAT_API_HEADERS,
    // credentials: CHAT_API_CREDENTIALS,
    prepareSendMessagesRequest: ({ api, id, messages, body, headers, credentials }: any) => {
      const plainMessages = messages
        .filter((message: UIMessage) => message.role === 'assistant' || message.role === 'user')
        .map((message: UIMessage) => ({
          role: message.role,
          content: extractTextFromMessage(message)
        }));

      return {
        api,
        headers,
        credentials,
        body: {
          ...body,
          id,
          message: plainMessages?.at(plainMessages?.length - 1)?.content
        }
      };
    }
  });
}

export function ChatApp() {
  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [threadFilter, setThreadFilter] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [hasLoadedThreads, setHasLoadedThreads] = React.useState(false);
  const [pendingQuestion, setPendingQuestion] = React.useState<string | null>(null);
  const [pendingSend, setPendingSend] = React.useState<string | null>(null);
  const [typingState, setTypingState] = React.useState<{
    id: string;
    text: string;
  } | null>(null);

  const typedMessageIdsRef = React.useRef<Set<string>>(new Set());
  const typingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialisedTypingRef = React.useRef(false);

  const chatBodyRef = React.useRef<HTMLDivElement | null>(null);
  const chatInputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const searchParams = useSearchParams();

  const fallbackMessages = React.useMemo(() => [createWelcomeMessage()], []);
  const transport = React.useMemo(() => createTransport(), []);

  const activeThread = React.useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  const chatId = activeThreadId ?? 'pending-thread';
  const initialMessages = activeThread?.messages ?? fallbackMessages;

  const { messages, sendMessage, status, error, clearError, stop } = useChat({
    id: chatId,
    messages: initialMessages,
    transport
  });

  const isRequesting = status === 'submitted';
  const isTyping = Boolean(typingState);
  const isResponding = isRequesting || isTyping;

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

  const createThread = React.useCallback((title = 'Nova conversa') => {
    const id = uid('t');
    const welcome = createWelcomeMessage();
    const preview = normalisePreview(extractTextFromMessage(welcome)).slice(0, 160);
    const nextThread: ChatThread = {
      id,
      title,
      messages: [welcome],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preview
    };
    setThreads((prev) => [nextThread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const sendTextToAssistant = React.useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      setChatInput('');

      if (error) {
        clearError();
      }

      if (!activeThreadId) {
        createThread();
        setPendingSend(trimmed);
        return;
      }

      void sendMessage({ text: trimmed }).catch((err) => {
        console.error('[chat] Failed to send message', err);
      });
    },
    [activeThreadId, clearError, createThread, error, sendMessage]
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
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    typedMessageIdsRef.current = new Set();
    hasInitialisedTypingRef.current = false;
    setTypingState(null);
  }, [chatId]);

  React.useEffect(() => {
    if (hasInitialisedTypingRef.current) return;
    if (!messages.length) return;

    const next = new Set(typedMessageIdsRef.current);
    messages.forEach((message) => {
      if (message.role === 'assistant') {
        next.add(message.id);
      }
    });

    typedMessageIdsRef.current = next;
    hasInitialisedTypingRef.current = true;
  }, [messages]);

  React.useEffect(() => {
    if (!hasInitialisedTypingRef.current) return;
    if (typingTimerRef.current) return;

    const nextAssistant = messages.find(
      (message) => message.role === 'assistant' && !typedMessageIdsRef.current.has(message.id)
    );

    if (!nextAssistant) return;

    const fullText = extractTextFromMessage(nextAssistant);

    if (!fullText) {
      typedMessageIdsRef.current.add(nextAssistant.id);
      return;
    }

    let index = 0;
    const delay = Math.min(60, Math.max(18, Math.ceil(1200 / Math.max(fullText.length, 1))));

    setTypingState({ id: nextAssistant.id, text: '' });

    const interval = setInterval(() => {
      index += 1;
      const slice = fullText.slice(0, Math.min(index, fullText.length));

      setTypingState((prev) => {
        if (!prev || prev.id !== nextAssistant.id) {
          return prev;
        }

        if (index >= fullText.length) {
          return { id: nextAssistant.id, text: fullText };
        }

        return { id: nextAssistant.id, text: slice };
      });

      if (index >= fullText.length) {
        typedMessageIdsRef.current.add(nextAssistant.id);
        clearInterval(interval);
        typingTimerRef.current = null;
        setTypingState(null);
      }
    }, delay);

    typingTimerRef.current = interval;
  }, [messages]);

  React.useEffect(() => {
    if (!isHydrated) return;
    try {
      const stored = localStorage.getItem(THREADS_KEY);
      const active = localStorage.getItem(ACTIVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<StoredThreadV1 | StoredThreadV2>;
        const migrated = parsed.map((thread) => migrateStoredThread(thread));
        setThreads(migrated);
        if (active && migrated.some((thread) => thread.id === active)) {
          setActiveThreadId(active);
        } else if (migrated[0]) {
          setActiveThreadId(migrated[0].id);
        }
      }
    } catch (err) {
      console.error('[chat] Failed to load stored threads', err);
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
      } catch (err) {
        console.warn('[chat] Failed to persist threads', err);
      }
    } else {
      localStorage.removeItem(THREADS_KEY);
    }

    if (activeThreadId) {
      try {
        localStorage.setItem(ACTIVE_KEY, activeThreadId);
      } catch (err) {
        console.warn('[chat] Failed to persist active thread id', err);
      }
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeThreadId, isHydrated, threads]);

  React.useEffect(() => {
    if (!isHydrated || !hasLoadedThreads) return;
    if (!threads.length) {
      createThread('Nova conversa');
      return;
    }
    if (!activeThreadId) {
      setActiveThreadId(threads[0].id);
    }
  }, [activeThreadId, createThread, hasLoadedThreads, isHydrated, threads]);

  React.useEffect(() => {
    if (!hasLoadedThreads) return;
    if (!activeThreadId) return;
    const clonedMessages = cloneMessages(messages);

    setThreads((prev) => {
      const index = prev.findIndex((thread) => thread.id === activeThreadId);
      if (index === -1) return prev;

      const previousThread = prev[index];
      const previousLast = extractTextFromMessage(previousThread.messages.at(-1));
      const currentLast = extractTextFromMessage(clonedMessages.at(-1));
      if (
        previousThread.messages.length === clonedMessages.length &&
        previousLast === currentLast
      ) {
        return prev;
      }

      const preview = normalisePreview(currentLast).slice(0, 160);
      const firstUserMessage = clonedMessages.find((message) => message.role === 'user');
      const derivedTitle = normalisePreview(extractTextFromMessage(firstUserMessage)).slice(0, 48);
      const title =
        previousThread.title && previousThread.title !== 'Nova conversa'
          ? previousThread.title
          : derivedTitle || previousThread.title || 'Conversa';

      const updatedThread: ChatThread = {
        ...previousThread,
        title,
        messages: clonedMessages,
        preview,
        updatedAt: Date.now()
      };

      const next = [...prev];
      next[index] = updatedThread;
      return next;
    });
  }, [activeThreadId, hasLoadedThreads, messages]);

  React.useEffect(() => {
    if (!pendingSend) return;
    if (!activeThreadId) return;

    let isCancelled = false;

    const run = async () => {
      try {
        await sendMessage({ text: pendingSend });
      } catch (err) {
        console.error('[chat] Failed to send pending message', err);
      } finally {
        if (!isCancelled) {
          setPendingSend(null);
        }
      }
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [activeThreadId, pendingSend, sendMessage]);

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
    if (!chatBodyRef.current) return;
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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

  const handleDeleteThread = React.useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const next = prev.filter((item) => item.id !== threadId);
        if (threadId === activeThreadId) {
          void stop();
          setActiveThreadId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeThreadId, stop]
  );

  const renderMessageContent = React.useCallback(
    (message: UIMessage) => {
      if (message.role === 'assistant' && typingState && typingState.id === message.id) {
        return (
          <p className="whitespace-pre-wrap">
            {typingState.text}
            <span className="ml-1 animate-pulse">▌</span>
          </p>
        );
      }

      if (!message.parts.length) {
        return <p className="text-xs text-muted-foreground">(sem conteúdo)</p>;
      }

      return message.parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <p key={`${message.id}-text-${index}`} className="whitespace-pre-wrap">
              {part.text}
            </p>
          );
        }

        if (part.type === 'reasoning') {
          return (
            <p key={`${message.id}-reasoning-${index}`} className="whitespace-pre-wrap text-xs text-muted-foreground">
              {part.text}
            </p>
          );
        }

        if (part.type === 'tool') {
          return (
            <pre
              key={`${message.id}-tool-${index}`}
              className="overflow-x-auto rounded-md bg-muted/60 p-2 text-xs"
            >
              {JSON.stringify({ toolName: part.toolName, input: part.input, output: part.output }, null, 2)}
            </pre>
          );
        }

        if (part.type === 'data') {
          return (
            <pre
              key={`${message.id}-data-${index}`}
              className="overflow-x-auto rounded-md bg-muted/40 p-2 text-xs"
            >
              {JSON.stringify(part.data, null, 2)}
            </pre>
          );
        }

        return (
          <pre
            key={`${message.id}-part-${index}`}
            className="overflow-x-auto rounded-md bg-muted/30 p-2 text-xs text-muted-foreground"
          >
            {JSON.stringify(part, null, 2)}
          </pre>
        );
      });
    },
    [typingState]
  );

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
                const lastRole = thread.messages[count - 1]?.role ?? 'assistant';
                const who = lastRole === 'assistant' ? 'assistente' : 'você';
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
            <Badge variant={isResponding ? 'secondary' : 'outline'} className="gap-2 text-xs">
              {isResponding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
              {isResponding ? 'Respondendo…' : 'Online'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div ref={chatBodyRef} className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'assistant' ? (
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
                >
                  {renderMessageContent(message)}
                </div>
                {message.role === 'user' ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    😊
                  </div>
                ) : null}
              </div>
            ))}
            {isRequesting ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/90 text-sm font-semibold text-primary-foreground shadow">
                  S
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-bl-none border border-border/80 bg-background px-4 py-3 text-sm shadow-sm sm:max-w-[75%]">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    O assistente está preparando uma resposta…
                  </p>
                </div>
              </div>
            ) : null}
            {error ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <div className="flex flex-wrap items-center gap-2">
                  <CircleAlert className="h-4 w-4" />
                  <span>Não foi possível concluir a resposta. Tente novamente.</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => clearError()}>
                    Limpar erro
                  </Button>
                </div>
              </div>
            ) : null}
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
                  disabled={isRequesting}
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
                disabled={isRequesting}
              />
              <div className="flex items-center gap-2 md:self-stretch">
                <Button
                  type="button"
                  onClick={handleSend}
                  className="md:px-6"
                  disabled={!chatInput.trim() || isRequesting}
                >
                  {isRequesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isRequesting ? 'Enviando…' : 'Enviar'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
