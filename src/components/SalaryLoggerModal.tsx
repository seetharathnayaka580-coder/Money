import React, { useState, useEffect } from 'react';
import { BankAccount, AccountId, FixedObligation, IncomeCategory } from '../types';
import { formatLKR } from '../utils/formatters';
import { Briefcase, Clock, Check, X, ShieldCheck, Landmark, PlusCircle, Sparkles } from 'lucide-react';

interface SalaryLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  fixedObligations: FixedObligation[];
  defaultType?: 'basic_salary' | 'ot_amount' | 'other_income';
  onRecordIncome: (income: {
    amount: number;
    category: IncomeCategory;
    title: string;
    accountId: AccountId;
    date: string;
    note?: string;
    autoPayFixed?: boolean;
  }) => void;
}

export const SalaryLoggerModal: React.FC<SalaryLoggerModalProps> = ({
  isOpen,
  onClose,
  accounts,
  fixedObligations,
  defaultType = 'basic_salary',
  onRecordIncome,
}) => {
  const [incomeType, setIncomeType] = useState<IncomeCategory>(defaultType);
  const [customTitle, setCustomTitle] = useState('');
  const [amount, setAmount] = useState('85000');
  const [accountId, setAccountId] = useState<AccountId>('sampath');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [autoPayFixed, setAutoPayFixed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIncomeType(defaultType);
      if (defaultType === 'basic_salary') {
        setAmount('85000');
        setCustomTitle('Basic Monthly Salary');
      } else if (defaultType === 'ot_amount') {
        setAmount('35000');
        setCustomTitle('Monthly Overtime (OT)');
      } else {
        setAmount('');
        setCustomTitle('Farm Produce / Side Income');
      }
      setAccountId('sampath');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setAutoPayFixed(false);
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const unpaidFixed = fixedObligations.filter((o) => !o.isPaid).reduce((sum, o) => sum + o.amount, 0);
  const totalFixed = fixedObligations.reduce((sum, o) => sum + o.amount, 0);
  const enteredAmount = parseFloat(amount) || 0;
  const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
  const newAccountBalance = (targetAccount?.balance || 0) + enteredAmount;

  const handleTypeSelect = (type: IncomeCategory) => {
    setIncomeType(type);
    if (type === 'basic_salary') {
      setAmount('85000');
      setCustomTitle('Basic Monthly Salary');
    } else if (type === 'ot_amount') {
      setAmount('35000');
      setCustomTitle('Monthly Overtime (OT)');
    } else {
      setAmount('');
      setCustomTitle('Farm Produce / Side Income');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) return;

    let finalTitle = customTitle.trim();
    if (!finalTitle) {
      if (incomeType === 'basic_salary') finalTitle = 'Basic Monthly Salary';
      else if (incomeType === 'ot_amount') finalTitle = 'Monthly Overtime (OT)';
      else finalTitle = 'Other Income';
    }

    // Append account info
    const accountName = targetAccount?.name || 'Sampath Bank';
    const completeTitle = `${finalTitle} (${accountName})`;

    onRecordIncome({
      amount: enteredAmount,
      category: incomeType,
      title: completeTitle,
      accountId,
      date,
      note: note.trim() || (incomeType === 'basic_salary' ? 'Regular 10th salary credited' : incomeType === 'ot_amount' ? '15th-20th OT payment credited' : 'Manual other income'),
      autoPayFixed: incomeType === 'basic_salary' ? autoPayFixed : false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              incomeType === 'basic_salary'
                ? 'bg-emerald-100 text-emerald-800'
                : incomeType === 'ot_amount'
                ? 'bg-teal-100 text-teal-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {incomeType === 'basic_salary' ? (
                <Briefcase className="w-5 h-5" />
              ) : incomeType === 'ot_amount' ? (
                <Clock className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {incomeType === 'basic_salary'
                  ? 'Manual Add Salary (Sampath Bank)'
                  : incomeType === 'ot_amount'
                  ? 'Manual Add OT Amount (Sampath Bank)'
                  : 'Manual Add Other Income'}
              </h3>
              <p className="text-xs text-slate-500">
                Direct income deposit into your banking accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Income Type Selector (3 options: Salary, OT, Other Income) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Income Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-select-basic-salary"
                onClick={() => handleTypeSelect('basic_salary')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  incomeType === 'basic_salary'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-xs font-bold">Basic Salary</span>
                </div>
                <div className="text-[10px] text-slate-500">10th Payday</div>
              </button>

              <button
                type="button"
                id="btn-select-ot-amount"
                onClick={() => handleTypeSelect('ot_amount')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  incomeType === 'ot_amount'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span className="text-xs font-bold">Overtime (OT)</span>
                </div>
                <div className="text-[10px] text-slate-500">15th–20th Window</div>
              </button>

              <button
                type="button"
                id="btn-select-other-income"
                onClick={() => handleTypeSelect('other_income')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  incomeType === 'other_income'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-xs font-bold">Other Income</span>
                </div>
                <div className="text-[10px] text-slate-500">Bonus, Produce, Side</div>
              </button>
            </div>
          </div>

          {/* Income Source / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Income Description / Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Basic Salary, 45h OT, Vegetable Harvest Sale, Bonus"
              required
              className="w-full px-3.5 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {incomeType === 'other_income' && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Quick suggestions:</span>
                {['Farm Bonus', 'Harvest Produce Sale', 'Freelance Work', 'Allowance'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCustomTitle(sug)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Manual Amount (LKR)
              </label>
              <div className="flex items-center gap-1">
                {incomeType === 'basic_salary' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAmount('85000')}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      85k
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('90000')}
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      90k
                    </button>
                  </>
                )}
                {incomeType === 'ot_amount' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAmount('35000')}
                      className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      35k
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('25000')}
                      className="text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      25k
                    </button>
                  </>
                )}
                {incomeType === 'other_income' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAmount('5000')}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      5,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('10000')}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('20000')}
                      className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded"
                    >
                      20,000
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rs.
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                placeholder="Enter manual amount in LKR"
                className="w-full pl-11 pr-4 py-2.5 text-base font-extrabold text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Deposit Account & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deposit Destination Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value as AccountId)}
                className="w-full px-3 py-2.5 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatLKR(acc.balance)})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">
                {accountId === 'sampath'
                  ? '✓ Credited directly to Sampath Bank'
                  : `Credited to ${targetAccount?.name}`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Allocation & Coverage Info Box */}
          {incomeType === 'basic_salary' ? (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Sampath Bank Salary Coverage (Bills: {formatLKR(totalFixed)})</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                Your monthly fixed bills total {formatLKR(totalFixed)}
                {fixedObligations.length > 0
                  ? ` (${fixedObligations.map((o) => `${o.title}: ${formatLKR(o.amount)}`).join(', ')})`
                  : ' (No active bills)'}
                .
              </p>
              {unpaidFixed > 0 && (
                <label className="flex items-center gap-2 mt-2.5 pt-2 border-t border-emerald-200/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPayFixed}
                    onChange={(e) => setAutoPayFixed(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-emerald-950">
                    Auto-settle pending fixed commitments ({formatLKR(unpaidFixed)}) from Sampath Bank
                  </span>
                </label>
              )}
            </div>
          ) : incomeType === 'ot_amount' ? (
            <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs">
                <Clock className="w-4 h-4 text-teal-700" />
                <span>Overtime (OT) Allocation</span>
              </div>
              <p className="text-[11px] text-teal-800 mt-1 leading-relaxed">
                OT is received between the 15th and 20th. After crediting to Sampath Bank, you can optionally transfer a portion into Dialog Finance (Savings) or withdraw cash for daily operations.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>Additional Income Stream</span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                Record farm harvest sales, bonuses, freelance services, or allowances directly to Sampath Bank or your preferred account.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Month basic salary, 45h farm OT, vegetable sale invoice"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Balance Preview Callout */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {targetAccount?.name} updated balance:
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {formatLKR(targetAccount?.balance || 0)} + {formatLKR(enteredAmount)} = <strong className="text-emerald-700 text-sm">{formatLKR(newAccountBalance)}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-manual-income"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Credit {formatLKR(enteredAmount)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
