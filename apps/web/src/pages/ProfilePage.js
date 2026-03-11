import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
export function ProfilePage() {
    const { data } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get('/me')).data });
    const me = data?.data;
    if (!me) {
        return _jsx(EmptyState, { title: "Profile unavailable", description: "Could not load authenticated account metadata.", icon: "\uD83D\uDC64" });
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Profile", description: "Authenticated user information and access role." }), _jsxs(SectionCard, { title: "Account details", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4 pb-4", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full border border-[hsl(var(--border-strong))] bg-[hsl(var(--bg-elevated))] text-lg font-semibold", children: (me.username || 'U').slice(0, 1).toUpperCase() }), _jsxs("div", { children: [_jsx("p", { className: "text-base font-semibold text-[hsl(var(--text-primary))]", children: me.username || '-' }), _jsx("p", { className: "text-sm text-[hsl(var(--text-secondary))]", children: "GitHub account" })] }), _jsx(StatusBadge, { status: me.role?.toLowerCase() || 'neutral', className: "ml-auto" })] }), _jsxs("div", { className: "grid gap-3 text-sm sm:grid-cols-2", children: [_jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["Username: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: me.username || '-' })] }), _jsxs("p", { className: "surface-muted rounded-lg p-3", children: ["GitHub ID: ", _jsx("span", { className: "text-[hsl(var(--text-primary))]", children: me.githubId || '-' })] })] }), _jsx("p", { className: "mt-3 text-xs text-[hsl(var(--text-muted))]", children: "Access summary: Developer \u2192 assigned/owned repositories only. DevOps \u2192 all repositories + sync/export. Admin \u2192 all platform operations + user management." })] })] }));
}
