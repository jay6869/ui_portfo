describe('navigation', () => {
  it('header links scroll to their sections', () => {
    cy.visitQuiet('/')
    cy.get('header nav[aria-label="Primary"]').contains('a', 'Lab').click()
    cy.location('hash').should('eq', '#lab')
    cy.get('#lab').should(($el) => {
      const top = $el[0]!.getBoundingClientRect().top
      expect(Math.abs(top)).to.be.lessThan(120)
    })
  })

  it('skip link moves focus to the main landmark', () => {
    cy.visitQuiet('/')
    cy.get('a[href="#main"]').focus().should('be.visible').click()
    cy.focused().should('have.attr', 'id', 'main')
  })

  it('mobile menu opens as an accessible dialog and navigates', () => {
    cy.viewport(375, 812)
    cy.visitQuiet('/')
    cy.contains('button', 'Menu').should('have.attr', 'aria-expanded', 'false').click()
    cy.get('[role="dialog"]').should('be.visible').within(() => {
      cy.contains('a', 'Contact').click()
    })
    cy.get('[role="dialog"]').should('not.exist')
    cy.location('hash').should('eq', '#contact')
  })

  it('⌘K palette is keyboard-driven', () => {
    cy.visitQuiet('/')
    cy.get('body').type('{ctrl}k')
    cy.get('[role="combobox"]').should('be.focused').type('about')
    cy.get('[role="option"]').should('have.length', 1).and('have.attr', 'aria-selected', 'true')
    cy.focused().type('{enter}')
    cy.get('[role="dialog"]').should('not.exist')
    cy.location('hash').should('eq', '#about')
  })

  it('preloader runs on first visit and can be skipped', () => {
    cy.visit('/')
    cy.get('html').should('have.attr', 'data-preloader', 'full')
    cy.get('body').type(' ')
    cy.get('html', { timeout: 4000 }).should('not.have.attr', 'data-preloader')
    cy.window().its('sessionStorage').invoke('getItem', 'jg:seen').should('eq', '1')
  })
})
