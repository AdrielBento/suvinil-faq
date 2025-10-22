'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { ChatApp } from '@/components/chat/chat-app';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

export default function ChatPage() {
  const router = useRouter();

  const handleBackToHelpCenter = React.useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader variant="chat" onPrimaryAction={handleBackToHelpCenter} />
      <div className="flex-1 bg-gradient-to-b from-background via-background to-background/60">
        <div className="container py-12">
          <React.Suspense fallback={<div className="text-sm text-muted-foreground">Carregando chat…</div>}>
            <ChatApp />
          </React.Suspense>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
