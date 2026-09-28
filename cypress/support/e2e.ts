/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Visit with the preloader already "seen" (first-visit theatre skipped). */
      visitQuiet(path: string, opts?: Partial<Cypress.VisitOptions>): Chainable<Cypress.AUTWindow>
    }
  }
}

Cypress.Commands.add('visitQuiet', (path: string, opts: Partial<Cypress.VisitOptions> = {}) =>
  cy.visit(path, {
    ...opts,
    onBeforeLoad(win) {
      win.sessionStorage.setItem('jg:seen', '1')
      opts.onBeforeLoad?.(win)
    },
  }),
)

export {}
