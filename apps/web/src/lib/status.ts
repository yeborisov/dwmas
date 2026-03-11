export type WorkflowStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'success'
  | 'failure'
  | 'cancelled'
  | 'skipped'
  | 'neutral'
  | 'timed_out'
  | 'action_required';

export const statusLabelMap: Record<string, string> = {
  queued: 'Queued',
  in_progress: 'In Progress',
  completed: 'Completed',
  success: 'Success',
  failure: 'Failure',
  active: 'Active',
  inactive: 'Inactive',
  developer: 'Developer',
  devops: 'DevOps',
  admin: 'Admin',
  cancelled: 'Cancelled',
  skipped: 'Skipped',
  neutral: 'Neutral',
  timed_out: 'Timed Out',
  action_required: 'Action Required'
};

export const statusClassMap: Record<string, string> = {
  queued: 'border-slate-500/50 bg-slate-500/15 text-slate-200',
  in_progress: 'border-blue-500/55 bg-blue-500/15 text-blue-200',
  completed: 'border-indigo-500/55 bg-indigo-500/15 text-indigo-200',
  success: 'border-emerald-500/55 bg-emerald-500/15 text-emerald-200',
  failure: 'border-rose-500/55 bg-rose-500/15 text-rose-200',
  active: 'border-emerald-500/55 bg-emerald-500/15 text-emerald-200',
  inactive: 'border-zinc-500/55 bg-zinc-500/15 text-zinc-200',
  developer: 'border-sky-500/55 bg-sky-500/15 text-sky-200',
  devops: 'border-indigo-500/55 bg-indigo-500/15 text-indigo-200',
  admin: 'border-amber-500/55 bg-amber-500/15 text-amber-200',
  cancelled: 'border-orange-500/55 bg-orange-500/15 text-orange-200',
  skipped: 'border-amber-500/55 bg-amber-500/15 text-amber-200',
  neutral: 'border-zinc-500/55 bg-zinc-500/15 text-zinc-200',
  timed_out: 'border-fuchsia-500/55 bg-fuchsia-500/15 text-fuchsia-200',
  action_required: 'border-cyan-500/55 bg-cyan-500/15 text-cyan-200',
  syncing: 'border-cyan-500/55 bg-cyan-500/15 text-cyan-200',
  idle: 'border-zinc-500/55 bg-zinc-500/15 text-zinc-200',
  error: 'border-rose-500/55 bg-rose-500/15 text-rose-200'
};

export function toStatusLabel(status?: string | null) {
  if (!status) return 'Unknown';
  return statusLabelMap[status] ?? status.split('_').join(' ');
}

export function toStatusClass(status?: string | null) {
  if (!status) return statusClassMap.neutral;
  return statusClassMap[status] ?? statusClassMap.neutral;
}
