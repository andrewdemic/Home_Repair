import { Pencil, Trash2, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Repair,
  type RepairPriority,
  type RepairStatus,
} from '@/lib/supabase';

interface RepairCardProps {
  repair: Repair;
  onEdit: (repair: Repair) => void;
  onDelete: (repair: Repair) => void;
  onStatusChange: (repair: Repair, status: RepairStatus) => void;
}

const STATUS_STYLES: Record<RepairStatus, string> = {
  todo: 'bg-stone-100 text-stone-700 border-stone-200',
  in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
  done: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const PRIORITY_STYLES: Record<RepairPriority, string> = {
  low: 'bg-sky-100 text-sky-800 border-sky-200',
  medium: 'bg-stone-100 text-stone-700 border-stone-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

const PRIORITY_DOT: Record<RepairPriority, string> = {
  low: 'bg-sky-500',
  medium: 'bg-stone-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function RepairCard({ repair, onEdit, onDelete, onStatusChange }: RepairCardProps) {
  const isDone = repair.status === 'done';
  const overdue =
    repair.due_date && !isDone && new Date(repair.due_date) < new Date(new Date().toDateString());

  return (
    <div
      className={`group relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isDone ? 'border-stone-200 opacity-75' : 'border-stone-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[repair.priority]}`} />
            <h3 className={`truncate font-semibold text-stone-900 ${isDone ? 'line-through' : ''}`}>
              {repair.title}
            </h3>
          </div>
          {repair.description && (
            <p className="mb-2 line-clamp-2 text-sm text-stone-500">{repair.description}</p>
          )}
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(repair)}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            aria-label="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(repair)}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[repair.status]}`}>
          {STATUS_LABELS[repair.status]}
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[repair.priority]}`}>
          {PRIORITY_LABELS[repair.priority]}
        </span>
        {repair.category && (
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {repair.category}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
        {repair.room && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {repair.room}
          </span>
        )}
        {repair.contractor && (
          <span className="flex items-center gap-1">
            <User size={12} /> {repair.contractor}
          </span>
        )}
        {repair.due_date && (
          <span className={`flex items-center gap-1 ${overdue ? 'font-semibold text-red-600' : ''}`}>
            <Calendar size={12} />
            {new Date(repair.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {overdue && ' · Overdue'}
          </span>
        )}
        {repair.cost > 0 && (
          <span className="flex items-center gap-1">
            <DollarSign size={12} />
            {repair.cost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {!isDone && (
        <div className="mt-3 border-t border-stone-100 pt-2.5">
          <select
            value={repair.status}
            onChange={(e) => onStatusChange(repair, e.target.value as RepairStatus)}
            className="w-full cursor-pointer rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 focus:outline-none"
          >
            <option value="todo">Move to To Do</option>
            <option value="in_progress">Mark In Progress</option>
            <option value="done">Mark Done</option>
          </select>
        </div>
      )}
    </div>
  );
}
