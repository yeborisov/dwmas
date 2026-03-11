import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const toneClassMap = {
    default: 'border-[hsl(var(--border))]',
    success: 'border-emerald-500/40',
    danger: 'border-rose-500/40',
    warning: 'border-amber-500/40',
    info: 'border-sky-500/40'
};
export function StatCard({ label, value, hint, tone = 'default' }) {
    return (_jsxs("article", { className: `surface p-4 ${toneClassMap[tone]}`, children: [_jsx("p", { className: "kpi-label", children: label }), _jsx("p", { className: "kpi-value mt-2", children: value }), hint ? _jsx("p", { className: "mt-1 text-xs text-[hsl(var(--text-secondary))]", children: hint }) : null] }));
}
