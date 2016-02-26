function heartbeat(){
    //start the data fetching heartbeat
    //note the dataStore.heartbeat object needs to be defined first.

    var URLqueries = dataStore.heartbeat.URLqueries.slice();

    if(dataStore.heartbeat.ADCrequest.length > 0)
        URLqueries = URLqueries.concat(dataStore.heartbeat.ADCrequest);

    if (typeof preFetch === "function"){ 
        preFetch();
    }
    
    Promise.all(URLqueries.map(promiseURL)).then(
        function(responses){
            var i;
            for(i=0; i<responses.length; i++){
                //callbacks
                URLqueries[i][2](responses[i]);
            }

            Promise.all(dataStore.heartbeat.scriptQueries.map(promiseScript)).then(
                function(){
                    if(typeof dataStore.heartbeat.callback === 'function'){
                        dataStore.heartbeat.callback();
                    }
                    window.clearTimeout(dataStore.heartbeatTimer)
                    dataStore.heartbeatTimer = window.setTimeout(heartbeat, dataStore.heartbeatInterval);
                }
            )
        }
    )


}

function promiseURL(query){
    // promise to get array buffer response from <query> == ['url', 'request type', callback],
    // where request type can be 'arraybuffer' or 'json' 
    // thanks http://www.html5rocks.com/en/tutorials/es6/promises/

    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();

        req.onerror = function() {
            reject(Error("Network Error"));
        };

        if(query[1] == 'arraybuffer'){
            req.onreadystatechange = function(){
                var dv;

                if(this.readyState != 4) return;

                if(this.response)
                    dv = new DataView(this.response);
                else
                    dv = new DataView(new ArrayBuffer(0));
                resolve(dv);
            }
            req.responseType = "arraybuffer";
        } else if (query[1] == 'json'){
            req.onreadystatechange = function(){
                var blobject

                if(this.readyState != 4) return;

                try {
                    blobject = JSON.parse(this.response);
                }
                catch (e) {
                   console.log(query[0], ' failed to return valid JSON');
                   console.log(this.response);
                   blobject = {}
                }
                resolve(blobject);
            }   
        }

        req.open('GET', query[0]);
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