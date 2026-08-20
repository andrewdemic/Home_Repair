import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle2, Clock, TrendingUp, Home, LogOut, Sparkles } from 'lucide-react';
import { supabase, type Repair, type RepairInput, type RepairStatus } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import RepairCard from '@/components/RepairCard';
import RepairForm from '@/components/RepairForm';
import PremiumPanel from '@/components/PremiumPanel';

type StatusFilter = 'all' | RepairStatus;
type SortBy = 'created' | 'priority' | 'due' | 'cost';

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

export default function App() {
  const { signOut } = useAuth();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Repair | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');
  const [showPremium, setShowPremium] = useState(false);

  const loadRepairs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('repairs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setRepairs((data ?? []) as Repair[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const handleSave = async (input: RepairInput, id?: string) => {
    const completed_at = input.status === 'done' ? new Date().toISOString() : null;
    const payload = { ...input, completed_at };
    if (id) {
      const { error } = await supabase.from('repairs').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('repairs').insert(payload);
      if (error) throw error;
    }
    await loadRepairs();
  };

  const handleDelete = async (repair: Repair) => {
    if (!confirm(`Delete "${repair.title}"? This can't be undone.`)) return;
    const { error } = await supabase.from('repairs').delete().eq('id', repair.id);
    if (error) {
      setError(error.message);
      return;
    }
    setRepairs(repairs.filter((r) => r.id !== repair.id));
  };

  const handleStatusChange = async (repair: Repair, status: RepairStatus) => {
    const payload: Partial<Repair> = {
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    };
    setRepairs(repairs.map((r) => (r.id === repair.id ? { ...r, ...payload } as Repair : r)));
    const { error } = await supabase.from('repairs').update(payload).eq('id', repair.id);
    if (error) {
      setError(error.message);
      await loadRepairs();
    }
  };

  const filtered = useMemo(() => {
    let list = repairs;
    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.room.toLowerCase().includes(q) ||
          r.contractor.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'priority':
        sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
      case 'due':
        sorted.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return a.due_date.localeCompare(b.due_date);
        });
        break;
      case 'cost':
        sorted.sort((a, b) => b.cost - a.cost);
        break;
      default:
        sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return sorted;
  }, [repairs, statusFilter, search, sortBy]);

  const stats = useMemo(() => {
    const total = repairs.length;
    const done = repairs.filter((r) => r.status === 'done').length;
    const inProgress = repairs.filter((r) => r.status === 'in_progress').length;
    const todo = repairs.filter((r) => r.status === 'todo').length;
    const totalCost = repairs.reduce((sum, r) => sum + (r.cost || 0), 0);
    const spentCost = repairs
      .filter((r) => r.status === 'done')
      .reduce((sum, r) => sum + (r.cost || 0), 0);
    const overdue = repairs.filter(
      (r) =>
        r.due_date &&
        r.status !== 'done' &&
        new Date(r.due_date) < new Date(new Date().toDateString()),
    ).length;
    return { total, done, inProgress, todo, totalCost, spentCost, overdue };
  }, [repairs]);

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (repair: Repair) => {
    setEditing(repair);
    setShowForm(true);
  };

  const statCards = [
    {
      label: 'Total Repairs',
      value: stats.total,
      icon: <Home size={18} />,
      accent: 'text-stone-700 bg-stone-100',
    },
    {
      label: 'To Do',
      value: stats.todo,
      icon: <Wrench size={18} />,
      accent: 'text-sky-700 bg-sky-100',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: <Clock size={18} />,
      accent: 'text-amber-700 bg-amber-100',
    },
    {
      label: 'Completed',
      value: stats.done,
      icon: <CheckCircle2 size={18} />,
      accent: 'text-emerald-700 bg-emerald-100',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: <AlertTriangle size={18} />,
      accent: 'text-red-700 bg-red-100',
    },
    {
      label: 'Total Cost',
      value: `$${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      icon: <TrendingUp size={18} />,
      accent: 'text-stone-700 bg-stone-100',
    },
  ];

  const taglines = [
    'Keep your older home in order',
    'Every fix, tracked with love',
    'Hammer it out, one repair at a time',
    'Your home deserves a to-do list too',
    'Old house, new habits',
  ];
  const [taglineIdx, setTaglineIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTaglineIdx((i) => (i + 1) % taglines.length), 4000);
    return () => clearInterval(id);
  }, [taglines.length]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-100">
      {/* Animated background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#fafaf9_0%,#fef3c7_25%,#fed7aa_50%,#fdba74_75%,#fafaf9_100%)] bg-[length:200%_200%] opacity-60" style={{ animation: 'banner-gradient 20s ease infinite' }} />
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" style={{ animation: 'blob-drift 25s ease-in-out infinite' }} />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" style={{ animation: 'blob-drift 30s ease-in-out infinite reverse' }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl" style={{ animation: 'blob-drift 28s ease-in-out infinite' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(125,211,252,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 overflow-hidden border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
        <div className="relative mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,#fef3c7,#fed7aa,#fbcfe8,#bae6fd,#bbf7d0)] bg-[length:300%_300%] opacity-30" style={{ animation: 'banner-gradient 12s ease infinite' }} />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm" style={{ animation: 'wiggle 3s ease-in-out infinite' }}>
                <Home size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight text-stone-900">Home Repair Tracker</h1>
                <p className="text-xs text-stone-500 transition-opacity duration-500">{taglines[taglineIdx]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPremium(true)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:bg-amber-100 active:scale-95"
              >
                <Sparkles size={17} />
                <span className="hidden sm:inline">Pro Help</span>
              </button>
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-95"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Repair</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
                title="Sign out"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm"
            >
              <div className={`mb-2 inline-flex rounded-lg p-1.5 ${s.accent}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-stone-900">{s.value}</p>
              <p className="text-xs font-medium text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repairs…"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 shadow-sm transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition focus:border-stone-900 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm transition focus:border-stone-900 focus:outline-none"
            >
              <option value="priority">Sort: Priority</option>
              <option value="due">Sort: Due Date</option>
              <option value="cost">Sort: Cost</option>
              <option value="created">Sort: Newest</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/50 py-20 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <Wrench size={28} />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-stone-800">
              {repairs.length === 0 ? 'No repairs yet' : 'No matches found'}
            </h3>
            <p className="mb-5 max-w-xs text-sm text-stone-500">
              {repairs.length === 0
                ? 'Track every repair, project, and fix in your home — add your first one to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
            {repairs.length === 0 && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
              >
                <Plus size={18} /> Add Your First Repair
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((repair) => (
              <RepairCard
                key={repair.id}
                repair={repair}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <RepairForm
          repair={editing}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {showPremium && <PremiumPanel onClose={() => setShowPremium(false)} />}
    </div>
  );
}
