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

    if(val>=1000000){
        pretty = (val / 1000000).toFixed(3) + ' M'
    } else if(val>=1000){
        pretty = (val / 1000).toFixed(3) + ' k'
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

function get_browser(){
    // thanks http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
 }

function validate_browser(){
    // browser must be able to deal with promises
    // no promises (ha) about anything other than FF and Chrome

    var browser = get_browser();
    console.log(browser)
    if( (browser.name != 'Firefox' && browser.name != 'Chrome') ||
        (browser.name == 'Firefox' && parseInt(browser.version,10) < 29 ) ||
        (browser.name == 'Chrome' && parseInt(browser.version, 10) < 33)
    ){
        alert('Please upgrade your browser to Firefox 29+ or Chrome 33+.')
    }
}

function parseQuery(){
	//return an object with keys/values as per query string
	//note all values will be strings.

	var elts = {};
	var queryString = window.location.search.substring(1)
	var value, i;

	queryString = queryString.split('&');
	for(i=0; i<queryString.length; i++){
		value = queryString[i].split('=');
		elts[value[0]] = value[1];
	}

    console.log(elts)
    
	return elts;
}

///////////////
// templating
///////////////

function prepareTemplates(templates){
    //take an array of template ids, and load their inner html into a simmilarly keyed object.

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
    //function to make a reasonable decision on how many decimal places to show, where <min> and <max> are the axis minimum and maximum,
    //<nTicks> is the number of tickmarks on the axis, and we are returning the label for the <n>th tick mark

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

function generatePath(vertices, offsetX, offsetY){
    //given an array of vertices [x0,y0, x1,y1,...] return a Path2D object described by these vertices
    //offsetX and offsetY translate all coords

    var poly = new Path2D(),
        i;

    poly.moveTo(vertices[0]+offsetX,vertices[1]+offsetY);
    for(i=1; i<vertices.length/2; i++){
        poly.lineTo(vertices[2*i]+offsetX,vertices[2*i+1]+offsetY);
    }
    poly.closePath();

    return poly;
}

function generateArc(startPhi, endPhi, innerRad, outerRad, centerX, centerY){
    //return a Path2D object in the shape of a rainbow

    var arc = new Path2D();

    arc.arc(centerX, centerY, outerRad, startPhi, endPhi);
    arc.lineTo(centerX + innerRad*Math.cos(endPhi), centerY + innerRad*Math.sin(endPhi));
    arc.arc(centerX, centerY, innerRad, endPhi, startPhi, true);
    arc.closePath();

    return arc;
}

function drawArrow(fromx, fromy, tox, toy){
    // returns a qd object in the shape of an arrow

    var headlen = 20,
        angle = Math.atan2(toy-fromy,tox-fromx),
        points = [
            fromx,fromy, 
            tox-headlen*Math.cos(angle),toy-headlen*Math.sin(angle), 
            tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6), 
            tox,toy,
            tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6), 
            tox-headlen*Math.cos(angle),toy-headlen*Math.sin(angle)
        ],
        path = generatePath(points,0,0),
        arrow = new qdshape(
            path, 
            {
                id: 'arrow',
                fillStyle: '#999999',
                strokeStyle: '#999999',
                lineWidth: dataStore.frameLineWidth,
                z: 1
            }
        );
    return arrow;
}

//////////////////////////
// network requests
//////////////////////////

function pokeURL(url){
    // send a GET request to a given URL
    // to be used for poking MIDAS API endpoints (mostly jset) that expect a GET and don't have a CORS header (so the response can't be meaningfully validated)

    var req = new XMLHttpRequest();

    req.onerror = function(err) {
        console.log('The request to the following URL returned an error:');
        console.log(url);
        console.log(err)
    };

    req.open('GET', url);
    // Make the request
    req.send();
}

