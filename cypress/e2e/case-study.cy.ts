describe('case studies', () => {
  it('opens from the work list and returns to the same place', () => {
    cy.visitQuiet('/')
    // Desktop list or touch carousel, depending on the pointer the browser reports
    cy.get('#work a[href="/work/flagship-one"]:visible').first().scrollIntoView()
    cy.wait(600) // let reveals settle
    cy.get('#work a[href="/work/flagship-one"]:visible').first().click()
    cy.location('pathname').should('eq', '/work/flagship-one')
    cy.get('h1').should('contain.text', 'Flagship one')
    cy.title().should('contain', 'Flagship one')
    cy.contains('a', 'All work').click()
    cy.location('pathname').should('eq', '/')
    cy.get('#work a[href="/work/flagship-one"]:visible')
      .first()
      .should(($a) => {
        const r = $a[0]!.getBoundingClientRect()
        expect(r.top).to.be.greaterThan(-50)
        expect(r.bottom).to.be.lessThan(Cypress.config('viewportHeight') + 50)
      })
  })

  it('direct loads are prerendered and link to the next project', () => {
    cy.request('/work/small-two').its('body').should('contain', 'Small thing two')
    cy.visitQuiet('/work/small-two')
    cy.get('[aria-label="Next project"] a').should('have.attr', 'href', '/work/small-three').click()
    cy.location('pathname').should('eq', '/work/small-three')
    cy.get('h1').should('contain.text', 'Small thing three')
  })

  it('unknown paths get the 404 page with a 404 status', () => {
    cy.request({ url: '/definitely-not-here', failOnStatusCode: false })
      .its('status')
      .should('eq', 404)
    cy.visitQuiet('/definitely-not-here', { failOnStatusCode: false })
    cy.contains('h1', 'awkward').should('be.visible')
    cy.contains('a', 'Take me home').click()
    cy.location('pathname').should('eq', '/')
  })
})
