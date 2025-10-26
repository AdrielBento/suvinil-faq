import * as React from 'react';
import { ArrowUpRightSquare, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
  return (
    <div className="space-y-3 border-t border-border/60 bg-background/60 p-6">
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
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Textarea
          ref={chatInputRef}
          value={chatInput}
          onChange={(event) => onChatInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Escreva sua dúvida (Shift+Enter para nova linha)…"
          aria-label="Mensagem"
          className="min-h-[80px] flex-1"
          disabled={isRequesting}
        />
        <div className="flex items-center gap-2 md:self-stretch">
          <Button type="button" onClick={onSend} className="md:px-6" disabled={!chatInput.trim() || isRequesting}>
            {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isRequesting ? 'Enviando…' : 'Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
