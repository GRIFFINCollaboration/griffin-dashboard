////////////////////
// setup
////////////////////

function registerODB(payload){
    //park the ODB responses in the dataStore, and run through initial parsing

    dataStore.ODB.DAQ = payload[0];
    dataStore.ODB.Equipment = payload[1];

    exploreCrates();
}

function exploreCrates(){
    // use dataStore.ODB.Equipment to decide how many crates there are, and what is plugged into each slot

    var i,
        keys = Object.keys(dataStore.ODB.Equipment)

    for(i=0; i<keys.length; i++){
        if(keys[i].slice(0,3) == 'HV-'){
            dataStore.HV.crates[keys[i]] = {};

            console.log(dataStore.ODB.Equipment[keys[i]].Settings.Devices.sy2527.DD.crateMap)
            console.log(unpackHVCrateMap(dataStore.ODB.Equipment[keys[i]].Settings.Devices.sy2527.DD.crateMap));
        }
    }
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