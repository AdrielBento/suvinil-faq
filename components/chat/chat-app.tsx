'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { Card, CardContent } from '@/components/ui/card';
import { chatSuggestions } from '@/lib/data';

import { ChatComposer } from './chat-composer';
import { CHAT_API_CREDENTIALS, CHAT_API_HEADERS, CHAT_API_URL } from './config';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatSidebar } from './chat-sidebar';
import { useTypingEffect } from './hooks/useTypingEffect';
import { useThreadStorage } from './hooks/useThreadStorage';
import type { ChatThread } from './types';
import {
  createWelcomeMessage,
  extractTextFromMessage
} from './utils';

function createTransport() {
  return new DefaultChatTransport({
    api: CHAT_API_URL,
    headers: CHAT_API_HEADERS,
    credentials: CHAT_API_CREDENTIALS,
    prepareSendMessagesRequest: ({ api, id, messages, body, headers, credentials }: any) => {
      const plainMessages = (messages as UIMessage[])
        .filter((message) => message.role === 'assistant' || message.role === 'user')
        .map((message) => ({
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
  const [threadFilter, setThreadFilter] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');
  const [pendingQuestion, setPendingQuestion] = React.useState<string | null>(null);
  const [pendingSend, setPendingSend] = React.useState<string | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const chatBodyRef = React.useRef<HTMLDivElement>(null);
  const chatInputRef = React.useRef<HTMLTextAreaElement>(null);

  const searchParams = useSearchParams();

  const fallbackMessages = React.useMemo(() => [createWelcomeMessage()], []);
  const transport = React.useMemo(() => createTransport(), []);

  const {
    threads,
    activeThreadId,
    setActiveThreadId,
    hasLoadedThreads,
    createThread,
    updateActiveThreadMessages,
    renameThread,
    deleteThread
  } = useThreadStorage(isHydrated);

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

  const typingState = useTypingEffect(messages, chatId);

  const isRequesting = status === 'submitted';
  const isTyping = Boolean(typingState);
  const isResponding = isRequesting || isTyping;

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    updateActiveThreadMessages(messages);
  }, [messages, updateActiveThreadMessages]);

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

  const handleRenameThread = React.useCallback(
    (thread: ChatThread) => {
      const current = window.prompt('Novo título da conversa:', thread.title || 'Conversa');
      if (current !== null) {
        const trimmed = current.trim();
        if (trimmed) {
          renameThread(thread.id, trimmed);
        }
      }
    },
    [renameThread]
  );

  const handleDeleteThread = React.useCallback(
    (threadId: string) => {
      if (threadId === activeThreadId) {
        void stop();
      }
      deleteThread(threadId);
    },
    [activeThreadId, deleteThread, stop]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <ChatSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        filter={threadFilter}
        onFilterChange={setThreadFilter}
        onCreateThread={() => createThread()}
        onSelectThread={setActiveThreadId}
        onRenameThread={handleRenameThread}
        onDeleteThread={handleDeleteThread}
      />

      <Card className="flex min-h-[520px] flex-col border-border/80 bg-card/80">
        <ChatHeader isResponding={isResponding} />
        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <ChatMessages
            messages={messages}
            typingState={typingState}
            isRequesting={isRequesting}
            error={error}
            onClearError={clearError}
            chatBodyRef={chatBodyRef}
          />
          <ChatComposer
            chatInput={chatInput}
            onChatInputChange={setChatInput}
            onSend={handleSend}
            onSuggestionClick={sendTextToAssistant}
            suggestions={chatSuggestions}
            isRequesting={isRequesting}
            chatInputRef={chatInputRef}
          />
        </CardContent>
      </Card>
    </div>
  );
}
