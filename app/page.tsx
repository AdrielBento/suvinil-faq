'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { ContactSection } from '@/components/home/contact-section';
import { CategorySection } from '@/components/home/category-section';
import { HeroSection } from '@/components/home/hero-section';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { categories, quickSearches } from '@/lib/data';

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSearchTermChange = React.useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (searchError) {
        setSearchError(null);
      }
    },
    [searchError]
  );

  const findQuestionByQuery = React.useCallback((query: string) => {
    const normalized = query.toLowerCase();
    for (const category of categories) {
      for (const question of category.questions) {
        if (question.question.toLowerCase().includes(normalized)) {
          return question;
        }
      }
    }
    return null;
  }, []);

  const handleSearchSubmit = React.useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const value = searchTerm.trim();
      if (!value) {
        searchInputRef.current?.focus();
        setSearchError('Digite um termo para pesquisar.');
        return;
      }
      const match = findQuestionByQuery(value);
      if (match) {
        setSearchError(null);
        router.push(`/questions/${match.slug}`);
        return;
      }
      setSearchError('Nenhuma pergunta encontrada para sua pesquisa.');
      searchInputRef.current?.select();
    },
    [findQuestionByQuery, router, searchTerm]
  );

  const handleQuickSearch = React.useCallback(
    (value: string) => {
      const normalized = value.toLowerCase();
      const category = categories.find(
        (cat) => cat.id.toLowerCase() === normalized || cat.title.toLowerCase() === normalized
      );
      if (category) {
        setSearchError(null);
        router.push(`/categories/${category.slug}`);
        return;
      }

      const match = findQuestionByQuery(value);
      if (match) {
        setSearchError(null);
        router.push(`/questions/${match.slug}`);
        return;
      }

      setSearchTerm(value);
      setSearchError('Nenhum resultado encontrado para a busca selecionada.');
      searchInputRef.current?.focus();
    },
    [findQuestionByQuery, router]
  );

  const handleGoToChat = React.useCallback(() => {
    router.push('/chat');
  }, [router]);

  React.useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader
        variant="home"
        searchTerm={searchTerm}
        searchInputRef={searchInputRef}
        onSearchTermChange={handleSearchTermChange}
        onSearchSubmit={handleSearchSubmit}
        onPrimaryAction={handleGoToChat}
      />

      <div className="flex-1 bg-gradient-to-b from-background via-background to-background/60">
        <div className="container flex flex-col gap-12 py-12">
          {searchError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {searchError}
            </div>
          ) : null}
          <HeroSection quickSearches={quickSearches} onQuickSearch={handleQuickSearch} />
          <CategorySection categories={categories} />
          <ContactSection onChatClick={handleGoToChat} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
