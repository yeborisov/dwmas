describe('Admin Features', () => {
  describe('Admin Users Page', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.mockRepositories();
      cy.mockUsers();
      cy.mockAnalytics();
      cy.mockWorkflows();
    });

    it('should display Users page with user list', () => {
      cy.visit('/users');
      cy.wait('@getUsers');
      cy.contains('yeborisov').should('be.visible');
      cy.contains('devuser').should('be.visible');
    });

    it('should show user roles in the list', () => {
      cy.visit('/users');
      cy.wait('@getUsers');
      cy.contains('ADMIN').should('be.visible');
      cy.contains('DEVELOPER').should('be.visible');
    });

    it('should show Users link in sidebar for admin', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').contains('Users').should('be.visible');
    });

    it('should display the footer on Users page', () => {
      cy.visit('/users');
      cy.get('footer').should('exist');
      cy.get('footer').contains('iordan.borisov@gmail.com').should('be.visible');
    });
  });

  describe('Developer Cannot Access Admin Pages', () => {
    beforeEach(() => {
      cy.loginAsDeveloper();
      cy.mockRepositories();
      cy.mockAnalytics();
      cy.mockWorkflows();
    });

    it('should not show Users link in sidebar for developer', () => {
      cy.visit('/dashboard');
      cy.get('nav[aria-label="Primary navigation"]').should('exist');
      cy.get('nav[aria-label="Primary navigation"]').contains('Users').should('not.exist');
    });

    it('should redirect developer away from /users', () => {
      cy.visit('/users');
      cy.url().should('include', '/dashboard');
    });
  });
});