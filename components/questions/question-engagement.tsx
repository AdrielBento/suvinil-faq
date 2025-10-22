'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

type QuestionEngagementProps = {
  questionSlug: string;
};

export function QuestionEngagement({ questionSlug }: QuestionEngagementProps) {
  const [visitCount, setVisitCount] = React.useState<number | null>(null);
  const [feedback, setFeedback] = React.useState<'helpful' | 'unhelpful' | null>(null);

  const visitsKey = React.useMemo(() => `suvinil-faq:visits:${questionSlug}`, [questionSlug]);
  const feedbackKey = React.useMemo(() => `suvinil-faq:feedback:${questionSlug}`, [questionSlug]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedVisits = Number.parseInt(window.localStorage.getItem(visitsKey) ?? '0', 10) || 0;
    const nextVisits = storedVisits + 1;
    window.localStorage.setItem(visitsKey, String(nextVisits));
    setVisitCount(nextVisits);

    const storedFeedback = window.localStorage.getItem(feedbackKey);
    if (storedFeedback === 'helpful' || storedFeedback === 'unhelpful') {
      setFeedback(storedFeedback);
    }
  }, [feedbackKey, visitsKey]);

  const handleFeedback = React.useCallback(
    (value: 'helpful' | 'unhelpful') => {
      if (typeof window === 'undefined') {
        return;
      }
      window.localStorage.setItem(feedbackKey, value);
      setFeedback(value);
    },
    [feedbackKey]
  );

  const hasFeedback = feedback !== null;

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Visitas nesta página</p>
        <p className="text-lg font-semibold text-primary">{visitCount ?? '—'}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Esta resposta foi útil?</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={feedback === 'helpful' ? 'default' : 'outline'}
            aria-pressed={feedback === 'helpful'}
            onClick={() => handleFeedback('helpful')}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant={feedback === 'unhelpful' ? 'default' : 'outline'}
            aria-pressed={feedback === 'unhelpful'}
            onClick={() => handleFeedback('unhelpful')}
          >
            Não
          </Button>
        </div>
        {hasFeedback ? (
          <p className="text-xs text-muted-foreground">
            Obrigado pelo retorno! Usamos este feedback para melhorar os conteúdos.
          </p>
        ) : null}
      </div>
    </div>
  );
}
