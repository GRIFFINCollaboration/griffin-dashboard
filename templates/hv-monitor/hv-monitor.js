////////////////////
// setup
////////////////////

//post-heartbeat callback:
function dataUpdate(){                    
    updateRunStatus();
    repaint();
}

function registerODB(payload){
    //park the ODB responses in the dataStore, and run through initial parsing

    dataStore.ODB.DAQ = payload[0];
    dataStore.ODB.Equipment = payload[1];

    detectDetectors();
    exploreCrates();
    setupDisplay();
    updateView();
}

function exploreCrates(){
    // use dataStore.ODB.Equipment to decide how many crates there are, and what is plugged into each slot

    var i,
        keys = Object.keys(dataStore.ODB.Equipment)

    for(i=0; i<keys.length; i++){
        if(keys[i].slice(0,3) == 'HV-'){
            dataStore.HV.crates[keys[i]] = {
                content: unpackHVCrateMap(dataStore.ODB.Equipment[keys[i]].Settings.Devices.sy2527.DD.crateMap),
                data: dataStore.ODB.Equipment[keys[i]]
            };
        }
    }
}

function setupDisplay(){
    // set up the context for drawing, and ui to manipulate it.

    var i, option,
        keys = Object.keys(dataStore.HV.crates),
        picker = document.getElementById('HVCratePicker'),
        wrap = document.getElementById('HVMonitor')

    // drawing parameters
    dataStore.HV.marginLeft = wrap.offsetWidth*0.1;
    dataStore.HV.scale = (wrap.offsetWidth - 2*dataStore.HV.marginLeft) / 16;
    dataStore.HV.marginTop = 1.5*dataStore.HV.scale;
    dataStore.HV.cardGutter = 4
    dataStore.HV.colors = {
        'ok': '#5CB85C',
        'alarm': '#D9534F',
        'extTrip': '#5BC0DE',
        'off': '#FCFCFC',
        'ramping': '#F0AD4E'
    };

    // set up a drawing stage
    dataStore.HV.stage = new quickdraw(wrap.offsetWidth, dataStore.HV.marginTop + 16*dataStore.HV.scale);
    document.getElementById('HVDisplay').appendChild(dataStore.HV.stage.canvas);

    dataStore.HV.crateLayers = {};
    dataStore.HV.cells = {'all': []};

    for(i=0; i<keys.length; i++){
        // add an option to the view picker
        option = document.createElement('option');
        option.setAttribute('value', keys[i]);
        option.innerHTML = keys[i];
        picker.appendChild(option);

        // add a layer to the display stage for each crate; start out invisible
        dataStore.HV.crateLayers[keys[i]] = new qdlayer('HVLayer'+i);
        dataStore.HV.stage.add(dataStore.HV.crateLayers[keys[i]]);
        dataStore.HV.crateLayers[keys[i]].display = false;

        // generate the cells for this layer, and add them
        setupGridLayer(keys[i], dataStore.HV.crates[keys[i]].content);  
    }

    // start display out on first layer
    dataStore.HV.currentCrate = selected('HVCratePicker');

    //set up error pattern
    dataStore.errorPattern = document.getElementById('errorPattern');
    assignErrorPattern = function(){
        var i;

        for(i=0; i<dataStore.HV.cells.all.length; i++){
            dataStore.HV.cells.all[i].fillPatternImage = dataStore.errorPattern;
            dataStore.HV.cells.all[i].fillPriority = 'pattern';
        }
    }
    if(dataStore.errorPattern.complete){
        assignErrorPattern();
    } else {
        dataStore.errorPattern.addEventListener('load', assignErrorPattern);
    }
}

//////////////////
// drawing
//////////////////

