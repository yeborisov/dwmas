import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';

export function AboutPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="About DWMAS"
        description="DevOps Workflow Monitoring & Analytics System built for course assignment requirements."
      />

      <SectionCard title="Assignment metadata">
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <p className="surface-muted rounded-lg p-3">Course: Full stack Application Development with Node.js + Express.js + React.js - 2026</p>
          <p className="surface-muted rounded-lg p-3">Author: Yordan B. (FN: 9MI3400735)</p>
        </div>
      </SectionCard>

      <SectionCard title="Short project description" description="Business needs and system features">
        <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
          DWMAS centralizes GitHub Actions workflow monitoring across multiple repositories, enabling teams to quickly
          track pipeline health, failure trends, active runs, and operational bottlenecks. The platform includes
          GitHub OAuth authentication, role-based access control, analytics dashboards, repository onboarding,
          realtime updates, and issue/comment collaboration to support coordinated DevOps and engineering operations.
        </p>
      </SectionCard>
    </section>
  );
}
