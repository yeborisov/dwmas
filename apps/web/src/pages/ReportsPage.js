import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function ReportsPage() {
    const [name, setName] = useState('Failed runs last 30 days');
    const [description, setDescription] = useState('Operational failures in last month grouped by repository.');
    const [type, setType] = useState('OPERATIONS');
    const [dateRangePreset, setDateRangePreset] = useState('30d');
    const [status, setStatus] = useState('completed');
    const [conclusion, setConclusion] = useState('failure');
    const [branch, setBranch] = useState('');
    const [actor, setActor] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const templatesQuery = useQuery({ queryKey: ['report-templates'], queryFn: async () => (await api.get('/reports/templates')).data });
    const templates = templatesQuery.data?.data ?? [];
    const createTemplateMutation = useMutation({
        mutationFn: async () => api.post('/reports/templates', {
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
        mutationFn: async (templateId) => (await api.post(`/reports/templates/${templateId}/apply`)).data
    });
    const selectedTemplate = useMemo(() => templates.find((t) => t.id === selectedTemplateId), [templates, selectedTemplateId]);
    const appliedResult = applyTemplateMutation.data?.data;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Reports", description: "Create reusable report templates, apply them to workflow data, and export results.", tabs: _jsx(Tabs, { items: [{ to: '/repositories', label: 'Repositories' }, { to: '/analytics', label: 'Analytics' }, { to: '/reports', label: 'Reports', end: true }] }) }), _jsx(SectionCard, { title: "What is a report template?", description: "A saved filter configuration for analytics and export workflows.", children: _jsx("p", { className: "text-sm text-slate-200", children: "A template stores your selected date range, status/conclusion filters, branch/actor scope and export preference. You can apply it anytime to generate a consistent report view." }) }), _jsxs(SectionCard, { title: "Create template", description: "Define filters once and reuse them for reporting/export.", children: [_jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [_jsx(FormField, { label: "Template name", children: _jsx("input", { className: "field", value: name, onChange: (e) => setName(e.target.value), placeholder: "Template name" }) }), _jsx(FormField, { label: "Template type", children: _jsx("input", { className: "field", value: type, onChange: (e) => setType(e.target.value), placeholder: "Template type (e.g. OPERATIONS)" }) }), _jsx(FormField, { label: "Description", className: "md:col-span-2", children: _jsx("textarea", { className: "field textarea-field", value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Description" }) }), _jsx(FormField, { label: "Date range", children: _jsxs("select", { className: "field", value: dateRangePreset, onChange: (e) => setDateRangePreset(e.target.value), children: [_jsx("option", { value: "7d", children: "Last 7 days" }), _jsx("option", { value: "30d", children: "Last 30 days" }), _jsx("option", { value: "90d", children: "Last 90 days" }), _jsx("option", { value: "custom", children: "Custom" })] }) }), _jsx(FormField, { label: "Status filter", children: _jsx("input", { className: "field", value: status, onChange: (e) => setStatus(e.target.value), placeholder: "Status filter" }) }), _jsx(FormField, { label: "Conclusion filter", children: _jsx("input", { className: "field", value: conclusion, onChange: (e) => setConclusion(e.target.value), placeholder: "Conclusion filter" }) }), _jsx(FormField, { label: "Branch filter", children: _jsx("input", { className: "field", value: branch, onChange: (e) => setBranch(e.target.value), placeholder: "Branch filter" }) }), _jsx(FormField, { label: "Actor filter", children: _jsx("input", { className: "field", value: actor, onChange: (e) => setActor(e.target.value), placeholder: "Actor filter" }) })] }), _jsx("button", { className: "btn btn-primary mt-3", onClick: () => createTemplateMutation.mutate(), children: createTemplateMutation.isPending ? 'Saving template...' : 'Save template' })] }), _jsx(SectionCard, { title: "Saved templates", description: "Apply, inspect, and export template outputs.", children: !templates.length ? (_jsx(EmptyState, { title: "No templates yet", description: "Create your first template to enable reusable reporting flows.", icon: "\uD83D\uDCC4" })) : (_jsx(DataTable, { columns: ['Template', 'Type', 'Description', 'Actions'], children: templates.map((template) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { className: "font-medium text-[hsl(var(--text-primary))]", children: template.name }), _jsx(DataTableCell, { children: _jsx(StatusBadge, { status: template.type.toLowerCase(), children: template.type }) }), _jsx(DataTableCell, { children: template.description || '-' }), _jsx(DataTableCell, { children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "btn", onClick: () => {
                                                setSelectedTemplateId(template.id);
                                                applyTemplateMutation.mutate(template.id);
                                            }, children: "Apply" }), _jsx("a", { className: "btn btn-secondary", href: `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/reports/templates/${template.id}/export.csv`, children: "Export CSV" })] }) })] }, template.id))) })) }), selectedTemplate && appliedResult ? (_jsxs(SectionCard, { title: `Applied: ${selectedTemplate.name}`, description: "Generated output from selected template configuration.", children: [_jsxs("p", { className: "text-sm text-slate-200", children: ["Runs: ", appliedResult.summary.totalRuns, " \u2022 Success: ", appliedResult.summary.successfulRuns, " \u2022 Failed:", ' ', appliedResult.summary.failedRuns] }), !appliedResult.rows.length ? (_jsx(EmptyState, { title: "No runs for this template", description: "Adjust filters or sync repositories to populate this report.", icon: "\uD83D\uDDC2" })) : (_jsx(DataTable, { columns: ['Workflow', 'Repository', 'Status', 'Conclusion', 'Branch', 'Actor', 'Started'], className: "mt-3", children: appliedResult.rows.slice(0, 15).map((row) => (_jsxs(DataTableRow, { children: [_jsx(DataTableCell, { children: row.workflowName }), _jsx(DataTableCell, { children: row.repository.fullName }), _jsx(DataTableCell, { children: row.status }), _jsx(DataTableCell, { children: row.conclusion || '-' }), _jsx(DataTableCell, { children: row.branch || '-' }), _jsx(DataTableCell, { children: row.actor || '-' }), _jsx(DataTableCell, { children: row.startedAt ? new Date(row.startedAt).toLocaleString() : '-' })] }, row.id))) }))] })) : null, _jsx(SectionCard, { title: "Template examples", description: "Suggested starter templates for demos and local validation.", children: _jsxs("ul", { className: "space-y-2 text-sm text-slate-200", children: [_jsx("li", { children: "\u2022 Failed runs last 30 days" }), _jsx("li", { children: "\u2022 Repository health overview" }), _jsx("li", { children: "\u2022 Main branch deployment failures" }), _jsx("li", { children: "\u2022 Average duration trend by repository" })] }) })] }));
}
