# Arquitetura do aplicativo

O app foi dividido para que cada arquivo tenha uma responsabilidade principal. A tela `HomePage.vue` conecta as partes, enquanto componentes e lógica cuidam de tarefas específicas.

## Mapa de pastas

| Caminho | Responsabilidade |
| --- | --- |
| `src/views/HomePage.vue` | Monta a tela principal e conecta componentes aos dados e ações. |
| `src/components/finance/FinanceAuth.vue` | Exibe login, cadastro e entrada na demonstração. |
| `src/components/finance/FinanceNavigation.vue` | Desenha menu lateral, cabeçalho, navegação móvel e área de conteúdo. |
| `src/components/finance/OverviewSection.vue` | Mostra indicadores, gráficos, transações recentes e metas resumidas. |
| `src/components/finance/TransactionsSection.vue` | Exibe transações e disponibiliza os filtros por tipo. |
| `src/components/finance/GoalsSection.vue` | Exibe as metas, seu progresso e ações para adicionar valores. |
| `src/components/finance/FinanceDialogs.vue` | Reúne os formulários de transação, meta e contribuição. |
| `src/components/finance/TransactionList.vue` | Apresenta uma lista reutilizável de movimentações. |
| `src/components/finance/GoalProgressList.vue` | Apresenta uma lista compacta de metas com barras de progresso. |
| `src/composables/useFinanceDashboard.ts` | Mantém estado, cálculos, autenticação e ações da tela. |
| `src/services/finance.ts` | Lê e grava transações e metas no Supabase ou na demonstração local. |
| `src/lib/supabase.ts` | Configura o cliente Supabase a partir das variáveis de ambiente. |
| `src/types/finance.ts` | Define os tipos usados por transações e metas. |
| `src/utils/financeFormatters.ts` | Formata moeda, datas e progresso de metas. |
| `src/theme/finance.css` | Reúne os estilos visuais e responsivos do aplicativo. |
| `supabase/schema.sql` | Define as tabelas, permissões RLS e função de contribuição. |

## Como os componentes conversam

- **Props** levam dados do componente pai para os componentes filhos. Por exemplo, a página envia as transações para `TransactionsSection.vue`.
- **Eventos** avisam o componente pai de uma ação do usuário. Por exemplo, a lista emite `remove` quando alguém pede para apagar uma transação.
- **Modelos (`v-model`)** mantêm formulários e filtros sincronizados com o estado do app.
- **Composable** (`useFinanceDashboard`) guarda o estado e as regras da tela sem misturá-los com o HTML dos componentes.
- **Service** (`finance.ts`) é a camada que acessa os dados. A interface não precisa conhecer os detalhes das chamadas ao banco.

## Fluxo: registrar uma transação

1. A pessoa toca em **Nova transação** na navegação.
2. `HomePage.vue` chama `openTransactionModal()` do composable.
3. `FinanceDialogs.vue` mostra o formulário e sincroniza os campos por `v-model`.
4. Ao enviar, o evento `save-transaction` aciona `saveTransaction()` no composable.
5. O composable chama `createTransaction()` em `finance.ts`.
6. O service grava no Supabase para uma conta autenticada ou no armazenamento local para a demonstração.
7. O composable atualiza a lista e o dashboard reflete as mudanças.

## Fluxo: carregar o dashboard

1. O composable verifica a sessão do Supabase ao abrir o app.
2. Com uma sessão, carrega as transações e metas da conta; sem sessão, a pessoa pode escolher a demonstração.
3. Os indicadores e séries dos gráficos são calculados a partir das transações carregadas.
4. `OverviewSection.vue` recebe os valores calculados e os apresenta como cartões, gráficos e listas.

## Como apresentar em sala

> “A tela principal não faz tudo sozinha: ela orquestra componentes. A lógica de estado, autenticação e cálculos fica no composable; o acesso ao banco fica no service; e cada componente cuida de uma parte da interface. Assim, fica mais fácil localizar, testar e explicar cada funcionalidade.”

Uma ordem simples para a demonstração:

1. Mostrar a tela de entrada e abrir **Explorar demonstração**.
2. Apresentar os indicadores e gráficos do dashboard.
3. Registrar uma receita ou despesa e mostrar a lista atualizada.
4. Criar uma meta, adicionar um valor e mostrar o progresso.
5. Ativar o modo escuro.
6. Explicar que as contas reais usam Supabase e políticas RLS; a demonstração usa armazenamento local.
