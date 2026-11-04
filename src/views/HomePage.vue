<template>
  <ion-page>
    <ion-content :fullscreen="true" class="finance-content">
      <main v-if="!userId" class="auth-screen">
        <div class="auth-card">
          <div class="brand-mark"><ion-icon :icon="walletOutline" /></div>
          <p class="eyebrow">SEU DINHEIRO, MAIS CLARO</p>
          <h1>{{ isSignUp ? 'Crie sua conta' : 'Bem-vinda de volta' }}</h1>
          <p class="auth-copy">
            {{ isSignUp ? 'Comece a cuidar melhor do seu dinheiro.' : 'Entre para acompanhar suas finanças.' }}
          </p>

          <form v-if="isSupabaseConfigured" class="auth-form" @submit.prevent="authenticate">
            <label>
              E-mail
              <input v-model.trim="authEmail" type="email" placeholder="voce@email.com" required />
            </label>
            <label>
              Senha
              <input
                v-model="authPassword"
                type="password"
                placeholder="No mínimo 6 caracteres"
                minlength="6"
                required
              />
            </label>
            <button class="primary-button full-width" type="submit" :disabled="busy">
              {{ busy ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar' }}
            </button>
            <button class="text-button full-width" type="button" @click="isSignUp = !isSignUp">
              {{ isSignUp ? 'Já tenho uma conta' : 'Ainda não tenho uma conta' }}
            </button>
          </form>

          <div v-else class="demo-info">
            <ion-icon :icon="sparklesOutline" />
            <span>Experimente o app com dados de demonstração. Configure o Supabase para ativar contas reais.</span>
          </div>
          <button v-if="!isSupabaseConfigured" class="primary-button full-width" @click="enterDemo">
            Explorar demonstração <ion-icon :icon="arrowForwardOutline" />
          </button>
          <button
            class="theme-button auth-theme"
            :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
            @click="toggleTheme"
          >
            <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
          </button>
          <p v-if="isSupabaseConfigured" class="auth-footnote">
            Seus dados ficam protegidos e associados somente à sua conta.
          </p>
        </div>
      </main>

      <div v-else class="app-layout">
        <aside class="sidebar">
          <a class="brand" href="#" @click.prevent="activeSection = 'overview'">
            <span class="brand-mark small"><ion-icon :icon="walletOutline" /></span>
            <span>saldo<span class="brand-dot">.</span></span>
          </a>
          <p class="nav-label">MENU</p>
          <nav class="side-nav" aria-label="Navegação principal">
            <button :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">
              <ion-icon :icon="gridOutline" /> Visão geral
            </button>
            <button :class="{ active: activeSection === 'transactions' }" @click="activeSection = 'transactions'">
              <ion-icon :icon="swapHorizontalOutline" /> Transações
            </button>
            <button :class="{ active: activeSection === 'goals' }" @click="activeSection = 'goals'">
              <ion-icon :icon="flagOutline" /> Metas financeiras
              <span v-if="goals.length" class="nav-count">{{ goals.length }}</span>
            </button>
          </nav>
          <div class="sidebar-bottom">
            <div class="profile-avatar">{{ userInitial }}</div>
            <div class="profile-copy">
              <strong>{{ displayName }}</strong>
              <span>{{ isDemo ? 'Modo demonstração' : 'Conta pessoal' }}</span>
            </div>
            <button class="icon-button logout-button" aria-label="Sair" title="Sair" @click="signOut">
              <ion-icon :icon="logOutOutline" />
            </button>
          </div>
        </aside>

        <section class="workspace">
          <header class="topbar">
            <div class="mobile-brand">
              <span class="brand-mark small"><ion-icon :icon="walletOutline" /></span>
              <strong>saldo<span class="brand-dot">.</span></strong>
            </div>
            <div class="breadcrumb">
              <span>Finanças</span><ion-icon :icon="chevronForwardOutline" /> {{ sectionTitle }}
            </div>
            <div class="topbar-actions">
              <span v-if="isDemo" class="demo-badge"><span></span> Demonstração</span>
              <button
                class="theme-button"
                :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
                :title="isDark ? 'Modo claro' : 'Modo escuro'"
                @click="toggleTheme"
              >
                <ion-icon :icon="isDark ? sunnyOutline : moonOutline" />
              </button>
              <button class="primary-button add-button" @click="openTransactionModal">
                <ion-icon :icon="addOutline" /> Nova transação
              </button>
            </div>
          </header>

          <div class="page-content">
            <div v-if="isDemo && showDemoBanner" class="demo-banner">
              <ion-icon :icon="informationCircleOutline" />
              <span>Os dados desta demonstração ficam salvos neste dispositivo.</span>
              <button aria-label="Fechar aviso" @click="showDemoBanner = false">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>

            <template v-if="activeSection === 'overview'">
              <div class="welcome-row">
                <div>
                  <p class="eyebrow">{{ todayLabel }}</p>
                  <h1>Olá, {{ firstName }} <span class="wave">✦</span></h1>
                  <p class="muted">Aqui está o resumo das suas finanças.</p>
                </div>
                <button class="outline-button" @click="activeSection = 'transactions'">
                  Ver transações <ion-icon :icon="arrowForwardOutline" />
                </button>
              </div>

              <section class="metrics-grid" aria-label="Resumo financeiro">
                <article class="metric-card balance-card">
                  <div class="metric-top">
                    <span>Saldo do mês</span
                    ><span class="metric-icon balance-icon"><ion-icon :icon="walletOutline" /></span>
                  </div>
                  <strong>{{ currency(monthBalance) }}</strong>
                  <div class="metric-foot">
                    <span class="balance-status"><span></span> {{ balanceMessage }}</span>
                  </div>
                </article>
                <article class="metric-card">
                  <div class="metric-top">
                    <span>Receitas</span
                    ><span class="metric-icon income-icon"><ion-icon :icon="arrowDownOutline" /></span>
                  </div>
                  <strong>{{ currency(monthIncome) }}</strong>
                  <div class="metric-foot"><span class="positive">↑</span> neste mês</div>
                </article>
                <article class="metric-card">
                  <div class="metric-top">
                    <span>Despesas</span
                    ><span class="metric-icon expense-icon"><ion-icon :icon="arrowUpOutline" /></span>
                  </div>
                  <strong>{{ currency(monthExpenses) }}</strong>
                  <div class="metric-foot"><span class="neutral">↘</span> neste mês</div>
                </article>
                <article class="metric-card">
                  <div class="metric-top">
                    <span>Economia</span><span class="metric-icon savings-icon"><ion-icon :icon="leafOutline" /></span>
                  </div>
                  <strong>{{ savingsRate }}<small>%</small></strong>
                  <div class="metric-foot">da sua renda mensal</div>
                </article>
              </section>

              <section class="charts-grid">
                <article class="panel trend-panel">
                  <div class="panel-heading">
                    <div>
                      <h2>Fluxo financeiro</h2>
                      <p>Receitas e despesas nos últimos 6 meses</p>
                    </div>
                    <span class="chart-legend"
                      ><i class="legend-income"></i> Receitas <i class="legend-expense"></i> Despesas</span
                    >
                  </div>
                  <ApexChart type="area" height="250" :options="trendOptions" :series="trendSeries" />
                </article>
                <article class="panel category-panel">
                  <div class="panel-heading">
                    <div>
                      <h2>Despesas por categoria</h2>
                      <p>Distribuição deste mês</p>
                    </div>
                  </div>
                  <div v-if="monthExpenses > 0" class="donut-wrap">
                    <ApexChart type="donut" height="210" :options="categoryOptions" :series="categorySeries" />
                    <div class="donut-center">
                      <strong>{{ currency(monthExpenses) }}</strong
                      ><span>no mês</span>
                    </div>
                  </div>
                  <div v-else class="chart-empty">
                    <span class="empty-icon"><ion-icon :icon="pieChartOutline" /></span
                    ><span>Sem despesas neste mês</span>
                  </div>
                  <div class="category-legend">
                    <div v-for="item in categoryBreakdown" :key="item.name">
                      <span><i :style="{ background: item.color }"></i>{{ item.name }}</span
                      ><strong>{{ currency(item.value) }}</strong>
                    </div>
                  </div>
                </article>
              </section>

              <section class="bottom-grid">
                <article class="panel transactions-panel">
                  <div class="panel-heading">
                    <div>
                      <h2>Transações recentes</h2>
                      <p>Suas movimentações mais recentes</p>
                    </div>
                    <button class="link-button" @click="activeSection = 'transactions'">
                      Ver todas <ion-icon :icon="arrowForwardOutline" />
                    </button>
                  </div>
                  <TransactionList :transactions="transactions.slice(0, 5)" @remove="removeTransactionAction" />
                </article>
                <article class="panel goals-panel">
                  <div class="panel-heading">
                    <div>
                      <h2>Metas financeiras</h2>
                      <p>Passo a passo para chegar lá</p>
                    </div>
                    <button class="link-button" @click="activeSection = 'goals'">
                      Ver todas <ion-icon :icon="arrowForwardOutline" />
                    </button>
                  </div>
                  <GoalList :goals="goals.slice(0, 2)" @contribute="openContributionModal" />
                  <button class="goal-add-button" @click="openGoalModal">
                    <ion-icon :icon="addOutline" /> Criar uma meta
                  </button>
                </article>
              </section>
            </template>

            <template v-else-if="activeSection === 'transactions'">
              <div class="welcome-row page-title-row">
                <div>
                  <p class="eyebrow">ACOMPANHAMENTO</p>
                  <h1>Transações</h1>
                  <p class="muted">Acompanhe tudo o que entra e sai.</p>
                </div>
                <button class="primary-button" @click="openTransactionModal">
                  <ion-icon :icon="addOutline" /> Nova transação
                </button>
              </div>
              <section class="panel full-panel">
                <div class="panel-heading transaction-heading">
                  <div>
                    <h2>Todas as movimentações</h2>
                    <p>{{ filteredTransactions.length }} registros encontrados</p>
                  </div>
                  <div class="filter-group" aria-label="Filtrar transações">
                    <button :class="{ selected: transactionFilter === 'all' }" @click="transactionFilter = 'all'">
                      Todas
                    </button>
                    <button :class="{ selected: transactionFilter === 'income' }" @click="transactionFilter = 'income'">
                      Receitas
                    </button>
                    <button
                      :class="{ selected: transactionFilter === 'expense' }"
                      @click="transactionFilter = 'expense'"
                    >
                      Despesas
                    </button>
                  </div>
                </div>
                <TransactionList :transactions="filteredTransactions" @remove="removeTransactionAction" />
              </section>
            </template>

            <template v-else>
              <div class="welcome-row page-title-row">
                <div>
                  <p class="eyebrow">SEU FUTURO FINANCEIRO</p>
                  <h1>Metas financeiras</h1>
                  <p class="muted">Transforme seus planos em conquistas.</p>
                </div>
                <button class="primary-button" @click="openGoalModal"><ion-icon :icon="addOutline" /> Nova meta</button>
              </div>
              <div v-if="goals.length" class="goals-grid">
                <article v-for="(goal, index) in goals" :key="goal.id" class="panel goal-card">
                  <div class="goal-card-top">
                    <span class="goal-symbol" :class="`goal-symbol-${index % 3}`"
                      ><ion-icon :icon="index % 2 ? airplaneOutline : flagOutline" /></span
                    ><button
                      class="icon-button"
                      aria-label="Adicionar valor à meta"
                      title="Adicionar valor"
                      @click="openContributionModal(goal)"
                    >
                      <ion-icon :icon="addOutline" />
                    </button>
                  </div>
                  <h2>{{ goal.title }}</h2>
                  <p class="muted">Meta até {{ formatDate(goal.due_date) }}</p>
                  <div class="goal-amounts">
                    <strong>{{ currency(goal.current_amount) }}</strong
                    ><span>de {{ currency(goal.target_amount) }}</span>
                  </div>
                  <div class="progress-track"><span :style="{ width: `${goalProgress(goal)}%` }"></span></div>
                  <div class="goal-card-footer">
                    <span>{{ goalProgress(goal) }}% concluído</span
                    ><button class="link-button" @click="openContributionModal(goal)">
                      Adicionar valor <ion-icon :icon="arrowForwardOutline" />
                    </button>
                  </div>
                </article>
              </div>
              <section v-else class="panel empty-goals">
                <span class="empty-icon"><ion-icon :icon="flagOutline" /></span>
                <h2>Seu próximo objetivo começa aqui</h2>
                <p class="muted">Crie uma meta para acompanhar seu progresso e realizar seus planos.</p>
                <button class="primary-button" @click="openGoalModal">
                  <ion-icon :icon="addOutline" /> Criar primeira meta
                </button>
              </section>
            </template>
          </div>
        </section>

        <nav class="mobile-nav" aria-label="Navegação móvel">
          <button :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">
            <ion-icon :icon="gridOutline" /><span>Início</span>
          </button>
          <button :class="{ active: activeSection === 'transactions' }" @click="activeSection = 'transactions'">
            <ion-icon :icon="swapHorizontalOutline" /><span>Transações</span>
          </button>
          <button :class="{ active: activeSection === 'goals' }" @click="activeSection = 'goals'">
            <ion-icon :icon="flagOutline" /><span>Metas</span>
          </button>
        </nav>
      </div>
    </ion-content>

    <div v-if="transactionModalOpen" class="modal-backdrop" @click.self="transactionModalOpen = false">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">REGISTRO FINANCEIRO</p>
            <h2 id="transaction-modal-title">Nova transação</h2>
          </div>
          <button class="icon-button" aria-label="Fechar" @click="transactionModalOpen = false">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>
        <form class="modal-form" @submit.prevent="saveTransaction">
          <div class="type-toggle">
            <button
              type="button"
              :class="{ selected: transactionForm.type === 'expense' }"
              @click="transactionForm.type = 'expense'"
            >
              <ion-icon :icon="arrowUpOutline" /> Despesa
            </button>
            <button
              type="button"
              :class="{ selected: transactionForm.type === 'income' }"
              @click="transactionForm.type = 'income'"
            >
              <ion-icon :icon="arrowDownOutline" /> Receita
            </button>
          </div>
          <label
            >Descrição<input
              v-model.trim="transactionForm.title"
              maxlength="80"
              placeholder="Ex.: Conta de luz"
              required
          /></label>
          <label
            >Valor
            <div class="amount-input">
              <span>R$</span
              ><input
                v-model.number="transactionForm.amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                required
              />
            </div>
          </label>
          <div class="form-row">
            <label
              >Categoria
              <select v-model="transactionForm.category" required>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </label>
            <label>Data<input v-model="transactionForm.date" type="date" required /></label>
          </div>
          <div class="modal-actions">
            <button type="button" class="outline-button" @click="transactionModalOpen = false">Cancelar</button
            ><button class="primary-button" type="submit" :disabled="busy">Salvar transação</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="goalModalOpen" class="modal-backdrop" @click.self="goalModalOpen = false">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">PLANEJE SEU FUTURO</p>
            <h2 id="goal-modal-title">Nova meta financeira</h2>
          </div>
          <button class="icon-button" aria-label="Fechar" @click="goalModalOpen = false">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>
        <form class="modal-form" @submit.prevent="saveGoal">
          <label
            >Nome da meta<input
              v-model.trim="goalForm.title"
              maxlength="80"
              placeholder="Ex.: Viagem de férias"
              required
          /></label>
          <label
            >Valor desejado
            <div class="amount-input">
              <span>R$</span
              ><input
                v-model.number="goalForm.target_amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                required
              /></div
          ></label>
          <label>Data desejada<input v-model="goalForm.due_date" type="date" :min="today" required /></label>
          <div class="modal-actions">
            <button type="button" class="outline-button" @click="goalModalOpen = false">Cancelar</button
            ><button class="primary-button" type="submit" :disabled="busy">Criar meta</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="contributionGoal" class="modal-backdrop" @click.self="contributionGoal = null">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="contribution-modal-title">
        <div class="modal-heading">
          <div>
            <p class="eyebrow">UM PASSO DE CADA VEZ</p>
            <h2 id="contribution-modal-title">Adicionar à meta</h2>
            <p class="muted">{{ contributionGoal.title }}</p>
          </div>
          <button class="icon-button" aria-label="Fechar" @click="contributionGoal = null">
            <ion-icon :icon="closeOutline" />
          </button>
        </div>
        <form class="modal-form" @submit.prevent="saveContribution">
          <label
            >Quanto deseja guardar?
            <div class="amount-input">
              <span>R$</span
              ><input
                v-model.number="contributionAmount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                required
              /></div
          ></label>
          <div class="modal-actions">
            <button type="button" class="outline-button" @click="contributionGoal = null">Cancelar</button
            ><button class="primary-button" type="submit" :disabled="busy">Adicionar valor</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="toastOpen" class="app-toast" :class="toastColor" role="status">
      <ion-icon :icon="toastColor === 'success' ? checkmarkCircleOutline : alertCircleOutline" />
      <span>{{ toastMessage }}</span>
      <button aria-label="Fechar notificação" @click="toastOpen = false">
        <ion-icon :icon="closeOutline" />
      </button>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import type { ApexOptions } from 'apexcharts';
import {
  addOutline,
  alertCircleOutline,
  airplaneOutline,
  arrowDownOutline,
  arrowForwardOutline,
  arrowUpOutline,
  cafeOutline,
  carOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  closeOutline,
  gridOutline,
  heartOutline,
  homeOutline,
  informationCircleOutline,
  leafOutline,
  logOutOutline,
  moonOutline,
  pieChartOutline,
  schoolOutline,
  sparklesOutline,
  sunnyOutline,
  swapHorizontalOutline,
  walletOutline,
  flagOutline,
} from 'ionicons/icons';
import { computed, defineAsyncComponent, defineComponent, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  createGoal,
  createTransaction,
  contributeToGoal,
  DEMO_USER_ID,
  listGoals,
  listTransactions,
  removeTransaction,
} from '@/services/finance';
import type { FinanceGoal, FinanceTransaction, NewGoal, NewTransaction, TransactionType } from '@/types/finance';

const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'));
const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Extra', 'Outros'];
const userId = ref<string | null>(null);
const isDemo = computed(() => userId.value === DEMO_USER_ID);
const isSignUp = ref(false);
const authEmail = ref('');
const authPassword = ref('');
const isDark = ref(false);
const activeSection = ref<'overview' | 'transactions' | 'goals'>('overview');
const transactions = ref<FinanceTransaction[]>([]);
const goals = ref<FinanceGoal[]>([]);
const busy = ref(false);
const transactionModalOpen = ref(false);
const goalModalOpen = ref(false);
const contributionGoal = ref<FinanceGoal | null>(null);
const contributionAmount = ref<number | null>(null);
const transactionFilter = ref<'all' | TransactionType>('all');
const showDemoBanner = ref(true);
const toastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref<'success' | 'danger'>('success');
let toastTimeout: ReturnType<typeof setTimeout> | undefined;
function localDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = localDate();
const transactionForm = ref<NewTransaction>({
  title: '',
  amount: 0,
  category: 'Alimentação',
  type: 'expense',
  date: today,
});
const goalForm = ref<NewGoal>({ title: '', target_amount: 0, due_date: '' });
let authSubscription: { unsubscribe: () => void } | undefined;

const userInitial = computed(() => (isDemo.value ? 'E' : authEmail.value.charAt(0).toUpperCase() || 'U'));
const displayName = computed(() => (isDemo.value ? 'Elisa Fonseca' : authEmail.value || 'Minha conta'));
const firstName = computed(() => displayName.value.split(/[ @]/)[0]);
const sectionTitle = computed(
  () =>
    ({
      overview: 'Visão geral',
      transactions: 'Transações',
      goals: 'Metas financeiras',
    })[activeSection.value],
);
const todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(
  new Date(),
);
const currentMonth = localDate().slice(0, 7);
const monthTransactions = computed(() =>
  transactions.value.filter((transaction) => transaction.date.startsWith(currentMonth)),
);
const monthIncome = computed(() =>
  monthTransactions.value
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0),
);
const monthExpenses = computed(() =>
  monthTransactions.value
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0),
);
const monthBalance = computed(() => monthIncome.value - monthExpenses.value);
const savingsRate = computed(() =>
  monthIncome.value ? Math.max(0, Math.round((monthBalance.value / monthIncome.value) * 100)) : 0,
);
const balanceMessage = computed(() => (monthBalance.value >= 0 ? 'Você está no positivo' : 'Atenção ao seu saldo'));
const filteredTransactions = computed(() =>
  transactionFilter.value === 'all'
    ? transactions.value
    : transactions.value.filter((transaction) => transaction.type === transactionFilter.value),
);
const categoryColors = ['#5667e9', '#e9a23b', '#56b89a', '#ec7188', '#9676d9', '#4b9fc2'];
const categoryBreakdown = computed(() => {
  const values = new Map<string, number>();
  monthTransactions.value
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) =>
      values.set(transaction.category, (values.get(transaction.category) ?? 0) + transaction.amount),
    );
  return [...values.entries()]
    .map(([name, value], index) => ({ name, value, color: categoryColors[index % categoryColors.length] }))
    .sort((a, b) => b.value - a.value);
});
const categorySeries = computed(() => categoryBreakdown.value.map((category) => category.value));
const trendSeries = computed(() => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });
  return [
    { name: 'Receitas', data: months.map((month) => totalForMonth(month, 'income')) },
    { name: 'Despesas', data: months.map((month) => totalForMonth(month, 'expense')) },
  ];
});
const trendOptions = computed<ApexOptions>(() => {
  const labels = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  });
  return {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
      background: 'transparent',
    },
    colors: ['#5667e9', '#e9a23b'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.18, opacityTo: 0.02 } },
    grid: { borderColor: isDark.value ? '#303644' : '#eef0f4', strokeDashArray: 4, padding: { left: 8, right: 12 } },
    xaxis: {
      categories: labels,
      labels: { style: { colors: isDark.value ? '#9ba3b4' : '#8b91a1' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark.value ? '#9ba3b4' : '#8b91a1' },
        formatter: (value: number) => (value >= 1000 ? `R$ ${(value / 1000).toFixed(0)}k` : `R$ ${value.toFixed(0)}`),
      },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => currency(value) } },
  };
});
const categoryOptions = computed<ApexOptions>(() => ({
  chart: { fontFamily: 'Inter, sans-serif', background: 'transparent' },
  labels: categoryBreakdown.value.map((category) => category.name),
  colors: categoryBreakdown.value.map((category) => category.color),
  dataLabels: { enabled: false },
  legend: { show: false },
  stroke: { width: 3, colors: [isDark.value ? '#1b1e27' : '#ffffff'] },
  plotOptions: { pie: { donut: { size: '76%' } } },
  tooltip: { y: { formatter: (value: number) => currency(value) } },
}));

