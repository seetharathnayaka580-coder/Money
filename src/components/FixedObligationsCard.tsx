import React, { useState } from 'react';
import { FixedObligation, BankAccount, AccountId } from '../types';
import { formatLKR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  CheckCircle2,
  Circle,
  Plus,
  ShieldAlert,
  Check,
  AlertCircle,
  Trash2,
  Edit2,
  X,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface FixedObligationsCardProps {
  obligations: FixedObligation[];
  accounts: BankAccount[];
  onTogglePaid: (obligationId: string, accountId: AccountId) => void;
  onAddObligation: (newObligation: Omit<FixedObligation, 'id' | 'isPaid'>) => void;
  onDeleteObligation: (obligationId: string) => void;
  onUpdateObligation?: (
    obligationId: string,
    updated: { title: string; amount: number; dueDay: number }
  ) => void;
  onRestoreDefaults?: () => void;
}

export const FixedObligationsCard: React.FC<FixedObligationsCardProps> = ({
  obligations,
  accounts,
  onTogglePaid,
  onAddObligation,
  onDeleteObligation,
  onUpdateObligation,
  onRestoreDefaults,
}) => {
  const [selectedPayAccount, setSelectedPayAccount] = useState<AccountId>('sampath');
  const [payingObligationId, setPayingObligationId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit obligation state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDay, setEditDueDay] = useState('10');

  // New obligation form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDay, setNewDueDay] = useState('10');

  const totalAmount = obligations.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = obligations
    .filter((item) => item.isPaid)
    .reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = totalAmount - paidAmount;
  const paidCount = obligations.filter((item) => item.isPaid).length;

  const handlePayClick = (obligation: FixedObligation) => {
    if (obligation.isPaid) {
      // Unmark as paid
      onTogglePaid(obligation.id, 'sampath');
    } else {
      // Prompt payment confirmation
      setPayingObligationId(obligation.id);
      setConfirmDeleteId(null);
      setEditingId(null);
    }
  };

  const confirmPayment = (obligationId: string) => {
    onTogglePaid(obligationId, selectedPayAccount);
    setPayingObligationId(null);
  };

  const startEdit = (obligation: FixedObligation) => {
    setEditingId(obligation.id);
    setEditTitle(obligation.title);
    setEditAmount(obligation.amount.toString());
    setEditDueDay(obligation.dueDay.toString());
    setConfirmDeleteId(null);
    setPayingObligationId(null);
  };

  const saveEdit = (obligationId: string) => {
    if (!editTitle.trim() || !editAmount || parseFloat(editAmount) <= 0) return;
    if (onUpdateObligation) {
      onUpdateObligation(obligationId, {
        title: editTitle.trim(),
        amount: parseFloat(editAmount),
        dueDay: parseInt(editDueDay) || 10,
      });
    }
    setEditingId(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || parseFloat(newAmount) <= 0) return;

    onAddObligation({
      title: newTitle.trim(),
      amount: parseFloat(newAmount),
      dueDay: parseInt(newDueDay) || 10,
      category: 'other_bills',
      note: 'Custom fixed commitment',
    });

    setNewTitle('');
    setNewAmount('');
    setShowAddForm(false);
  };

  const hasMissingDefault =
    obligations.length < 3 ||
    !obligations.some((o) => o.id === 'fix_bike_rental') ||
    !obligations.some((o) => o.id === 'fix_seat') ||
    !obligations.some((o) => o.id === 'fix_mobile_rental');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Fixed Monthly Commitments
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {paidCount} of {obligations.length} settled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your regular monthly bills (Bike rental, Seat/Seettu, Mobile rental, or custom commitments)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Total Fixed Needed</div>
            <div className="text-base font-extrabold text-slate-900 font-mono">
              {formatLKR(totalAmount)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {hasMissingDefault && onRestoreDefaults && (
              <button
                id="btn-restore-default-obligations"
                onClick={onRestoreDefaults}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Restore default bills (Bike, Seat, Mobile)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            )}
            <button
              id="btn-add-fixed-obligation"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setConfirmDeleteId(null);
                setEditingId(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Alert Bar */}
      <div className="py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {obligations.length === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              No fixed commitments listed.
            </span>
          ) : remainingAmount === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              All fixed bills for this month are completely paid!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-800 font-medium bg-amber-50 px-2.5 py-1 rounded-md">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <strong>{formatLKR(remainingAmount)}</strong> remaining to be cleared from salary.
            </span>
          )}
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Paid: <span className="text-emerald-700 font-bold">{formatLKR(paidAmount)}</span> / {formatLKR(totalAmount)}
        </div>
      </div>

      {/* Inline Form to Add New Fixed Obligation */}
      {showAddForm && (
        <form onSubmit={handleCreateNew} className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Add Fixed Monthly Commitment
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Room Rent, Bike Rental, Insurance"
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Amount (LKR)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Amount in LKR"
                required
                min="1"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Due Day of Month</label>
              <input
                type="number"
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                min="1"
                max="31"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
            >
              Save Commitment
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {obligations.length === 0 && (
        <div className="py-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 my-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Fixed Commitments</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
            You currently have no active recurring commitments. You can add custom monthly expenses or restore the defaults.
          </p>
          {onRestoreDefaults && (
            <button
              onClick={onRestoreDefaults}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Bike Rental, Seat & Mobile Rental</span>
            </button>
          )}
        </div>
      )}

      {/* Obligations List */}
      <div className="divide-y divide-slate-100 mt-2">
        {obligations.map((item) => {
          const isPayingThis = payingObligationId === item.id;
          const isConfirmingDelete = confirmDeleteId === item.id;
          const isEditingThis = editingId === item.id;

          return (
            <div
              key={item.id}
              id={`obligation-item-${item.id}`}
              className="py-3.5 px-2 rounded-xl hover:bg-slate-50/70 transition-colors"
            >
              {isConfirmingDelete ? (
                /* Inline Removal Confirmation Banner */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-950">
                        Remove fixed bill: "{item.title}" ({formatLKR(item.amount)})?
                      </div>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        {item.isPaid
                          ? `This bill is marked as paid. Removing it will refund ${formatLKR(
                              item.amount
                            )} back to your account.`
                          : 'This commitment will be removed from your monthly fixed budget.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-1 sm:pt-0">
                    <button
                      id={`btn-cancel-remove-${item.id}`}
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Keep Bill
                    </button>
                    <button
                      id={`btn-confirm-remove-${item.id}`}
                      onClick={() => {
                        onDeleteObligation(item.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : isEditingThis ? (
                /* Inline Edit Mode */
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Edit Commitment
                    </span>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Amount (LKR)</label>
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        min="1"
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Due Day</label>
                      <input
                        type="number"
                        value={editDueDay}
                        onChange={(e) => setEditDueDay(e.target.value)}
                        min="1"
                        max="31"
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id={`btn-save-edit-${item.id}`}
                      onClick={() => saveEdit(item.id)}
                      className="px-3.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Obligation Row */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                        item.isPaid
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <CategoryIcon category={item.category} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold ${
                            item.isPaid ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-sm">
                            <Check className="w-2.5 h-2.5" /> Paid
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-sm">
                            Due around {item.dueDay}th
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.note || 'Monthly fixed bill'}
                        {item.isPaid && item.paidDate && (
                          <span className="text-slate-400 ml-2">• Settled on {item.paidDate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pl-13 sm:pl-0">
                    <div className="text-right">
                      <span
                        className={`text-base font-extrabold font-mono ${
                          item.isPaid ? 'text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {formatLKR(item.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">per month</span>
                    </div>

                    {isPayingThis ? (
                      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-300">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 font-semibold uppercase">Paid From:</span>
                          <select
                            value={selectedPayAccount}
                            onChange={(e) => setSelectedPayAccount(e.target.value as AccountId)}
                            className="text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5 font-medium text-slate-800"
                          >
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} ({formatLKR(acc.balance)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => confirmPayment(item.id)}
                          className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setPayingObligationId(null)}
                          className="px-1.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          id={`btn-edit-obligation-${item.id}`}
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title={`Edit ${item.title}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Remove Option Button */}
                        <button
                          id={`btn-remove-obligation-${item.id}`}
                          onClick={() => {
                            setPayingObligationId(null);
                            setEditingId(null);
                            setConfirmDeleteId(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Paid / Paid Undo Button */}
                        <button
                          id={`btn-toggle-paid-${item.id}`}
                          onClick={() => handlePayClick(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            item.isPaid
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid (Undo)</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              <span>Mark Paid</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
