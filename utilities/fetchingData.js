//pull in data from the URLs listed in URL; <callback> executes on successful fetch.
function assembleData(callback) {
    var i, element, script,
        URL = [ 'http://annikal.triumf.ca:8082/?cmd=jcopy&odb0=Experiment/&odb1=Runinfo/&encoding=json-p-nokeys&callback=fetchODB'];

    for(i=0; i<URL.length; i++){
        //delete last instance of this script so they don't accrue:
        element = document.getElementById('tempScript'+i);
        if(element)
            element.parentNode.removeChild(element);

        //refetch the ith repo:
        script = document.createElement('script');
        script.setAttribute('src', URL[i]);

        script.setAttribute('id', 'tempScript'+i);

        script.onload = function(){
            if(callback){
                callback()
            }
        }

        script.onerror = function(){
            console.log('failed fetch!')
        }

        document.head.appendChild(script);
    }
}

//functions to route data returned by fetchingData nicely:
function fetchODB(returnObj){
    window.currentData.ODB = {};
    window.currentData.ODB.Experiment = returnObj[0];
    window.currentData.ODB.Runinfo = returnObj[1];
    console.log(window.currentData)
}


//tell everybody to refresh their data from the in-memory buffers:
function repopulate(){
    var sidebar = document.getElementById('statusBar');

    //refresh everybody
    sidebar.populateFields();
}