function setupGridLayer(crateName, crateContent){
    // set up the objects to represent an HV crate

    var i, j, x, y, cells, cardSize, ODBindexes,
        channelCount = 0;

    dataStore.HV.cells[crateName] = [];

    x = dataStore.HV.marginLeft;
    y = dataStore.HV.marginTop

    for(i=0; i<crateContent.length; i+=cardSize/12){
        //generate cells, associate corresponding index in Settings.Names with each cell
        ODBindexes = []; 
        cardSize = Math.max(12, crateContent[i]);
        if(cardSize == 48){ // add primary
            ODBindexes.push(channelCount);
            channelCount++;
        } 
        for(j=0; j<cardSize; j++){
            if(crateContent[i] == 0){
                ODBindexes.push('Empty Slot');
            } else {
                ODBindexes.push(channelCount);
                channelCount++;
            }
        }
        cells = setupCard(cardSize, x, y, dataStore.HV.scale, ODBindexes);

        //step along horizontally for next card
        x += dataStore.HV.scale * cardSize/12 + dataStore.HV.cardGutter;

        //add to layer
        for(j=0; j<cells.length; j++){
            dataStore.HV.crateLayers[crateName].add(cells[j]);
        }

        //keep track of image cells for reporting channels on the dataStore for future updates
        if(crateContent[i] != 0)
            dataStore.HV.cells[crateName] = dataStore.HV.cells[crateName].concat(cells);

        //and again for all cells (ie for applying error pattern on load)
        dataStore.HV.cells.all = dataStore.HV.cells.all.concat(cells);
    }

    windowDressing(dataStore.HV.crateLayers[crateName], crateContent);

}

function setupCard(cardSize, x0, y0, scale, ODBindexes){
    // create the objects representing a card with <cardSize> channels, top left corner at (x0,y0).
    // return an array of these objects.

    var i, primary, cell, poly, width, height,
        x = x0,
        y = y0,
        cells = [];

    // primary
    if(cardSize == 48){
        width = dataStore.HV.scale*(cardSize/12);
        height = dataStore.HV.scale
        poly = generatePath(
            [0,0, width,0, width,height, 0,height],
            x, y
        ),
        primary = new qdshape(poly, {
            id: '',
            fillStyle: '#000000',
            strokeStyle: dataStore.frameColor,
            lineWidth: dataStore.frameLineWidth,
            z: 1,
        });
        cells.push(primary);
    }

    for(i=0; i<cardSize; i++){
        //columns of 12 below primary
        x = x0 + dataStore.HV.scale*(Math.floor(i/12));
        y = y0 + dataStore.HV.scale*(1 + i%12);
        width = dataStore.HV.scale;
        height = dataStore.HV.scale;
        poly = generatePath(
            [0,0, width,0, width,height, 0,height],
            x, y
        ),
        cell = new qdshape(poly, {
            id: '',
            fillStyle: '#000000',
            strokeStyle: dataStore.frameColor,
            lineWidth: dataStore.frameLineWidth,
            z: 1,
        });
        cells.push(cell);
    }

    //set up the tooltip listeners & onclick listeners:
    for(i=0; i<cells.length; i++){
        cells[i].mouseover = writeTooltip.bind(null, ODBindexes[i]);
        cells[i].mousemove = moveTooltip;
        cells[i].mouseout = hideTooltip;
        cells[i].click = clickCell.bind(cells[i], ODBindexes[i]);
    }

    return cells;
}

function recolorCells(){
    // recolor cells based on whatever is in the dataStore

    var i, status, color;

    for(i=0; i<dataStore.HV.cells[dataStore.HV.currentCrate].length; i++){
        status = parseChStatus(dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.ChStatus[i]);

        if(status.indexOf('EXTERNAL DISABLE') != -1 || status.indexOf('EXTERNAL TRIP') != -1)
            color = dataStore.HV.colors.extTrip;
        else if(status.indexOf('Bias Off') != -1)
            color = dataStore.HV.colors.off;
        else if(status.indexOf('Ramping Up') != -1 || status.indexOf('Ramping Down') != -1)
            color = dataStore.HV.colors.ramping;
        else if(dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.ChStatus[i] == 1)
            color = dataStore.HV.colors.ok;
        else
            color = dataStore.HV.colors.alarm;

        dataStore.HV.cells[dataStore.HV.currentCrate][i].fillPriority = 'color';
        dataStore.HV.cells[dataStore.HV.currentCrate][i].fillStyle = color;
    }
}

function repaint(){
    // redraw the display

    recolorCells();
    dataStore.HV.stage.render();
}

