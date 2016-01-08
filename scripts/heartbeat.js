function heartbeat(){
    //start the data fetching heartbeat
    //note the dataStore.heartbeat object needs to be defined first.

    Promise.all(dataStore.heartbeat.URLqueries.map(promiseArrayBuffer)
        ).then(
            function(dv){
                var i;

                for(i=0; i<dv.length; i++)
                    unpackDAQdv(dv[i]);
            }
        ).then(
            Promise.all(dataStore.heartbeat.scriptQueries.map(promiseScript)
                ).then(
                    function(){
                        dataStore.heartbeat.callback();
                        dataStore.heartbeatTimer = window.setTimeout(heartbeat, dataStore.heartbeatInterval)
                    }
                )
        )
}

function restart_heartbeat(){
    // restart heartbeat immediately; note heartbeat must have its args bound at setup before calling this.

    window.clearTimeout(dataStore.heartbeatTimer);
    heartbeat();
}

// function promiseJSONURL(url){
//     // promise to get response from <url> 
//     //thanks http://www.html5rocks.com/en/tutorials/es6/promises/

//     // Return a new promise.
//     return new Promise(function(resolve, reject) {
//         // Do the usual XHR stuff
//         var req = new XMLHttpRequest();
//         req.open('GET', url);

//         req.onload = function() {
//             // This is called even on 404 etc
//             // so check the status
//             if (req.status == 200) {
//                 // Resolve the promise with the response text parsed as JSON
//                 resolve(JSON.parse(req.response));
//             }
//             else {
//                 // Otherwise reject with the status text
//                 // which will hopefully be a meaningful error
//                 reject(Error(req.statusText));
//             }
//         };

//         // Handle network errors
//         req.onerror = function() {
//             reject(Error("Network Error"));
//         };

//         // Make the request
//         req.send();
//     });
// }

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

// function XHR(URL, callback, mime, noCredentials, isDataview){
//     var xmlhttp = new XMLHttpRequest();

//     xmlhttp.onreadystatechange = function(){
//         var dv;

//         if(this.readyState != 4) return;
//         if(isDataview){
//             dv = new DataView(this.response);
//             callback(dv);
//         } else {
//             callback(this.responseText);
//         }
//     }

//     if(!noCredentials)
//         xmlhttp.withCredentials = true;
//     if(mime)
//         xmlhttp.overrideMimeType(mime);

//     xmlhttp.open('GET', URL);

//     if(isDataview)
//         xmlhttp.responseType = "arraybuffer";

//     xmlhttp.send();   
// }

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