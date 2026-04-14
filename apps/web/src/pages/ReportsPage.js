/* global window */
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
/* ── Grafana-style preset templates ── */
const PRESETS = [
    {
        name: 'Failed runs — Last 30 days',
        description: 'All workflow runs with failure conclusion in the past month.',
        type: 'OPERATIONS',
        icon: '🔴',
        config: { dateRangePreset: '30d', status: 'completed', conclusion: 'failure', exportFormat: 'csv' }
    },
    {
        name: 'Repository health overview',
        description: 'Summary of all completed runs across repositories — 90 day window.',
        type: 'HEALTH',
        icon: '💚',
        config: { dateRangePreset: '90d', status: 'completed', exportFormat: 'csv' }
    },
    {
        name: 'Main branch deployments',
        description: 'Runs triggered on the main branch only — useful for deployment tracking.',
        type: 'DEPLOYMENT',
        icon: '🚀',
        config: { dateRangePreset: '30d', branch: 'main', exportFormat: 'csv' }
    },
    {
        name: 'Recent activity — 7 days',
        description: 'All workflow activity in the last week for quick status review.',
        type: 'ACTIVITY',
        icon: '📊',
        config: { dateRangePreset: '7d', exportFormat: 'csv' }
    }
];
export function ReportsPage() {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('OPERATIONS');
    const [dateRangePreset, setDateRangePreset] = useState('30d');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [status, setStatus] = useState('completed');
    const [conclusion, setConclusion] = useState('failure');
    const [branch, setBranch] = useState('');
    const [actor, setActor] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [createError, setCreateError] = useState(null);
    const templatesQuery = useQuery({ queryKey: ['report-templates'], queryFn: async () => (await api.get('/reports/templates')).data });
    const templates = templatesQuery.data?.data ?? [];
    const createTemplateMutation = useMutation({
        mutationFn: async (payload) => api.post('/reports/templates', payload),
        onSuccess: () => {
            templatesQuery.refetch();
            setShowCreateForm(false);
            setName('');
            setDescription('');
            setCreateError(null);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || 'Unable to create report template.';
            setCreateError(message);
        }
    });
    const applyTemplateMutation = useMutation({
        mutationFn: async (templateId) => (await api.post(`/reports/templates/${templateId}/apply`)).data
    });
    const deleteTemplateMutation = useMutation({
        mutationFn: async (templateId) => api.delete(`/reports/templates/${templateId}`),
        onSuccess: () => {
            templatesQuery.refetch();
            if (selectedTemplateId)
                setSelectedTemplateId('');
        }
    });
    const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId), [templates, selectedTemplateId]);
    const appliedResult = applyTemplateMutation.data?.data;
    function handleCreateFromPreset(preset) {
        setCreateError(null);
        createTemplateMutation.mutate({
            name: preset.name,
            description: preset.description,
            type: preset.type,
            configJson: preset.config
        });
    }
    function handleCreateCustom() {
        setCreateError(null);
        createTemplateMutation.mutate({
            name,
            description,
            type,
            configJson: {
                dateRangePreset,
                from: dateRangePreset === 'custom' && customFrom ? customFrom : undefined,
                to: dateRangePreset === 'custom' && customTo ? customTo : undefined,
                status: status || undefined,
                conclusion: conclusion || undefined,
                branch: branch || undefined,
                actor: actor || undefined,
                exportFormat: 'csv'
            }
        });
    }
    function handleApply(templateId) {
        setSelectedTemplateId(templateId);
        applyTemplateMutation.mutate(templateId);
    }
    const successRate = appliedResult && appliedResult.summary.totalRuns > 0
        ? ((appliedResult.summary.successfulRuns / appliedResult.summary.totalRuns) * 100).toFixed(1)
        : null;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Reports", description: "Create dashboard-style report templates inspired by Grafana. Apply filters, view metrics, and export data.", tabs: _jsx(Tabs, { items: [{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports', end: true }] }), actions: _jsx("button", { className: "btn btn-primary", onClick: () => setShowCreateForm(!showCreateForm), children: showCreateForm ? 'Cancel' : '+ New template' }) }), _jsxs(SectionCard, { title: "Quick-start presets", description: "Click a preset panel to instantly create a report template. Like adding a Grafana dashboard panel.", children: [_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: PRESETS.map((preset) => (_jsxs("button", { className: "surface-muted flex flex-col gap-2 rounded-lg border border-[hsl(var(--border))] p-4 text-left transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--surface-elevated))]", onClick: () => handleCreateFromPreset(preset), disabled: createTemplateMutation.isPending, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: preset.icon }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-[hsl(var(--text-muted))]", children: preset.type })] }), _jsx("p", { className: "text-sm font-semibold text-[hsl(var(--text-primary))]", children: preset.name }), _jsx("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: preset.description }), _jsx("span", { className: "mt-auto text-[10px] font-medium text-[hsl(var(--accent))]", children: "Click to create \u2192" })] }, preset.name))) }), createError ? (_jsx("p", { className: "mt-3 text-xs text-rose-200", children: createError })) : null] }), showCreateForm ? (_jsxs(SectionCard, { title: "Custom template builder", description: "Define your own filter configuration \u2014 similar to editing a Grafana panel query.", children: [_jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx(FormField, { label: "Template name", children: _jsx("input", { className: "field", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Nightly build failures" }) }), _jsx(FormField, { label: "Template type", children: _jsxs("select", { className: "field", value: type, onChange: (e) => setType(e.target.value), children: [_jsx("option", { value: "OPERATIONS", children: "Operations" }), _jsx("option", { value: "HEALTH", children: "Health" }), _jsx("option", { value: "DEPLOYMENT", children: "Deployment" }), _jsx("option", { value: "ACTIVITY", children: "Activity" }), _jsx("option", { value: "CUSTOM", children: "Custom" })] }) }), _jsx(FormField, { label: "Description", className: "md:col-span-2", children: _jsx("textarea", { className: "field textarea-field", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "What does this report show?" }) }), _jsx(FormField, { label: "Date range", children: _jsxs("select", { className: "field", value: dateRangePreset, onChange: (e) => setDateRangePreset(e.target.value), children: [_jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "30d", children: "Last 30 days" }), _jsx("option", { value: "90d", children: "Last 90 days" }), _jsx("option", { value: "custom", children: "Custom" })] }) }), dateRangePreset === 'custom' ? (_jsxs(_Fragment, { children: [_jsx(FormField, { label: "From", children: _jsx("input", { className: "field", type: "date", value: customFrom, onChange: (e) => setCustomFrom(e.target.value) }) }), _jsx(FormField, { label: "To", children: _jsx("input", { className: "field", type: "date", value: customTo, onChange: (e) => setCustomTo(e.target.value) }) })] })) : null, _jsx(FormField, { label: "Status filter", children: _jsxs("select", { className: "field", value: status, onChange: (e) => setStatus(e.target.value), children: [_jsx("option", { value: "", children: "Any" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "in_progress", children: "In progress" }), _jsx("option", { value: "queued", children: "Queued" })] }) }), _jsx(FormField, { label: "Conclusion filter", children: _jsxs("select", { className: "field", value: conclusion, onChange: (e) => setConclusion(e.target.value), children: [_jsx("option", { value: "", children: "Any" }), _jsx("option", { value: "success", children: "Success" }), _jsx("option", { value: "failure", children: "Failure" }), _jsx("option", { value: "cancelled", children: "Cancelled" }), _jsx("option", { value: "timed_out", children: "Timed out" }), _jsx("option", { value: "skipped", children: "Skipped" })] }) }), _jsx(FormField, { label: "Branch filter", children: _jsx("input", { className: "field", value: branch, onChange: (e) => setBranch(e.target.value), placeholder: "e.g. main, develop" }) }), _jsx(FormField, { label: "Actor filter", children: _jsx("input", { className: "field", value: actor, onChange: (e) => setActor(e.target.value), placeholder: "GitHub username" }) })] }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { className: "btn btn-primary", onClick: handleCreateCustom, disabled: !name || createTemplateMutation.isPending, children: createTemplateMutation.isPending ? 'Saving…' : 'Save template' }) }), createError ? (_jsx("p", { className: "mt-2 text-xs text-rose-200", children: createError })) : null] })) : null, _jsx(SectionCard, { title: "Saved templates", description: "Your report dashboard panels. Click Apply to generate the report view, or Export to download.", actions: _jsxs("span", { className: "text-xs text-[hsl(var(--text-muted))]", children: [templates.length, " template", templates.length !== 1 ? 's' : ''] }), children: !templates.length ? (_jsx(EmptyState, { title: "No templates yet", description: "Use a quick-start preset above or create a custom template to get started.", icon: "\uD83D\uDCC4" })) : (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: templates.map((template) => {
                        const isActive = selectedTemplateId === template.id;
                        const config = template.configJson;
                        return (_jsxs("div", { className: `surface-muted flex flex-col gap-2 rounded-lg border p-4 transition ${isActive ? 'border-[hsl(var(--accent))] ring-1 ring-[hsl(var(--accent))]' : 'border-[hsl(var(--border))]'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(StatusBadge, { status: template.type.toLowerCase(), children: template.type }), config.dateRangePreset ? (_jsx("span", { className: "rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--text-muted))]", children: config.dateRangePreset })) : null] }), _jsx("p", { className: "text-sm font-semibold text-[hsl(var(--text-primary))]", children: template.name }), template.description ? _jsx("p", { className: "text-xs text-[hsl(var(--text-muted))]", children: template.description }) : null, _jsxs("div", { className: "mt-1 flex flex-wrap gap-1", children: [config.status ? _jsxs("span", { className: "rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]", children: ["status: ", config.status] }) : null, config.conclusion ? _jsxs("span", { className: "rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]", children: ["conclusion: ", config.conclusion] }) : null, config.branch ? _jsxs("span", { className: "rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]", children: ["branch: ", config.branch] }) : null, config.actor ? _jsxs("span", { className: "rounded bg-[hsl(var(--bg))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-muted))]", children: ["actor: ", config.actor] }) : null] }), _jsxs("div", { className: "mt-auto flex gap-2 pt-2", children: [_jsx("button", { className: "btn btn-primary flex-1 text-xs", onClick: () => handleApply(template.id), disabled: applyTemplateMutation.isPending && selectedTemplateId === template.id, children: applyTemplateMutation.isPending && selectedTemplateId === template.id ? 'Loading…' : '▶ Apply' }), _jsx("a", { className: "btn btn-secondary flex-1 text-center text-xs", href: `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/reports/templates/${template.id}/export.csv`, children: "\u2B07 CSV" }), _jsx("button", { className: "btn btn-danger flex-1 text-xs", onClick: () => {
                                                if (window.confirm(`Delete template "${template.name}"?`)) {
                                                    deleteTemplateMutation.mutate(template.id);
                                                }
                                            }, disabled: deleteTemplateMutation.isPending, children: deleteTemplateMutation.isPending ? 'Deleting…' : 'Delete' })] })] }, template.id));
                    }) })) }), selectedTemplate && appliedResult ? (_jsxs(_Fragment, { children: [_jsx(SectionCard, { title: `Report: ${selectedTemplate.name}`, description: "Generated output \u2014 metric panels and data rows.", children: _jsxs(MetricGrid, { children: [_jsx(StatCard, { label: "Total runs", value: String(appliedResult.summary.totalRuns), tone: "default", hint: "Matching runs" }), _jsx(StatCard, { label: "Successful", value: String(appliedResult.summary.successfulRuns), tone: "success", hint: successRate ? `${successRate}% rate` : undefined }), _jsx(StatCard, { label: "Failed", value: String(appliedResult.summary.failedRuns), tone: "danger", hint: "Require attention" })] }) }), _jsx(SectionCard, { title: "Run details", description: `Showing up to 50 matching runs for "${selectedTemplate.name}".`, children: !appliedResult.rows.length ? (_jsx(EmptyState, { title: "No matching runs", description: "Adjust the template filters or sync repositories to populate this report.", icon: "\uD83D\uDDC2" })) : (_jsx(DataTable, { columns: ['Workflow', 'Repository', 'Status', 'Conclusion', 'Branch', 'Actor', 'Started'], children: appliedResult.rows.slice(0, 50).map((row) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: row.workflowName }), _jsx(DataTableCell, { mono: true, children: row.repository.fullName }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: row.status, children: row.status }) }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: row.conclusion || 'queued', children: row.conclusion || '—' }) }), _jsx(DataTableCell, { mono: true, children: row.branch || '—' }), _jsx(DataTableCell, { children: row.actor || '—' }), _jsx(DataTableCell, { children: row.startedAt ? new Date(row.startedAt).toLocaleString() : '—' })] }, row.id))) })) })] })) : null] }));
}