function windowDressing(layer, crateContent){
    // draw all the window dressing on the provided layer: labels, legend, annotations etc.

    var i, text, cell, poly, x, y, width, height,
        baseFontSize = 14,
        rowLabels = ['Primary', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        columnLabels,
        totalColumns = crateContent.length,
        currentSlot = 0,
        currentCardLeft = dataStore.HV.marginLeft,
        currentCardWidth = null,
        legendLeft = dataStore.HV.marginLeft,
        legendLabels = {
            'ok': 'OK',
            'alarm': 'Alarm',
            'extTrip': 'Trip / Disable',
            'off': 'Off',
            'ramping': 'Ramping'
        }

    // row labels
    for(i=0; i<rowLabels.length; i++){
        text = new qdtext(rowLabels[i], {
            x: 0,
            y: dataStore.HV.marginTop + (i+0.75)*dataStore.HV.scale - baseFontSize/2,
            fontSize: baseFontSize,
            typeface: 'Arial',
            fillStyle: dataStore.frameTextColor
        });
        layer.add(text);
        text.x = dataStore.HV.marginLeft - baseFontSize - text.getTextMetric().width;
    }

    // slot labels
    for(i=0; i<crateContent.length; i+=Math.max(1,crateContent[i]/12)){
        currentCardWidth = Math.max(1, crateContent[i]/12)*dataStore.HV.scale;
        text = new qdtext(i, {
            x: 0,
            y: dataStore.HV.marginTop-baseFontSize/2,
            fontSize: baseFontSize,
            typeface: 'Arial',
            fillStyle: dataStore.frameTextColor
        });
        layer.add(text);
        text.x = currentCardLeft + currentCardWidth/2 - text.getTextMetric().width/2;   
        currentCardLeft += currentCardWidth + dataStore.HV.cardGutter;
    }

    text = new qdtext('Slot', {
        x: 0,
        y: 1.5*baseFontSize,
        fontSize: 1.5*baseFontSize,
        typeface: 'Arial',
        fillStyle: dataStore.frameTextColor
    });
    layer.add(text)
    text.x = dataStore.HV.marginLeft + totalColumns*dataStore.HV.scale/2 - text.getTextMetric().width/2;

    // legend
    for(state in dataStore.HV.colors){
        x = legendLeft;
        y = dataStore.HV.marginTop + 14*dataStore.HV.scale;
        width = dataStore.HV.scale;
        height = dataStore.HV.scale;
        poly = generatePath(
            [0,0, width,0, width,height, 0,height],
            x,y
        ),
        cell = new qdshape(poly, {
            id: state+'Legend',
            fillStyle: dataStore.HV.colors[state],
            strokeStyle: dataStore.frameColor,
            lineWidth: dataStore.frameLineWidth,
            z: 1
        });
        layer.add(cell);
        legendLeft += dataStore.HV.scale + baseFontSize/2;

        text = new qdtext(legendLabels[state], {
            x: legendLeft,
            y: dataStore.HV.marginTop + 14*dataStore.HV.scale + 2*baseFontSize,
            fontSize: baseFontSize,
            typeface: 'Arial',
            fillStyle: dataStore.frameTextColor
        });
        layer.add(text)
        legendLeft += text.getTextMetric().width + 3*baseFontSize;

    }

}

//////////////////////////
// tooltip management
//////////////////////////

function writeTooltip(index){

    var tooltip = document.getElementById('tooltip'),
        text = '',
        title =  nameFromIndex(index),
        chStatus, i;

    text += '<span class="highlightText">' + title + '</span><br>';

    if(!isNaN(index)){
        text += '<ul class="list-unstyled">'
        chStatus = parseChStatus(dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.ChStatus[index])
        text += '<li>Status:<ul>'
        for(i=0; i<chStatus.length; i++){
            text += '<li>' + chStatus[i] + '</li>'
        }
        text += '</ul></li>'
        text += '<li>Demand: ' + dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.Demand[index] + ' V</li>'
        text += '<li>Measured: ' + dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.Measured[index] + ' V</li>'
        text += '<li>Current: ' + dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.Current[index] + ' uA</li>'
        text += '<li>Temp: ' + dataStore.ODB.Equipment[dataStore.HV.currentCrate].Variables.Temperature[index] + ' C</li>'
        text += '</ul>'
    }

    tooltip.innerHTML = text;
}

////////////////////////
// cell clicks
////////////////////////

function clickCell(ODBindex){
    // response to clicking on <cellName>

    var name = nameFromIndex(ODBindex),
        evt;

    // let everyone know this cell was clicked
    evt = new CustomEvent('postHV', 
        {
            'detail': {
                'channel' : name,
                'crate': dataStore.HV.currentCrate
            } 
        }
    );
    document.getElementById(dataStore.HVClickListeners[0]).dispatchEvent(evt);

    // highlight the cell
    highlightCell(this);
}

////////////////////////////
// parsing & helpers
////////////////////////////

function unpackHVCrateMap(crateMap){
    //32-bit integer crateMap encodes what size cards are in what slot; each slot is encoded in 2 bits, and slot 0 is the two highest (ie 31 and 30) bits.
    //00 == empty slot, 01 == 12chan card, 10 == 24chan card, 11 == 48chan card. Crate size is indicated by the lowest two bits;
    //10 == 6 slot crate, 11 == 12 slot crate, anything else == 16 slot crate.

    var i, slotCode;
        nSlots = crateMap & 3,
        crate = [],
        sizeEncoding = [0,12,24,48];

    nSlots = ((nSlots == 2) ? 6 : ((nSlots == 3) ? 12 : 16));

    for(i=0; i<nSlots; i++){
        slotCode = (crateMap & (3 << (30-2*i))) >>> (30-2*i);
        crate[i] = sizeEncoding[slotCode];
    }

    return crate;
}  

function updateView(){
    // change the crate on display via the crate picker

    dataStore.HV.crateLayers[dataStore.HV.currentCrate].display = false;
    dataStore.HV.currentCrate = selected('HVCratePicker');
    dataStore.HV.crateLayers[dataStore.HV.currentCrate].display = true;
    repaint()
}

function nameFromIndex(indexString){
    // recreate the channel name from an index, where the index might not actually be a number
    // pulls name from array corresponding to the currently displayed crate

    var name; 

    index = parseInt(indexString, 10);

    if(!isNaN(index)){
        name = dataStore.HV.crates[dataStore.HV.currentCrate].data.Settings.Names[index]
    } else {
        name = indexString;
    }

    return name;

}

function sortODBEquipment(payload){
    // take the ODB equipment directory and populate the HV info with it.

    dataStore.ODB.Equipment = payload[0];

    // update hv sidebar if present
    if(dataStore.activeHVsidebar)
        populateHVsidebar(dataStore.activeHVsidebar);
}

function parseChStatus(chStatus){
    var status = [],
        remaining = chStatus;

        if(remaining >= 2048){
            status.push('UNPLUGGED');
            remaining -= 2048;
        }

        if(remaining >= 1024){
            status.push('CALIBRATION ERROR');
            remaining -= 1024;
        }

        if(remaining >= 512){
            status.push('INTERNAL TRIP');
            remaining -= 512;
        }

        if(remaining >= 256){
            status.push('EXTERNAL DISABLE');
            remaining -= 256;
        }

        if(remaining >= 128){
            status.push('HV MAX');
            remaining -= 128;
        }

        if(remaining >= 64){
            status.push('EXTERNAL TRIP');
            remaining -= 64;
        }

        if(remaining >= 32){
            status.push('UNDERVOLTAGE');
            remaining -= 32;
        }

        if(remaining >= 16){
            status.push('OVERVOLTAGE');
            remaining -= 16;
        }

        if(remaining >= 8){
            status.push('OVERCURRENT');
            remaining -= 8;
        }

        if(remaining >= 4){
            status.push('Ramping Down');
            remaining -= 4;
        }

        if(remaining >= 2){
            status.push('Ramping Up');
            remaining -= 2;
        }

        if(remaining >= 1){
            status.push('Bias On');
        } else{
            status.push('Bias Off');
        }

        return status;
}