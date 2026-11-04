export type TransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
}

export interface FinanceGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  due_date: string;
}

export interface NewTransaction {
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;
}

export interface NewGoal {
  title: string;
  target_amount: number;
  due_date: string;
}
