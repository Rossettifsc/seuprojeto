import type { FinanceGoal } from '@/types/finance';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(`${value}T12:00:00`))
    .replace('.', '');
}

export function getGoalProgress(goal: FinanceGoal): number {
  return Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
}
