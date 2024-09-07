describe('app', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  it('app layout', () => {
    cy.contains('Track')
    cy.contains('Export').click()
    cy.contains('[]') 
  })
  it('tracks entry', () => {
    cy.contains('Track').click()
    const today = new Date().toISOString().substring(0, 10)
    cy.contains(today)
  })
  it('removes entry', () => {
    cy.contains('Track').click()
    cy.on('window:confirm', () => true)
    const today = new Date().toISOString().substring(0, 10)
    cy.contains(today).click()
    cy.get(today).should('not.exist')
  })
})