const TransactionList = defineComponent({
  props: {
    transactions: { type: Array as () => FinanceTransaction[], required: true },
  },
  emits: ['remove'],
  setup(props, { emit }) {
    const iconForCategory = (category: string) => {
      if (category === 'Moradia') return homeOutline;
      if (category === 'Transporte') return carOutline;
      if (category === 'Saúde') return heartOutline;
      if (category === 'Educação') return schoolOutline;
      if (category === 'Alimentação' || category === 'Lazer') return cafeOutline;
      return walletOutline;
    };
    return () =>
      props.transactions.length
        ? h(
            'div',
            { class: 'transaction-list' },
            props.transactions.map((transaction) =>
              h('div', { class: 'transaction-row', key: transaction.id }, [
                h('span', { class: ['transaction-icon', transaction.type] }, [
                  h(IonIcon, { icon: iconForCategory(transaction.category) }),
                ]),
                h('div', { class: 'transaction-main' }, [
                  h('strong', transaction.title),
                  h('span', `${transaction.category} · ${formatDate(transaction.date)}`),
                ]),
                h('strong', { class: ['transaction-amount', transaction.type] }, [
                  transaction.type === 'income' ? '+' : '−',
                  currency(transaction.amount),
                ]),
                h(
                  'button',
                  {
                    class: 'icon-button remove-button',
                    title: 'Excluir transação',
                    'aria-label': `Excluir ${transaction.title}`,
                    onClick: () => emit('remove', transaction.id),
                  },
                  [h(IonIcon, { icon: closeOutline })],
                ),
              ]),
            ),
          )
        : h('div', { class: 'empty-list' }, [
            h('span', { class: 'empty-icon' }, [h(IonIcon, { icon: swapHorizontalOutline })]),
            h('span', 'Suas transações aparecerão aqui.'),
          ]);
  },
});

