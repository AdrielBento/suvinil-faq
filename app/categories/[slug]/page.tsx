import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { categories, getCategoryBySlug } from '@/lib/data';

type CategoryPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: 'Categoria não encontrada — Central de Ajuda Suvinil'
    };
  }

  return {
    title: `${category.title} — Central de Ajuda Suvinil`,
    description: category.description
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader variant="default" primaryActionHref="/chat" />
      <div className="flex-1 bg-gradient-to-b from-background via-background to-background/60">
        <div className="container flex flex-col gap-8 py-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">Categoria</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{category.title}</h1>
            <p className="text-base text-muted-foreground md:text-lg">{category.description}</p>
          </div>

          <section className="space-y-4" aria-labelledby="category-questions">
            <div className="space-y-2">
              <h2 id="category-questions" className="text-xl font-semibold">
                Perguntas desta categoria
              </h2>
              <p className="text-sm text-muted-foreground">
                Clique em uma pergunta para ver o passo a passo completo.
              </p>
            </div>
            {category.questions.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.questions.map((question) => (
                  <Button
                    key={question.id}
                    type="button"
                    variant="outline"
                    asChild
                    className="justify-start rounded-2xl border border-border/70 bg-card px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:border-primary/60 hover:shadow-md"
                  >
                    <Link href={`/questions/${question.slug}`}>{question.question}</Link>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma pergunta cadastrada para esta categoria.</p>
            )}
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
