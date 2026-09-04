import { BankAccount, FixedObligation, Transaction, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Pathum Sathintha',
  role: 'Farm Supervisor',
  salaryDay: 10,
  otWindowStart: 15,
  otWindowEnd: 20,
  expectedBasicSalary: 85000, // standard representative benchmark for farm supervisor, fully customizable
  expectedOT: 35000,
};

export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'sampath',
    name: 'Sampath Bank (Salary & Main)',
    bankName: 'Sampath Bank',
    accountNumber: '•••• 1092',
    balance: 38900,
    type: 'salary',
    color: 'emerald',
    description: 'Primary salary (10th), Overtime OT (15th-20th), other income & daily banking',
  },
  {
    id: 'dialog_finance',
    name: 'Dialog Finance (Savings)',
    bankName: 'Dialog Finance',
    accountNumber: '•••• 7734',
    balance: 14000,
    type: 'savings',
    color: 'purple',
    description: 'Emergency reserve & dedicated savings',
  },
  {
    id: 'cash',
    name: 'Cash in Hand (Wallet)',
    bankName: 'Physical Cash',
    accountNumber: 'Pocket',
    balance: 2500,
    type: 'cash',
    color: 'blue',
    description: 'For farm groceries, bus, tea, and daily reloads',
  },
];

export const INITIAL_FIXED_OBLIGATIONS: FixedObligation[] = [
  {
    id: 'fix_bike_rental',
    title: 'Bike Rental',
    amount: 25000,
    dueDay: 10,
    category: 'bike_rental',
    isPaid: false,
    note: 'Essential farm transport monthly rental',
  },
  {
    id: 'fix_seat',
    title: 'Seat / Seettu Payment',
    amount: 5000,
    dueDay: 12,
    category: 'seat',
    isPaid: false,
    note: 'Monthly seat commitment',
  },
  {
    id: 'fix_mobile_rental',
    title: 'Mobile Rental / Postpaid Bill',
    amount: 7900,
    dueDay: 15,
    category: 'mobile_rental',
    isPaid: false,
    note: 'Farm communication & data package',
  },
];

export const CATEGORY_DETAILS: Record<
  string,
  { label: string; color: string; iconName: string; defaultType: 'expense' | 'income' }
> = {
  bike_rental: { label: 'Bike Rental', color: 'rose', iconName: 'Bike', defaultType: 'expense' },
  seat: { label: 'Seat / Seettu', color: 'amber', iconName: 'Ticket', defaultType: 'expense' },
  mobile_rental: { label: 'Mobile Rental', color: 'indigo', iconName: 'Smartphone', defaultType: 'expense' },
  bike_repair: { label: 'Bike Repair & Petrol', color: 'orange', iconName: 'Wrench', defaultType: 'expense' },
  hospital: { label: 'Hospital & Medical', color: 'red', iconName: 'Activity', defaultType: 'expense' },
  daily_expenses: { label: 'Daily Food & Living', color: 'emerald', iconName: 'Coffee', defaultType: 'expense' },
  internet_reload: { label: 'Internet & Reloads', color: 'cyan', iconName: 'Wifi', defaultType: 'expense' },
  liquor: { label: 'Liquor & Relax', color: 'violet', iconName: 'Wine', defaultType: 'expense' },
  other_bills: { label: 'Other Bills / Misc', color: 'slate', iconName: 'Receipt', defaultType: 'expense' },
  basic_salary: { label: 'Basic Salary (10th)', color: 'emerald', iconName: 'Briefcase', defaultType: 'income' },
  ot_amount: { label: 'OT Amount (15-20th)', color: 'teal', iconName: 'Clock', defaultType: 'income' },
  other_income: { label: 'Other Income', color: 'blue', iconName: 'PlusCircle', defaultType: 'income' },
  transfer: { label: 'Account Transfer', color: 'slate', iconName: 'ArrowRightLeft', defaultType: 'expense' },
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_init_dialog',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    type: 'income',
    amount: 14000,
    category: 'other_income',
    title: 'Initial Dialog Finance Savings Balance',
    accountId: 'dialog_finance',
    note: 'Saved in Dialog Finance account',
  },
];
