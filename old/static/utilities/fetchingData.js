//tell everybody to refresh their data from the in-memory buffers:
function repopulate(callback){
    var i;

    //refresh everybody
    for(i=0; i<window.refreshTargets.length; i++)
        window.refreshTargets[i].update();

    if(callback)
        callback();
}

//(re)start the data fetching loop
function rebootFetch(){
    clearInterval(window.masterLoop);
    repopulate();
    window.masterLoop = window.setInterval(repopulate, 3000);
} 