export type Question = {
  id: string;
  slug: string;
  question: string;
  answer: string;
};

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
};

export type KnowledgeBaseEntry = {
  keywords: string[];
  answer: string;
};

const slugify = (input: string) =>
  input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const createQuestion = (question: string, answer: string): Question => {
  const slug = slugify(question);
  return {
    id: slug,
    slug,
    question,
    answer
  };
};

export const quickSearches = ['Troca e devolução', 'Cores', 'Self-Color', 'Produtos'] as const;

export const categories: Category[] = [
  {
    id: 'Produtos',
    slug: 'produtos',
    title: 'Produtos',
    description: 'Acabamentos, linhas e indicação de uso.',
    icon: '🎨',
    questions: [
      createQuestion(
        'Quais produtos e técnicas devo utilizar para pintar azulejos?',
        'Limpe bem os azulejos com detergente neutro, enxágue e remova o brilho com lixa fina. Aplique uma demão do Suvinil Preparador Multiuso ou do Primer Epóxi e, depois, finalize com a tinta Suvinil Epóxi Multiuso ou com Suvinil Toque de Seda em áreas secas, sempre respeitando o intervalo de secagem indicado na embalagem.'
      ),
      createQuestion(
        'Como obter a Ficha de Informação de Segurança de Produto Químico (FISPQ)?',
        'Cada produto Suvinil possui uma FISPQ disponível para download no site oficial. Acesse a página do produto desejado, procure pela área de documentos e baixe o arquivo. Se preferir, solicite o envio pelo atendimento Suvinil com o código do produto em mãos.'
      ),
      createQuestion(
        'Como posso obter o boletim técnico?',
        'Os boletins técnicos estão disponíveis no site da Suvinil na página de cada produto. Clique em “Documentos” e faça o download do PDF atualizado. Caso tenha dificuldade, entre em contato com o suporte informando o nome e o código do produto.'
      ),
      createQuestion(
        'Qual o rendimento dos produtos?',
        'O rendimento varia conforme o tipo de tinta e a condição da superfície. Consulte a tabela de rendimento na embalagem ou no boletim técnico: as tintas imobiliárias costumam render de 200 m² a 300 m² por demão para latas de 18 L em superfícies seladas e lisas. Sempre calcule uma margem extra para eventuais retoques.'
      ),
      createQuestion(
        'Ferramentas para escolha de cor - Leque de cores / Adesivos / Colorir / Teste sua Cor',
        'Você pode conhecer as cores Suvinil pelo Leque de Cores impresso, pelos adesivos reutilizáveis “Teste Sua Cor”, pelo aplicativo Suvinil Colorir e pelos simuladores no site. Combine os recursos para visualizar diferentes tonalidades antes de decidir.'
      ),
      createQuestion(
        'Quais são os produtos laváveis?',
        'As linhas Suvinil Toque de Seda, Família Protegida, AntiBactéria & Antimofo e Limpeza Total possuem acabamento lavável. Elas formam uma película resistente que permite limpeza com pano úmido e detergente neutro sem manchar a pintura.'
      ),
      createQuestion(
        'Quais são os produtos recomendados para madeira?',
        'Para madeiras internas utilize Suvinil Esmalte Premium ou Suvinil Verniz Copal. Em áreas externas opte por Suvinil Verniz Proteção Máxima, Suvinil Cetol Deck ou Suvinil Esmalte Proteção Total. Prepare a superfície com fundo nivelador ou seladora conforme a recomendação de cada sistema.'
      ),
      createQuestion(
        'Quais ferramentas (pincel, trincha, rolo, pistola) devo utilizar na aplicação da tinta?',
        'Rolos de lã ou espuma de poliéster são ideais para paredes; rolos de espuma dão melhor acabamento em esmaltes e vernizes. Use pincéis ou trinchas para cantos, recortes e detalhes. A aplicação com pistola é recomendada para profissionais, sempre ajustando a diluição indicada pelo fabricante.'
      ),
      createQuestion(
        'Como faço para impermeabilizar uma superfície?',
        'Verifique o tipo de substrato e utilize sistemas específicos, como Suvinil Vedapren Parede para áreas externas ou Suvinil Impermeabilizante 100 para áreas molhadas. Garanta limpeza, regularização e aplicação das demãos mínimas para formar a manta impermeável antes do acabamento final.'
      ),
      createQuestion(
        'Quais cuidados devo adotar no descarte de resíduos e latas de tintas?',
        'Deixe a lata aberta até que a tinta restante seque totalmente e encaminhe o material para postos de coleta seletiva ou pontos de logística reversa. Nunca descarte resíduos líquidos em redes de esgoto. Consulte o programa “Suvinil Recolhe” ou o serviço municipal de coleta na sua região.'
      ),
      createQuestion(
        'Como faço para conhecer e escolher um produto?',
        'Use o Guia de Produtos no site Suvinil para filtrar por ambiente, acabamento e necessidade. Cada página mostra características, rendimento, recomendações de uso e documentos técnicos. Se restar dúvida, consulte um revendedor autorizado ou fale com o atendimento Suvinil para receber orientação personalizada.'
      )
    ]
  },
  {
    id: 'Aplicação',
    slug: 'aplicacao',
    title: 'Aplicação',
    description: 'Preparo da superfície, rendimento e etapas.',
    icon: '🧰',
    questions: [
      createQuestion(
        'Como preparar a superfície antes de pintar?',
        'Remova poeira, gordura e mofo, corrija imperfeições com massa apropriada e lixe para uniformizar. Em superfícies novas aplique fundo selador ou preparador Suvinil para regularizar a absorção. A pintura só deve começar quando a base estiver firme, seca e limpa.'
      ),
      createQuestion(
        'Quantas demãos devo aplicar?',
        'A maioria das tintas Suvinil alcança cobertura total com duas demãos, podendo ser necessária uma terceira em cores intensas ou sobre superfícies muito contrastantes. Respeite o intervalo de secagem indicado e não sobrecarregue o rolo para evitar marcas.'
      ),
      createQuestion(
        'Qual o tempo de secagem entre demãos?',
        'Em condições ideais (25 °C e umidade até 50%) aguarde cerca de 2 horas entre demãos para tintas à base d’água e 6 a 8 horas para esmaltes e vernizes à base de solvente. Temperaturas baixas ou alta umidade podem exigir intervalos maiores.'
      ),
      createQuestion(
        'Como calcular a quantidade de tinta?',
        'Some a área das paredes e tetos (largura × altura) e subtraia portas e janelas. Divida o resultado pelo rendimento informado na embalagem para cada demão e multiplique pela quantidade de demãos planejadas. Acrescente 10% de margem para eventuais retoques.'
      )
    ]
  },
  {
    id: 'Cores',
    slug: 'cores',
    title: 'Cores',
    description: 'Como escolher, combinar e manter.',
    icon: '🌈',
    questions: [
      createQuestion(
        'Como escolher cores para ambientes pequenos?',
        'Prefira tons claros ou neutros para ampliar a sensação de espaço e aproveite contrastes suaves em detalhes para criar profundidade. Combine com boa iluminação natural ou artificial e utilize o simulador Suvinil para testar combinações antes de pintar.'
      ),
      createQuestion(
        'Como combinar cores quentes e frias?',
        'Use as cores frias (azuis, verdes) para equilibrar ambientes muito quentes e aplique tons quentes (amarelos, laranjas) em pontos de destaque. Trabalhe com uma base neutra e repita a paleta em objetos decorativos para manter a harmonia visual.'
      ),
      createQuestion(
        'Como manter a cor ao retocar paredes?',
        'Guarde o código da cor e o número do lote utilizado. Antes do retoque, limpe a área e faça pequenos testes em regiões discretas. Aplique a tinta com o mesmo tipo de rolo e pressão para minimizar diferenças de textura e, se possível, repinte toda a parede.'
      )
    ]
  },
  {
    id: 'Self-Color',
    slug: 'self-color',
    title: 'Self-Color',
    description: 'Tingimento e dúvidas comuns.',
    icon: '🧪',
    questions: [
      createQuestion(
        'O que é o sistema Self-Color?',
        'Self-Color é o sistema de tingimento computadorizado da Suvinil disponível em lojas parceiras. A máquina mistura bases e pigmentos conforme a receita selecionada, garantindo precisão na cor e repetibilidade em compras futuras.'
      ),
      createQuestion(
        'Como repetir a mesma cor no futuro?',
        'Guarde o cupom ou etiqueta com o nome da cor, código e composição da receita. Leve essas informações a uma loja com sistema Self-Color para reproduzir a cor exatamente como foi produzida na primeira compra.'
      ),
      createQuestion(
        'Como ler o rótulo com a receita da cor?',
        'O rótulo apresenta o nome da cor, a base utilizada, o volume da embalagem e a dosagem de cada pigmento. Com esses dados o lojista consegue localizar a mesma fórmula no software Self-Color e preparar uma nova lata idêntica.'
      )
    ]
  },
  {
    id: 'Troca e devolução',
    slug: 'troca-e-devolucao',
    title: 'Troca e devolução',
    description: 'Política, prazos e acompanhamento.',
    icon: '🔁',
    questions: [
      createQuestion(
        'Como solicitar troca ou devolução?',
        'Entre em contato com o canal onde realizou a compra (loja física, e-commerce ou televendas) informando número da nota fiscal, produto e motivo. Para compras online você também pode acionar o formulário de atendimento Suvinil em até 7 dias corridos após o recebimento.'
      ),
      createQuestion(
        'Quais itens não podem ser devolvidos?',
        'Produtos personalizados pelo sistema Self-Color, itens abertos, danificados ou com sinais de uso não são elegíveis para devolução, exceto em caso de defeito constatado. Verifique também as condições específicas do revendedor.'
      ),
      createQuestion(
        'Qual o prazo para devolução?',
        'Para compras realizadas fora do estabelecimento comercial o prazo legal de arrependimento é de 7 dias corridos após o recebimento. Em lojas físicas siga a política do revendedor, apresentando a nota fiscal e mantendo a embalagem original.'
      )
    ]
  },
  {
    id: 'Outras dúvidas',
    slug: 'outras-duvidas',
    title: 'Outras dúvidas',
    description: 'Quando não souber por onde começar.',
    icon: '💬',
    questions: [
      createQuestion(
        'Como falar com o suporte?',
        'Utilize o telefone 0800 011 7558, o chat disponível no site Suvinil ou envie mensagem pelo formulário de contato. Informe nome, cidade, produto e descreva a dúvida para agilizar o atendimento.'
      ),
      createQuestion(
        'Onde encontro lojas parceiras?',
        'No site Suvinil acesse o localizador de lojas, informe seu CEP e filtre por serviços desejados, como Self-Color ou entrega. A ferramenta mostra endereços, telefones e rotas das revendas mais próximas.'
      )
    ]
  },
  {
    id: 'Plataformas',
    slug: 'plataformas',
    title: 'Plataformas',
    description: 'Conta, senha e acesso.',
    icon: '🔌',
    questions: [
      createQuestion(
        'Esqueci minha senha. E agora?',
        'Acesse o portal Suvinil e clique em “Esqueci minha senha”. Informe o e-mail cadastrado para receber um link de redefinição. Verifique a caixa de entrada e o spam. Caso não receba, solicite suporte informando CPF ou CNPJ cadastrado.'
      ),
      createQuestion(
        'Como atualizar meus dados de cadastro?',
        'Faça login no portal e acesse a área “Meu Perfil”. Atualize telefone, endereço e demais informações e confirme as alterações. Se tiver dificuldades, entre em contato com o suporte enviando os dados atualizados para validação manual.'
      )
    ]
  },
  {
    id: 'Programas',
    slug: 'programas',
    title: 'Programas',
    description: 'Relacionamento e benefícios.',
    icon: '🤝',
    questions: [
      createQuestion(
        'Como participar de programas de relacionamento?',
        'Verifique no site Suvinil ou com seu representante comercial os programas disponíveis, como Clube Amigo Pintor. Preencha o formulário de inscrição com dados pessoais e profissionais e aguarde a confirmação do cadastro por e-mail.'
      ),
      createQuestion(
        'Quais são os benefícios disponíveis?',
        'Os programas de relacionamento oferecem treinamentos, materiais exclusivos, promoções e acúmulo de pontos que podem ser trocados por prêmios. Consulte o regulamento de cada programa para conhecer regras, prazos e catálogo de recompensas.'
      )
    ]
  }
];

export type QuestionDetails = {
  question: Question;
  category: Category;
};

export const allQuestions: QuestionDetails[] = categories.flatMap((category) =>
  category.questions.map((question) => ({
    question,
    category
  }))
);

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getQuestionBySlug(slug: string): QuestionDetails | null {
  return allQuestions.find((item) => item.question.slug === slug) ?? null;
}

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
