function heartbeat(){
    //start the data fetching heartbeat
    //note the dataStore.heartbeat object needs to be defined first.

    Promise.all(dataStore.heartbeat.URLqueries.map(promiseArrayBuffer)
        ).then(
            function(dv){
                var i;

                for(i=0; i<dv.length; i++)
                    unpackDAQdv(dv[i]);
                
                Promise.all(dataStore.heartbeat.scriptQueries.map(promiseScript)
                    ).then(
                        function(){
                            dataStore.heartbeat.callback();
                            dataStore.heartbeatTimer = window.setTimeout(heartbeat, dataStore.heartbeatInterval)
                        }
                    )
            }
        )
}

function restart_heartbeat(){
    // restart heartbeat immediately; note heartbeat must have its args bound at setup before calling this.

    window.clearTimeout(dataStore.heartbeatTimer);
    heartbeat();
}

function promiseArrayBuffer(url){
    // promise to get array buffer response from <url> 
    //thanks http://www.html5rocks.com/en/tutorials/es6/promises/

    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();

        req.onreadystatechange = function(){
            var dv;

            if(this.readyState != 4) return;

            dv = new DataView(this.response);
            resolve(dv);
        }

        req.onerror = function() {
            reject(Error("Network Error"));
        };

        req.open('GET', url);

        req.responseType = "arraybuffer";
        req.timeout = 500;
        // Make the request
        req.send();
    });
}

function promiseScript(url){
    //similar to above, but does the script tag dance to avoid non-CORS-compliant servers

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