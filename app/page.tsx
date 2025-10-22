'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { ContactSection } from '@/components/home/contact-section';
import { CategorySection } from '@/components/home/category-section';
import { FaqSection } from '@/components/home/faq-section';
import { HeroSection } from '@/components/home/hero-section';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { categories, quickSearches } from '@/lib/data';

export type FaqMode =
  | { type: 'category'; categoryId: string }
  | { type: 'search'; query: string };

type FaqState = {
  title: string;
  subtitle?: string;
  items: { question: string; category: string }[];
};

export default function HomePage() {
  const router = useRouter();
  const defaultCategory = categories[0];
  const [faqMode, setFaqMode] = React.useState<FaqMode>({ type: 'category', categoryId: defaultCategory.id });
  const [searchTerm, setSearchTerm] = React.useState('');

  const faqRef = React.useRef<HTMLDivElement | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const faqState = React.useMemo<FaqState>(() => {
    if (faqMode.type === 'category') {
      const category = categories.find((item) => item.id === faqMode.categoryId) ?? defaultCategory;
      return {
        title: category.title,
        subtitle: category.questions.length ? 'Dúvidas relacionadas' : undefined,
        items: category.questions.map((question) => ({ question, category: category.id }))
      };
    }

    const query = faqMode.query.toLowerCase();
    const matches = categories.flatMap((category) =>
      category.questions
        .filter((question) => question.toLowerCase().includes(query))
        .map((question) => ({ question, category: category.id }))
    );
    return {
      title: 'Resultados da busca',
      subtitle: `${matches.length} resultado(s)`,
      items: matches
    };
  }, [defaultCategory, faqMode]);

  const scrollToFaq = React.useCallback(() => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleSearchSubmit = React.useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const value = searchTerm.trim();
      if (!value) {
        searchInputRef.current?.focus();
        return;
      }
      setFaqMode({ type: 'search', query: value });
      scrollToFaq();
    },
    [scrollToFaq, searchTerm]
  );

  const handleQuickSearch = React.useCallback(
    (value: string) => {
      const category = categories.find((cat) => cat.id === value);
      if (category) {
        setFaqMode({ type: 'category', categoryId: category.id });
      } else {
        setFaqMode({ type: 'search', query: value });
      }
      setSearchTerm(value);
      scrollToFaq();
    },
    [scrollToFaq]
  );

  const handleCategorySelect = React.useCallback(
    (categoryId: string) => {
      setFaqMode({ type: 'category', categoryId });
      setSearchTerm('');
      scrollToFaq();
    },
    [scrollToFaq]
  );

  const handleQuestionSelect = React.useCallback(
    (question: string) => {
      const query = encodeURIComponent(question);
      router.push(`/chat?query=${query}`);
    },
    [router]
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
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        onPrimaryAction={handleGoToChat}
      />

      <div className="flex-1 bg-gradient-to-b from-background via-background to-background/60">
        <div className="container flex flex-col gap-12 py-12">
          <HeroSection quickSearches={quickSearches} onQuickSearch={handleQuickSearch} />
          <CategorySection categories={categories} onSelectCategory={handleCategorySelect} />
          <div ref={faqRef} className="scroll-mt-24">
            <FaqSection
              title={faqState.title}
              subtitle={faqState.subtitle}
              items={faqState.items}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
          <ContactSection onChatClick={handleGoToChat} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
