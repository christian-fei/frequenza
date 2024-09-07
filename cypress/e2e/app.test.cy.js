describe('app', () => {
  it('app layout', () => {
    cy.visit('http://localhost:8080')
    cy.contains('Track')
  })
})