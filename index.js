if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => { console.log('Service Worker Registered') })
}

window.onerror = function (err) {
  alert(err.toString())
}

renderApp()

const $trackEntry = document.querySelector('#track')
if ($trackEntry) {
  $trackEntry.addEventListener('click', () => {
    addHistoryEntry()
    renderApp()
  })
}

const $formCustomEntry = document.querySelector('#custom-entry')
const $entry = document.querySelector('#entry')
if ($formCustomEntry) {
  $formCustomEntry.addEventListener('submit', function (e) {
    e.preventDefault()
    if ($entry && $entry.value) {
      addHistoryEntry(+new Date($entry.value))
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

function addHistoryEntry (timestamp = Date.now(), history = getHistory()) {
  history.push(timestamp)
  history.sort()
  localStorage.setItem('history', JSON.stringify(history))
  return history
}
function popHistoryItem (history = getHistory()) {
  history.pop()
  localStorage.setItem('history', JSON.stringify(history))
  return history
}
function removeHistoryItem(item, history = getHistory()) {
  history = history.filter((i) => i !== item)
  localStorage.setItem('history', JSON.stringify(history))
  return history
}

function renderApp (
  $history = document.querySelector('#history'),
  $stats = document.querySelector('#stats'),
  $graphContainer = document.querySelector('#graph-container'),
  $export = document.querySelector('#export'),
  history = getHistory()
) {
  if ($stats) renderStats($stats, history)
  if ($history) renderHistory($history, history)
  if ($graphContainer) renderGraph($graphContainer, history)
  if ($export) $export.textContent = JSON.stringify(history, null, 2);
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
  $history.removeEventListener('click', handleClickHistory)
  $history.addEventListener('click', handleClickHistory)
  const groupedData = groupTimestampsByDay(history)
  let printDay = null
  $history.innerHTML = history
  .sort((a, b) => b - a)
  .map((i, index) => {
    let prepend = ''
    const itemDate = new Date(i).toISOString().substring(0, 10)
    if (index === 0 || itemDate !== printDay) {
      printDay = itemDate
      const groupCount = groupedData.find((g) => g.date === printDay).count
      prepend = `<h3>${printDay} (${groupCount})</h3>`
    }
    return `${prepend}<li data-id="${i}">${formatTimestamp(new Date(i))}</li>`
  })
  .join('')
}
function handleClickHistory (event) {
  if (event.target.tagName === "LI") {
    if (confirm(`Do you want to delete this item? ${formatTimestamp(+event.target.dataset.id)}`)) {
      removeHistoryItem(+event.target.dataset.id)
      renderApp()
    }
  }
}

function renderGraph($graphContainer, history) {
  const groupedData = groupTimestampsByDay(history)
  groupedData.length = groupedData.length >= 7 ? 7 : groupedData.length
  const maxCount = groupedData.reduce((acc, curr) => acc < curr.count ? curr.count : acc, 0)
  const $graph = $graphContainer.querySelector('.graph')
  const $labels = $graphContainer.querySelector('.labels')
  if ($graph) {
    $graph.style.height = '200px'
    $graph.innerHTML = ''
    groupedData.forEach(({ date, count }, index) => {
      const bar = document.createElement('div')
      bar.className = 'bar'
      bar.textContent = `${count} - ${date.substring(5)}`
      bar.style.height = `${count * 200 / maxCount}px`
      bar.style.bottom = '0px'
      bar.style.left = `${index * 100 / groupedData.length}%`
      bar.style.width = `${100 / groupedData.length}%`
      bar.setAttribute('data-date', date)
      $graph.appendChild(bar)
    })
  }

  if ($labels) {
    return
    $labels.innerHTML = ''
    groupedData.forEach(({ date, count }) => {
      const label = document.createElement('span')
      if (count > history.length * 0.1) label.textContent = date
      //label.style.width = `${count/maxCount * 100}%`
      $labels.appendChild(label)
    })
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (!date) return ''
  return date.toLocaleTimeString()
  return date.toISOString().slice(0, 10) + ' ' + date.toLocaleTimeString()
}

function groupTimestampsByDay(timestamps) {
  const grouped = {}
  
  timestamps.forEach(timestamp => {
    const date = new Date(timestamp)
    const formattedDate = date.toISOString().substring(0, 10)
    
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
    popHistoryItem()
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