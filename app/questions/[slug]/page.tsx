import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { QuestionEngagement } from '@/components/questions/question-engagement';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Button } from '@/components/ui/button';
import { allQuestions, getQuestionBySlug } from '@/lib/data';

type QuestionPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return allQuestions.map(({ question }) => ({ slug: question.slug }));
}

export function generateMetadata({ params }: QuestionPageProps): Metadata {
  const details = getQuestionBySlug(params.slug);
  if (!details) {
    return {
      title: 'Pergunta não encontrada — Central de Ajuda Suvinil'
    };
  }

  const preview = details.question.answer.slice(0, 160);

  return {
    title: `${details.question.question} — Central de Ajuda Suvinil`,
    description: preview
  };
}

export default function QuestionPage({ params }: QuestionPageProps) {
  const details = getQuestionBySlug(params.slug);

  if (!details) {
    notFound();
  }

  const { question, category } = details;
  const paragraphs = question.answer
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const relatedQuestions = category.questions.filter((item) => item.slug !== question.slug).slice(0, 4);

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader variant="default" primaryActionHref="/chat" />
      <div className="flex-1 bg-gradient-to-b from-background via-background to-background/60">
        <div className="container flex flex-col gap-10 py-12">
          <div className="space-y-4">
            <Breadcrumbs
              items={[
                { label: 'Início', href: '/' },
                { label: category.title, href: `/categories/${category.slug}` },
                { label: question.question }
              ]}
            />
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">Pergunta frequente</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{question.question}</h1>
            </div>
          </div>

          <article className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 text-base leading-relaxed text-card-foreground shadow-sm md:p-8">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>

          <QuestionEngagement questionSlug={question.slug} />

          {relatedQuestions.length ? (
            <section className="space-y-3" aria-labelledby="related-questions">
              <h2 id="related-questions" className="text-xl font-semibold">
                Veja também
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
                {relatedQuestions.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant="outline"
                    asChild
                    className="justify-start self-start rounded-2xl border border-border/70 bg-background px-4 py-3 text-left text-sm font-medium leading-snug shadow-sm transition hover:border-primary/60 hover:shadow-md"
                  >
                    <Link href={`/questions/${item.slug}`} className="block break-words leading-snug">
                      {item.question}
                    </Link>
                  </Button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
