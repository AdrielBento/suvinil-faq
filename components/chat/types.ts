import type { UIMessage } from '@ai-sdk/react';

export type StoredMessageV1 = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  createdAt?: number;
};

export type StoredThreadV1 = {
  id: string;
  title?: string;
  messages: StoredMessageV1[];
  createdAt?: number;
  updatedAt?: number;
  preview?: string;
};

export type StoredThreadV2 = {
  id: string;
  title?: string;
  messages: UIMessage[];
  createdAt?: number;
  updatedAt?: number;
  preview?: string;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
  preview: string;
};

export type TypingState = {
  id: string;
  text: string;
};
