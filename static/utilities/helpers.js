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

function XHR(URL, callback, mime, noCredentials){
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
        if(this.readyState != 4) return;
        callback(this.responseText);
    }

    if(!noCredentials)
        xmlhttp.withCredentials = true;
    if(mime)
        xmlhttp.overrideMimeType(mime);
    xmlhttp.open('GET', URL);
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












/*
//build the MSC table from the encoding in the ODB at /DAQ
function buildMSC(DAQresponse){
    var DAQ = JSON.parse(DAQresponse),
        digiSequence = JSON.parse(JSON.stringify(DAQ.nodes.digitizers)),
        MSCaddr = [], channelList = [],
        i,j;

    //construct the ordered list of MSC addresses
    for(i=0; i<digiSequence.length; i++){
        digiSequence[i] = JSON.parse(digiSequence[i]);
        digiSequence[i].MSC = parseInt(digiSequence[i].MSC, 16);
    }

    digiSequence.sort(function(a, b){
        return a.MSC > b.MSC
    })

    for(i=0; i<digiSequence.length; i++){
        for(j=0; j<digiSequence[i].channels; j++){
            MSCaddr.push(digiSequence[i].MSC + j);
        }
    }

    //construct list of channels
    console.log(canonicalNames('GRIFFIN'))
}

//generate an array of the channel names of <detector>, in the cannonical order
function canonicalNames(detector){
    var names = [],
        i,j,k,
        index,
        colors = ['B', 'G', 'R', 'W'];

    if(detector === 'GRIFFIN'){
        for(i=1; i<17; i++){
            index = (i<10) ? '0'+i : i;
            for(j=0; j<4; j++){
                names.push('GRG' + index + colors[j] + 'N00A');
                names.push('GRG' + index + colors[j] + 'N00B');
            }
            for(j=0; j<4; j++){
                for(k=1; k<6; k++)
                    names.push('GRS' + index + colors[j] + 'N0' + k + 'X');
            }
        }
    }

    return names;
}
*/




