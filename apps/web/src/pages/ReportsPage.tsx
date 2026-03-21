import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { api } from '../lib/api';
import { DataTable, DataTableCell, DataTableRow } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import { FormField } from '../components/ui/FormField';
import { Tabs } from '../components/ui/Tabs';
import { StatusBadge } from '../components/ui/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
import { MetricGrid } from '../components/ui/MetricGrid';

interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  configJson: {
    dateRangePreset?: '7d' | '30d' | '90d' | 'custom';
    status?: string;
    conclusion?: string;
    branch?: string;
    actor?: string;
    exportFormat?: 'json' | 'csv';
    repositoryIds?: string[];
  };
}

interface AppliedReportResult {
  summary: {
    totalRuns: number;
    failedRuns: number;
    successfulRuns: number;
  };
  rows: Array<{
    id: string;
    workflowName: string;
    status: string;
    conclusion?: string | null;
    branch?: string | null;
    actor?: string | null;
    repository: { fullName: string };
    startedAt?: string | null;
  }>;
}

/* ── Grafana-style preset templates ── */
const PRESETS = [
  {
    name: 'Failed runs — Last 30 days',
    description: 'All workflow runs with failure conclusion in the past month.',
    type: 'OPERATIONS',
    icon: '🔴',
    config: { dateRangePreset: '30d' as const, status: 'completed', conclusion: 'failure', exportFormat: 'csv' as const }
  },
  {
    name: 'Repository health overview',
    description: 'Summary of all completed runs across repositories — 90 day window.',
    type: 'HEALTH',
    icon: '💚',
    config: { dateRangePreset: '90d' as const, status: 'completed', exportFormat: 'csv' as const }
  },
  {
    name: 'Main branch deployments',
    description: 'Runs triggered on the main branch only — useful for deployment tracking.',
    type: 'DEPLOYMENT',
    icon: '🚀',
    config: { dateRangePreset: '30d' as const, branch: 'main', exportFormat: 'csv' as const }
  },
  {
    name: 'Recent activity — 7 days',
    description: 'All workflow activity in the last week for quick status review.',
    type: 'ACTIVITY',
    icon: '📊',
    config: { dateRangePreset: '7d' as const, exportFormat: 'csv' as const }
  }
];

