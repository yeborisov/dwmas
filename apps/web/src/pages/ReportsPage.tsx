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

export function ReportsPage() {
  const [name, setName] = useState('Failed runs last 30 days');
  const [description, setDescription] = useState('Operational failures in last month grouped by repository.');
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
    mutationFn: async () =>
      api.post('/reports/templates', {
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
      }),
    onSuccess: () => templatesQuery.refetch()
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => (await api.post(`/reports/templates/${templateId}/apply`)).data
  });

  const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId), [templates, selectedTemplateId]);
  const appliedResult: AppliedReportResult | undefined = applyTemplateMutation.data?.data;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reports"
        description="Create reusable report templates, apply them to workflow data, and export results."
        tabs={<Tabs items={[{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports', end: true }]} />}
      />

      <SectionCard title="What is a report template?" description="A saved filter configuration for analytics and export workflows.">
        <p className="text-sm text-slate-200">
          A template stores your selected date range, status/conclusion filters, branch/actor scope and export preference.
          You can apply it anytime to generate a consistent report view.
        </p>
      </SectionCard>

      <SectionCard title="Create template" description="Define filters once and reuse them for reporting/export.">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Template name">
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
          </FormField>
          <FormField label="Template type">
            <input className="field" value={type} onChange={(e) => setType(e.target.value)} placeholder="Template type (e.g. OPERATIONS)" />
          </FormField>
          <FormField label="Description" className="md:col-span-2">
            <textarea className="field textarea-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
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
            <input className="field" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status filter" />
          </FormField>
          <FormField label="Conclusion filter">
            <input className="field" value={conclusion} onChange={(e) => setConclusion(e.target.value)} placeholder="Conclusion filter" />
          </FormField>
          <FormField label="Branch filter">
            <input className="field" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch filter" />
          </FormField>
          <FormField label="Actor filter">
            <input className="field" value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Actor filter" />
          </FormField>
        </div>
        <button className="btn btn-primary mt-3" onClick={() => createTemplateMutation.mutate()}>
          {createTemplateMutation.isPending ? 'Saving template...' : 'Save template'}
        </button>
      </SectionCard>

      <SectionCard title="Saved templates" description="Apply, inspect, and export template outputs.">
        {!templates.length ? (
          <EmptyState title="No templates yet" description="Create your first template to enable reusable reporting flows." icon="📄" />
        ) : (
          <DataTable columns={['Template', 'Type', 'Description', 'Actions']}>
            {templates.map((template) => (
              <DataTableRow key={template.id}>
                <DataTableCell className="font-medium text-[hsl(var(--text-primary))]">{template.name}</DataTableCell>
                <DataTableCell><StatusBadge status={template.type.toLowerCase()}>{template.type}</StatusBadge></DataTableCell>
                <DataTableCell>{template.description || '-'}</DataTableCell>
                <DataTableCell>
                  <div className="flex gap-2">
                    <button
                      className="btn"
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        applyTemplateMutation.mutate(template.id);
                      }}
                    >
                      Apply
                    </button>
                    <a className="btn btn-secondary" href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/reports/templates/${template.id}/export.csv`}>
                      Export CSV
                    </a>
                  </div>
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        )}
      </SectionCard>

      {selectedTemplate && appliedResult ? (
        <SectionCard title={`Applied: ${selectedTemplate.name}`} description="Generated output from selected template configuration.">
          <p className="text-sm text-slate-200">
            Runs: {appliedResult.summary.totalRuns} • Success: {appliedResult.summary.successfulRuns} • Failed:{' '}
            {appliedResult.summary.failedRuns}
          </p>
          {!appliedResult.rows.length ? (
            <EmptyState title="No runs for this template" description="Adjust filters or sync repositories to populate this report." icon="🗂" />
          ) : (
            <DataTable columns={['Workflow', 'Repository', 'Status', 'Conclusion', 'Branch', 'Actor', 'Started']} className="mt-3">
              {appliedResult.rows.slice(0, 15).map((row) => (
                <DataTableRow key={row.id}>
                  <DataTableCell>{row.workflowName}</DataTableCell>
                  <DataTableCell>{row.repository.fullName}</DataTableCell>
                  <DataTableCell>{row.status}</DataTableCell>
                  <DataTableCell>{row.conclusion || '-'}</DataTableCell>
                  <DataTableCell>{row.branch || '-'}</DataTableCell>
                  <DataTableCell>{row.actor || '-'}</DataTableCell>
                  <DataTableCell>{row.startedAt ? new Date(row.startedAt).toLocaleString() : '-'}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          )}
        </SectionCard>
      ) : null}

      <SectionCard title="Template examples" description="Suggested starter templates for demos and local validation.">
        <ul className="space-y-2 text-sm text-slate-200">
          <li>• Failed runs last 30 days</li>
          <li>• Repository health overview</li>
          <li>• Main branch deployment failures</li>
          <li>• Average duration trend by repository</li>
        </ul>
      </SectionCard>
    </section>
  );
}
