function prepareTemplates(templates){
    //take an array of template names, and load their inner html into a simmilarly keyed object.

    var i, guts = {};

    for(i=0; i<templates.length; i++){
        guts[templates[i]] = document.getElementById(templates[i]).import.getElementById(templates[i]).innerHTML
    }

    return guts
}

function deleteNode(id){
    //delete a dom node with id
    //thanks https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild

    var node = document.getElementById(id);
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}

function prettyNumber(val){
    //turn a number into a string with a sensible unit

    var pretty

    if(val>1000000){
        pretty = (val / 1000000).toFixed(3) + ' M'
    } else if(val>1000){
        pretty = (val / 1000000).toFixed(3) + ' k'
    }

    return pretty;
}

function selected(selectID, fetchText){
    //returns the value selected from a select element, or the inner html of the option if fetchText is set

    var select = document.getElementById(selectID),
        value = select.options[select.selectedIndex].value;

        if(fetchText)
            value = select.options[select.selectedIndex].innerHTML;

    return value;
}

function generateTickLabel(min, max, nTicks, n){
    //function to make a reasonable decision on how many decimal places to show, whether to to use 
    //sci. notation on an axis tick mark, where <min> and <max> are the axis minimum and maximum,
    //<nTicks> is the number of tickmarks on the axis, and we are returning the label for the <n>th
    //tick mark

    var range = max - min,
        smallestPrecision = range / (nTicks-1),
        tickValue = min + (max-min)/(nTicks-1)*n;

    //tickmark needs to be labeled to enough precision to show the difference between subsequent ticks:
    smallestPrecision = Math.floor(Math.log(smallestPrecision) / Math.log(10));

    if(smallestPrecision < 0){
        return tickValue.toFixed(-smallestPrecision)
    }

    tickValue = Math.floor(tickValue/Math.pow(10, smallestPrecision)) * Math.pow(10, smallestPrecision);

    return tickValue+'';

}

Math.log10 = function(x){
    //base 10 log

    return Math.log(x) / Math.log(10);
}

function getPosition(element) {
    //modified from http://www.kirupa.com/html5/get_element_position_using_javascript.htm

    var xPosition = 0;
    var yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft + element.clientLeft);
        yPosition += (element.offsetTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function isNumeric(n) {
    // is n a number?

    return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
}

function fetchScript(url, id){
    // simple script hack fetch

    var script = document.createElement('script');

    script.setAttribute('src', url);
    script.onload = function(){
            deleteNode(id); 
    }
    script.id = id;
    document.head.appendChild(script);
    
}

function pokeURL(url){
    // poke the requested URL, don't care about the response

    var req = new XMLHttpRequest();

    req.open('GET', url);
    // Make the request
    req.send();
}

function fetchDAQ(payload){
    //get the contents of the ODB DAQ directory.

    var i, key;

    dataStore.DAQ = payload;

    //extract hosts list
    dataStore.hosts = [];

    //master
    //dataStore.hosts.push(dataStore.DAQ.hosts.master);
    for(key in dataStore.DAQ.hosts){
        if(dataStore.DAQ.hosts[key].host){
            //collectors
            //dataStore.hosts.push(dataStore.DAQ.hosts[key].host);
            //digitizers
            for(i=0; i<dataStore.DAQ.hosts[key].digitizers.length; i++){
                if(dataStore.DAQ.hosts[key].digitizers[i])
                    dataStore.hosts.push(dataStore.DAQ.hosts[key].digitizers[i])
            }
        }
    }
}

function getParameterByName(name) {
    // get a parameter out of the query string
    // thanks http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function reloadPage(){
    document.location.reload();
}