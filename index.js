if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => { console.log('Service Worker Registered') })
}

window.onerror = function (err) {
  alert(err.toString())
}

appendHistory(Date.now())

render()


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
  $graph = document.querySelector('.graph'),
  $labels = document.querySelector('.labels'),
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
        <b>${history.filter(i => i >= today).length}</b>
        <br>
        Today
      </div>
      <div>
        <b>${history.filter(i => i >= yesterday && i < today).length}</b>
        <br>
        Yesterday
      </div>
      <div>
        <b>${history.length}</b>
        <br>
        Overall
      </div>
    `
  }
  if ($history) {
    $history.innerHTML = history
      .map(i => `<li>${formatTimestamp(new Date(i))}</li>`)
      .join('')
  }

  const groupedData = groupTimestampsByDay(history)
  if ($graph) {
    $graph.innerHTML = ''
    groupedData.forEach(({ date, count }) => {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.style.width = `${count * 2}%`
      bar.setAttribute('data-date', date)
      $graph.appendChild(bar)
    })
  }

  if ($labels) {
    $labels.innerHTML = ''
    groupedData.forEach(({ date, count }) => {
      const label = document.createElement('span')
      label.textContent = date
      label.style.width = `${count * 2}%`
      $labels.appendChild(label)
    })
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (!date) return ''
  return date.toISOString().slice(0, 10) + ' ' + date.toLocaleTimeString()
}


/* graph viz */
function groupTimestampsByDay(timestamps) {
  const grouped = {}
  
  timestamps.forEach(timestamp => {
    const date = new Date(timestamp)
    const formattedDate = date.toISOString().split('T')[0]
    
    if (!grouped[formattedDate]) {
      grouped[formattedDate] = []
    }
    
    grouped[formattedDate].push(timestamp)
  })
  
  return Object.keys(grouped).map(date => ({
    date,
    count: grouped[date].length
  }))
}








/* DANGER ZONE */

const $revertLastEntry = document.querySelector('#revert')
if ($revertLastEntry) {
  $revertLastEntry.addEventListener('click', () => {
    popHistory()
    render()
  })
}

const $resetAppStorage = document.querySelector('#reset-app-storage')
const $resetApp = document.querySelector('#reset-app')
const $resetStorage = document.querySelector('#reset-storage')
if ($resetAppStorage) {
  $resetAppStorage.addEventListener('click', () => {
    if (confirm('Do you want to reset the app and its data?')) {
      resetApp()
      resetStorage()
      window.location.reload()
    }
  })
}
if ($resetApp) {
  $resetApp.addEventListener('click', () => {
    resetApp()
    window.location.reload()
  })
}
if ($resetStorage) {
  $resetStorage.addEventListener('click', () => {
    if (confirm('Do you want to reset the storage?')) {
      resetStorage()
      render()
    }
  })
}

function resetApp () {
  if ('serviceWorker' in navigator) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        caches.delete(cacheName)
      })
    })
  }
}
function resetStorage () {
  localStorage.clear() 
}