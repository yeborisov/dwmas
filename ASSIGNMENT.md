# Assignment

## Course

Full stack Application Development with Node.js + Express.js + React.js - 2026

## Project author

- **Name:** Yordan B.
- **FN:** 9MI3400735

## Project name

**DevOps Workflow Monitoring & Analytics System (DWMAS)**

## 1. Short project description (Business needs and system features)

Modern teams need centralized visibility over CI/CD operations across many repositories. GitHub’s default views are repository-local and do not provide a unified cross-repository operational picture.

DWMAS solves this with a full-stack platform that aggregates GitHub Actions workflow execution data, enforces role-based access, streams active run updates in real time, and provides historical analytics and exports.

### Business needs addressed

- Centralized cross-repository workflow monitoring
- Faster incident detection for failed/long-running pipelines
- Unified analytics for engineering performance and reliability
- Controlled access to private data through internal RBAC

### Main system features

- GitHub OAuth-only authentication
- Automatic local profile creation on first login
- Repository onboarding and workflow/job synchronization via Octokit
- Workflow filtering and details pages
- Realtime updates via SSE and Socket.IO
- Analytics dashboard with chart visualizations
- Local repository-scoped issues and comments
- CSV/JSON export endpoints
- Admin user management and role assignment
