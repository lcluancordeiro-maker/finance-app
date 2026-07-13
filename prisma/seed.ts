import { PrismaClient, AssetType } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

type SeedQuestion = { question: string; options: string[]; correctIndex: number };
type SeedLesson = {
  slug: string;
  title: string;
  videoUrl: string;
  content: string;
  questions: SeedQuestion[];
};
type SeedTrack = {
  slug: string;
  title: string;
  description: string;
  level: string;
  lessons: SeedLesson[];
};

const tracks: SeedTrack[] = [
  {
    slug: "basico",
    title: "Fundamentos das Finanças",
    description: "O ponto de partida: orçamento, dívidas e reserva de emergência.",
    level: "Básico",
    lessons: [
      {
        slug: "orcamento-pessoal",
        title: "O que é orçamento pessoal",
        videoUrl: "",
        content:
          "Orçamento pessoal é o registro de tudo que você ganha e tudo que gasta em um período. Ele existe para responder a uma pergunta simples: para onde vai o meu dinheiro?\n\nUm método simples para começar é a regra 50-30-20: 50% da renda para necessidades (moradia, contas, alimentação), 30% para desejos (lazer, assinaturas) e 20% para poupança e quitação de dívidas.\n\nO primeiro passo prático é listar todas as fontes de renda e todos os gastos fixos e variáveis dos últimos 3 meses. Isso revela padrões que muita gente não percebe no dia a dia, como pequenos gastos recorrentes que somam um valor alto no fim do mês.",
        questions: [
          {
            question: "Na regra 50-30-20, para que servem os 20%?",
            options: ["Lazer", "Necessidades básicas", "Poupança e quitação de dívidas", "Impostos"],
            correctIndex: 2,
          },
          {
            question: "Qual é o primeiro passo prático para montar um orçamento?",
            options: [
              "Investir na bolsa",
              "Listar renda e gastos dos últimos meses",
              "Pedir um empréstimo",
              "Cancelar todos os cartões",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        slug: "sair-das-dividas",
        title: "Como sair das dívidas",
        videoUrl: "",
        content:
          "Dívidas com juros altos (cartão de crédito, cheque especial) devem ser priorizadas antes de qualquer investimento, porque o juro que você paga costuma ser maior do que qualquer retorno que você conseguiria investindo.\n\nDois métodos populares para organizar a quitação: método bola de neve (quita primeiro a menor dívida, ganhando motivação psicológica) e método avalanche (quita primeiro a dívida com maior taxa de juros, economizando mais dinheiro no total).\n\nRenegociar dívidas diretamente com o credor, buscando prazos maiores ou taxas menores, também costuma ser mais vantajoso do que deixar a dívida rolar no rotativo do cartão.",
        questions: [
          {
            question: "Por que dívidas com juros altos devem ser priorizadas?",
            options: [
              "Porque são ilegais",
              "Porque o juro pago costuma superar o retorno de investimentos",
              "Porque bancos exigem isso",
              "Não devem ser priorizadas",
            ],
            correctIndex: 1,
          },
          {
            question: "O método avalanche prioriza quitar qual dívida primeiro?",
            options: ["A menor dívida", "A mais antiga", "A com maior taxa de juros", "A do cartão de crédito sempre"],
            correctIndex: 2,
          },
        ],
      },
      {
        slug: "reserva-de-emergencia",
        title: "Reserva de emergência",
        videoUrl: "",
        content:
          "A reserva de emergência é um valor guardado para cobrir imprevistos (perda de emprego, problemas de saúde, conserto urgente) sem precisar recorrer a dívidas.\n\nO valor recomendado costuma ser de 3 a 6 meses do custo de vida mensal, podendo chegar a 12 meses para quem tem renda instável (autônomos, freelancers).\n\nEssa reserva deve ficar em um investimento de alta liquidez (resgate rápido) e baixo risco, como Tesouro Selic ou um CDB com liquidez diária, e não em investimentos de renda variável, que podem estar desvalorizados justamente no momento em que você precisar do dinheiro.",
        questions: [
          {
            question: "Quantos meses de custo de vida a reserva de emergência costuma cobrir?",
            options: ["1 mês", "3 a 6 meses", "10 anos", "Não tem regra"],
            correctIndex: 1,
          },
          {
            question: "Onde a reserva de emergência deve ficar aplicada?",
            options: [
              "Em ações de empresas pequenas",
              "Em criptomoedas",
              "Em investimento de alta liquidez e baixo risco",
              "Debaixo do colchão apenas",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  {
    slug: "intermediario",
    title: "Investimentos e Planejamento",
    description: "Renda fixa, renda variável, juros compostos e aposentadoria.",
    level: "Intermediário",
    lessons: [
      {
        slug: "renda-fixa-vs-variavel",
        title: "Renda fixa vs. renda variável",
        videoUrl: "",
        content:
          "Renda fixa é quando as regras de rentabilidade são definidas no momento da aplicação (ex: Tesouro Direto, CDB, LCI/LCA). O risco costuma ser menor e mais previsível.\n\nRenda variável é quando o retorno não é conhecido de antemão e pode variar bastante (ex: ações, fundos imobiliários, ETFs). O potencial de ganho é maior no longo prazo, mas com mais oscilação e risco.\n\nUma carteira equilibrada geralmente combina os dois tipos, na proporção que depende do perfil de risco do investidor, do prazo do objetivo e da necessidade de liquidez.",
        questions: [
          {
            question: "O que caracteriza um investimento de renda fixa?",
            options: [
              "Retorno desconhecido",
              "Regras de rentabilidade definidas no momento da aplicação",
              "Sempre maior risco",
              "É o mesmo que ações",
            ],
            correctIndex: 1,
          },
          {
            question: "Qual é uma vantagem típica da renda variável no longo prazo?",
            options: ["Menor risco", "Potencial de retorno maior", "Garantia do governo", "Liquidez imediata sempre"],
            correctIndex: 1,
          },
        ],
      },
      {
        slug: "juros-compostos-e-inflacao",
        title: "Juros compostos e inflação",
        videoUrl: "",
        content:
          "Juros compostos são juros sobre juros: o rendimento de um período passa a fazer parte do capital que rende no período seguinte. É por isso que investir cedo, mesmo com valores pequenos, faz tanta diferença no longo prazo.\n\nInflação é o aumento geral de preços ao longo do tempo, que reduz o poder de compra do dinheiro parado. Por isso, o retorno de um investimento deve ser comparado sempre com a inflação do período — esse é o chamado retorno real.\n\nUm investimento que rende 10% ao ano com inflação de 6% no mesmo período teve retorno real de aproximadamente 4%, não 10%.",
        questions: [
          {
            question: "O que são juros compostos?",
            options: ["Juros fixos sobre o capital inicial apenas", "Juros sobre juros", "Um tipo de imposto", "Taxa cobrada por bancos apenas em empréstimos"],
            correctIndex: 1,
          },
          {
            question: "O que é 'retorno real' de um investimento?",
            options: [
              "O retorno bruto anunciado",
              "O retorno descontado da inflação do período",
              "O valor investido inicialmente",
              "O imposto pago sobre o investimento",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        slug: "planejamento-aposentadoria",
        title: "Planejamento de aposentadoria",
        videoUrl: "",
        content:
          "Planejar a aposentadoria cedo aproveita o efeito dos juros compostos ao longo de décadas, exigindo aportes mensais bem menores do que quem começa tarde.\n\nNo Brasil, as principais opções complementares à previdência pública são a Previdência Privada (PGBL e VGBL) e a formação de patrimônio próprio via investimentos (ações, fundos imobiliários, renda fixa de longo prazo).\n\nPGBL costuma ser vantajoso para quem faz declaração completa do Imposto de Renda e contribui para o INSS, permitindo deduzir até 12% da renda bruta tributável. VGBL é mais indicado para quem faz declaração simplificada ou já atingiu o limite de dedução.",
        questions: [
          {
            question: "Por que começar a planejar a aposentadoria cedo é vantajoso?",
            options: [
              "Porque exige aportes maiores",
              "Aproveita o efeito dos juros compostos por mais tempo",
              "É obrigatório por lei",
              "Não faz diferença",
            ],
            correctIndex: 1,
          },
          {
            question: "PGBL costuma ser vantajoso para quem...",
            options: [
              "Faz declaração simplificada do IR",
              "Não contribui para o INSS",
              "Faz declaração completa do IR e contribui para o INSS",
              "Não paga Imposto de Renda",
            ],
            correctIndex: 2,
          },
        ],
      },
    ],
  },
  {
    slug: "avancado",
    title: "Estratégias Avançadas",
    description: "Alocação de ativos, análise de ações e otimização tributária.",
    level: "Avançado",
    lessons: [
      {
        slug: "alocacao-de-ativos",
        title: "Diversificação e alocação de ativos",
        videoUrl: "",
        content:
          "Alocação de ativos é a distribuição do patrimônio entre diferentes classes (renda fixa, ações, imóveis, moedas, ativos internacionais) para equilibrar risco e retorno.\n\nDiversificar reduz o risco não sistemático (específico de um ativo ou setor), mas não elimina o risco sistemático (que afeta todo o mercado, como uma crise econômica).\n\nUma técnica comum é o rebalanceamento periódico: revisar a carteira a cada 6-12 meses e ajustar as posições de volta à alocação-alvo definida, vendendo o que subiu além do previsto e comprando o que ficou abaixo.",
        questions: [
          {
            question: "O que a diversificação reduz?",
            options: ["O risco sistemático", "O risco não sistemático", "A inflação", "Os impostos"],
            correctIndex: 1,
          },
          {
            question: "O que é rebalanceamento de carteira?",
            options: [
              "Vender tudo e sair do mercado",
              "Ajustar periodicamente as posições de volta à alocação-alvo",
              "Investir só em um ativo",
              "Um tipo de imposto sobre investimentos",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        slug: "analise-fundamentalista",
        title: "Análise fundamentalista de ações",
        videoUrl: "",
        content:
          "Análise fundamentalista avalia o valor de uma empresa a partir de seus resultados financeiros, governança e perspectivas de mercado, buscando comprar ações abaixo do valor justo estimado.\n\nAlguns indicadores centrais: P/L (preço sobre lucro, quanto o mercado paga por cada real de lucro), ROE (retorno sobre patrimônio líquido, eficiência em gerar lucro com o capital dos acionistas) e Dívida Líquida/EBITDA (nível de endividamento em relação à geração de caixa operacional).\n\nNenhum indicador deve ser analisado isoladamente — o contexto do setor, o histórico de vários anos e a qualidade da gestão importam tanto quanto os números isolados de um único balanço.",
        questions: [
          {
            question: "O que o indicador P/L representa?",
            options: [
              "Quanto o mercado paga por cada real de lucro da empresa",
              "O total de dívidas da empresa",
              "O número de ações emitidas",
              "A taxa de juros do país",
            ],
            correctIndex: 0,
          },
          {
            question: "ROE mede principalmente:",
            options: [
              "O endividamento da empresa",
              "A eficiência em gerar lucro com o capital dos acionistas",
              "O preço da ação",
              "O volume negociado na bolsa",
            ],
            correctIndex: 1,
          },
        ],
      },
      {
        slug: "otimizacao-tributaria",
        title: "Estratégias tributárias e otimização fiscal",
        videoUrl: "",
        content:
          "Otimização tributária legal (não confundir com sonegação) envolve escolher estruturas e investimentos que reduzem a carga de impostos dentro da lei.\n\nExemplos comuns: isenção de Imposto de Renda em LCI, LCA e na venda de até R$ 20 mil em ações por mês para pessoa física; uso de holding patrimonial para sucessão e gestão de imóveis; e a escolha entre PGBL/VGBL conforme o modelo de declaração do IR.\n\nA tributação regressiva em renda fixa (título de longo prazo) reduz a alíquota de Imposto de Renda quanto mais tempo o dinheiro fica aplicado, incentivando investimentos de prazo mais longo para quem não precisa de liquidez imediata.",
        questions: [
          {
            question: "Até qual valor de venda mensal em ações a pessoa física tem isenção de IR?",
            options: ["R$ 5 mil", "R$ 20 mil", "R$ 100 mil", "Não existe isenção"],
            correctIndex: 1,
          },
          {
            question: "Na tabela regressiva de IR para renda fixa, o que acontece quanto mais tempo o dinheiro fica aplicado?",
            options: [
              "A alíquota de IR aumenta",
              "A alíquota de IR diminui",
              "O IR passa a ser cobrado em dobro",
              "Não há qualquer mudança",
            ],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
];

const assets: { ticker: string; name: string; type: AssetType; currentPrice: number }[] = [
  { ticker: "PETR4", name: "Petrobras PN", type: AssetType.ACAO, currentPrice: 38.12 },
  { ticker: "VALE3", name: "Vale ON", type: AssetType.ACAO, currentPrice: 61.45 },
  { ticker: "ITUB4", name: "Itaú Unibanco PN", type: AssetType.ACAO, currentPrice: 33.2 },
  { ticker: "WEGE3", name: "WEG ON", type: AssetType.ACAO, currentPrice: 42.78 },
  { ticker: "BBDC4", name: "Bradesco PN", type: AssetType.ACAO, currentPrice: 13.89 },
  { ticker: "ABEV3", name: "Ambev ON", type: AssetType.ACAO, currentPrice: 12.56 },
  { ticker: "MGLU3", name: "Magazine Luiza ON", type: AssetType.ACAO, currentPrice: 8.97 },
  { ticker: "MXRF11", name: "Maxi Renda FII", type: AssetType.FII, currentPrice: 10.42 },
  { ticker: "HGLG11", name: "CSHG Logística FII", type: AssetType.FII, currentPrice: 165.8 },
  { ticker: "bitcoin", name: "Bitcoin", type: AssetType.CRIPTO, currentPrice: 350000 },
];

async function seedTracks() {
  const existing = await prisma.track.count();
  if (existing > 0) {
    console.log("Trilhas já seedadas, pulando.");
    return;
  }
  for (const [trackIdx, track] of tracks.entries()) {
    await prisma.track.create({
      data: {
        slug: track.slug,
        title: track.title,
        description: track.description,
        level: track.level,
        orderIndex: trackIdx,
        lessons: {
          create: track.lessons.map((lesson, lessonIdx) => ({
            slug: lesson.slug,
            title: lesson.title,
            videoUrl: lesson.videoUrl || null,
            content: lesson.content,
            orderIndex: lessonIdx,
            questions: {
              create: lesson.questions.map((q, qIdx) => ({
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                orderIndex: qIdx,
              })),
            },
          })),
        },
      },
    });
  }
  console.log("Trilhas seedadas com sucesso.");
}

async function seedAssets() {
  const existing = await prisma.asset.count();
  if (existing > 0) {
    console.log("Ativos já seedados, pulando.");
    return;
  }
  for (const asset of assets) {
    await prisma.asset.create({
      data: { ...asset, quoteUpdatedAt: new Date() },
    });
  }
  console.log("Ativos seedados com sucesso.");
}

async function main() {
  await seedTracks();
  await seedAssets();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
