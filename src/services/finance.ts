import { supabase } from '@/lib/supabase';
import type { FinanceGoal, FinanceTransaction, NewGoal, NewTransaction } from '@/types/finance';

export const DEMO_USER_ID = 'demo';

const transactionStorageKey = 'saldo-transactions';
const goalStorageKey = 'saldo-goals';

function demoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

const sampleTransactions: FinanceTransaction[] = [
  {
    id: 'demo-1',
    title: 'Salário',
    amount: 5200,
    category: 'Salário',
    type: 'income',
    date: demoDate(2),
  },
  {
    id: 'demo-2',
    title: 'Aluguel',
    amount: 1450,
    category: 'Moradia',
    type: 'expense',
    date: demoDate(3),
  },
  {
    id: 'demo-3',
    title: 'Supermercado',
    amount: 386.4,
    category: 'Alimentação',
    type: 'expense',
    date: demoDate(4),
  },
  {
    id: 'demo-4',
    title: 'Projeto freelancer',
    amount: 850,
    category: 'Extra',
    type: 'income',
    date: demoDate(7),
  },
  {
    id: 'demo-5',
    title: 'Internet',
    amount: 119.9,
    category: 'Moradia',
    type: 'expense',
    date: demoDate(9),
  },
  {
    id: 'demo-6',
    title: 'Academia',
    amount: 89.9,
    category: 'Saúde',
    type: 'expense',
    date: demoDate(12),
  },
];

const sampleGoals: FinanceGoal[] = [
  {
    id: 'demo-goal-1',
    title: 'Reserva de emergência',
    target_amount: 10000,
    current_amount: 6200,
    due_date: '2027-06-30',
  },
  {
    id: 'demo-goal-2',
    title: 'Viagem de férias',
    target_amount: 5000,
    current_amount: 1850,
    due_date: '2027-01-15',
  },
];

function readDemoList<T>(key: string, initialData: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored === null) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }

  return JSON.parse(stored) as T[];
}

function saveDemoList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Configure as variáveis do Supabase para continuar.');
  }
  return supabase;
}

export async function listTransactions(userId: string): Promise<FinanceTransaction[]> {
  if (userId === DEMO_USER_ID) {
    return readDemoList(transactionStorageKey, sampleTransactions).sort((a, b) => b.date.localeCompare(a.date));
  }

  const { data, error } = await requireSupabase()
    .from('transactions')
    .select('id, title, amount, category, type, date')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((item) => ({ ...item, amount: Number(item.amount) }));
}

export async function createTransaction(userId: string, transaction: NewTransaction): Promise<FinanceTransaction> {
  if (userId === DEMO_USER_ID) {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    const transactions = readDemoList(transactionStorageKey, sampleTransactions);
    saveDemoList(transactionStorageKey, [newTransaction, ...transactions]);
    return newTransaction;
  }

  const { data, error } = await requireSupabase()
    .from('transactions')
    .insert({ ...transaction, user_id: userId })
    .select('id, title, amount, category, type, date')
    .single();

  if (error) throw error;
  return { ...data, amount: Number(data.amount) };
}

export async function removeTransaction(userId: string, transactionId: string): Promise<void> {
  if (userId === DEMO_USER_ID) {
    const transactions = readDemoList(transactionStorageKey, sampleTransactions);
    saveDemoList(
      transactionStorageKey,
      transactions.filter((transaction) => transaction.id !== transactionId),
    );
    return;
  }

  const { error } = await requireSupabase().from('transactions').delete().eq('id', transactionId).eq('user_id', userId);

  if (error) throw error;
}

export async function listGoals(userId: string): Promise<FinanceGoal[]> {
  if (userId === DEMO_USER_ID) {
    return readDemoList(goalStorageKey, sampleGoals);
  }

  const { data, error } = await requireSupabase()
    .from('goals')
    .select('id, title, target_amount, current_amount, due_date')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((goal) => ({
    ...goal,
    target_amount: Number(goal.target_amount),
    current_amount: Number(goal.current_amount),
  }));
}

export async function createGoal(userId: string, goal: NewGoal): Promise<FinanceGoal> {
  if (userId === DEMO_USER_ID) {
    const newGoal = { ...goal, id: crypto.randomUUID(), current_amount: 0 };
    const goals = readDemoList(goalStorageKey, sampleGoals);
    saveDemoList(goalStorageKey, [newGoal, ...goals]);
    return newGoal;
  }

  const { data, error } = await requireSupabase()
    .from('goals')
    .insert({ ...goal, current_amount: 0, user_id: userId })
    .select('id, title, target_amount, current_amount, due_date')
    .single();

  if (error) throw error;
  return {
    ...data,
    target_amount: Number(data.target_amount),
    current_amount: Number(data.current_amount),
  };
}

export async function contributeToGoal(userId: string, goalId: string, amount: number): Promise<void> {
  if (userId === DEMO_USER_ID) {
    const goals = readDemoList(goalStorageKey, sampleGoals);
    saveDemoList(
      goalStorageKey,
      goals.map((goal) => (goal.id === goalId ? { ...goal, current_amount: goal.current_amount + amount } : goal)),
    );
    return;
  }

  const { error } = await requireSupabase().rpc('contribute_to_goal', {
    goal_id: goalId,
    contribution: amount,
  });

  if (error) throw error;
}
