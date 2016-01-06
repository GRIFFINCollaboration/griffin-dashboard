function heartbeat(URLqueries, scriptQueries, callback){
    //start the data fetching heartbeat
    //note this function should be overwritten by itself with bound arguments on setup.

    Promise.all(URLqueries.map(promiseJSONURL)
        ).then(
            function(json){
                return 0;
            }
        ).then(
            Promise.all(scriptQueries.map(promiseScript)
                ).then(
                    function(){
                        callback();
                        dataStore.heartbeat = window.setTimeout(heartbeat, dataStore.heartbeatInterval)
                    }
                )
        )
}

function restart_heartbeat(){
    // restart heartbeat immediately; note heartbeat must have its args bound at setup before calling this.

    window.clearTimeout(dataStore.heartbeat);
    heartbeat();
}

function promiseJSONURL(url){
    // promise to get response from <url> 
    //thanks http://www.html5rocks.com/en/tutorials/es6/promises/

    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text parsed as JSON
                resolve(JSON.parse(req.response));
            }
            else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}

function promiseScript(url){
    //like promiseURL, but does the script tag dance to avoid non-CORS-compliant servers

    // Return a new promise.
    return new Promise(function(resolve, reject) {

        var script = document.createElement('script');

        script.setAttribute('src', url);
        script.onload = function(){
            deleteNode('promiseScript');
            resolve(null); 
        }
        script.id = 'promiseScript';
        document.head.appendChild(script);
    });
}