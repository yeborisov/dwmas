import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const toneStyles = {
    default: { border: 'border-[hsl(var(--border))]', accent: 'bg-[hsl(var(--text-muted))]' },
    success: { border: 'border-emerald-500/40', accent: 'bg-emerald-500' },
    danger: { border: 'border-rose-500/40', accent: 'bg-rose-500' },
    warning: { border: 'border-amber-500/40', accent: 'bg-amber-500' },
    info: { border: 'border-sky-500/40', accent: 'bg-sky-500' }
};
export function StatCard({ label, value, hint, tone = 'default' }) {
    const { border, accent } = toneStyles[tone];
    return (_jsxs("article", { className: `surface relative overflow-hidden p-4 ${border}`, children: [_jsx("div", { className: `absolute left-0 right-0 top-0 h-0.5 ${accent} opacity-60` }), _jsx("p", { className: "kpi-label", children: label }), _jsx("p", { className: "kpi-value mt-1.5", children: value }), hint ? _jsx("p", { className: "mt-1 text-xs text-[hsl(var(--text-secondary))]", children: hint }) : null] }));
}
