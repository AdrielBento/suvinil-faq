import * as React from 'react';
import { ArrowUp, ArrowUpRightSquare, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type ChatComposerProps = {
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionClick: (suggestion: string) => void;
  suggestions: string[];
  isRequesting: boolean;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
};

export function ChatComposer({
  chatInput,
  onChatInputChange,
  onSend,
  onSuggestionClick,
  suggestions,
  isRequesting,
  chatInputRef
}: ChatComposerProps) {
  const isSendDisabled = isRequesting || !chatInput.trim();

  return (
    <div className="space-y-3 border-t border-border/40 bg-background/95 px-4 py-5 md:px-6">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={isRequesting}
          >
            <ArrowUpRightSquare className="mr-1 h-3.5 w-3.5" />
            {suggestion}
          </Button>
        ))}
      </div>
      <div className="relative">
        <Textarea
          ref={chatInputRef}
          value={chatInput}
          onChange={(event) => onChatInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (!isSendDisabled) {
                onSend();
              }
            }
          }}
          placeholder="Escreva sua dúvida (Shift+Enter para nova linha)…"
          aria-label="Mensagem"
          className={cn(
            'min-h-[70px] w-full resize-none rounded-2xl border border-border/40 bg-muted/70 px-4 py-3 pr-16 text-sm shadow-sm transition focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground/80'
          )}
        />
        <Button
          type="button"
          onClick={onSend}
          className={cn(
            'absolute bottom-2 right-2 h-9 w-9 rounded-full bg-[#19c37d] p-0 text-white shadow-lg transition hover:bg-[#15a46b]',
            'focus-visible:ring-2 focus-visible:ring-[#19c37d]/40 focus-visible:ring-offset-0'
          )}
          disabled={isSendDisabled}
        >
          {isRequesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
