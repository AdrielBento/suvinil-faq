import { parseHeaders } from './utils';

export const THREADS_KEY = 'suv-threads-v2';
export const ACTIVE_KEY = 'suv-active-thread';

export const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? 'http://localhost:3000/rag/chat';
export const CHAT_API_HEADERS = parseHeaders(process.env.NEXT_PUBLIC_CHAT_API_HEADERS);
export const CHAT_API_CREDENTIALS = process.env
  .NEXT_PUBLIC_CHAT_API_CREDENTIALS as RequestCredentials | undefined;
