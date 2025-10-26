import * as React from 'react';
import type { UIMessage } from '@ai-sdk/react';

import { extractTextFromMessage } from '../utils';
import type { TypingState } from '../types';

export function useTypingEffect(messages: UIMessage[], chatId: string) {
  const [typingState, setTypingState] = React.useState<TypingState | null>(null);

  const typedMessageIdsRef = React.useRef<Set<string>>(new Set());
  const typingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialisedTypingRef = React.useRef(false);

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

  return typingState;
}
