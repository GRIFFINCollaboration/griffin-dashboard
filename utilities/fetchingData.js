//pull in data from the URLs listed in URL; <callback> executes on successful fetch.
function assembleData(callback) {
    var i, element, script;

    for(i=0; i<window.fetchURL.length; i++){
        //delete last instance of this script so they don't accrue:
        element = document.getElementById('tempScript'+i);
        if(element)
            element.parentNode.removeChild(element);

        //refetch the ith repo:
        script = document.createElement('script');
        script.setAttribute('src', window.fetchURL[i]);

        script.setAttribute('id', 'tempScript'+i);

        //only do the callback on the first script
        //if(i==0){
            script.onload = function(){
                if(callback){
                    callback()
                }
            }
        //}

        script.onerror = function(){
            console.log('failed fetch!')
        }

        document.head.appendChild(script);
    }
}

//tell everybody to refresh their data from the in-memory buffers:
function repopulate(callback){
    var i;

    //refresh everybody
    for(i=0; i<window.refreshTargets.length; i++)
        window.refreshTargets[i].update();

    if(callback)
        callback();
}