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


///////////////////////////////
// daq requests & unpacking
///////////////////////////////

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

function determineADCrequests(){
    // generate the URLs for rate and threshold requests, park them in the dataStore, and kick the heartbeat to start fetching.

    var i;

    //insert url queries into heartbeat polls:
    for(i=0; i<dataStore.hosts.length; i++){
        dataStore.heartbeat.URLqueries.push(['http://' + dataStore.hosts[i] + '/report', 'arraybuffer', unpackDAQdv])
    }

    //bump the heartbeat
    startHeart();

}

function unpackDAQ(i, dv){
    //extract the ith block out of a dataview object constructed from the arraybuffer returned by a DAQ element:
    var blockLength = 14,
        thresholdPos = 10,
        trigAcptPos = 2,
        trigReqPos = 6,
        MSCPos = 0,
        unpacked = {};

    unpacked.threshold  = dv.getUint32(i*blockLength + thresholdPos, true);
    unpacked.trigAcpt   = dv.getFloat32(i*blockLength + trigAcptPos, true);
    unpacked.trigReq    = dv.getFloat32(i*blockLength + trigReqPos, true);
    unpacked.MSC        = dv.getUint16(i*blockLength + MSCPos, true);

    return unpacked;
}

function parseMSCindex(MSC){
    //decode an MSC index into [master channel, collector channel, digitizer channel]

    var masterChannel, collectorChannel, digitizerChannel;

    masterChannel = (MSC & 0xF000) >> 12;
    collectorChannel = (MSC & 0xF00) >> 8;
    digitizerChannel = (MSC & 0xFF);
    
    return [masterChannel, collectorChannel, digitizerChannel]
}

Array.prototype.unique = function(){
    // thanks http://jszen.com/best-way-to-get-unique-values-of-an-array-in-javascript.7.html
    var n = {},r=[];
    for(var i = 0; i < this.length; i++) 
    {
        if (!n[this[i]]) 
        {
            n[this[i]] = true; 
            r.push(this[i]); 
        }
    }
    return r;
}