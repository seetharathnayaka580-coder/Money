export type AccountId = 'sampath' | 'dialog_finance' | 'cash';

export interface BankAccount {
  id: AccountId;
  name: string;
  bankName: string;
  accountNumber?: string;
  balance: number;
  type: 'salary' | 'main' | 'savings' | 'cash';
  color: string;
  description: string;
}

export type ExpenseCategory =
  | 'bike_rental'
  | 'seat'
  | 'mobile_rental'
  | 'bike_repair'
  | 'hospital'
  | 'daily_expenses'
  | 'internet_reload'
  | 'liquor'
  | 'other_bills';

export type IncomeCategory =
  | 'basic_salary'
  | 'ot_amount'
  | 'other_income';

export interface FixedObligation {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // e.g. 10th
  category: ExpenseCategory;
  isPaid: boolean;
  paidDate?: string;
  paidFromAccount?: AccountId;
  note?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string or YYYY-MM-DD
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  category?: ExpenseCategory | IncomeCategory | 'transfer';
  title: string;
  accountId: AccountId;
  toAccountId?: AccountId; // for transfers
  note?: string;
  isFixed?: boolean;
}

export interface UserProfile {
  name: string;
  role: string;
  salaryDay: number; // 10th
  otWindowStart: number; // 15th
  otWindowEnd: number; // 20th
  expectedBasicSalary: number;
  expectedOT: number;
}
