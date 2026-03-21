describe('Authenticated Pages (Admin)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.mockRepositories();
    cy.mockUsers();
    cy.mockAnalytics();
    cy.mockWorkflows();
  });

  describe('Auth Redirect', () => {
    it('should redirect authenticated user from / to /dashboard', () => {
      cy.visit('/');
      cy.url().should('include', '/dashboard');
    });

    it('should redirect authenticated user from /login to /dashboard', () => {
      cy.visit('/login');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Dashboard Page', () => {
    it('should display the dashboard', () => {
      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });

    it('should show sidebar navigation', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').should('exist');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Workflows').should('be.visible');
      cy.contains('Repositories').should('be.visible');
    });

    it('should show topbar with username and role', () => {
      cy.visit('/dashboard');
      cy.contains('yeborisov').should('be.visible');
      cy.contains('ADMIN').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/dashboard');
      cy.get('footer').should('exist');
      cy.get('footer').contains('iordan.borisov@gmail.com').should('be.visible');
    });
  });

  describe('Sidebar Navigation', () => {
    it('should show admin section with Users link for ADMIN role', () => {
      cy.visit('/dashboard');
      cy.contains('Users').should('be.visible');
    });

    it('should show Operations section', () => {
      cy.visit('/dashboard');
      cy.contains('Operations').should('be.visible');
      cy.contains('Repositories').should('be.visible');
      cy.contains('Analytics').should('be.visible');
      cy.contains('Reports').should('be.visible');
    });

    it('should navigate to Workflows page', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').contains('Workflows').click();
      cy.url().should('include', '/workflows');
    });

    it('should navigate to Repositories page', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').contains('Repositories').click();
      cy.url().should('include', '/repositories');
    });

    it('should navigate to Profile page', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').contains('Profile').click();
      cy.url().should('include', '/profile');
    });
  });

  describe('Repositories Page', () => {
    it('should display repositories list', () => {
      cy.visit('/repositories');
      cy.wait('@getRepositories');
      cy.contains('yeborisov/dwmas').should('be.visible');
      cy.contains('yeborisov/test-repo').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/repositories');
      cy.get('footer').should('exist');
    });
  });

  describe('Analytics Page', () => {
    it('should display analytics page', () => {
      cy.visit('/analytics');
      cy.contains('Analytics').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/analytics');
      cy.get('footer').should('exist');
    });
  });

  describe('Workflows Page', () => {
    it('should display workflows page', () => {
      cy.visit('/workflows');
      cy.contains('Workflows').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/workflows');
      cy.get('footer').should('exist');
    });
  });

  describe('Profile Page', () => {
    it('should display profile page with user info', () => {
      cy.visit('/profile');
      cy.contains('Profile').should('be.visible');
      cy.contains('yeborisov').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/profile');
      cy.get('footer').should('exist');
    });
  });

  describe('Reports Page', () => {
    it('should display the reports page', () => {
      cy.intercept('GET', '**/api/reports*', {
        statusCode: 200,
        body: { success: true, data: [] }
      }).as('getReports');

      cy.visit('/reports');
      cy.contains('Reports').should('be.visible');
    });

    it('should display the footer', () => {
      cy.intercept('GET', '**/api/reports*', {
        statusCode: 200,
        body: { success: true, data: [] }
      });
      cy.visit('/reports');
      cy.get('footer').should('exist');
    });
  });
});