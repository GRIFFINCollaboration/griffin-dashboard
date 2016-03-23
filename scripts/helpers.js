//////////////
// generic
//////////////

function deleteNode(id){
    //delete a dom node with id
    //thanks https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild

    var node = document.getElementById(id);
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
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

///////////////
// templating
///////////////

function prepareTemplates(templates){
    //take an array of template names, and load their inner html into a simmilarly keyed object.

    var i, guts = {};

    for(i=0; i<templates.length; i++){
        guts[templates[i]] = document.getElementById(templates[i]).import.getElementById(templates[i]).innerHTML
    }

    return guts
}

//////////////////////////
// plots and drawing
//////////////////////////

function generateTickLabel(min, max, nTicks, n){
    //function to make a reasonable decision on how many decimal places to show, whether to to use 
    //sci. notation on an axis tick mark, where <min> and <max> are the axis minimum and maximum,
    //<nTicks> is the number of tickmarks on the axis, and we are returning the label for the <n>th
    //tick mark

    var range = max - min,
        smallestPrecision = range / (nTicks-1),
        tickValue = min + (max-min)/(nTicks-1)*n;

    //tickmark needs to be labeled to enough precision to show the difference between subsequent ticks:
    smallestPrecision = Math.min(0, Math.floor(Math.log(smallestPrecision) / Math.log(10)));

    if(smallestPrecision < 0){
        return tickValue.toFixed(-smallestPrecision)
    }

    tickValue = Math.floor(tickValue/Math.pow(10, smallestPrecision)) * Math.pow(10, smallestPrecision);

    return tickValue+'';

}

function squishFont(string, maxWidth){
    // given a kinetic string, keep reducing its font until it fits in maxWidth
    while(string.getTextWidth() > maxWidth){
        string.setAttr('fontSize', string.getAttr('fontSize') - 1);
    }
}

//////////////////////////
// network requests
//////////////////////////

function fetchScript(url, id){
    // simple script hack fetch

    var script = document.createElement('script');

    script.setAttribute('src', url);
    script.onload = function(){
        deleteNode(id); 
    }
    script.id = id;

    try{
        document.head.appendChild(script);
    } catch(err){
        console.log('script fetch fail')
    }
    
}

function pokeURL(url){
    // poke the requested URL, don't care about the response

    var req = new XMLHttpRequest();

    req.open('GET', url);
    // Make the request
    req.send();
}

function CRUDarrays(path, value, type){
    // delete the arrays at [path] from the odb, recreate them, and populate them with [value]

    var deletionURL, creationURL, updateURLs = [],
        i, typeIndex;

    //generate deletion URLs:
    deletionURL = 'http://' + dataStore.host + '?cmd=jdelete';
    for(i=0; i<path.length; i++){
        deletionURL += '&odb' + i + '=' + path[i];
    }

    //generate creation URLs:
    creationURL = 'http://' + dataStore.host + '?cmd=jcreate';
    for(i=0; i<path.length; i++){

        if(type[i]=='string')
            typeIndex = 12;
        else if(type[i]=='int')
            typeIndex = 7;
        else
            typeIndex = 9; // float, see mhttpd.js

        creationURL += '&odb' + i + '=' + path[i] + '&type' + i + '=' + typeIndex + '&arraylen' + i + '=' + value[i].length;
        if(typeIndex == 12)
            creationURL += '&strlen' + i + '=32';
    }

    //generate update urls:
    for(i=0; i<path.length; i++){
        updateURLs.push('http://' + dataStore.host + '?cmd=jset&odb=' + path[i] + '[*]&value=' + value[i].join() );
    }

    promiseScript(deletionURL).then(function(){
        promiseScript(creationURL).then(function(){
            var i;
            for(i=0; i<updateURLs.length; i++){
                pokeURL(updateURLs[i]);
            }
        })
    })
}

///////////////////////////////
// daq requests & unpacking
///////////////////////////////

function fetchDAQ(payload){
    //parse the contents of the ODB DAQ directory.

    var i, key;

    dataStore.ODB.DAQ = payload;

    //extract hosts list
    dataStore.hosts = [];

    //master
    //dataStore.hosts.push(dataStore.ODB.DAQ.hosts.master);
    for(key in dataStore.ODB.DAQ.hosts){
        if(dataStore.ODB.DAQ.hosts[key].host){
            //collectors
            //dataStore.hosts.push(dataStore.ODB.DAQ.hosts[key].host);
            //digitizers
            for(i=0; i<dataStore.ODB.DAQ.hosts[key].digitizers.length; i++){
                if(dataStore.ODB.DAQ.hosts[key].digitizers[i])
                    dataStore.hosts.push(dataStore.ODB.DAQ.hosts[key].digitizers[i])
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
    heartbeat();

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

function findHVcrate(channel){
    //given an HV cell name, return the index of the HV crate it is powered by

    var i=0,
        match = false,
        crateID = -1;

    while(!match && dataStore.ODB.Equipment['HV-'+i]){
        if(dataStore.ODB.Equipment['HV-'+i].Settings.Names.indexOf(channel) != -1){
            match = true;
            crateID = i;
        }
        else 
            i++;
    }

    if(match)
        return crateID;
    else
        return -1;
}

////////////////////////////
// tooltip management
////////////////////////////

function hideTooltip(){

    var tooltip = document.getElementById('tooltip');
    tooltip.setAttribute('style', 'display:none;');   
}

function moveTooltip(event){

    var tooltip = document.getElementById('tooltip'),
        offset = getPosition(tooltip.parentElement),
        gap = 20;

    tooltip.setAttribute('style', 'display:inline-block; z-index:10; position: absolute; left:' + (event.pageX - offset.x + gap) + '; top:' + event.pageY  + ';');
}

///////////////////////////////
// cell click management
///////////////////////////////

function highlightCell(cell){
    // draw a big red border around the last cell clicked, and remove the previous big red border if it exists.

    if(dataStore.lastCellClick){
        dataStore.lastCellClick.setAttr('stroke', dataStore.frameColor);
        dataStore.lastCellClick.setAttr('strokeWidth', dataStore.frameLineWidth);
    }
    dataStore.lastCellClick = cell;
    cell.setAttr('stroke', '#FF0000');
    cell.setAttr('strokeWidth', 6);
    cell.moveToTop();
    
    repaint();
}

//////////////////////////////////
// prototype modifications
//////////////////////////////////

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