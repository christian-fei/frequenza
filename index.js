if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => { console.log('Service Worker Registered'); });
}

window.onerror = function (err) {
  alert(err.toString())
}

const $count = document.querySelector('#count')
if ($count) {
  let count = +localStorage.getItem('count')
  if (!Number.isFinite(count)) count = 1
  count++
  localStorage.setItem('count', count)
  $count.innerHTML = count
}


const $resetSWbutton = document.querySelector('#reset')
if ($resetSWbutton) {
  $resetSWbutton.addEventListener('click', function () {
    alert('resetting')
    if ('serviceWorker' in navigator) {
      caches.keys().then(function(cacheNames) {
        cacheNames.forEach(function(cacheName) {
          caches.delete(cacheName);
        });
      });
    }
    localStorage.clear()
    window.location.reload()
  })
}