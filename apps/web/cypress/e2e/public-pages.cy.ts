describe('Public Pages', () => {
  beforeEach(() => {
    // Ensure unauthenticated state
    cy.intercept('GET', '**/api/me', { statusCode: 401, body: { success: false, message: 'Unauthorized' } }).as('getMe');
  });

  describe('Home Page', () => {
    it('should display the home page with DWMAS branding', () => {
      cy.visit('/');
      cy.contains('DWMAS').should('be.visible');
    });

    it('should have navigation links', () => {
      cy.visit('/');
      cy.contains('About').should('be.visible');
      cy.contains('Sign in').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/');
      cy.get('footer').should('exist');
      cy.get('footer').contains('iordan.borisov@gmail.com').should('be.visible');
      cy.get('footer').contains('DWMAS').should('be.visible');
    });

    it('should navigate to About page', () => {
      cy.visit('/');
      cy.contains('About').click();
      cy.url().should('include', '/about');
    });

    it('should navigate to Login page', () => {
      cy.visit('/');
      cy.contains('Sign in').click();
      cy.url().should('include', '/login');
    });
  });

  describe('About Page', () => {
    it('should display About page content', () => {
      cy.visit('/about');
      cy.contains('About').should('be.visible');
    });

    it('should display the footer', () => {
      cy.visit('/about');
      cy.get('footer').should('exist');
      cy.get('footer').contains('iordan.borisov@gmail.com').should('be.visible');
    });
  });

  describe('Login Page', () => {
    it('should display the login page', () => {
      cy.visit('/login');
      cy.contains('GitHub').should('be.visible');
    });

    it('should have a GitHub login button/link', () => {
      cy.visit('/login');
      cy.get('a[href*="github"], a[href*="auth/github"], button').should('exist');
    });

    it('should display the footer', () => {
      cy.visit('/login');
      cy.get('footer').should('exist');
    });
  });
});