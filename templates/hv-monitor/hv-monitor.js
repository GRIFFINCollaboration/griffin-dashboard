////////////////////
// setup
////////////////////

function registerODB(payload){
    //park the ODB responses in the dataStore, and run through initial parsing

    dataStore.ODB.DAQ = payload[0];
    dataStore.ODB.Equipment = payload[1];

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
    // set up the kinetic context for drawing, and ui to manipulate it.

    var i, option,
        keys = Object.keys(dataStore.HV.crates),
        picker = document.getElementById('HVCratePicker'),
        wrap = document.getElementById('HVMonitor')

    // set up a kinetic stage
    dataStore.HV.stage = new Kinetic.Stage({
        container: 'HVDisplay',
        width: wrap.offsetWidth,
        height: wrap.offsetWidth*4/3
    });
    dataStore.HV.crateLayers = {};
    dataStore.HV.cells = {};

    for(i=0; i<keys.length; i++){
        // add an option to the view picker
        option = document.createElement('option');
        option.setAttribute('value', keys[i]);
        option.innerHTML = keys[i];
        picker.appendChild(option);

        // add a layer to the display stage for each crate; start out invisible
        dataStore.HV.crateLayers[keys[i]] = new Kinetic.Layer();
        dataStore.HV.stage.add(dataStore.HV.crateLayers[keys[i]]);
        dataStore.HV.crateLayers[keys[i]].visible(false);

        // generate the cells for this layer, and add them
        setupGridLayer(keys[i], dataStore.HV.crates[keys[i]].content);  
    }

    // start display out on first layer
    dataStore.HV.currentCrate = selected('HVCratePicker');
}

//////////////////
// drawing
//////////////////

function setupGridLayer(crateName, crateContent){
    // set up the kinetic objects to represent an HV crate

    var i, j, cells, cardSize, ODBindex,
        channelCount = 0,
        wrap = document.getElementById('HVMonitor'),
        marginLeft = wrap.offsetWidth*0.1,
        marginTop = wrap.offsetHeight*0.05,
        scale = (wrap.offsetWidth - 2*marginLeft) / 16,
        x = marginLeft,
        y = marginTop

    dataStore.HV.cells[crateName] = [];

    for(i=0; i<crateContent.length; i+=cardSize/12){
        //generate cells, associate corresponding index in Settings.Names with each cell
        ODBindex = []; 
        cardSize = Math.max(12, crateContent[i]);
        if(cardSize == 48){
            ODBindex.push(channelCount);
            channelCount++;
        } else if(crateContent[i] == 0){
            ODBindex.push('Empty Slot'); 
        } else {
            ODBindex.push('No Primary');
        }
        for(j=0; j<cardSize; j++){
            if(crateContent[i] == 0){
                ODBindex.push('Empty Slot');
            } else {
                ODBindex.push(channelCount);
                channelCount++;
            }
        }
        cells = setupCard(cardSize, x, y, scale, ODBindex);

        //step along horizontally for next card
        x += scale * cardSize/12;

        //add to layer
        for(j=0; j<cells.length; j++){
            dataStore.HV.crateLayers[crateName].add(cells[j]);
        }

        //keep track of kinetic cells on the dataStore for future updates
        dataStore.HV.cells[i] = cells;
    }

}

function setupCard(cardSize, x0, y0, scale, ODBindex){
    // create the kinetic objects representing a card with <cardSize> channels, top left corner at (x0,y0).
    // return an array of these objects.

    var i, primary, cell,
        x = x0,
        y = y0,
        cells = [];

    // primary
    primary = new Kinetic.Rect({
        x: x,
        y: y,
        width: scale*(cardSize/12),
        height: scale,
        fill: 'blue',
        stroke: dataStore.frameColor,
        strokeWidth: 2
    });

    cells.push(primary);

    for(i=0; i<cardSize; i++){
        //columns of 12 below primary
        x = x0 + scale*(Math.floor(i/12));
        y = y0 + scale*(1 + i%12);

        cell = new Kinetic.Rect({
            x: x,
            y: y,
            width: scale,
            height: scale,
            fill: 'blue',
            stroke: dataStore.frameColor,
            strokeWidth: 2
        });
        cells.push(cell);
    }

    //set up the tooltip listeners & onclick listeners:
    for(i=0; i<cells.length; i++){
        cells[i].on('mouseover', writeTooltip.bind(null, ODBindex[i]));
        cells[i].on('mousemove', moveTooltip);
        cells[i].on('mouseout',  hideTooltip);
        cells[i].on('click', clickCell.bind(cells[i], ODBindex[i]) );
    }

    return cells;
}

function repaint(){
    // redraw the display

    dataStore.HV.crateLayers[dataStore.HV.currentCrate].draw();
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

    dataStore.HV.crateLayers[dataStore.HV.currentCrate].visible(false);
    dataStore.HV.currentCrate = selected('HVCratePicker');
    dataStore.HV.crateLayers[dataStore.HV.currentCrate].visible(true);
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