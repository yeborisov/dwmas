import { jsx as _jsx } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
export function Tabs({ items, className }) {
    return (_jsx("nav", { className: cn('surface-elevated inline-flex w-fit items-center gap-1 rounded-lg p-1', className), "aria-label": "Section navigation", children: items.map((item) => (_jsx(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => cn('tab-trigger', isActive && 'tab-trigger-active'), children: item.label }, item.to))) }));
}
