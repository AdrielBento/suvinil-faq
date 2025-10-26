import * as React from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
import type { UIMessage } from '@ai-sdk/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { TypingState } from './types';

function renderMessageContent(message: UIMessage, typingState: TypingState | null) {
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
        <pre key={`${message.id}-tool-${index}`} className="overflow-x-auto rounded-md bg-muted/60 p-2 text-xs">
          {JSON.stringify({ toolName: part.toolName, input: part.input, output: part.output }, null, 2)}
        </pre>
      );
    }

    if (part.type === 'data') {
      return (
        <pre key={`${message.id}-data-${index}`} className="overflow-x-auto rounded-md bg-muted/40 p-2 text-xs">
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
}

type ChatMessagesProps = {
  messages: UIMessage[];
  typingState: TypingState | null;
  isRequesting: boolean;
  error: Error | undefined;
  onClearError: () => void;
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatMessages({
  messages,
  typingState,
  isRequesting,
  error,
  onClearError,
  chatBodyRef
}: ChatMessagesProps) {
  return (
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
            {renderMessageContent(message, typingState)}
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
            <Button type="button" size="sm" variant="ghost" onClick={onClearError}>
              Limpar erro
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