function CRUDarrays(path, value, type){
    // delete the arrays at [path] from the odb, recreate them, and populate them with [value]
    // then check for integrity.

    var deletionURL, creationURL, updateURLs = [], fetchURL,
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
        else if(type[i]=='short')
            typeIndex = 5;
        else
            typeIndex = 9; // float, see mhttpd.js

        creationURL += '&odb' + i + '=' + path[i] + '&type' + i + '=' + typeIndex + '&arraylen' + i + '=' + value[i].length;
        if(typeIndex == 12)
            creationURL += '&strlen' + i + '=32';
    }

    //generate update urls:
    for(i=0; i<path.length; i++){
        updateURLs.push(['http://' + dataStore.host + '?cmd=jset&odb=' + path[i] + '[*]&value=' + value[i].join(), 'json'] );
    }

    //generate fetch/validation url
    fetchURL = 'http://' + dataStore.host + '?cmd=jcopy';
    for(i=0; i<path.length; i++){
        fetchURL += '&odb' + i + '=' + path[i];
    }
    fetchURL += '&encoding=json-p-nokeys&callback=validateCRUD';


    promiseScript(deletionURL).then(function(){ 
        promiseScript(creationURL).then(function(){
            Promise.all(updateURLs.map(promiseURL)).then(function(){
                validateCRUD = function(path, value, payload){
                    var i, key, tokenPath,
                        valid = true;

                    for(i=0; i<path.length; i++){
                        tokenPath = path[i].split('/');
                        key = tokenPath[tokenPath.length-1];
                        valid = valid && value[i].equals(payload[i][key]);
                    }

                    if(typeof CRUDintegrity == 'function'){
                        CRUDintegrity(valid)
                    }
                }.bind(null, path, value)

                promiseScript(fetchURL);
            })

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

    // Hack for TIGRESS
    // GRIF-16 modules registered on the general Network for TIGRESS or GRIF-WAGON need a 'b' in their url
    console.log(dataStore.hosts);
    for(i=0; i<dataStore.hosts.length; i++){
	var d = /\d+/;
	var num = dataStore.hosts[i].match(d);
	if(parseInt(num)>69){
	    console.log('found adc: '+dataStore.hosts[i]);	    
	    //	    str.replace(".triumf.ca", "b.triumf.ca");
	}
    }
    
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

function mungeCal(calibration){
    // munge GRIFFIN's .cal calibration file format into JSON, and return as a parsed object.

    var munged;

    //remove comment lines
    munged = calibration.replace(RegExp('//.*', 'g'), '');

    //remove keys with no value
    munged = munged.replace(RegExp('\\w+:\\s*[\n\f]', 'mg'), '')

    //put quotes around sub-key names:
    munged = munged.replace(RegExp('^((?!\").)*:', 'mg'), function(match, offset, string){
        return '"' + match.slice(0,match.length-1) + '":';
    })
    
    //put quotes around top-key names, follow with colon:
    munged = munged.replace(RegExp('\\w+\\s*{', 'mg'), function(match, offset, string){
        return '"' + match.replace(RegExp('\\s*{'), '":{');
    })

    //put [] around arrays
    munged = munged.replace(RegExp('[\\w.-]+\\s+([\\w.-]+)+(\\s+[\\w.-]+)*', 'mg'), function(match, offset, string){
        return '[' + match.replace(RegExp('\\s+' ,'g'), ',') + ']'
    })
    
    //quote ALL values
    munged = munged.replace(RegExp('[\\w.-]+(?=[\\s,\\]])', 'mg'), function(match, offset, string){
        return '"' + match + '"';
    })
    
    //remove quotes from number values - note JSON doesn't abide 0x hex notation
    munged = munged.replace(RegExp('\"[\\d.-]+\"', 'mg'), function(match, offset, string){
        return match.slice(1,match.length-1);
    })

    //remove blank lines
    munged = munged.replace(RegExp('^\\s*[\\r\\n]', 'gm'), '');
    munged = munged.trim();

    //comma at the end of every line...
    munged = munged.replace(RegExp('$','gm'), ',');

    //...except after {
    munged = munged.replace(RegExp('{,', 'g'), '{');

    //wrap the whole things as an object:
    munged = '{' + munged + '}';

    //...or after last key
    munged = munged.replace(RegExp(',[\\s]*}', 'g'), function(match, offset, string){
        return match.slice(1);
    })

    //whitespace after arrays
    munged = munged.replace(RegExp(']\\s*,', 'g'), '],');

    return JSON.parse(munged);
}

////////////////////////////
// tooltip management
////////////////////////////

function hideTooltip(){

    var tooltip = document.getElementById('tooltip');
    tooltip.setAttribute('style', 'display:none;');   
}

function moveTooltip(x, y, event){

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
        dataStore.lastCellClick.strokeStyle = dataStore.frameColor;
        dataStore.lastCellClick.lineWidth = dataStore.frameLineWidth;
        dataStore.lastCellClick.z = 1;
    }
    dataStore.lastCellClick = cell;
    cell.strokeStyle = '#FF0000';
    cell.lineWidth = 6;
    cell.z = 10;
    
    repaint();
}

//////////////////////////////////
// prototype modifications
//////////////////////////////////

// return unique subset of array containing only unique elements
// Warn if overriding existing method
if(Array.prototype.unique)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
Array.prototype.unique = function(){
    // thanks http://jszen.com/best-way-to-get-unique-values-of-an-array-in-javascript.7.html
    var i, j, include, n = {},r=[];

    for(i = 0; i < this.length; i++){
        if (!n[this[i]]){
            n[this[i]] = [this[i]]; 
            r.push(this[i]); 
        } else {
            include = true;
            for(j=0; j<n[this[i]].length; j++){
                if(n[this[i]][j] === this[i] || Object.is(this[i], n[this[i]][j])){
                    include = false;
                    break;
                }
            }

            if(include){
                n[this[i]].push(this[i]); 
                r.push(this[i]);     
            }
        }
    }
    return r;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "unique", {enumerable: false});


// equality method for arrays, thanks http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
