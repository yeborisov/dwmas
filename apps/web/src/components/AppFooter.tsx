const currentYear = new Date().getFullYear();

export function AppFooter() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-elevated))]">
      <div className="content-wrap flex flex-col gap-2 py-4 text-xs text-[hsl(var(--text-muted))] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded bg-cyan-500/15 px-1.5 text-[10px] font-bold tracking-wider text-cyan-300">
            DWMAS
          </span>
          <span className="hidden sm:inline">·</span>
          <span>DevOps Workflow Monitoring &amp; Analytics System</span>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <p>
            This is an automatically generated system. If you have questions please contact{' '}
            <a href="mailto:iordan.borisov@gmail.com" className="font-medium text-[hsl(var(--accent))] hover:underline">
              iordan.borisov@gmail.com
            </a>
          </p>
          <p className="text-[hsl(var(--text-muted))]">© {currentYear} DWMAS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}