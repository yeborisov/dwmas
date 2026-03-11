import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function SectionCard({ title, description, actions, children, className }) {
    return (_jsxs("section", { className: cn('surface p-4 md:p-5', className), children: [title || description || actions ? (_jsxs("header", { className: "mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[hsl(var(--border))] pb-3", children: [_jsxs("div", { children: [title ? _jsx("h2", { className: "text-base font-semibold md:text-lg", children: title }) : null, description ? _jsx("p", { className: "mt-1 text-sm text-[hsl(var(--text-secondary))]", children: description }) : null] }), actions ? _jsx("div", { className: "flex items-center gap-2", children: actions }) : null] })) : null, children] }));
}
