export type Category = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: string[];
};

export type KnowledgeBaseEntry = {
  keywords: string[];
  answer: string;
};

export const quickSearches = ['Troca e devolução', 'Cores', 'Self-Color', 'Produtos'] as const;

export const categories: Category[] = [
  {
    id: 'Produtos',
    title: 'Produtos',
    description: 'Acabamentos, linhas e indicação de uso.',
    icon: '🎨',
    questions: [
      'Quais produtos e técnicas devo utilizar para pintar azulejos?',
      'Como obter a Ficha de Informação de Segurança de Produto Químico (FISPQ)?',
      'Como posso obter o boletim técnico?',
      'Qual o rendimento dos produtos?',
      'Ferramentas para escolha de cor - Leque de cores / Adesivos / Colorir / Teste sua Cor',
      'Quais são os produtos laváveis?',
      'Quais são os produtos recomendados para madeira?',
      'Quais ferramentas (pincel, trincha, rolo, pistola) devo utilizar na aplicação da tinta?',
      'Como faço para impermeabilizar uma superfície?',
      'Quais cuidados devo adotar no descarte de resíduos e latas de tintas?',
      'Como faço para conhecer e escolher um produto?'
    ]
  },
  {
    id: 'Aplicação',
    title: 'Aplicação',
    description: 'Preparo da superfície, rendimento e etapas.',
    icon: '🧰',
    questions: [
      'Como preparar a superfície antes de pintar?',
      'Quantas demãos devo aplicar?',
      'Qual o tempo de secagem entre demãos?',
      'Como calcular a quantidade de tinta?'
    ]
  },
  {
    id: 'Cores',
    title: 'Cores',
    description: 'Como escolher, combinar e manter.',
    icon: '🌈',
    questions: [
      'Como escolher cores para ambientes pequenos?',
      'Como combinar cores quentes e frias?',
      'Como manter a cor ao retocar paredes?'
    ]
  },
  {
    id: 'Self-Color',
    title: 'Self-Color',
    description: 'Tingimento e dúvidas comuns.',
    icon: '🧪',
    questions: [
      'O que é o sistema Self-Color?',
      'Como repetir a mesma cor no futuro?',
      'Como ler o rótulo com a receita da cor?'
    ]
  },
  {
    id: 'Troca e devolução',
    title: 'Troca e devolução',
    description: 'Política, prazos e acompanhamento.',
    icon: '🔁',
    questions: [
      'Como solicitar troca ou devolução?',
      'Quais itens não podem ser devolvidos?',
      'Qual o prazo para devolução?'
    ]
  },
  {
    id: 'Outras dúvidas',
    title: 'Outras dúvidas',
    description: 'Quando não souber por onde começar.',
    icon: '💬',
    questions: [
      'Como falar com o suporte?',
      'Onde encontro lojas parceiras?'
    ]
  },
  {
    id: 'Plataformas',
    title: 'Plataformas',
    description: 'Conta, senha e acesso.',
    icon: '🔌',
    questions: [
      'Esqueci minha senha. E agora?',
      'Como atualizar meus dados de cadastro?'
    ]
  },
  {
    id: 'Programas',
    title: 'Programas',
    description: 'Relacionamento e benefícios.',
    icon: '🤝',
    questions: [
      'Como participar de programas de relacionamento?',
      'Quais são os benefícios disponíveis?'
    ]
  }
];

export const chatSuggestions = ['Produtos', 'Aplicação', 'Cores', 'Troca e devolução', 'Self-Color'] as const;

export const knowledgeBase: KnowledgeBaseEntry[] = [
  {
    keywords: ['troca', 'devolução', 'garantia'],
    answer:
      'Para **trocas e devoluções**, guarde seu comprovante e entre em contato em até 7 dias corridos após o recebimento. Produtos personalizados (ex.: Self‑Color) seguem regras específicas.'
  },
  {
    keywords: ['aplicação', 'preparo', 'rendimento', 'm²', 'metros'],
    answer:
      'Para **aplicação**, lixe levemente, limpe a superfície e aplique 2 a 3 demãos conforme o **rendimento indicado na embalagem**. Aguarde o tempo de secagem entre demãos.'
  },
  {
    keywords: ['cores', 'tendência', 'combinar'],
    answer:
      'Escolha **cores** considerando iluminação e tamanho do ambiente. Tons quentes (ex.: laranjas Suvinil) criam aconchego; frios ampliam espaços. Teste antes com adesivos ou amostras.'
  },
  {
    keywords: ['self-color', 'tingimento', 'pasta', 'máquina'],
    answer:
      '**Self‑Color** é o sistema de tingimento em máquina. As receitas garantem repetibilidade. Guarde o código da cor para futuras compras.'
  },
  {
    keywords: ['produto', 'qual tinta', 'acabamento', 'fosco', 'acetinado', 'semibrilho'],
    answer:
      'Para **acabamentos**: *Fosco* disfarça imperfeições; *Acetinado* facilita a limpeza; *Semibrilho* é mais resistente em áreas úmidas.'
  }
];
