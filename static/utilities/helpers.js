//return the value of a selected option from a <select> element, or the innerHTML instead if fetchText is set.
function selected(selectID, fetchText){
    var select = document.getElementById(selectID),
        value = select.options[select.selectedIndex].value;

        if(fetchText)
            value = select.options[select.selectedIndex].innerHTML;

    return value;
}

//base 10 log
Math.log10 = function(x){
	return Math.log(x) / Math.log(10);
}

//returns a if it isn't undefined or null, returns b otherwise
function canHas(a, b){

	if(a === undefined || a === null) return b;

	return a;
}

//return a KineticJS object in the shape of an arrow
function kineticArrow(fromx, fromy, tox, toy){
    var headlen = 20;   // how long you want the head of the arrow to be, you could calculate this as a fraction of the distance between the points as well.
    var angle = Math.atan2(toy-fromy,tox-fromx);

    line = new Kinetic.Line({
        points: [tox,toy, tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6), tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6), tox,toy, fromx,fromy],
        stroke: '#999999',
        fill: '#999999',
        closed: true
    });

    return line;
}

//find the length of longest word in a string
function longestWord(phrase){
    var words = phrase.split(' '),
        i;

    for(i=0; i<words.length; i++){
        words[i] = words[i].length;
    }

    words.sort(function(a, b){
        return b - a;
    });

    return words[0];

}

function XHR(URL, callback, mime, noCredentials, isDataview){
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
        var dv;

        if(this.readyState != 4) return;
        if(isDataview){
            dv = new DataView(this.response);
            callback(dv);
        } else {
            callback(this.responseText);
        }
    }

    if(!noCredentials)
        xmlhttp.withCredentials = true;
    if(mime)
        xmlhttp.overrideMimeType(mime);

    xmlhttp.open('GET', URL);

    if(isDataview)
        xmlhttp.responseType = "arraybuffer";

    xmlhttp.send();   
}

function squishFont(string, maxWidth){
    while(string.getTextWidth() > maxWidth){
        string.setAttr('fontSize', string.getAttr('fontSize') - 1);
    }
}

function scrubNumber(value){
    var scrubbed;

    if((!value && value!=0) || value==0xDEADBEEF ) 
        scrubbed = 'Not Reporting';                    
    else
        scrubbed = parseFloat(value).toFixed();    

    return scrubbed;
}

//get query string parameter <name>
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//build an array of radio buttons
function radioArray(parentElt, labelText, values, groupName){
    var i,
        radio, label;

    for(i=0; i<labelText.length; i++){
        radio = document.createElement('input');
        radio.setAttribute('class', 'stdin');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('id', groupName + i);
        radio.setAttribute('name', groupName);
        radio.setAttribute('value', values[i]);
        parentElt.appendChild(radio);

        label = document.createElement('label');
        label.setAttribute('for', groupName + i);
        label.setAttribute('id', groupName+i+'Label');
        label.innerHTML = labelText[i];
        parentElt.appendChild(label);
    }
}

//function to make a reasonable decision on how many decimal places to show, whether to to use 
//sci. notation on an axis tick mark, where <min> and <max> are the axis minimum and maximum,
//<nTicks> is the number of tickmarks on the axis, and we are returning the label for the <n>th
//tick mark
function generateTickLabel(min, max, nTicks, n){
    var range = max - min,
        smallestPrecision = range / (nTicks-1),
        tickValue = min + (max-min)/(nTicks-1)*n;

    //tickmark needs to be labeled to enough precision to show the difference between subsequent ticks:
    smallestPrecision = Math.floor(Math.log(smallestPrecision) / Math.log(10));


    if(smallestPrecision < 0)
        return tickValue.toFixed(-smallestPrecision)

    tickValue = Math.floor(tickValue/Math.pow(10, smallestPrecision)) * Math.pow(10, smallestPrecision);
    return tickValue+'';

}

//set a bunch of attributes on a dom element:
function setAttributes(DOMelt, tribs){
    var key, newElt;

    for(key in tribs){
        DOMelt.setAttribute(key, tribs[key])
    }
}

//determine the hostname of the digitizer into which <channel> is plugged, given the <DAQ> table from the ODB
function findHost(channel, DAQ){
    var host;

    host = DAQ.MSC.chan.indexOf(channel);  //table index of channel
    if(host !=-1){
        host = DAQ.MSC.MSC[host]; //MSC address of channel
        host = (host & 0xF000) >> 12; //collector channel
        host = 'collector0x'+host.toString(16);
        host = DAQ.hosts[host].host; //haha
    } else
        host = false;

    return host;
}

//determine the ADC index into which <channel> is plugged, given the <DAQ> table from the ODB
function findADC(channel, DAQ){
    var ADC;

    ADC = DAQ.MSC.chan.indexOf(channel);  //table index of channel
    if(ADC !=-1){
        ADC = DAQ.MSC.MSC[ADC]; //MSC address of channel
        ADC = ADC & 0xFF; //ADC index
    } else
        ADC = false;

    return ADC;
}

//expand and collapse our diy collapsible divs
function toggleSection(id){
    var section = document.getElementById(id)

    if(section.className == 'collapse'){
        section.className = 'expand'
        this.innerHTML = String.fromCharCode(0x25BC) + this.innerHTML.slice(this.innerHTML.indexOf(' '));
    }
    else{
        section.className = 'collapse'
        this.innerHTML = String.fromCharCode(0x25B6) + this.innerHTML.slice(this.innerHTML.indexOf(' '));   
    }
}
