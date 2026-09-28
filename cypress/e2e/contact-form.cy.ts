describe('contact form', () => {
  beforeEach(() => {
    cy.visitQuiet('/#contact')
    cy.get('#contact-form').scrollIntoView()
  })

  it('shows inline, accessible errors and focuses the first invalid field', () => {
    cy.get('#contact-form').contains('button', 'Send it').click()
    cy.get('#cf-name').should('have.attr', 'aria-invalid', 'true').and('be.focused')
    cy.get('#cf-email').should('have.attr', 'aria-invalid', 'true')
    cy.get('#cf-message').should('have.attr', 'aria-invalid', 'true')
    cy.get('#cf-name-error').should('contain.text', 'who I')
    cy.get('#cf-name').should('have.attr', 'aria-describedby', 'cf-name-error')
  })

  it('validates email format and message length', () => {
    cy.get('#cf-name').type('Ada')
    cy.get('#cf-email').type('not-an-email').blur()
    cy.get('#cf-email-error').should('contain.text', "doesn't look right")
    cy.get('#cf-message').type('too short').blur()
    cy.get('#cf-message-error').should('contain.text', '20+')
  })

  it('submits valid input (mailto fallback without an endpoint)', () => {
    cy.get('#cf-name').type('Ada Lovelace')
    cy.get('#cf-email').type('ada@example.com')
    cy.get('#cf-message').type('Hello! I would like to talk about a small project.')
    cy.wait(2600) // past the anti-bot time trap
    cy.get('#contact-form').contains('button', 'Send it').click()
    cy.get('[role="status"]').should('contain.text', 'email app')
  })

  it('treats a filled honeypot as a bot (fake success, nothing sent)', () => {
    cy.get('#cf-company').type('Spam Inc', { force: true })
    cy.get('#cf-name').type('Bot')
    cy.get('#cf-email').type('bot@example.com')
    cy.get('#cf-message').type('Buy followers, very cheap, limited offer today.')
    cy.get('#contact-form').contains('button', 'Send it').click()
    cy.get('[role="status"]').should('contain.text', 'Thanks for writing')
  })

  it('copies the email address with a toast', () => {
    cy.window().then((win) => cy.stub(win.navigator.clipboard, 'writeText').resolves())
    cy.contains('button', 'Copy email address').click()
    cy.contains('[role="status"] *', 'Copied. Talk soon.').should('be.visible')
  })
})
