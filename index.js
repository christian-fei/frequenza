if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => { console.log('Service Worker Registered') })
}

window.onerror = function (err) {
  alert(err.toString())
}

const $formCustomEntry = document.querySelector('#custom-entry')
const $entry = document.querySelector('#entry')
if ($formCustomEntry) {
  $formCustomEntry.addEventListener('submit', function (e) {
    e.preventDefault()
    if ($entry && $entry.value) {
      appendHistory(+new Date($entry.value))
      render()
    }
    return false
  })
}

appendHistory(Date.now())

render()

function getHistory () {
  let history = localStorage.getItem('history')
  try {
    history = JSON.parse(history)
    if (!Array.isArray(history)) history = []
  } catch (err) {
    history = []
  }
  return history
}

function appendHistory (timestamp = Date.now(), history = getHistory()) {
  history.push(timestamp)
  history.sort()
  localStorage.setItem('history', JSON.stringify(history))
  return history
}
function popHistory (history = getHistory()) {
  history.pop()
  localStorage.setItem('history', JSON.stringify(history))
  return history
}

function render (
  $history = document.querySelector('#history'),
  $stats = document.querySelector('#stats'),
  history = getHistory()
) {
  if ($stats) {
    const today = new Date(Date.now())
    today.setUTCHours(0)
    today.setUTCMinutes(0)
    today.setUTCSeconds(0)
    const yesterday = new Date(+today - 1000*60*60*24)
    $stats.innerHTML = `
      <div>
        Today<br>
        <b>${history.filter(i => i >= today).length}</b>
      </div>
      <div>
        Yesterday<br>
        <b>${history.filter(i => i >= yesterday && i < today).length}</b>
      </div>
      <div>
        Overall<br>
        <b>${history.length}</b>
      </div>
    `
  }
  if ($history) {
    $history.innerHTML = history.map(i => `<li>${new Date(i)}</li>`).join('')
  }
}

const $revertLastEntry = document.querySelector('#revert')
if ($revertLastEntry) {
  $revertLastEntry.addEventListener('click', function () {
    popHistory()
    render()
  })
}

const $reset = document.querySelector('#reset')
if ($reset) {
  $reset.addEventListener('click', function () {
    //alert('resetting')
    if (confirm('Do you want to reset the app and its data?')) {
      if ('serviceWorker' in navigator) {
        caches.keys().then(function(cacheNames) {
          cacheNames.forEach(function(cacheName) {
            caches.delete(cacheName)
          })
        })
      }
      localStorage.clear()
      window.location.reload()
    }
  })
}