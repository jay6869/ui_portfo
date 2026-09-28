describe('theme', () => {
  it('toggles charcoal ⇄ paper and remembers the choice', () => {
    cy.visitQuiet('/', { onBeforeLoad: (win) => win.localStorage.setItem('jg:theme', 'charcoal') })
    cy.get('html').should('have.attr', 'data-theme', 'charcoal')
    cy.get('header button[aria-label^="Paper theme"]').click()
    cy.get('html').should('have.attr', 'data-theme', 'paper')
    cy.get('meta[name="theme-color"]').should('have.attr', 'content', '#efeae0')
    cy.reload()
    cy.get('html').should('have.attr', 'data-theme', 'paper')
    cy.get('body').type('t')
    cy.get('html').should('have.attr', 'data-theme', 'charcoal')
  })
})
