/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Visit with the preloader already "seen" (first-visit theatre skipped) and wait until
       * React has hydrated (JS is fetched after first paint, so clicks before that are inert).
       */
      visitQuiet(path: string, opts?: Partial<Cypress.VisitOptions>): Chainable<Cypress.AUTWindow>
      /** Wait for the app to hydrate. */
      hydrated(): Chainable<Cypress.AUTWindow>
    }
  }
}

// The production CSP (meta tag, hash-based) blocks the script Cypress injects into every page.
// Strip it for tests only; the real site keeps it (see scripts/prerender.mjs).
beforeEach(() => {
  cy.intercept({ method: 'GET', resourceType: 'document' }, (req) => {
    req.continue((res) => {
      if (typeof res.body === 'string')
        res.body = res.body.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '')
    })
  })
})

Cypress.Commands.add('hydrated', () =>
  cy.window({ timeout: 15000 }).should((win) => {
    expect((win as unknown as { __jgHydrated?: boolean }).__jgHydrated, 'hydrated').to.eq(true)
  }),
)

Cypress.Commands.add('visitQuiet', (path: string, opts: Partial<Cypress.VisitOptions> = {}) => {
  cy.visit(path, {
    ...opts,
    onBeforeLoad(win) {
      win.sessionStorage.setItem('jg:seen', '1')
      opts.onBeforeLoad?.(win)
    },
  })
  return cy.hydrated()
})

export {}
