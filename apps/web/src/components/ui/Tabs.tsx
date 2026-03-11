import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface TabItem {
  to: string;
  label: string;
  end?: boolean;
}

export function Tabs({ items, className }: { items: TabItem[]; className?: string }) {
  return (
    <nav className={cn('surface-elevated inline-flex w-fit items-center gap-1 rounded-lg p-1', className)} aria-label="Section navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn('tab-trigger', isActive && 'tab-trigger-active')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
