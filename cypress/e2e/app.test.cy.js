describe('app', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })
  
  it('app layout', () => {
    cy.visit('/')
    cy.contains('Track')
    cy.contains('Export').click()
    cy.contains('[]') 
  })
  it('tracks entry', () => {
    cy.visit('/')
    cy.contains('Track').click()
    const today = new Date().toISOString().substring(0, 10)
    cy.contains(today)
  })
  it('removes entry', () => {
    cy.visit('/')
    cy.contains('Track').click()
    cy.on('window:confirm', () => true)
    const today = new Date().toISOString().substring(0, 10)
    cy.get('ul > li').click()
    cy.contains(today).should('not.exist')
  })
  it('shows entry history', () => {
    cy.visit('/', {
      onBeforeLoad: function (window) {
        window.localStorage.setItem('history', JSON.stringify([+new Date(), +new Date() - 1000*60*60*24]));
      }
    })
    const today = new Date()
    cy.contains(today.toISOString().substring(0, 10))
    const yesterday = new Date(+today - 1000*60*60*24)
    cy.contains(yesterday.toISOString().substring(0, 10))
  })
})