const GoalList = defineComponent({
  props: { goals: { type: Array as () => FinanceGoal[], required: true } },
  emits: ['contribute'],
  setup(props, { emit }) {
    return () =>
      props.goals.length
        ? h(
            'div',
            { class: 'goal-list' },
            props.goals.map((goal, index) => {
              const progress = goalProgress(goal);
              return h('div', { class: 'goal-list-item', key: goal.id }, [
                h('span', { class: ['goal-symbol', `goal-symbol-${index % 3}`] }, [
                  h(IonIcon, { icon: index % 2 ? airplaneOutline : flagOutline }),
                ]),
                h('div', { class: 'goal-list-content' }, [
                  h('div', { class: 'goal-list-title' }, [h('strong', goal.title), h('span', `${progress}%`)]),
                  h('div', { class: 'progress-track' }, [h('span', { style: { width: `${progress}%` } })]),
                  h(
                    'span',
                    { class: 'goal-list-caption' },
                    `${currency(goal.current_amount)} de ${currency(goal.target_amount)}`,
                  ),
                ]),
                h(
                  'button',
                  {
                    class: 'goal-quick-add',
                    title: 'Adicionar valor à meta',
                    'aria-label': `Adicionar valor à meta ${goal.title}`,
                    onClick: () => emit('contribute', goal),
                  },
                  [h(IonIcon, { icon: addOutline })],
                ),
              ]);
            }),
          )
        : h('div', { class: 'goal-list-empty' }, 'Crie sua primeira meta e acompanhe seu progresso.');
  },
});

