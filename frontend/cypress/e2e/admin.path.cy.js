// test suite for admin path
describe('Tests Admin Path', () => {
    let email = `GJD@kings.edu.au`;
    const password = 'mickeymousestuff';

    before(() => {
        const randomId = Date.now();
        email = `gary${randomId}@kings.edu.au`;

        // Register account once
        cy.visit('/register');
        cy.get('#email-input').type(email);
        cy.get('#name-input').type('Gary');
        cy.get('#password-input').type(password);
        cy.get('#confirm-password-input').type(password);
        cy.get('button[type="submit"]').click();

        cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    });

    it('Creates a new game', () => {
        // 1. create a new game
        cy.contains('Create Game').click();
        cy.get('#gameName').type('Test Game');
        const fileName = 'Trollface.png';

        cy.get('#formFile').selectFile(`cypress/fixtures/${fileName}`, { force: true });
        cy.get('button').contains('Save').click();

        // 2. start game session
        cy.contains('Start Game', { timeout: 8000 }).should('exist');
        cy.contains('Start Game').click();
    
        // session start modal appears
        cy.contains('Game Session Started').should('exist');
        cy.contains('Session ID:').should('exist');
        
        cy.contains('Manage').click();
        cy.url().should('include', '/session/');

        // 3. display reuslts
        cy.contains('Results', { timeout: 10000 }).click();


        // 4. logout game
        cy.contains('Logout').click();
        cy.url().should('eq', `${Cypress.config().baseUrl}/login`);
        cy.get('#email-input').type(email);
        cy.get('#password-input').type(password);
        cy.get('button[type="submit"]').click();
    });
});
