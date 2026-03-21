describe('Protected Routes', () => {
  describe('Unauthenticated access', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/me', { statusCode: 401, body: { success: false, message: 'Unauthorized' } }).as('getMe');
    });

    const protectedRoutes = ['/dashboard', '/workflows', '/repositories', '/analytics', '/reports', '/profile', '/users'];

    protectedRoutes.forEach((route) => {
      it(`should redirect ${route} to /login when not authenticated`, () => {
        cy.visit(route);
        cy.url().should('include', '/login');
      });
    });
  });

  describe('Logout', () => {
    it('should clear auth and redirect to login on logout', () => {
      cy.loginAsAdmin();
      cy.mockRepositories();
      cy.mockUsers();
      cy.mockAnalytics();
      cy.mockWorkflows();

      cy.intercept('POST', '**/api/auth/logout', { statusCode: 200, body: { success: true } }).as('logout');

      cy.visit('/dashboard');
      cy.contains('Dashboard').should('be.visible');

      // Click logout button in topbar
      cy.get('button').contains(/log\s*out|sign\s*out/i).click();
      cy.wait('@logout');

      // After logout, intercept /api/me as unauthorized
      cy.intercept('GET', '**/api/me', { statusCode: 401, body: { success: false, message: 'Unauthorized' } });
      cy.url().should('include', '/login');
    });
  });
});