function totalForMonth(date: Date, type: TransactionType): number {
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return transactions.value
    .filter((transaction) => transaction.type === type && transaction.date.startsWith(month))
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function currency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(`${value}T12:00:00`))
    .replace('.', '');
}

function goalProgress(goal: FinanceGoal): number {
  return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
}

function notify(message: string, color: 'success' | 'danger' = 'success'): void {
  toastMessage.value = message;
  toastColor.value = color;
  toastOpen.value = true;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastOpen.value = false;
  }, 3200);
}

async function loadFinanceData(id: string): Promise<void> {
  busy.value = true;
  try {
    const [loadedTransactions, loadedGoals] = await Promise.all([listTransactions(id), listGoals(id)]);
    transactions.value = loadedTransactions;
    goals.value = loadedGoals;
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível carregar seus dados.', 'danger');
  } finally {
    busy.value = false;
  }
}

async function authenticate(): Promise<void> {
  if (!supabase) return;
  busy.value = true;
  try {
    const result = isSignUp.value
      ? await supabase.auth.signUp({ email: authEmail.value, password: authPassword.value })
      : await supabase.auth.signInWithPassword({ email: authEmail.value, password: authPassword.value });
    if (result.error) throw result.error;
    if (isSignUp.value && !result.data.session) {
      notify('Conta criada! Confira seu e-mail para confirmar o cadastro.');
      isSignUp.value = false;
      return;
    }
    if (result.data.user) {
      authEmail.value = result.data.user.email ?? authEmail.value;
      userId.value = result.data.user.id;
      await loadFinanceData(result.data.user.id);
    }
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível autenticar.', 'danger');
  } finally {
    busy.value = false;
  }
}

