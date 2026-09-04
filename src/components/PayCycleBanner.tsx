import React from 'react';
import { calculatePayCycles, formatLKR } from '../utils/formatters';
import { Calendar, AlertCircle, CheckCircle2, Clock, ArrowUpRight, ShieldCheck, PlusCircle } from 'lucide-react';
import { FixedObligation, BankAccount } from '../types';

interface PayCycleBannerProps {
  accounts: BankAccount[];
  fixedObligations: FixedObligation[];
  onLogSalary: () => void;
  onLogOT: () => void;
  onLogOtherIncome?: () => void;
}

export const PayCycleBanner: React.FC<PayCycleBannerProps> = ({
  accounts,
  fixedObligations,
  onLogSalary,
  onLogOT,
  onLogOtherIncome,
}) => {
  const payCycles = calculatePayCycles();

  // Find Sampath Bank balance (Salary and main account)
  const sampathAccount = accounts.find((a) => a.id === 'sampath');
  const sampathBalance = sampathAccount?.balance || 0;

  // Total fixed expenses
  const totalFixed = fixedObligations.reduce((acc, curr) => acc + curr.amount, 0);
  const paidFixed = fixedObligations
    .filter((o) => o.isPaid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const unpaidFixed = totalFixed - paidFixed;

  // Liquid available for bills (Sampath Bank + Cash)
  const totalLiquid = accounts
    .filter((a) => a.id !== 'dialog_finance')
    .reduce((acc, a) => acc + a.balance, 0);

  const coveragePercent = unpaidFixed > 0 ? Math.min(100, Math.round((totalLiquid / unpaidFixed) * 100)) : 100;
  const isFullyFunded = unpaidFixed === 0 || totalLiquid >= unpaidFixed;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* 1. Basic Salary (10th) */}
        <div className="flex flex-col justify-between pr-0 md:pr-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5" />
                Basic Salary (10th)
              </span>
              {payCycles.isBasicToday ? (
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                  Today is Payday!
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  {payCycles.daysUntilBasic === 0 ? 'Today' : `In ${payCycles.daysUntilBasic} days`}
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-2.5">
              Deposited to Sampath Bank
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary monthly earnings due on the 10th directly to your Sampath Bank account.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Target: <strong className="text-slate-800">{payCycles.nextBasicDateStr}</strong>
            </span>
            <button
              id="btn-quick-log-salary"
              onClick={onLogSalary}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Manual add salary to Sampath Bank"
            >
              <span>Add Salary</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Overtime Window (15th - 20th) */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 px-0 md:px-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                Overtime (15th–20th)
              </span>
              {payCycles.isOTPeriod ? (
                <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  Window Active
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-medium">
                  In {payCycles.daysUntilOT} days
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-2.5">
              OT Payout to Sampath Bank
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Received within 15–20 days of the month. Great for bike maintenance, savings, and wallet reloads.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Window: <strong className="text-slate-800">15th to 20th</strong>
            </span>
            <div className="flex items-center gap-1.5">
              {onLogOtherIncome && (
                <button
                  id="btn-quick-log-other-income"
                  onClick={onLogOtherIncome}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-colors"
                  title="Manual add other income"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Other Income</span>
                </button>
              )}
              <button
                id="btn-quick-log-ot"
                onClick={onLogOT}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Manual add OT to Sampath Bank"
              >
                <span>Add OT</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Fixed Commitment Shield (37,900 LKR) */}
        <div className="flex flex-col justify-between pt-4 md:pt-0 pl-0 md:pl-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                Fixed Bills Shield
              </span>
              {unpaidFixed === 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  All Paid
                </span>
              ) : isFullyFunded ? (
                <span className="text-xs font-semibold text-emerald-600">Funds Ready</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                  <AlertCircle className="w-3 h-3" />
                  Pending Salary
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatLKR(unpaidFixed)}
                </span>
                <span className="text-xs text-slate-500 ml-1">remaining</span>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Total: {formatLKR(totalFixed)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-300 ${
                  coveragePercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${coveragePercent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              {fixedObligations.length > 0
                ? `${fixedObligations.map((o) => `${o.title} (${formatLKR(o.amount)})`).join(' + ')}. `
                : 'No active fixed commitments. '}
              {unpaidFixed > 0 && totalLiquid < unpaidFixed && (
                <span className="text-amber-700 font-medium">
                  Requires {formatLKR(unpaidFixed - totalLiquid)} more upon salary.
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sampath Bank Balance:</span>
            <strong className="text-slate-900 font-mono font-bold">{formatLKR(sampathBalance)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