export function ReportsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('OPERATIONS');
  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [status, setStatus] = useState('completed');
  const [conclusion, setConclusion] = useState('failure');
  const [branch, setBranch] = useState('');
  const [actor, setActor] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const templatesQuery = useQuery({ queryKey: ['report-templates'], queryFn: async () => (await api.get('/reports/templates')).data });
  const templates: ReportTemplate[] = templatesQuery.data?.data ?? [];

  const createTemplateMutation = useMutation({
    mutationFn: async (payload: { name: string; description: string; type: string; configJson: Record<string, unknown> }) =>
      api.post('/reports/templates', payload),
    onSuccess: () => {
      templatesQuery.refetch();
      setShowCreateForm(false);
      setName('');
      setDescription('');
    }
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => (await api.post(`/reports/templates/${templateId}/apply`)).data
  });

  const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId), [templates, selectedTemplateId]);
  const appliedResult: AppliedReportResult | undefined = applyTemplateMutation.data?.data;

  function handleCreateFromPreset(preset: typeof PRESETS[number]) {
    createTemplateMutation.mutate({
      name: preset.name,
      description: preset.description,
      type: preset.type,
      configJson: preset.config
    });
  }

  function handleCreateCustom() {
    createTemplateMutation.mutate({
      name,
      description,
      type,
      configJson: {
        dateRangePreset,
        status: status || undefined,
        conclusion: conclusion || undefined,
        branch: branch || undefined,
        actor: actor || undefined,
        exportFormat: 'csv'
      }
    });
  }

  function handleApply(templateId: string) {
    setSelectedTemplateId(templateId);
    applyTemplateMutation.mutate(templateId);
  }

  const successRate = appliedResult && appliedResult.summary.totalRuns > 0
    ? ((appliedResult.summary.successfulRuns / appliedResult.summary.totalRuns) * 100).toFixed(1)
    : null;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reports"
        description="Create dashboard-style report templates inspired by Grafana. Apply filters, view metrics, and export data."
        tabs={<Tabs items={[{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports', end: true }]} />}
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ New template'}
          </button>
        }
      />

      {/* ── Quick-start presets (Grafana panel style) ── */}
      <SectionCard title="Quick-start presets" description="Click a preset panel to instantly create a report template. Like adding a Grafana dashboard panel.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              className="surface-muted flex flex-col gap-2 rounded-lg border border-[hsl(var(--border))] p-4 text-left transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--surface-elevated))]"
              onClick={() => handleCreateFromPreset(preset)}
              disabled={createTemplateMutation.isPending}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{preset.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]">{preset.type}</span>
              </div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{preset.name}</p>
              <p className="text-xs text-[hsl(var(--text-muted))]">{preset.description}</p>
              <span className="mt-auto text-[10px] font-medium text-[hsl(var(--accent))]">Click to create →</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Custom template form ── */}
      {showCreateForm ? (
        <SectionCard title="Custom template builder" description="Define your own filter configuration — similar to editing a Grafana panel query.">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Template name">
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nightly build failures" />
            </FormField>
            <FormField label="Template type">
              <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="OPERATIONS">Operations</option>
                <option value="HEALTH">Health</option>
                <option value="DEPLOYMENT">Deployment</option>
                <option value="ACTIVITY">Activity</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className="field textarea-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this report show?" />
            </FormField>
            <FormField label="Date range">
              <select className="field" value={dateRangePreset} onChange={(e) => setDateRangePreset(e.target.value as typeof dateRangePreset)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom</option>
              </select>
            </FormField>
            <FormField label="Status filter">
              <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Any</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In progress</option>
                <option value="queued">Queued</option>
              </select>
            </FormField>
            <FormField label="Conclusion filter">
              <select className="field" value={conclusion} onChange={(e) => setConclusion(e.target.value)}>
                <option value="">Any</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="cancelled">Cancelled</option>
                <option value="timed_out">Timed out</option>
                <option value="skipped">Skipped</option>
              </select>
            </FormField>
            <FormField label="Branch filter">
              <input className="field" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. main, develop" />
            </FormField>
            <FormField label="Actor filter">
              <input className="field" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="GitHub username" />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn btn-primary" onClick={handleCreateCustom} disabled={!name || createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Saving…' : 'Save template'}
            </button>
          </div>
        </SectionCard>
      ) : null}

      {/* ── Saved templates (dashboard panels) ── */}
      <SectionCard
        title="Saved templates"
        description="Your report dashboard panels. Click Apply to generate the report view, or Export to download."
        actions={<span className="text-xs text-[hsl(var(--text-muted))]">{templates.length} template{templates.length !== 1 ? 's' : ''}</span>}
      >
        {!templates.length ? (
          <EmptyState
            title="No templates yet"
            description="Use a quick-start preset above or create a custom template to get started."
            icon="📄"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const isActive = selectedTemplateId === template.id;
              const config = template.configJson;
              return (
                <div
                  key={template.id}
                  className={`surface-muted flex flex-col gap-2 rounded-lg border p-4 transition ${
                    isActive ? 'border-[hsl(var(--accent))] ring-1 ring-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge status={template.type.toLowerCase()}>{template.type}</StatusBadge>
                    {config.dateRangePreset ? (
                      <span className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--text-muted))]">
                        {config.dateRangePreset}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{template.name}</p>
                  {template.description ? <p className="text-xs text-[hsl(var(--text-muted))]">{template.description}</p> : null}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {config.status ? <span className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]">status: {config.status}</span> : null}
                    {config.conclusion ? <span className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]">conclusion: {config.conclusion}</span> : null}
                    {config.branch ? <span className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]">branch: {config.branch}</span> : null}
                    {config.actor ? <span className="rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]">actor: {config.actor}</span> : null}
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      className="btn btn-primary flex-1 text-xs"
                      onClick={() => handleApply(template.id)}
                      disabled={applyTemplateMutation.isPending && selectedTemplateId === template.id}
                    >
                      {applyTemplateMutation.isPending && selectedTemplateId === template.id ? 'Loading…' : '▶ Apply'}
                    </button>
                    <a
                      className="btn btn-secondary flex-1 text-center text-xs"
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/reports/templates/${template.id}/export.csv`}
                    >
                      ⬇ CSV
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Applied result (Grafana panel output) ── */}
      {selectedTemplate && appliedResult ? (
        <>
          <SectionCard title={`Report: ${selectedTemplate.name}`} description="Generated output — metric panels and data rows.">
            <MetricGrid>
              <StatCard label="Total runs" value={String(appliedResult.summary.totalRuns)} tone="default" hint="Matching runs" />
              <StatCard label="Successful" value={String(appliedResult.summary.successfulRuns)} tone="success" hint={successRate ? `${successRate}% rate` : undefined} />
              <StatCard label="Failed" value={String(appliedResult.summary.failedRuns)} tone="danger" hint="Require attention" />
            </MetricGrid>
          </SectionCard>

          <SectionCard title="Run details" description={`Showing up to 50 matching runs for "${selectedTemplate.name}".`}>
            {!appliedResult.rows.length ? (
              <EmptyState title="No matching runs" description="Adjust the template filters or sync repositories to populate this report." icon="🗂" />
            ) : (
              <DataTable columns={['Workflow', 'Repository', 'Status', 'Conclusion', 'Branch', 'Actor', 'Started']}>
                {appliedResult.rows.slice(0, 50).map((row) => (
                  <DataTableRow key={row.id}>
                    <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">{row.workflowName}</DataTableCell>
                    <DataTableCell mono>{row.repository.fullName}</DataTableCell>
                    <DataTableCell><StatusBadge status={row.status}>{row.status}</StatusBadge></DataTableCell>
                    <DataTableCell><StatusBadge status={row.conclusion || 'queued'}>{row.conclusion || '—'}</StatusBadge></DataTableCell>
                    <DataTableCell mono>{row.branch || '—'}</DataTableCell>
                    <DataTableCell>{row.actor || '—'}</DataTableCell>
                    <DataTableCell>{row.startedAt ? new Date(row.startedAt).toLocaleString() : '—'}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTable>
            )}
          </SectionCard>
        </>
      ) : null}
    </section>
  );
}