import type { UIMessage } from '@ai-sdk/react';

import { ChatThread, StoredMessageV1, StoredThreadV1, StoredThreadV2 } from './types';

export function parseHeaders(raw: string | undefined): Record<string, string> | undefined {
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

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createWelcomeMessage(): UIMessage {
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

export function normalisePreview(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractTextFromMessage(message: UIMessage | undefined): string {
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

export function cloneMessages(messages: UIMessage[]): UIMessage[] {
  try {
    return structuredClone(messages);
  } catch {
    return JSON.parse(JSON.stringify(messages)) as UIMessage[];
  }
}

export function migrateStoredMessage(message: UIMessage | StoredMessageV1): UIMessage {
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

export function migrateStoredThread(thread: StoredThreadV1 | StoredThreadV2): ChatThread {
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
