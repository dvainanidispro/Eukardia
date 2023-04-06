'use strict';

// on window load, register the service worker 
window.addEventListener('load', function(event) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js',{scope: "/"})
            .catch(err=>console.debug('service worker not registered',err));
    }
});