function enterDemo(): void {
  userId.value = DEMO_USER_ID;
  authEmail.value = 'elisa@email.com';
  void loadFinanceData(DEMO_USER_ID);
}

async function signOut(): Promise<void> {
  if (!isDemo.value && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      notify(error.message, 'danger');
      return;
    }
  }
  userId.value = null;
  transactions.value = [];
  goals.value = [];
  isSignUp.value = false;
}

function toggleTheme(): void {
  isDark.value = !isDark.value;
}

function openTransactionModal(): void {
  transactionForm.value = { title: '', amount: 0, category: 'Alimentação', type: 'expense', date: today };
  transactionModalOpen.value = true;
}

async function saveTransaction(): Promise<void> {
  if (!userId.value || transactionForm.value.amount <= 0) return;
  busy.value = true;
  try {
    const created = await createTransaction(userId.value, transactionForm.value);
    transactions.value = [created, ...transactions.value].sort((a, b) => b.date.localeCompare(a.date));
    transactionModalOpen.value = false;
    notify('Transação registrada com sucesso.');
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível salvar a transação.', 'danger');
  } finally {
    busy.value = false;
  }
}

async function removeTransactionAction(transactionId: string): Promise<void> {
  if (!userId.value) return;
  try {
    await removeTransaction(userId.value, transactionId);
    transactions.value = transactions.value.filter((transaction) => transaction.id !== transactionId);
    notify('Transação excluída.');
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível excluir a transação.', 'danger');
  }
}

function openGoalModal(): void {
  goalForm.value = { title: '', target_amount: 0, due_date: '' };
  goalModalOpen.value = true;
}

async function saveGoal(): Promise<void> {
  if (!userId.value || goalForm.value.target_amount <= 0) return;
  busy.value = true;
  try {
    const goal = await createGoal(userId.value, goalForm.value);
    goals.value = [goal, ...goals.value];
    goalModalOpen.value = false;
    notify('Meta criada. Boa jornada!');
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível criar a meta.', 'danger');
  } finally {
    busy.value = false;
  }
}

function openContributionModal(goal: FinanceGoal): void {
  contributionGoal.value = goal;
  contributionAmount.value = null;
}

async function saveContribution(): Promise<void> {
  if (!userId.value || !contributionGoal.value || !contributionAmount.value || contributionAmount.value <= 0) return;
  busy.value = true;
  try {
    await contributeToGoal(userId.value, contributionGoal.value.id, contributionAmount.value);
    await loadFinanceData(userId.value);
    contributionGoal.value = null;
    notify('Valor adicionado à sua meta!');
  } catch (error) {
    notify(error instanceof Error ? error.message : 'Não foi possível atualizar a meta.', 'danger');
  } finally {
    busy.value = false;
  }
}

watch(isDark, (value) => {
  document.documentElement.classList.toggle('dark', value);
  document.documentElement.classList.toggle('ion-palette-dark', value);
  localStorage.setItem('saldo-dark-mode', String(value));
});

onMounted(async () => {
  isDark.value = localStorage.getItem('saldo-dark-mode') === 'true';
  document.documentElement.classList.toggle('ion-palette-dark', isDark.value);
  if (!isSupabaseConfigured || !supabase) return;
  const { data, error } = await supabase.auth.getSession();
  if (error) notify(error.message, 'danger');
  if (data.session?.user) {
    authEmail.value = data.session.user.email ?? '';
    userId.value = data.session.user.id;
    await loadFinanceData(data.session.user.id);
  }
  const { data: authData } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      userId.value = null;
      transactions.value = [];
      goals.value = [];
    } else if (event === 'SIGNED_IN' && session?.user && session.user.id !== userId.value) {
      authEmail.value = session.user.email ?? '';
      userId.value = session.user.id;
      void loadFinanceData(session.user.id);
    }
  });
  authSubscription = authData.subscription;
});

watch(showDemoBanner, (visible) => {
  if (!visible) localStorage.setItem('saldo-demo-banner-dismissed', 'true');
});

onMounted(() => {
  showDemoBanner.value = localStorage.getItem('saldo-demo-banner-dismissed') !== 'true';
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
  if (toastTimeout) clearTimeout(toastTimeout);
});
</script>

<style>
:root {
  --app-bg: #f5f6fa;
  --surface: #ffffff;
  --surface-soft: #f8f9fc;
  --ink: #202435;
  --muted: #8990a1;
  --line: #eceef3;
  --brand: #5667e9;
  --brand-dark: #4353d2;
  --green: #28a879;
  --red: #df6e70;
  --ion-background-color: var(--app-bg);
  --ion-text-color: var(--ink);
}

html.dark {
  --app-bg: #151821;
  --surface: #1d222d;
  --surface-soft: #242a36;
  --ink: #edf0f7;
  --muted: #a0a7b7;
  --line: #303644;
  --brand: #8290ff;
  --brand-dark: #6d7bf1;
  --green: #55c99a;
  --red: #f08a8c;
}

