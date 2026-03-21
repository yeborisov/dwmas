/// <reference types="cypress" />

// Custom command to login by setting auth cookie directly via API
Cypress.Commands.add('loginAsAdmin', () => {
  // Intercept /api/me and return admin user mock
  cy.intercept('GET', '**/api/me', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id: 'test-admin-id',
        githubId: '47869881',
        username: 'yeborisov',
        displayName: 'Yordan Borisov',
        email: 'iordan.borisov@gmail.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/47869881?v=4',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-03-11T10:34:54.052Z',
        updatedAt: '2026-03-12T19:27:13.179Z'
      }
    }
  }).as('getMe');
});

Cypress.Commands.add('loginAsDeveloper', () => {
  cy.intercept('GET', '**/api/me', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id: 'test-dev-id',
        githubId: '12345',
        username: 'devuser',
        displayName: 'Dev User',
        email: 'dev@example.com',
        avatarUrl: '',
        role: 'DEVELOPER',
        isActive: true,
        createdAt: '2026-03-11T10:34:54.052Z',
        updatedAt: '2026-03-12T19:27:13.179Z'
      }
    }
  }).as('getMe');
});

Cypress.Commands.add('mockRepositories', () => {
  cy.intercept('GET', '**/api/repositories', {
    statusCode: 200,
    body: {
      success: true,
      data: [
        {
          id: 'repo-1',
          fullName: 'yeborisov/dwmas',
          owner: 'yeborisov',
          name: 'dwmas',
          defaultBranch: 'main',
          isActive: true,
          createdAt: '2026-03-11T10:34:54.052Z',
          _count: { workflows: 3, issues: 5 }
        },
        {
          id: 'repo-2',
          fullName: 'yeborisov/test-repo',
          owner: 'yeborisov',
          name: 'test-repo',
          defaultBranch: 'main',
          isActive: true,
          createdAt: '2026-03-10T10:34:54.052Z',
          _count: { workflows: 1, issues: 2 }
        }
      ]
    }
  }).as('getRepositories');
});

Cypress.Commands.add('mockUsers', () => {
  cy.intercept('GET', '**/api/users', {
    statusCode: 200,
    body: {
      success: true,
      data: [
        {
          id: 'test-admin-id',
          githubId: '47869881',
          username: 'yeborisov',
          displayName: 'Yordan Borisov',
          email: 'iordan.borisov@gmail.com',
          role: 'ADMIN',
          isActive: true,
          assignments: []
        },
        {
          id: 'test-dev-id',
          githubId: '12345',
          username: 'devuser',
          displayName: 'Dev User',
          email: 'dev@example.com',
          role: 'DEVELOPER',
          isActive: true,
          assignments: [{ repository: { id: 'repo-1', fullName: 'yeborisov/dwmas' } }]
        }
      ]
    }
  }).as('getUsers');
});

Cypress.Commands.add('mockAnalytics', () => {
  cy.intercept('GET', '**/api/analytics*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        totalWorkflows: 4,
        totalRuns: 120,
        successRate: 85.5,
        avgDuration: 142
      }
    }
  }).as('getAnalytics');
});

Cypress.Commands.add('mockWorkflows', () => {
  cy.intercept('GET', '**/api/workflows*', {
    statusCode: 200,
    body: {
      success: true,
      data: []
    }
  }).as('getWorkflows');
});

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
      loginAsDeveloper(): Chainable<void>;
      mockRepositories(): Chainable<void>;
      mockUsers(): Chainable<void>;
      mockAnalytics(): Chainable<void>;
      mockWorkflows(): Chainable<void>;
    }
  }
}

export {};