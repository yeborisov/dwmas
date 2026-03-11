import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ title, description, action, icon }) {
    return (_jsxs("div", { className: "state-box", children: [_jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border-strong))] bg-[hsl(var(--bg-elevated))] text-sm text-[hsl(var(--text-secondary))]", children: icon ?? '∅' }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-[hsl(var(--text-primary))]", children: title }), _jsx("p", { className: "mt-1 text-sm text-[hsl(var(--text-secondary))]", children: description })] }), action] }));
}
