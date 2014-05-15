//status bar
(function(){  

    xtag.register('widget-HV', {
        extends: 'div',
        lifecycle: {
            created: function() {
                ////////////////
                //Members
                ////////////////
                this.width = this.offsetWidth;
                this.height = this.offsetHeight;
                this.driftTolerance = 0.05;
                this.temperatureMax = 40;
                this.color = {
                    'ok' : '#2ecc71',
                    'alarm' : '#c0392b',
                    'ramp' : '#f1c40f',
                    'trip' : '#3498db',
                    'off' : '#95a5a6'
                }

                //this.crateNames = ['Crate_0', 'Crate_1', 'Crate_2'];
                //slot occupancy, ie [4,4,4,4] == four 4-slot cards beside each other,
                //[1,0,1,0] == a one slot card, a space, another 1 slot card, and another empty slot, etc.
                /*
                this.cratePop = [
                    [4,4,4,4],
                    [1,0,1,0,0,0],
                    [4,0,4,0,4,0,0]
                ];
                this.cardNames = [
                    ['Slot 0', 'Slot 4', 'Slot 8', 'Slot 12'],
                    ['Slot 0', 'Slot 1', 'Slot 2', 'Slot 3', 'Slot 4', 'Slot 5'],
                    ['Slot 0', 'Slot 4', 'Slot 5', 'Slot 9', 'Slot 10', 'Slot 14', 'Slot 15']
                ]
                */
                this.cratePop = [];
                this.cardNames = [];
                this.crateNames = [];
                this.HVgrid = [];
            },
            inserted: function() {

                var equipmentURL = 'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-nokeys',
                    that = this;

                //get ODB equipment directory, parse number of crates & crate maps, and configure HV tool accordingly
                getJSON(equipmentURL, function(){
                    
                    var nCrates = 0,
                        i, j;

                    //bail out if data not returned yet
                    if(this.readyState != 4) return;
                    
                    //parse JSON
                    window.ODBEquipment = JSON.parse(this.responseText)[0];  //comes packed in a one-element array...

                    //start counting HV crates; frontends must be names HV-0, HV-1...
                    while(window.ODBEquipment['HV-'+nCrates]){
                        //name that crate:
                        that.crateNames.push('Crate_'+nCrates);

                        //parse crate map and stick appropriate array into HV widget
                        that.cratePop.push(unpackHVCrateMap(window.ODBEquipment['HV-'+nCrates].Settings.Devices.sy2527.DD.crateMap) );

                        //generate default card names by slot
                        that.cardNames.push( generateCardNames(that.cratePop[nCrates]) );
                        nCrates++;

                    }
                    
                    that.instantiateMonitors();
                    that.update();
                    
                });

                //let repopulate know that the HV grid would like to be updated every loop:
                if(!window.refreshTargets)
                    window.refreshTargets = [];
                window.refreshTargets[window.refreshTargets.length] = this;

            },
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {
            'MIDAS':{
                attribute: {} //this just needs to be declared
            }
        }, 
        methods: {

            'update': function(){
                var i;

                for(i=0; i<this.HVgrid.length; i++){
                    getJSON('http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/HV-'+i+'/&encoding=json-nokeys', this.mapData.bind(this, i) );
                }
                
            },

            'instantiateMonitors': function(){
                var deckWrap = document.createElement('div'),
                    nav = document.createElement('div'),
                    title = document.createElement('h1'),
                    crateLabel, crateRadio, xString, HVgrid, i, j, k, nSlots, colsPassed;

                ////////////////
                //DOM Setup
                ////////////////
                //crate navigation
                nav.setAttribute('id', this.id+'Nav');
                nav.setAttribute('class', 'HVcrateNav');
                this.appendChild(nav);
                title.innerHTML = 'HV Control';
                document.getElementById(this.id+'Nav').appendChild(title);
                for(i=0; i<this.crateNames.length; i++){
                    crateRadio = document.createElement('input')
                    crateRadio.setAttribute('id', this.id+'goto'+this.crateNames[i]);
                    crateRadio.setAttribute('class', 'crateRadio');
                    crateRadio.setAttribute('type', 'radio');
                    crateRadio.setAttribute('name', this.id+'Nav');
                    crateRadio.setAttribute('value', this.crateNames[i]);
                    crateRadio.onchange = this.changeView.bind(this, i);
                    if(i==0) crateRadio.setAttribute('checked', true);
                    document.getElementById(this.id+'Nav').appendChild(crateRadio);
                    crateLabel = document.createElement('label');
                    crateLabel.setAttribute('id', this.id+'goto'+this.crateNames[i]+'Label');
                    crateLabel.setAttribute('class', 'crateLabel');
                    crateLabel.setAttribute('for', this.id+'goto'+this.crateNames[i]);
                    document.getElementById(this.id+'Nav').appendChild(crateLabel);
                    document.getElementById(this.id+'goto'+this.crateNames[i]+'Label').innerHTML = this.crateNames[i];
                }

                //plot deck wrapper:
                deckWrap.setAttribute('id', this.id+'DeckWrap');
                this.appendChild(deckWrap);

                //declaring x-tags from within other x-tags needs special treatment via innerHTML; must build HTML string and set it.
                xString = '<x-deck id="' + this.id + 'Deck" selected-index=0>';
                for(i=0; i<this.crateNames.length; i++){
                    xString += '<x-card id="HVCard'+i+'"><x-waffle id="HVGrid'+i+'"></x-waffle></x-card>';
                }
                xString += '</x-deck>'
                deckWrap.innerHTML = xString;

                //configure HV grids
                for(i=0; i<this.crateNames.length; i++){
                    //rows and cols
                    this.HVgrid[i] = document.getElementById('HVGrid'+i);
                    nSlots = 0;

                    for(j=0; j<this.cratePop[i].length; j++){
                        nSlots += Math.max(this.cratePop[i][j], 1);
                    }
                    this.HVgrid[i].rows = 13;
                    this.HVgrid[i].cols = nSlots;

                    //master cells for 4-channel cards & card dividers & card names
                    colsPassed = 0
                    this.HVgrid[i].specials = {};
                    this.HVgrid[i].dividers = {};
                    this.HVgrid[i].colTitles = [];
                    this.HVgrid[i].TTdata = {};
                    this.HVgrid[i].clickCell = this.clickCell;
                    for(j=0; j<this.cratePop[i].length; j++){
                        //primary cells
                        if(this.cratePop[i][j] == 4){
                            this.HVgrid[i].specials['test'+i+j] = [0,colsPassed, 4,1];
                        }

                        //card titles
                        this.HVgrid[i].colTitles[j] = [];
                        this.HVgrid[i].colTitles[j][0] = this.cardNames[i][j];
                        this.HVgrid[i].colTitles[j][1] = colsPassed;
                        this.HVgrid[i].colTitles[j][2] = Math.max(1, this.cratePop[i][j]);

                        colsPassed += Math.max(1, this.cratePop[i][j]);

                        //dividers
                        if(colsPassed != this.HVgrid[i].cols)
                            this.HVgrid[i].dividers['divider'+j] = [colsPassed,0, colsPassed,this.HVgrid[i].rows];

                    }

                    //row titles
                    this.HVgrid[i].rowTitles = ['Primary',1,2,3,4,5,6,7,8,9,10,11,12];

                    //cell names
                    this.HVgrid[i].cellNames = [];
                    for(j=0; j<this.HVgrid[i].rows; j++){
                        this.HVgrid[i].cellNames[j] = []
                        for(k=0; k<this.HVgrid[i].cols; k++){
                            this.HVgrid[i].cellNames[j][k] = findChannelName(j, k, this.cratePop[i], window.ODBEquipment['HV-'+i].Settings.Names);
                        }
                    }

                    //legend
                    this.HVgrid[i].legend = [
                        [this.color.ok, 'All OK'],
                        [this.color.alarm, 'Alarm!'],
                        [this.color.ramp, 'Ramping'],
                        [this.color.trip, 'Trip / Disable'],
                        [this.color.off, 'Off']
                    ]

                }

            },

            'changeView': function(i){
                document.getElementById(this.id+'Deck').shuffleTo(i);
            },

            'mapData': function(crate, event){
                var data, i, demand, measured, color, channelStat, statMessage, current, currentLimit, temperature;

                if(event.explicitOriginalTarget.readyState != 4) return

                data = JSON.parse(event.explicitOriginalTarget.responseText)[0]

                for(i=0; i<data.Settings.Names.length; i++){
                    demand = data.Variables.Demand[i];
                    measured = data.Variables.Measured[i];
                    current = data.Variables.Current[i];
                    currentLimit = data.Settings['Current Limit'][i];
                    channelStat = data.Variables.ChStatus[i];
                    temperature = data.Variables.Temperature[i];
                    statMessage = 'All Ok\n';
                    color = this.color.ok;
                    this.HVgrid[crate].cells[data.Settings.Names[i]].setFillPriority('color');

                    //require demand and measured voltages be close enough, else throw alarm:
                    if(measured / demand < (1-this.driftTolerance) || measured / demand > (1+this.driftTolerance)){
                        color = this.color.alarm;
                        statMessage = 'VOLTAGE DRIFT\n'
                    }

                    //throw alarm if current over limit
                    if(current > currentLimit){
                        color = this.color.alarm;
                        statMessage = 'OVERCURRENT\n';
                    }

                    //enter alarm state if channel too hot
                    if(temperature > this.temperatureMax){
                        color = this.color.alarm;
                        statMessage = 'OVERHEAT\n';
                    }

                    //ramping supercedes voltage diff
                    if(channelStat == 3 || channelStat == 5){
                        color = this.color.ramp;
                        statMessage = 'Ramping\n';
                    }

                    //trips and disables supercede voltage diff
                    if(channelStat == 64){
                        color = this.color.trip;
                        statMessage = 'EXTERNAL TRIP\n'
                    } else if(channelStat == 256){
                        color = this.color.trip;
                        statMessage = 'EXTERNAL DISABLE\n'
                    } else if(channelStat == 512){
                        color = this.color.trip;
                        statMessage = 'INTERNAL TRIP\n'
                    }

                    //off supercedes everything
                    if(channelStat == 0){
                        color = this.color.off;
                        statMessage = 'Off\n';
                    }

                    //set whatever color we've settled on
                    this.HVgrid[crate].cells[data.Settings.Names[i]].setAttr('fill', color);

                    //set tooltip for this cell
                    this.HVgrid[crate].TTdata[data.Settings.Names[i]] = {
                        'Status' : statMessage,
                        'Demand' : demand + ' V',
                        'Measured' : measured + ' V',
                        'Current': ((current==-9999)? 'Not Reporting' : current+' mA' ),
                        'Temp' : data.Variables.Temperature[i] + ' C'
                    }                    
                }

                //repaint the grid
                this.HVgrid[crate].update();
            },

            'clickCell': function(cellName){
                if(cellName == 'EMPTY SLOT' || cellName == 'No Primary') return
                if(this.oldHighlight){
                    this.cells[this.oldHighlight].setAttr('stroke', 'black');
                    this.cells[this.oldHighlight].setAttr('strokeWidth', '2'); 
                    this.cells[this.oldHighlight].moveToBottom();                   
                }
                this.cells[cellName].setAttr('stroke', 'red');
                this.cells[cellName].setAttr('strokeWidth', '6');
                this.cells[cellName].moveToTop();
                this.oldHighlight = cellName;
                this.update();

            }
  
        }
    });

})();

//helpers
function unpackHVCrateMap(crateMap){
    var i, nSlots, cardArray = [];
    
    //32-bit integer encodes what size cards are in what slot; each slot is encoded in 2 bits, and slot 0 is the two highest (ie 31 and 30) bits.
    //00 == empty slot, 01 == 12chan card, 10 == 24chan card, 11 == 48chan card. Crate size is indicated by the lowest two bits;
    //10 == 6 slot crate, 11 == 12 slot crate, anything else == 16 slot crate.
    if( (crateMap & 3) == 2) nSlots = 6;
    else if( (crateMap & 3) == 3) nSlots = 12;
    else nSlots = 16;

    for(i=0; i<nSlots;){

        if( ((crateMap>>(30-2*i)) & 3) == 0 ){
            cardArray.push(0);
            i++;
        }
        else if( ((crateMap>>(30-2*i)) & 3) == 1 ){
            cardArray.push(1);
            i++;
        }
        else if( ((crateMap>>(30-2*i)) & 3) == 2 ){
            cardArray.push(2);
            i+=2;
        }
        else if( ((crateMap>>(30-2*i)) & 3) == 3 ){
            cardArray.push(4);
            i+=4;
        }
    }

    return cardArray;
}


function generateCardNames(cardArray){
    var nameArray = [],
        slotsPassed = 0,
        i;

    for(i=0; i<cardArray.length; i++){
        nameArray[i] = 'Slot ' + slotsPassed;
        slotsPassed += Math.max(1, cardArray[i]);
    }

    return nameArray;

}

/*
function generateCardNames(cardArray, equipmentTree){
    var nameArray = [],
        slotsPassed = 0,
        i;

    for(i=0; i<cardArray.length; i++){
        if(cardArray[i] == 0)
            nameArray[i] = 'Empty';
        else
            nameArray[i] = equipmentTree.Settings.Devices.sy2527['Slot '+slotsPassed].Description

        slotsPassed += Math.max(1, cardArray[i]);
    }

    return nameArray;

}
*/
//find the name of the channel at row, col in the grid from the ODB
function findChannelName(row, col, cardArray, nameArray){
    var channelNames = [],
        i,
        stringified = JSON.stringify(nameArray),
        nameCopy = JSON.parse(stringified);

    //pad the ODB array with blanks so that it's packed as (row0 col0), (row1 col0), ...., (row last, col last)
    for(i=0; i<cardArray.length; i++){
        if(cardArray[i] == 1)
            channelNames = channelNames.concat(['No Primary'].concat(nameCopy.splice(0,12)));
        else if(cardArray[i] == 2){
            channelNames = channelNames.concat(['No Primary'].concat(nameCopy.splice(0,12)));
            channelNames = channelNames.concat(['No Primary'].concat(nameCopy.splice(0,12)));
        } else if(cardArray[i] == 4)
            channelNames = channelNames.concat(nameCopy.splice(0,49));
        else if(cardArray[i] == 0)
            channelNames = channelNames.concat(['EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT', 'EMPTY SLOT']);
    }

    return channelNames[col*13 + row];

}