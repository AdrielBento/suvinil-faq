'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { categories, chatSuggestions, knowledgeBase, quickSearches } from '../lib/data';

type FaqMode =
  | { type: 'category'; categoryId: string }
  | { type: 'search'; query: string };

type ChatMessage = {
  id: string;
  role: 'bot' | 'user';
  content: string;
  createdAt: number;
};

type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  preview: string;
};

const THREADS_KEY = 'suv-threads';
const ACTIVE_KEY = 'suv-active-thread';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function formatMessage(content: string) {
  const escaped = escapeHtml(content);
  const withBreaks = escaped.replace(/\n/g, '<br>');
  const withBold = withBreaks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withBold.replace(/\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');
}

function normalisePreview(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function findKnowledgeAnswer(query: string) {
  const lower = query.toLowerCase();
  const hit = knowledgeBase.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return hit?.answer ?? null;
}

export default function HomePage() {
  const defaultCategory = categories[0];
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [faqMode, setFaqMode] = useState<FaqMode>({ type: 'category', categoryId: defaultCategory.id });
  const [searchTerm, setSearchTerm] = useState('');

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadFilter, setThreadFilter] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChatMaximized, setChatMaximized] = useState(false);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId]
  );

  const filteredThreads = useMemo(() => {
    const term = threadFilter.trim().toLowerCase();
    return threads
      .slice()
      .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
      .filter((thread) => {
        if (!term) return true;
        const title = thread.title?.toLowerCase() ?? '';
        const preview = thread.preview?.toLowerCase() ?? '';
        return title.includes(term) || preview.includes(term);
      });
  }, [threadFilter, threads]);

  const faqState = useMemo(() => {
    if (faqMode.type === 'category') {
      const category = categories.find((cat) => cat.id === faqMode.categoryId) ?? defaultCategory;
      return {
        title: category.title,
        subtitle: category.questions.length ? 'Dúvidas relacionadas' : '',
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

  const scrollToFaq = useCallback(() => {
    faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const focusChat = useCallback(() => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 160);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  const appendMessage = useCallback((threadId: string, message: ChatMessage) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }
        const updatedMessages = [...thread.messages, message];
        const preview = normalisePreview(message.content).slice(0, 120);
        let title = thread.title;
        if ((!title || title === 'Nova conversa') && message.role === 'user') {
          title = normalisePreview(message.content).slice(0, 42) || 'Conversa';
        }
        return {
          ...thread,
          title,
          messages: updatedMessages,
          updatedAt: Date.now(),
          preview
        };
      })
    );
  }, []);

  const createThread = useCallback((title = 'Nova conversa') => {
    const id = uid('t');
    const welcome: ChatMessage = {
      id: uid('m'),
      role: 'bot',
      content: 'Olá! Sou o **Assistente Suvinil**. Como posso ajudar hoje?',
      createdAt: Date.now()
    };
    const newThread: ChatThread = {
      id,
      title,
      messages: [welcome],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      preview: normalisePreview(welcome.content).slice(0, 120)
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(id);
    return id;
  }, []);

  const sendTextToAssistant = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      setChatInput('');

      let threadId = activeThreadId;
      if (!threadId) {
        threadId = createThread('Nova conversa');
      }
      if (!threadId) return;

      setActiveThreadId(threadId);

      const userMessage: ChatMessage = {
        id: uid('m'),
        role: 'user',
        content: trimmed,
        createdAt: Date.now()
      };
      appendMessage(threadId, userMessage);

      const answer = findKnowledgeAnswer(trimmed);
      const response = answer
        ? `${answer}\n\n<small style="color:var(--muted)">Dica: se quiser, pergunte por *produtos*, *aplicação*, *cores* ou *trocas*.</small>`
        : 'Posso ajudar com **produtos**, **aplicação**, **cores** e **trocas/devoluções**. Descreva sua dúvida ou clique em uma sugestão acima.';

      const botMessage: ChatMessage = {
        id: uid('m'),
        role: 'bot',
        content: response,
        createdAt: Date.now()
      };
      appendMessage(threadId, botMessage);
    },
    [activeThreadId, appendMessage, createThread]
  );

  const handleSend = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    sendTextToAssistant(text);
    setChatInput('');
  }, [chatInput, sendTextToAssistant]);

  const handleSearchSubmit = useCallback(
    (event?: FormEvent) => {
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

  useEffect(() => {
    setIsHydrated(true);
    if (typeof document === 'undefined') return;
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stored = localStorage.getItem(THREADS_KEY);
      const active = localStorage.getItem(ACTIVE_KEY);
      if (stored) {
        const parsed: ChatThread[] = JSON.parse(stored);
        setThreads(parsed.map((thread) => ({
          ...thread,
          createdAt: thread.createdAt || Date.now(),
          updatedAt: thread.updatedAt || thread.createdAt || Date.now(),
          messages: (thread.messages || []).map((message) => ({
            ...message,
            createdAt: message.createdAt || Date.now()
          }))
        })));
      }
      if (active) {
        setActiveThreadId(active);
      }
    } catch {
      setThreads([]);
      setActiveThreadId(null);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (threads.length) {
      try {
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(THREADS_KEY);
    }
    if (activeThreadId) {
      try {
        localStorage.setItem(ACTIVE_KEY, activeThreadId);
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeThreadId, isHydrated, threads]);

  useEffect(() => {
    if (!isHydrated || threads.length) return;
    createThread('Nova conversa');
  }, [createThread, isHydrated, threads.length]);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight });
  }, [activeThread?.messages.length]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const updateInsets = () => {
      const vv = window.visualViewport;
      let offset = 0;
      if (vv && window.innerHeight) {
        offset = Math.max(0, Math.round(window.innerHeight - vv.height));
      }
      document.documentElement.style.setProperty('--kb-offset', `${offset}px`);
    };
    updateInsets();
    window.addEventListener('resize', updateInsets);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateInsets);
      window.visualViewport.addEventListener('scroll', updateInsets);
    }
    return () => {
      window.removeEventListener('resize', updateInsets);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateInsets);
        window.visualViewport.removeEventListener('scroll', updateInsets);
      }
    };
  }, []);

  useEffect(() => {
    if (!chatInputRef.current) return;
    const el = chatInputRef.current;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [chatInput]);

  const themeIcon = theme === 'dark' ? '🌞' : '🌙';

  return (
    <main>
      <header>
        <div className="nav container">
          <div className="brand" aria-label="Suvinil">
            <div className="brand-badge" aria-hidden="true">
              S
            </div>
            <span>Central de Ajuda • Suvinil</span>
          </div>
          <form
            className="searchbar"
            role="search"
            aria-label="Pesquisar artigos"
            onSubmit={handleSearchSubmit}
          >
            <input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="search"
              placeholder="Digite sua dúvida…"
              aria-label="Digite sua dúvida"
            />
            <button type="submit" title="Pesquisar (⌘K)" aria-label="Pesquisar">
              Pesquisar
            </button>
          </form>
          <div className="actions">
            <button id="theme-btn" className="icon-btn" aria-label="Alternar tema" onClick={toggleTheme}>
              <span>{themeIcon}</span>
              <span style={{ whiteSpace: 'nowrap' }}>Tema</span>
            </button>
            <button className="icon-btn" aria-label="Ir para o chat" onClick={focusChat}>
              💬 Chat
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <figure className="hero" aria-label="Hero com destaque visual">
          <section>
            <h1>Como podemos ajudar?</h1>
            <p>Pesquise por palavras-chave, navegue por categorias ou converse com nosso assistente.</p>
            <div className="quick-search" aria-label="Sugestões rápidas">
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    const category = categories.find((cat) => cat.id === item);
                    if (category) {
                      setFaqMode({ type: 'category', categoryId: category.id });
                    } else {
                      setFaqMode({ type: 'search', query: item });
                    }
                    scrollToFaq();
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        </figure>

        <section className="section" aria-labelledby="cats-title">
          <h2 id="cats-title">Navegue por categorias</h2>
          <div className="grid" id="cats">
            {categories.map((category) => (
              <button
                key={category.id}
                className="cat"
                data-cat={category.id}
                onClick={() => {
                  setFaqMode({ type: 'category', categoryId: category.id });
                  scrollToFaq();
                }}
                type="button"
              >
                <div className="icon">{category.icon}</div>
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="faq" className="section" aria-labelledby="faq-title" ref={faqRef}>
          <div className="faq-header">
            <h2 id="faq-title">{faqState.title}</h2>
            <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{faqState.subtitle}</div>
          </div>
          <div className="faq" id="faq-list">
            {faqState.items.length ? (
              <div className="faq-list" role="list">
                {faqState.items.map(({ question }) => (
                  <button
                    key={question}
                    type="button"
                    role="listitem"
                    onClick={() => {
                      sendTextToAssistant(question);
                      focusChat();
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : (
              <p>Nenhum resultado encontrado.</p>
            )}
          </div>
        </section>

        <section className="section" aria-labelledby="contact-title">
          <h2 id="contact-title">Não encontrou o que procurava?</h2>
          <p>Fale com a gente pelos canais abaixo.</p>
          <div className="contact">
            <article className="card">
              <h3>Telefone</h3>
              <p>
                <strong>0800 011 7558</strong>
                <br />
                <small>Seg. a sex., 8h–17h</small>
              </p>
              <a className="btn" href="tel:08000117558" aria-label="Ligar para 0800 011 7558">
                Ligar
              </a>
            </article>
            <article className="card">
              <h3>E-mail</h3>
              <p>Envie sua mensagem e retornamos assim que possível.</p>
              <a className="btn" href="mailto:suporte@example.com">
                Enviar mensagem
              </a>
            </article>
            <article className="card">
              <h3>Chat online</h3>
              <p>
                <small>Seg. a sex., 8h–19h</small>
              </p>
              <button className="btn" onClick={focusChat}>
                Iniciar chat
              </button>
            </article>
          </div>
        </section>
      </div>

      <section id="chat-hub" className="section" aria-labelledby="chat-hub-title" ref={chatSectionRef}>
        <div className="container" style={{ paddingTop: 0 }}>
          <h2 id="chat-hub-title">Converse com o Assistente</h2>
          <div className="chat-app" id="chat-app">
            <aside className="threads" id="threads" aria-label="Histórico de conversas">
              <div className="threads-head">
                <button className="btn" onClick={() => createThread('Nova conversa')} aria-label="Iniciar nova conversa">
                  + Nova conversa
                </button>
                <input
                  value={threadFilter}
                  onChange={(event) => setThreadFilter(event.target.value)}
                  className="threads-search"
                  type="search"
                  placeholder="Buscar conversa"
                  aria-label="Buscar conversa"
                />
              </div>
              <nav className="threads-list" id="threads-list" role="list">
                {filteredThreads.map((thread) => {
                  const count = thread.messages.length;
                  const lastRole = thread.messages[count - 1]?.role ?? 'bot';
                  const who = lastRole === 'bot' ? 'bot' : 'você';
                  const stamp = new Date(thread.updatedAt || thread.createdAt).toLocaleString('pt-BR');
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      className={`thread-item${thread.id === activeThreadId ? ' active' : ''}`}
                      onClick={() => setActiveThreadId(thread.id)}
                      role="listitem"
                    >
                      <div>
                        <div className="thread-title">{thread.title || 'Conversa'}</div>
                        <div className="thread-meta">
                          {count} msg{count !== 1 ? 's' : ''} • último: {who} • {stamp}
                        </div>
                      </div>
                      <div className="thread-right">
                        <span className="count-badge">{count}</span>
                        <div className="thread-actions">
                          <button
                            type="button"
                            title="Renomear"
                            onClick={(event) => {
                              event.stopPropagation();
                              const current = window.prompt('Novo título da conversa:', thread.title || 'Conversa');
                              if (current !== null) {
                                const trimmed = current.trim();
                                if (trimmed) {
                                  setThreads((prev) =>
                                    prev.map((item) =>
                                      item.id === thread.id
                                        ? { ...item, title: trimmed, updatedAt: Date.now() }
                                        : item
                                    )
                                  );
                                }
                              }
                            }}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            title="Excluir"
                            onClick={(event) => {
                              event.stopPropagation();
                              setThreads((prev) => {
                                const next = prev.filter((item) => item.id !== thread.id);
                                if (thread.id === activeThreadId) {
                                  setActiveThreadId(next[0]?.id ?? null);
                                }
                                return next;
                              });
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="chat-col" aria-label="Área do chat">
              <aside className={`chat-drawer embedded${isChatMaximized ? ' open' : ''}`} id="chat">
                <div className="chat-head">
                  <div className="chat-title">
                    <div className="bot-badge">S</div>
                    <div>
                      <strong>Assistente Suvinil</strong>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>Produtos • Aplicação • Cores • Trocas</small>
                    </div>
                  </div>
                  <div className="actions">
                    <button
                      className="icon-btn"
                      aria-label="Maximizar/Restaurar"
                      onClick={() => setChatMaximized((value) => !value)}
                    >
                      ⛶
                    </button>
                  </div>
                </div>
                <div className="chat-body" id="chat-body" ref={chatBodyRef} aria-live="polite">
                  {activeThread?.messages.map((message) => (
                    <div className={`msg ${message.role}`} key={message.id}>
                      <div className="bot-badge">{message.role === 'bot' ? 'S' : '😊'}</div>
                      <div className="bubble" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <div>
                    <div className="chat-suggestions">
                      {chatSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            sendTextToAssistant(suggestion);
                            focusChat();
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Escreva sua dúvida (Shift+Enter para quebrar linha)…"
                      aria-label="Mensagem"
                    />
                  </div>
                  <button className="btn" onClick={handleSend} aria-label="Enviar mensagem">
                    Enviar
                  </button>
                </div>
              </aside>
            </section>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>
            © {new Date().getFullYear()} Suvinil • Central de Ajuda •{' '}
            <a href="#">Política de privacidade</a>
          </p>
          <p>
            <small>
              Dica: pressione <kbd>⌘</kbd>
              <kbd>K</kbd> ou <kbd>Ctrl</kbd>
              <kbd>K</kbd> para pesquisar.
            </small>
          </p>
        </div>
      </footer>
    </main>
  );
}
