import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RepairStatus = 'todo' | 'in_progress' | 'done';
export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Repair {
  id: string;
  title: string;
  description: string;
  room: string;
  status: RepairStatus;
  priority: RepairPriority;
  category: string;
  cost: number;
  contractor: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type RepairInput = Omit<Repair, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;

export const STATUS_LABELS: Record<RepairStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<RepairPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Structural',
  'Cosmetic',
  'Appliance',
  'Exterior',
  'Other',
] as const;