* {
  box-sizing: border-box;
}
body {
  background: var(--app-bg);
  color: var(--ink);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
button,
input,
select {
  font: inherit;
}
button {
  cursor: pointer;
}
.finance-content {
  --background: var(--app-bg);
}
.app-layout {
  min-height: 100%;
  color: var(--ink);
  display: flex;
}
.sidebar {
  width: 236px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 27px 17px 18px;
  flex-shrink: 0;
  min-height: 100vh;
}
.brand,
.mobile-brand {
  color: var(--ink);
  font-size: 22px;
  font-weight: 780;
  letter-spacing: -1.2px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  color: white;
  background: linear-gradient(145deg, #7180f5, #4f5cdb);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  box-shadow: 0 8px 18px #5667e92b;
}
.brand-mark.small {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  font-size: 18px;
}
.brand-dot {
  color: var(--brand);
}
.nav-label,
.eyebrow {
  color: var(--muted);
  font-size: 10px;
  line-height: 1.4;
  font-weight: 750;
  letter-spacing: 1.15px;
  margin: 0;
}
.nav-label {
  margin: 47px 11px 12px;
}
.side-nav {
  display: grid;
  gap: 6px;
}
.side-nav button {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 45px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 0 12px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
}
.side-nav button ion-icon {
  font-size: 18px;
}
.side-nav button.active {
  background: color-mix(in srgb, var(--brand) 10%, var(--surface));
  color: var(--brand);
}
.nav-count {
  margin-left: auto;
  font-size: 11px;
  background: var(--surface-soft);
  border-radius: 20px;
  padding: 2px 7px;
}
.sidebar-bottom {
  margin-top: auto;
  padding: 15px 3px 0;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 10px;
}
.profile-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #4b5ad5;
  background: #e6e9ff;
  font-weight: 750;
  font-size: 13px;
}
.profile-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.profile-copy strong {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-copy span {
  color: var(--muted);
  font-size: 10px;
}
.icon-button {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--muted);
  border-radius: 9px;
  font-size: 17px;
}
.icon-button:hover {
  background: var(--surface-soft);
  color: var(--ink);
}
.logout-button {
  margin-left: auto;
}
.workspace {
  flex: 1;
  min-width: 0;
}
.topbar {
  height: 76px;
  padding: 0 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}
.breadcrumb {
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
  display: flex;
  gap: 10px;
  align-items: center;
}
.breadcrumb span,
.breadcrumb ion-icon {
  color: var(--muted);
  font-weight: 450;
}
.breadcrumb ion-icon {
  font-size: 13px;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 13px;
}
.theme-button {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
  border-radius: 10px;
  display: inline-grid;
  place-items: center;
  font-size: 17px;
}
.theme-button:hover {
  background: var(--surface-soft);
  color: var(--brand);
}
.primary-button,
.outline-button {
  min-height: 40px;
  border-radius: 9px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 650;
  font-size: 12px;
  border: 1px solid transparent;
  transition: 0.18s ease;
}
.primary-button {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 4px 11px #5667e92e;
}
.primary-button:hover {
  background: var(--brand-dark);
  transform: translateY(-1px);
}
.primary-button:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none;
}
.primary-button ion-icon,
.outline-button ion-icon {
  font-size: 16px;
}
.outline-button {
  color: var(--ink);
  background: var(--surface);
  border-color: var(--line);
}
.outline-button:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.demo-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  background: #fff6e8;
  color: #ae751e;
  border-radius: 30px;
  font-size: 10px;
  font-weight: 700;
}
.demo-badge span,
.balance-status span {
  width: 6px;
  height: 6px;
  background: #e7a444;
  border-radius: 50%;
}
.mobile-brand,
.mobile-nav {
  display: none;
}
.page-content {
  max-width: 1460px;
  padding: 29px 42px 45px;
  margin: 0 auto;
}
.demo-banner {
  min-height: 37px;
  border: 1px solid #e8eaff;
  border-radius: 8px;
  padding: 7px 10px;
  margin: -5px 0 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5763bd;
  background: color-mix(in srgb, var(--brand) 5%, var(--surface));
  font-size: 11px;
}
.demo-banner ion-icon {
  font-size: 15px;
}
.demo-banner button {
  margin-left: auto;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 15px;
}
.welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 15px;
  margin-bottom: 24px;
}
.welcome-row h1 {
  font-size: clamp(24px, 2.8vw, 31px);
  letter-spacing: -1.1px;
  margin: 7px 0 5px;
  font-weight: 740;
}
.welcome-row .muted,
.muted {
  color: var(--muted);
  font-size: 12px;
  margin: 0;
}
.wave {
  color: #e5aa51;
  font-size: 20px;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 15px;
}
.metric-card,
.panel {
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 13px;
}
.metric-card {
  min-height: 138px;
  padding: 17px 18px 14px;
}
.metric-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}
.metric-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 16px;
}
.balance-icon {
  color: #5869e8;
  background: #eef0ff;
}
.income-icon {
  color: #24a477;
  background: #e9f8f1;
}
.expense-icon {
  color: #df7774;
  background: #fff0ef;
}
.savings-icon {
  color: #ba8e3f;
  background: #fff5e3;
}
.metric-card > strong {
  display: block;
  font-size: clamp(18px, 2vw, 24px);
  letter-spacing: -0.5px;
  margin-top: 15px;
  font-weight: 730;
  white-space: nowrap;
}
.metric-card > strong small {
  font-size: 14px;
}
.metric-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 10px;
  margin-top: 7px;
}
.balance-status {
  color: var(--green);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.balance-status span {
  background: var(--green);
}
.positive {
  color: var(--green);
  font-weight: 750;
}
.neutral {
  color: #e5aa51;
  font-weight: 750;
}
.charts-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.95fr);
  gap: 15px;
  margin-top: 16px;
}
.panel {
  padding: 19px;
  min-width: 0;
}
.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.panel-heading h2,
.goal-card h2,
.empty-goals h2 {
  font-size: 14px;
  letter-spacing: -0.2px;
  margin: 0 0 5px;
  font-weight: 720;
}
.panel-heading p {
  color: var(--muted);
  font-size: 10px;
  margin: 0;
}
.chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 9px;
  white-space: nowrap;
}
.chart-legend i,
.category-legend i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.legend-income {
  background: #5667e9;
  margin-left: 6px;
}
.legend-expense {
  background: #e9a23b;
  margin-left: 5px;
}
.trend-panel .apexcharts-canvas {
  margin: 4px auto 0;
}
.category-panel {
  min-height: 356px;
}
.donut-wrap {
  position: relative;
  height: 204px;
  display: grid;
  place-items: center;
  margin-top: 4px;
}
.donut-wrap .apexcharts-canvas {
  z-index: 1;
}
.donut-center {
  position: absolute;
  display: grid;
  justify-items: center;
  pointer-events: none;
  z-index: 2;
}
.donut-center strong {
  font-size: 14px;
  letter-spacing: -0.4px;
}
.donut-center span {
  color: var(--muted);
  font-size: 9px;
  margin-top: 3px;
}
.category-legend {
  display: grid;
  gap: 7px;
}
.category-legend > div,
.category-legend > div > span {
  display: flex;
  align-items: center;
}
.category-legend > div {
  justify-content: space-between;
  color: var(--muted);
  font-size: 10px;
}
.category-legend > div > span {
  gap: 7px;
}
.category-legend strong {
  color: var(--ink);
  font-size: 10px;
  font-weight: 650;
}
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.9fr);
  gap: 15px;
  margin-top: 16px;
}
.transactions-panel,
.goals-panel {
  min-height: 270px;
}
.link-button {
  border: 0;
  background: transparent;
  color: var(--brand);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 650;
  padding: 3px 0;
  white-space: nowrap;
}
.link-button ion-icon {
  font-size: 13px;
}
.transaction-list {
  margin-top: 12px;
}
.transaction-row {
  min-height: 52px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 10px;
}
.transaction-icon {
  flex: 0 0 31px;
  width: 31px;
  height: 31px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 15px;
}
.transaction-icon.income {
  color: var(--green);
  background: color-mix(in srgb, var(--green) 12%, var(--surface));
}
.transaction-icon.expense {
  color: #d78c37;
  background: #fff5e8;
}
.transaction-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}
.transaction-main strong {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 650;
}
.transaction-main span {
  color: var(--muted);
  font-size: 9px;
}
.transaction-amount {
  white-space: nowrap;
  font-size: 11px;
  font-weight: 700;
}
.transaction-amount.income {
  color: var(--green);
}
.transaction-amount.expense {
  color: var(--ink);
}
.remove-button {
  opacity: 0;
  width: 26px;
  height: 26px;
  font-size: 14px;
}
.transaction-row:hover .remove-button,
.remove-button:focus-visible {
  opacity: 1;
}
.goal-list {
  display: grid;
  gap: 16px;
  margin: 17px 0 13px;
}
.goal-list-item {
  display: flex;
  gap: 10px;
  align-items: center;
}
.goal-symbol {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 16px;
}
.goal-symbol-0 {
  color: #596be8;
  background: #eff0ff;
}
.goal-symbol-1 {
  color: #d9963e;
  background: #fff5e7;
}
.goal-symbol-2 {
  color: #36a880;
  background: #eaf8f1;
}
.goal-list-content {
  flex: 1;
  min-width: 0;
}
.goal-list-title {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 7px;
}
.goal-list-title strong {
  font-size: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.goal-list-title span {
  color: var(--brand);
  font-size: 9px;
  font-weight: 700;
}
.progress-track {
  height: 5px;
  border-radius: 8px;
  background: var(--surface-soft);
  overflow: hidden;
}
.progress-track > span {
  height: 100%;
  display: block;
  background: linear-gradient(90deg, #6676ef, #8b97ff);
  border-radius: inherit;
}
.goal-list-caption {
  display: block;
  color: var(--muted);
  font-size: 9px;
  margin-top: 5px;
}
.goal-quick-add {
  flex: 0 0 27px;
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--brand);
  font-size: 15px;
}
.goal-add-button {
  width: 100%;
  min-height: 33px;
  border: 1px dashed color-mix(in srgb, var(--brand) 35%, var(--line));
  background: transparent;
  border-radius: 8px;
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 650;
}
.goal-add-button ion-icon {
  font-size: 14px;
}
.empty-list,
.goal-list-empty,
.chart-empty {
  min-height: 130px;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 9px;
  color: var(--muted);
  font-size: 11px;
}
.empty-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--surface-soft);
  color: var(--brand);
  font-size: 20px;
}
.page-title-row {
  margin-bottom: 25px;
}
.full-panel {
  min-height: 300px;
}
.transaction-heading {
  align-items: center;
  margin-bottom: 12px;
}
.filter-group {
  display: flex;
  padding: 3px;
  gap: 2px;
  border-radius: 8px;
  background: var(--surface-soft);
}
.filter-group button {
  border: 0;
  background: transparent;
  color: var(--muted);
  min-height: 28px;
  padding: 0 10px;
  font-size: 10px;
  border-radius: 6px;
}
.filter-group button.selected {
  background: var(--surface);
  color: var(--brand);
  box-shadow: 0 1px 4px #20243512;
  font-weight: 650;
}
.goals-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}
.goal-card {
  padding: 21px;
}
.goal-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 17px;
}
.goal-card-top .goal-symbol {
  width: 42px;
  height: 42px;
  font-size: 19px;
}
.goal-card h2 {
  font-size: 16px;
}
.goal-card > .muted {
  font-size: 10px;
}
.goal-amounts {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 21px 0 9px;
}
.goal-amounts strong {
  font-size: 19px;
  letter-spacing: -0.5px;
}
.goal-amounts span {
  font-size: 10px;
  color: var(--muted);
}
.goal-card .progress-track {
  height: 7px;
}
.goal-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.goal-card-footer > span {
  color: var(--muted);
  font-size: 10px;
}
.empty-goals {
  min-height: 280px;
  display: grid;
  justify-items: center;
  align-content: center;
  text-align: center;
  gap: 10px;
}
.empty-goals h2 {
  margin: 4px 0 0;
  font-size: 17px;
}
.empty-goals .muted {
  max-width: 340px;
  line-height: 1.6;
  margin-bottom: 8px;
}
.app-toast {
  position: fixed;
  z-index: 40;
  top: max(14px, env(safe-area-inset-top));
  right: 16px;
  width: min(390px, calc(100vw - 32px));
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 10px 30px #20243520;
  font-size: 12px;
}
.app-toast > ion-icon {
  flex: 0 0 auto;
  font-size: 18px;
}
.app-toast.success > ion-icon {
  color: var(--green);
}
.app-toast.danger > ion-icon {
  color: var(--red);
}
.app-toast > span {
  flex: 1;
}
.app-toast button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 16px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: #11152280;
  display: grid;
  place-items: center;
  padding: 18px;
  overflow-y: auto;
}
.modal-card {
  width: min(100%, 440px);
  max-height: calc(100vh - 36px);
  overflow-y: auto;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 23px;
  box-shadow: 0 25px 80px #11152238;
}
.modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 22px;
}
.modal-heading h2 {
  margin: 6px 0 0;
  font-size: 20px;
  letter-spacing: -0.5px;
}
.modal-heading .muted {
  margin-top: 5px;
}
.modal-form,
.auth-form {
  display: grid;
  gap: 15px;
}
.modal-form label,
.auth-form label {
  display: grid;
  gap: 7px;
  color: var(--ink);
  font-size: 11px;
  font-weight: 650;
}
.modal-form input,
.modal-form select,
.auth-form input {
  width: 100%;
  min-height: 41px;
  outline: none;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  border-radius: 8px;
  padding: 0 11px;
  font-size: 12px;
}
.modal-form input:focus,
.modal-form select:focus,
.auth-form input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 12%, transparent);
}
.amount-input {
  display: flex;
  align-items: center;
  min-height: 41px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 8px;
  padding-left: 11px;
}
.amount-input:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 12%, transparent);
}
.amount-input > span {
  color: var(--muted);
  font-size: 12px;
}
.amount-input input {
  min-height: 39px;
  border: 0;
  box-shadow: none !important;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  background: var(--surface-soft);
  border-radius: 9px;
}
.type-toggle button {
  min-height: 35px;
  border: 0;
  background: transparent;
  border-radius: 7px;
  color: var(--muted);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 650;
}
.type-toggle button.selected {
  background: var(--surface);
  color: var(--brand);
  box-shadow: 0 1px 4px #20243512;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}
.auth-screen {
  min-height: 100%;
  padding: 24px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(ellipse at 18% 15%, color-mix(in srgb, var(--brand) 11%, transparent), transparent 42%),
    var(--app-bg);
  color: var(--ink);
}
.auth-card {
  width: min(100%, 410px);
  position: relative;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 36px;
  box-shadow: 0 20px 70px #30395912;
}
.auth-card .brand-mark {
  margin-bottom: 25px;
}
.auth-card h1 {
  font-size: 27px;
  letter-spacing: -1px;
  margin: 8px 0;
}
.auth-copy {
  color: var(--muted);
  font-size: 12px;
  margin: 0 0 25px;
}
.auth-form {
  margin-top: 24px;
}
.auth-form input {
  min-height: 44px;
}
.full-width {
  width: 100%;
  min-height: 44px;
}
.text-button {
  color: var(--brand);
  background: transparent;
  border: 0;
  font-size: 11px;
  font-weight: 650;
}
.demo-info {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  border-radius: 9px;
  background: var(--surface-soft);
  color: var(--muted);
  line-height: 1.5;
  font-size: 11px;
  margin: 23px 0 13px;
}
.demo-info ion-icon {
  flex: 0 0 auto;
  color: var(--brand);
  font-size: 17px;
}
.auth-theme {
  position: absolute;
  right: 18px;
  top: 18px;
  border: 0;
}
.auth-footnote {
  color: var(--muted);
  text-align: center;
  line-height: 1.6;
  font-size: 10px;
  margin: 18px 0 0;
}

@media (max-width: 1120px) {
  .sidebar {
    width: 205px;
  }
  .topbar {
    padding: 0 27px;
  }
  .page-content {
    padding-right: 27px;
    padding-left: 27px;
  }
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 850px) {
  .sidebar {
    width: 66px;
    padding: 22px 10px 15px;
    align-items: center;
  }
  .brand > span:last-child,
  .nav-label,
  .side-nav button {
    font-size: 0;
  }
  .brand {
    margin-bottom: 34px;
  }
  .side-nav {
    width: 100%;
  }
  .side-nav button {
    justify-content: center;
    padding: 0;
  }
  .side-nav button ion-icon {
    font-size: 20px;
  }
  .side-nav .nav-count,
  .profile-copy,
  .logout-button {
    display: none;
  }
  .sidebar-bottom {
    justify-content: center;
    width: 100%;
    padding-top: 13px;
  }
  .charts-grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(245px, 1fr);
  }
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 650px) {
  .sidebar,
  .breadcrumb {
    display: none;
  }
  .workspace {
    width: 100%;
  }
  .topbar {
    height: 62px;
    padding: 0 17px;
  }
  .mobile-brand {
    display: flex;
    font-size: 18px;
  }
  .mobile-brand .brand-mark {
    width: 30px;
    height: 30px;
    font-size: 16px;
    border-radius: 9px;
  }
  .topbar-actions {
    gap: 8px;
  }
  .demo-badge {
    font-size: 0;
    padding: 8px;
  }
  .demo-badge span {
    width: 7px;
    height: 7px;
  }
  .add-button {
    width: 38px;
    min-width: 38px;
    padding: 0;
    font-size: 0;
  }
  .add-button ion-icon {
    font-size: 19px;
  }
  .theme-button {
    width: 34px;
    height: 34px;
  }
  .page-content {
    padding: 21px 15px 88px;
  }
  .demo-banner {
    margin-top: 0;
    font-size: 10px;
  }
  .welcome-row {
    align-items: flex-start;
    margin-bottom: 17px;
  }
  .welcome-row h1 {
    font-size: 25px;
  }
  .welcome-row .outline-button {
    display: none;
  }
  .welcome-row .muted {
    font-size: 11px;
  }
  .metrics-grid {
    gap: 9px;
  }
  .metric-card {
    min-height: 118px;
    padding: 13px;
  }
  .metric-top {
    font-size: 10px;
  }
  .metric-icon {
    width: 27px;
    height: 27px;
    font-size: 14px;
  }
  .metric-card > strong {
    font-size: 18px;
    margin-top: 13px;
  }
  .metric-foot {
    font-size: 9px;
  }
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 10px;
  }
  .panel {
    padding: 15px;
    border-radius: 11px;
  }
  .trend-panel {
    overflow: hidden;
  }
  .trend-panel .apexcharts-canvas {
    transform: translateX(-8px);
  }
  .chart-legend {
    font-size: 0;
    gap: 3px;
  }
  .chart-legend i {
    margin: 0 3px;
  }
  .category-panel {
    min-height: auto;
  }
  .donut-wrap {
    height: 185px;
  }
  .bottom-grid {
    gap: 10px;
    margin-top: 10px;
  }
  .transactions-panel,
  .goals-panel {
    min-height: auto;
  }
  .transaction-row {
    gap: 8px;
    min-height: 52px;
  }
  .transaction-amount {
    font-size: 10px;
  }
  .remove-button {
    opacity: 1;
    width: 24px;
  }
  .mobile-nav {
    position: fixed;
    z-index: 10;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(62px + env(safe-area-inset-bottom));
    padding: 5px 15px env(safe-area-inset-bottom);
    background: var(--surface);
    border-top: 1px solid var(--line);
    display: flex;
    justify-content: space-around;
  }
  .mobile-nav button {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--muted);
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 3px;
    font-size: 9px;
  }
  .mobile-nav button ion-icon {
    font-size: 19px;
  }
  .mobile-nav button.active {
    color: var(--brand);
    font-weight: 700;
  }
  .page-title-row {
    align-items: center;
  }
  .page-title-row .primary-button {
    min-height: 37px;
    padding: 0 10px;
    font-size: 10px;
    white-space: nowrap;
  }
  .page-title-row .primary-button ion-icon {
    font-size: 14px;
  }
  .goals-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .transaction-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .filter-group {
    width: 100%;
  }
  .filter-group button {
    flex: 1;
  }
  .modal-card {
    padding: 20px;
    border-radius: 14px;
  }
  .auth-card {
    padding: 30px 24px;
  }
}
@media (max-width: 360px) {
  .metric-card {
    padding: 11px;
  }
  .metric-card > strong {
    font-size: 16px;
  }
  .welcome-row h1 {
    font-size: 23px;
  }
  .page-title-row .primary-button {
    padding: 0 8px;
  }
  .page-title-row .primary-button ion-icon {
    display: none;
  }
}
</style>
