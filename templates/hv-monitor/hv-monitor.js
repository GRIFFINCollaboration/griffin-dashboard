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
                content: unpackHVCrateMap(dataStore.ODB.Equipment[keys[i]].Settings.Devices.sy2527.DD.crateMap)
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

    var i, j, cells, cardSize,
        wrap = document.getElementById('HVMonitor'),
        marginLeft = wrap.offsetWidth*0.1,
        marginTop = wrap.offsetHeight*0.05,
        scale = (wrap.offsetWidth - 2*marginLeft) / 16,
        x = marginLeft,
        y = marginTop

    dataStore.HV.cells[crateName] = [];

    for(i=0; i<crateContent.length; i+=cardSize/12){
        //generate cells
        cardSize = Math.max(12, crateContent[i]);
        cells = setupCard(cardSize, x, y, scale);

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

function setupCard(cardSize, x0, y0, scale){
    // create the kinetic objects representing a card with <cardSize> channels, top left corner at (x0,y0).
    // return an array of these objects, primary last.

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

    cells.push(primary);
    return cells;
}

function repaint(){
    // redraw the display

    dataStore.HV.crateLayers[dataStore.HV.currentCrate].draw();
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