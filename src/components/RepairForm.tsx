import { useEffect, useState } from 'react';
import { X, DollarSign, Calendar, User, MapPin, Tag } from 'lucide-react';
import {
  CATEGORIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Repair,
  type RepairInput,
  type RepairPriority,
  type RepairStatus,
} from '@/lib/supabase';

interface RepairFormProps {
  repair: Repair | null;
  onSave: (input: RepairInput, id?: string) => Promise<void>;
  onClose: () => void;
}

const emptyForm: RepairInput = {
  title: '',
  description: '',
  room: '',
  status: 'todo',
  priority: 'medium',
  category: 'Other',
  cost: 0,
  contractor: '',
  due_date: null,
};

export default function RepairForm({ repair, onSave, onClose }: RepairFormProps) {
  const [form, setForm] = useState<RepairInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (repair) {
      setForm({
        title: repair.title,
        description: repair.description,
        room: repair.room,
        status: repair.status,
        priority: repair.priority,
        category: repair.category,
        cost: repair.cost,
        contractor: repair.contractor,
        due_date: repair.due_date,
      });
    }
  }, [repair]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a title for this repair.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          ...form,
          cost: Number(form.cost) || 0,
          title: form.title.trim(),
        },
        repair?.id,
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    children: React.ReactNode,
    icon?: React.ReactNode,
  ) => (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-600">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );

  const inputClass =
    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-stone-50 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-900">
            {repair ? 'Edit Repair' : 'New Repair'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-200 hover:text-stone-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {field('Title', (
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Fix leaking kitchen sink"
              className={inputClass}
              autoFocus
            />
          ))}

          {field('Description', (
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details about the issue…"
              rows={3}
              className={inputClass}
            />
          ))}

          <div className="grid grid-cols-2 gap-4">
            {field('Room / Area', (
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="Kitchen"
                className={inputClass}
              />
            ), <MapPin size={14} />)}

            {field('Category', (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ), <Tag size={14} />)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Status', (
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as RepairStatus })
                }
                className={inputClass}
              >
                {(Object.keys(STATUS_LABELS) as RepairStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            ))}

            {field('Priority', (
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as RepairPriority })
                }
                className={inputClass}
              >
                {(Object.keys(PRIORITY_LABELS) as RepairPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                ))}
              </select>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Estimated Cost', (
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <DollarSign size={15} />
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost || ''}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  placeholder="0"
                  className={`${inputClass} pl-8`}
                />
              </div>
            ))}

            {field('Due Date', (
              <input
                type="date"
                value={form.due_date ?? ''}
                onChange={(e) =>
                  setForm({ ...form, due_date: e.target.value || null })
                }
                className={inputClass}
              />
            ), <Calendar size={14} />)}
          </div>

          {field('Contractor / Who', (
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <User size={15} />
              </span>
              <input
                type="text"
                value={form.contractor}
                onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                placeholder="e.g. Mike's Plumbing"
                className={`${inputClass} pl-8`}
              />
            </div>
          ))}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>

        <div className="flex gap-3 border-t border-stone-200 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : repair ? 'Save Changes' : 'Add Repair'}
          </button>
        </div>
      </div>
    </div>
  );
}
