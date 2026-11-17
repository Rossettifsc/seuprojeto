import type { ApexOptions } from 'apexcharts';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
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
import { formatCurrency } from '@/utils/financeFormatters';

type AppSection = 'overview' | 'transactions' | 'goals';
type ToastColor = 'success' | 'danger';

const categories = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Salário', 'Extra', 'Outros'];
const categoryColors = ['#5667e9', '#e9a23b', '#56b89a', '#ec7188', '#9676d9', '#4b9fc2'];

function getLocalDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function createFinanceDashboard() {
  const today = getLocalDate();
  const userId = ref<string | null>(null);
  const isSignUp = ref(false);
  const authEmail = ref('');
  const authPassword = ref('');
  const isDark = ref(false);
  const activeSection = ref<AppSection>('overview');
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
  const toastColor = ref<ToastColor>('success');
  const transactionForm = ref<NewTransaction>({
    title: '',
    amount: 0,
    category: categories[0],
    type: 'expense',
    date: today,
  });
  const goalForm = ref<NewGoal>({ title: '', target_amount: 0, due_date: '' });

  let authSubscription: { unsubscribe: () => void } | undefined;
  let toastTimeout: ReturnType<typeof setTimeout> | undefined;

  const isDemo = computed(() => userId.value === DEMO_USER_ID);
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
  const todayLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const monthTransactions = computed(() =>
    transactions.value.filter((transaction) => transaction.date.startsWith(getMonthKey(new Date()))),
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
  const categoryBreakdown = computed(() => {
    const totals = new Map<string, number>();
    monthTransactions.value
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
      });

    return [...totals.entries()]
      .map(([name, value], index) => ({
        name,
        value,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.value - a.value);
  });
  const categorySeries = computed(() => categoryBreakdown.value.map((category) => category.value));
  const trendMonths = computed(() =>
    Array.from({ length: 6 }, (_, index) => {
      const month = new Date();
      month.setDate(1);
      month.setMonth(month.getMonth() - (5 - index));
      return month;
    }),
  );
  const trendSeries = computed(() => [
    { name: 'Receitas', data: trendMonths.value.map((month) => totalForMonth(month, 'income')) },
    { name: 'Despesas', data: trendMonths.value.map((month) => totalForMonth(month, 'expense')) },
  ]);
  const trendOptions = computed<ApexOptions>(() => ({
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
    grid: {
      borderColor: isDark.value ? '#303644' : '#eef0f4',
      strokeDashArray: 4,
      padding: { left: 8, right: 12 },
    },
    xaxis: {
      categories: trendMonths.value.map((month) =>
        month.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      ),
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
    tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
  }));
  const categoryOptions = computed<ApexOptions>(() => ({
    chart: { fontFamily: 'Inter, sans-serif', background: 'transparent' },
    labels: categoryBreakdown.value.map((category) => category.name),
    colors: categoryBreakdown.value.map((category) => category.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 3, colors: [isDark.value ? '#1b1e27' : '#ffffff'] },
    plotOptions: { pie: { donut: { size: '76%' } } },
    tooltip: { y: { formatter: (value: number) => formatCurrency(value) } },
  }));

  function notify(message: string, color: ToastColor = 'success'): void {
    toastMessage.value = message;
    toastColor.value = color;
    toastOpen.value = true;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastOpen.value = false;
    }, 3200);
  }

  function totalForMonth(date: Date, type: TransactionType): number {
    const monthKey = getMonthKey(date);
    return transactions.value
      .filter((transaction) => transaction.type === type && transaction.date.startsWith(monthKey))
      .reduce((total, transaction) => total + transaction.amount, 0);
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
    transactionForm.value = {
      title: '',
      amount: 0,
      category: categories[0],
      type: 'expense',
      date: today,
    };
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
    if (!userId.value || !contributionGoal.value || !contributionAmount.value || contributionAmount.value <= 0) {
      return;
    }
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

  watch(showDemoBanner, (visible) => {
    if (!visible) localStorage.setItem('saldo-demo-banner-dismissed', 'true');
  });

  onMounted(async () => {
    isDark.value = localStorage.getItem('saldo-dark-mode') === 'true';
    document.documentElement.classList.toggle('ion-palette-dark', isDark.value);
    showDemoBanner.value = localStorage.getItem('saldo-demo-banner-dismissed') !== 'true';

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

  onUnmounted(() => {
    authSubscription?.unsubscribe();
    if (toastTimeout) clearTimeout(toastTimeout);
  });

  return {
    activeSection,
    authEmail,
    authPassword,
    balanceMessage,
    busy,
    categoryBreakdown,
    categoryOptions,
    categorySeries,
    contributionAmount,
    contributionGoal,
    displayName,
    filteredTransactions,
    firstName,
    goalForm,
    goalModalOpen,
    goals,
    isDark,
    isDemo,
    isSignUp,
    monthBalance,
    monthExpenses,
    monthIncome,
    openContributionModal,
    openGoalModal,
    openTransactionModal,
    removeTransactionAction,
    saveContribution,
    saveGoal,
    saveTransaction,
    savingsRate,
    sectionTitle,
    showDemoBanner,
    signOut,
    today,
    todayLabel,
    toastColor,
    toastMessage,
    toastOpen,
    toggleTheme,
    transactionFilter,
    transactionForm,
    transactionModalOpen,
    transactions,
    transactionTypeOptions: ['all', 'income', 'expense'] as const,
    trendOptions,
    trendSeries,
    userId,
    userInitial,
    enterDemo,
    authenticate,
  };
}

export function useFinanceDashboard(): ReturnType<typeof createFinanceDashboard> {
  return createFinanceDashboard();
}
