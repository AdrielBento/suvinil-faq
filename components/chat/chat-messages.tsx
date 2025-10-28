import * as React from 'react';
import { CircleAlert, Loader2 } from 'lucide-react';
import type { UIMessage } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { TypingState } from './types';

const markdownComponents: Components = {
  p: ({ node: _node, ...props }) => (
    <p className="whitespace-pre-wrap leading-relaxed [&:not(:first-child)]:mt-2" {...props} />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul className="my-2 list-disc space-y-1 pl-5" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />
  ),
  li: ({ node: _node, ...props }) => <li className="leading-relaxed" {...props} />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="my-3 border-l-2 border-primary/40 pl-3 text-muted-foreground"
      {...props}
    />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  img: ({ node: _node, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ''}
      className="my-3 max-h-64 w-auto rounded-lg border border-border/50"
      loading="lazy"
      {...props}
    />
  ),
  code: ({ node: _node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="rounded bg-muted px-1 py-[2px] font-mono text-[0.85em]" {...props}>
          {children}
        </code>
      );
    }

    const codeContent = React.Children.toArray(children).join('').replace(/\n$/, '');

    return (
      <pre className="my-3 overflow-x-auto rounded-md bg-muted/60 p-3 text-xs">
        <code className={cn('block font-mono', className)} {...props}>
          {codeContent}
        </code>
      </pre>
    );
  },
  hr: () => <hr className="my-4 border-border/60" />,
  table: ({ node: _node, ...props }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th className="border border-border/60 bg-muted/40 px-2 py-1 font-semibold" {...props} />
  ),
  td: ({ node: _node, ...props }) => <td className="border border-border/60 px-2 py-1" {...props} />
};

const markdownRemarkPlugins = [remarkGfm];

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
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="sr-only">Digitando…</span>
        {[0, 1, 2].map((dot) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-current animate-bounce"
            style={{ animationDelay: `${dot * 0.2}s` }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return message.parts.map((part, index) => {
    if (part.type === 'text') {
      return (
        <ReactMarkdown
          key={`${message.id}-text-${index}`}
          remarkPlugins={markdownRemarkPlugins}
          components={markdownComponents}
        >
          {part.text}
        </ReactMarkdown>
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
