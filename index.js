if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => { console.log('Service Worker Registered') })
}

window.onerror = function (err) {
  alert(err.toString())
}

appendHistory(Date.now())

renderApp()


const $formCustomEntry = document.querySelector('#custom-entry')
const $entry = document.querySelector('#entry')
if ($formCustomEntry) {
  $formCustomEntry.addEventListener('submit', function (e) {
    e.preventDefault()
    if ($entry && $entry.value) {
      appendHistory(+new Date($entry.value))
      renderApp()
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

function renderApp (
  $history = document.querySelector('#history'),
  $stats = document.querySelector('#stats'),
  $graphContainer = document.querySelector('#graph-container'),
  history = getHistory()
) {
  if ($stats) renderStats($stats, history)
  if ($history) renderHistory($history, history)
  if ($graphContainer) renderGraph($graphContainer, history)
}

function renderStats ($stats, history) {
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

function renderHistory($history, history) {
  $history.innerHTML = history
  .map(i => `<li>${formatTimestamp(new Date(i))}</li>`)
  .join('')
}

function renderGraph($graphContainer, history) {
  const groupedData = groupTimestampsByDay(history)
  const $graph = $graphContainer.querySelector('.graph')
  const $labels = $graphContainer.querySelector('.labels')
  if ($graph) {
    $graph.innerHTML = ''
    groupedData.forEach(({ date, count }) => {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.textContent = count
      bar.style.width = `${count * 2}%`
      bar.setAttribute('data-date', date)
      $graph.appendChild(bar)
    })
  }

  if ($labels) {
    $labels.innerHTML = ''
    groupedData.forEach(({ date, count }) => {
      const label = document.createElement('span')
      if (count > history.length * 0.1) label.textContent = date
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
    renderApp()
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
      renderApp()
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