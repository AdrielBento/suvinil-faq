import * as React from 'react';
import type { UIMessage } from '@ai-sdk/react';

import { ACTIVE_KEY, THREADS_KEY } from '../config';
import {
  ChatThread,
  StoredThreadV1,
  StoredThreadV2
} from '../types';
import {
  cloneMessages,
  createWelcomeMessage,
  extractTextFromMessage,
  migrateStoredThread,
  normalisePreview,
  uid
} from '../utils';

export function useThreadStorage(isHydrated: boolean) {
  const [threads, setThreads] = React.useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [hasLoadedThreads, setHasLoadedThreads] = React.useState(false);

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

  const updateActiveThreadMessages = React.useCallback(
    (messages: UIMessage[]) => {
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
    },
    [activeThreadId, hasLoadedThreads]
  );

  const renameThread = React.useCallback((threadId: string, title: string) => {
    setThreads((prev) =>
      prev.map((item) => (item.id === threadId ? { ...item, title, updatedAt: Date.now() } : item))
    );
  }, []);

  const deleteThread = React.useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        const next = prev.filter((item) => item.id !== threadId);
        if (threadId === activeThreadId) {
          setActiveThreadId(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeThreadId]
  );

  return {
    threads,
    activeThreadId,
    setActiveThreadId,
    hasLoadedThreads,
    createThread,
    updateActiveThreadMessages,
    renameThread,
    deleteThread
  };
}
