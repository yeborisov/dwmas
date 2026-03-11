import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../lib/cn';
export function Panel({ children, className }) {
    return _jsx("div", { className: cn('surface p-4 md:p-5', className), children: children });
}
