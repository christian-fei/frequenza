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

function render (
  $count = document.querySelector('#count'), 
  $history = document.querySelector('#history'), 
  history = getHistory()
) {
  if ($count) {
    $count.innerHTML = history.length
  }
  if ($history) {
    $history.innerHTML = history.map(i => `<li>${new Date(i)}</li>`).join('')
  }
}



const $resetSWbutton = document.querySelector('#reset')
if ($resetSWbutton) {
  $resetSWbutton.addEventListener('click', function () {
    //alert('resetting')
    if ('serviceWorker' in navigator) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          caches.delete(cacheName)
        })
      })
    }
    localStorage.clear()
    window.location.reload()
  })
}