//HV widget
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
                this.currentCrate = 0;

                this.cratePop = [];
                this.cardNames = [];
                this.crateNames = [];
                this.HVgrid = [];
            },
            inserted: function() {

                var equipmentURL = 'http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-nokeys';

                //get ODB equipment directory, parse number of crates & crate maps, and configure HV tool accordingly
                getJSON(equipmentURL, function(responseText){
                    
                    var nCrates = 0,
                        i, j;
                    
                    //parse JSON
                    window.ODBEquipment = JSON.parse(responseText)[0];  //comes packed in a one-element array...

                    //start counting HV crates; frontends must be names HV-0, HV-1...
                    while(window.ODBEquipment['HV-'+nCrates]){
                        //name that crate:
                        this.crateNames.push('Crate_'+nCrates);

                        //parse crate map and stick appropriate array into HV widget
                        this.cratePop.push(this.unpackHVCrateMap(window.ODBEquipment['HV-'+nCrates].Settings.Devices.sy2527) );

                        //generate default card names by slot
                        this.cardNames.push( this.generateCardNames(this.cratePop[nCrates]) );
                        nCrates++;

                    }
console.log(this.cratePop)
                    this.instantiateMonitors();
                    this.update();
                    
                }.bind(this));

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
            'changeView': function(i){
                document.getElementById(this.id+'Deck').shuffleTo(i);
                this.currentCrate = i;
            },

            'clickCell': function(cellName){
                var evt, i,
                    controlSidebars = document.getElementsByTagName('widget-HVcontrol')

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

                if(controlSidebars){
                    for(i=0; i<controlSidebars.length; i++){
                        evt = new CustomEvent('postHVchan', {'detail': {   
                            'channel' : cellName, 
                            'ODBblob': window.ODBEquipment['HV-'+this.id.slice(6)], 
                            'crateIndex': this.id.slice(6)
                        } });
                        controlSidebars[i].dispatchEvent(evt);
                    }
                }

            },

            //find the name of the channel at row, col in the grid from the ODB
            'findChannelName': function(row, col, cardArray, nameArray){
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

            },

            'generateCardNames' : function(cardArray){
                var nameArray = [],
                    slotsPassed = 0,
                    i;

                for(i=0; i<cardArray.length; i++){
                    nameArray[i] = 'Slot ' + slotsPassed;
                    slotsPassed += Math.max(1, cardArray[i]);
                }

                return nameArray;

            },

            'instantiateMonitors': function(){
                var deckWrap = document.createElement('div'),
                    nav = document.createElement('div'),
                    title = document.createElement('h1'),
                    crateLabel, crateRadio, xString, HVgrid, i, j, k, nSlots, colsPassed, crate, channel;

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
                xtag.innerHTML(deckWrap, xString);

                //configure HV grids
                for(i=0; i<this.crateNames.length; i++){
                    this.HVgrid[i] = document.getElementById('HVGrid'+i);

                    //rows and cols
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
                            this.HVgrid[i].cellNames[j][k] = this.findChannelName(j, k, this.cratePop[i], window.ODBEquipment['HV-'+i].Settings.Names);
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

                    this.HVgrid[i].instantiateCells();

                }

                //now that the display is built, navigate to the channel indicated by the query string if possible:
                crate = getParameterByName('crate');
                channel = getParameterByName('channel');
                if(crate && channel){
                    this.clickCell.bind(this.HVgrid[crate], channel)();
                }


            },

            'mapData': function(crate, responseText){
                var data, i, j, demand, measured, color, channelStat, statMessage, current, currentLimit, temperature, statString,
                    isVoltageDrift, isRamping, isTripped, isOverheat, isAlarmed;

                data = JSON.parse(responseText)[0];

                for(i=0; i<data.Settings.Names.length; i++){
                    demand = data.Variables.Demand[i];
                    measured = data.Variables.Measured[i];
                    current = data.Variables.Current[i];
                    currentLimit = data.Settings['Current Limit'][i];
                    channelStat = parseInt(data.Variables.ChStatus[i], 16);
                    temperature = data.Variables.Temperature[i];
                    statMessage = parseChStatus(channelStat);
                    color = this.color.ok;

                    this.HVgrid[crate].cells[data.Settings.Names[i]].setFillPriority('color');

                    isVoltageDrift = measured / demand < (1-this.driftTolerance) || measured / demand > (1+this.driftTolerance);
                    isRamping = statMessage.indexOf('Ramping Down')!=-1 || statMessage.indexOf('Ramping Up')!=-1;
                    isTripped = statMessage.indexOf('INTERNAL TRIP')!=-1 || statMessage.indexOf('EXTERNAL TRIP')!=-1 || statMessage.indexOf('EXTERNAL DISABLE')!=-1;
                    isOverheat = temperature > this.temperatureMax;
                    isAlarmed = channelStat>=8 && !isTripped;

                    if( (isVoltageDrift && !isRamping && !isTripped) || (isAlarmed && !isTripped) || isOverheat )
                        color = this.color.alarm;

                    if(isRamping && !isAlarmed && !isOverheat)
                        color = this.color.ramp;

                    if(isTripped && !isAlarmed)
                        color = this.color.trip;

                    if(channelStat == 0)
                        color = this.color.off;

                    if(isVoltageDrift && !isRamping && !isTripped && channelStat%2)
                        statMessage.push('VOLTAGE DRIFT');

                    if(isOverheat)
                        statMessage.push('OVERHEAT');

                    //set whatever color we've settled on
                    this.HVgrid[crate].cells[data.Settings.Names[i]].setAttr('fill', color);

                    //build stat string message
                    statString = '';
                    for(j=0; j<statMessage.length; j++){
                        statString += statMessage[j] + '\n'
                    }

                    //set tooltip for this cell
                    this.HVgrid[crate].TTdata[data.Settings.Names[i]] = {
                        'Status' : statString,
                        'Demand' : demand + ' V',
                        'Measured' : measured + ' V',
                        'Current': ((current==-9999)? 'Not Reporting' : current+' mA' ),
                        'Temp' : data.Variables.Temperature[i] + ' C'
                    }                    
                }

                //repaint the grid
                this.HVgrid[crate].update();
            },

            'unpackHVCrateMap' : function(crateMap){
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
            },

            'unpackHVCrateMap' : function(mapObj){
                var key, i;
                    nSlots = mapObj.DD.crateMap & 3,
                    crate = [];

                nSlots = ((nSlots == 2) ? 6 : ((nSlots == 3) ? 12 : 16));

                for(i=0; i<nSlots; i++)
                    crate.push(0)

                for(key in mapObj){
                    if(key == 'DD') continue
console.log(parseInt(key.slice(5),10))
                    crate[ parseInt(key.slice(5),10) ] = parseInt(mapObj[key].Channels,10)/12;
                }

                return crate;
            },

            'update': function(){
                var i;

                for(i=0; i<this.HVgrid.length; i++){
                    getJSON('http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/HV-'+i+'/&encoding=json-nokeys', this.mapData.bind(this, i) );
                }
                
            }
  
        }
    });

})();









//HV control panel
(function(){  

    xtag.register('widget-HVcontrol', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var HVcontrol = document.createElement('form')
                ,   controlTitle = document.createElement('h2')
                ,   chIndex = document.createElement('input')
                ,   crateIndex = document.createElement('input')
                ,   chName = document.createElement('input')
                ,   offRadio = document.createElement('input')
                ,   offRadioLabel = document.createElement('label')
                ,   onRadio = document.createElement('input')
                ,   onRadioLabel = document.createElement('label')
                ,   commit = document.createElement('input')
                ,   statusBar = document.createElement('ul')
                ,   meterDiv = document.createElement('div')
                ,   demandTitle = document.createElement('h3')
                ,   demandCell = document.createElement('input')
                ,   demandUnit = document.createElement('label')
                ,   demandSlide = document.createElement('input')
                ,   voltageUpTitle = document.createElement('h3')
                ,   voltageUpCell = document.createElement('input')
                ,   voltageUpUnit = document.createElement('label')
                ,   voltageUpSlide = document.createElement('input')
                ,   voltageDownTitle = document.createElement('h3')
                ,   voltageDownCell = document.createElement('input')
                ,   voltageDownUnit = document.createElement('label')
                ,   voltageDownSlide = document.createElement('input')

                this.temperatureMax = 40;

                ////////////////////
                //build the DOM
                ////////////////////
                controlTitle.setAttribute('id', this.id + 'Title');
                controlTitle.innerHTML = 'Click on a HV cell to get started.';
                this.appendChild(controlTitle);

                HVcontrol.setAttribute('id', this.id + 'Control');
                HVcontrol.setAttribute('method', 'POST');
                HVcontrol.setAttribute('action', 'postHV');
                this.appendChild(HVcontrol);

                chIndex.setAttribute('id', this.id + 'chIndex');
                chIndex.setAttribute('name', 'chIndex');
                chIndex.setAttribute('style', 'display:none');
                chIndex.setAttribute('type', 'number');
                HVcontrol.appendChild(chIndex);

                crateIndex.setAttribute('id', this.id + 'crateIndex');
                crateIndex.setAttribute('name', 'crateIndex');
                crateIndex.setAttribute('style', 'display:none');
                crateIndex.setAttribute('type', 'number');
                HVcontrol.appendChild(crateIndex);

                chName.setAttribute('id', this.id + 'chName');
                chName.setAttribute('name', 'chName');
                chName.setAttribute('style', 'display:none');
                chName.setAttribute('type', 'text');
                HVcontrol.appendChild(chName);

                commit.setAttribute('id', this.id + 'HVparameterCommit');
                commit.setAttribute('type', 'submit');
                commit.setAttribute('value', 'Commit');
                //commit.setAttribute.onclick = this.submitParameters;
                HVcontrol.appendChild(commit);

                offRadio.setAttribute('id', this.id + 'offRadio')
                offRadio.setAttribute('name', 'powerSwitch');
                offRadio.setAttribute('value', 'off');
                offRadio.setAttribute('type', 'radio');
                HVcontrol.appendChild(offRadio);
                offRadioLabel.setAttribute('for', this.id + 'offRadio');
                offRadioLabel.innerHTML = 'Off';
                HVcontrol.appendChild(offRadioLabel);
                onRadio.setAttribute('id', this.id + 'onRadio')
                onRadio.setAttribute('name', 'powerSwitch');
                onRadio.setAttribute('value', 'on');
                onRadio.setAttribute('type', 'radio');
                HVcontrol.appendChild(onRadio);
                onRadioLabel.setAttribute('for', this.id + 'onRadio');
                onRadioLabel.innerHTML = 'On';
                HVcontrol.appendChild(onRadioLabel);

                statusBar.setAttribute('id', this.id + 'statusReport');
                HVcontrol.appendChild(statusBar);

                meterDiv.setAttribute('id', this.id + 'HVmeterWrapper');
                HVcontrol.appendChild(meterDiv);

                demandTitle.innerHTML = 'Demand Voltage';
                HVcontrol.appendChild(demandTitle);
                demandCell.setAttribute('id', this.id + 'demandVoltage');
                demandCell.setAttribute('name', 'demandVoltage');
                demandCell.setAttribute('class', 'voltageField');
                demandCell.setAttribute('type', 'number');
                demandCell.setAttribute('step', 'any');
                demandCell.setAttribute('min', 0);
                HVcontrol.appendChild(demandCell);
                demandUnit.innerHTML = 'V';
                HVcontrol.appendChild(demandUnit);
                demandSlide.setAttribute('id', this.id + 'demandVoltageSlide');
                demandSlide.setAttribute('type', 'range');
                HVcontrol.appendChild(demandSlide);
                demandCell.onchange = function(parentID){
                    document.getElementById(parentID+'demandVoltageSlide').value = parseInt(this.value, 10);
                }.bind(demandCell, this.id);
                demandSlide.oninput = function(parentID){
                    document.getElementById(parentID+'demandVoltage').value = parseInt(this.value, 10);
                }.bind(demandSlide, this.id);

                voltageUpTitle.innerHTML = 'Voltage Ramp Up';
                HVcontrol.appendChild(voltageUpTitle);
                voltageUpCell.setAttribute('id', this.id + 'voltageUp');
                voltageUpCell.setAttribute('name', 'voltageUp');
                voltageUpCell.setAttribute('class', 'rampField');
                voltageUpCell.setAttribute('type', 'number');
                voltageUpCell.setAttribute('step', 'any');
                voltageUpCell.setAttribute('min', 0);
                voltageUpCell.setAttribute('max', 500);
                HVcontrol.appendChild(voltageUpCell);
                voltageUpUnit.innerHTML = 'V/s';
                HVcontrol.appendChild(voltageUpUnit);
                voltageUpSlide.setAttribute('id', this.id + 'voltageUpSlide');
                voltageUpSlide.setAttribute('type', 'range');
                voltageUpSlide.setAttribute('min', 0);
                voltageUpSlide.setAttribute('max', 500);
                HVcontrol.appendChild(voltageUpSlide);
                voltageUpCell.onchange = function(parentID){
                    document.getElementById(parentID+'voltageUpSlide').value = parseInt(this.value, 10);
                }.bind(voltageUpCell, this.id);
                voltageUpSlide.oninput = function(parentID){
                    document.getElementById(parentID+'voltageUp').value = parseInt(this.value, 10);
                }.bind(voltageUpSlide, this.id);

                voltageDownTitle.innerHTML = 'Voltage Ramp Down';
                HVcontrol.appendChild(voltageDownTitle);
                voltageDownCell.setAttribute('id', this.id + 'voltageDown');
                voltageDownCell.setAttribute('name', 'voltageDown');
                voltageDownCell.setAttribute('class', 'rampField');
                voltageDownCell.setAttribute('type', 'number');
                voltageDownCell.setAttribute('step', 'any');
                voltageDownCell.setAttribute('min', 0);
                voltageDownCell.setAttribute('max', 500);
                HVcontrol.appendChild(voltageDownCell);
                voltageDownUnit.innerHTML = 'V/s';
                HVcontrol.appendChild(voltageDownUnit);
                voltageDownSlide.setAttribute('id', this.id + 'voltageDownSlide');
                voltageDownSlide.setAttribute('type', 'range');
                voltageDownSlide.setAttribute('min', 0);
                voltageDownSlide.setAttribute('max', 500);
                HVcontrol.appendChild(voltageDownSlide);
                voltageDownCell.onchange = function(parentID){
                    document.getElementById(parentID+'voltageDownSlide').value = parseInt(this.value, 10);
                }.bind(voltageDownCell, this.id);
                voltageDownSlide.oninput = function(parentID){
                    document.getElementById(parentID+'voltageDown').value = parseInt(this.value, 10);
                }.bind(voltageDownSlide, this.id);

                //set up kinetic objects
                this.meterWidth = document.getElementById(this.id+'HVmeterWrapper').offsetWidth;
                this.meterHeight = 0.8*document.getElementById(this.id+'HVmeterWrapper').offsetWidth;
                this.stage = new Kinetic.Stage({
                    container: this.id+'HVmeterWrapper',
                    width: this.meterWidth,
                    height: this.meterHeight
                });
                this.mainLayer = new Kinetic.Layer();       //main rendering layer
                this.stage.add(this.mainLayer);
                this.establishFillMeter('Voltage', 'V', this.mainLayer, 0, 0.05*this.meterHeight, this.meterWidth, 0.27*this.meterHeight);
                this.establishFillMeter('Current', 'mA', this.mainLayer, 0, 0.37*this.meterHeight, this.meterWidth, 0.27*this.meterHeight);
                this.establishFillMeter('Temperature', 'C', this.mainLayer, 0, 0.69*this.meterHeight, this.meterWidth, 0.27*this.meterHeight);

                this.addEventListener('postHVchan', function(evt){
                    this.updateForm(evt.detail.channel, evt.detail.ODBblob, evt.detail.crateIndex);
                }, false);

            },
            inserted: function() {},
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

            'submitParameters' : function(){
                var crateIndex = document.getElementById(this.id + 'crateIndex').value,
                    chanIndex = document.getElementById(this.id +'chIndex').value,
                    powerOff = document.getElementById(this.id+'offRadio').checked && true,
                    demandV = document.getElementById(this.id + 'demandVoltage'),
                    vUp = document.getElementById(this.id + 'voltageUp'),
                    vDown = document.getElementById(this.id + 'voltageDown'),
                    cmdString;

                cmdString = '?cmd=jset&odb=/Equipment/HV-'+crateIndex+'/Variables/Demand['+chanIndex+']'
                cmdString += '&value='+demandV


            },

            'updateForm' : function(channelName, ODBfe, crateIndex){
                var chanIndex = ODBfe.Settings.Names.indexOf(channelName),
                    chStatus = parseChStatus(ODBfe.Variables.ChStatus[chanIndex]),
                    demandVoltage = ODBfe.Variables.Demand[chanIndex],
                    measuredVoltage = ODBfe.Variables.Measured[chanIndex],
                    voltageLimit = ODBfe.Settings['Voltage Limit'][chanIndex],
                    currentLimit = ODBfe.Settings['Current Limit'][chanIndex],
                    current = ODBfe.Variables.Current[chanIndex],
                    temperature = ODBfe.Variables.Temperature[chanIndex],
                    vUp = ODBfe.Settings['Ramp Up Speed'][chanIndex],
                    vDown = ODBfe.Settings['Ramp Down Speed'][chanIndex],
                    i, listCell;

                if(chanIndex==-1) return;

                document.getElementById(this.id + 'Title').innerHTML = channelName;
                document.getElementById(this.id + 'chIndex').value = chanIndex;
                document.getElementById(this.id + 'crateIndex').value = crateIndex;
                document.getElementById(this.id + 'chName').value = channelName;
                document.getElementById(this.id + 'Control').style.opacity = 1;
                if(ODBfe.Variables.ChStatus[chanIndex]%2 == 0)
                    document.getElementById(this.id+'offRadio').checked = true;
                else
                    document.getElementById(this.id+'onRadio').checked = true;
                document.getElementById(this.id + 'statusReport').innerHTML = '';
                for(i=0; i<chStatus.length; i++){
                    listCell = document.createElement('li');
                    listCell.innerHTML = chStatus[i];
                    document.getElementById(this.id + 'statusReport').appendChild(listCell);
                }
                document.getElementById(this.id + 'demandVoltage').max = voltageLimit;
                document.getElementById(this.id + 'demandVoltage').value = demandVoltage;
                document.getElementById(this.id + 'demandVoltageSlide').max = voltageLimit;
                document.getElementById(this.id + 'demandVoltageSlide').value = demandVoltage;
                document.getElementById(this.id + 'voltageUp').value = vUp;
                document.getElementById(this.id + 'voltageUpSlide').value = vUp;
                document.getElementById(this.id + 'voltageDown').value = vDown;
                document.getElementById(this.id + 'voltageDownSlide').value = vDown;

                this.updateFillMeter('Voltage', measuredVoltage, voltageLimit);
                this.updateFillMeter('Current', current, currentLimit);
                this.updateFillMeter('Temperature', temperature, this.temperatureMax);
                this.mainLayer.draw();

            },

            'establishFillMeter' : function(title, unit, layer, x0, y0, width, height){
                var title, shell, meter, value,
                    fontSize = height/3;

                if(!this.meter)
                    this.meter = {};
                if(!this.shell)
                    this.shell = {};
                if(!this.meterMax)
                    this.meterMax = {};
                if(!this.meterNow)
                    this.meterNow = {};

                label = new Kinetic.Text({
                    x: x0,
                    y: 0,
                    text: title,
                    fontSize: fontSize,
                    fontFamily: 'Arial',
                    fill: '#999999'
                });
                squishFont(label, 0.35*width*0.95)
                label.setAttr('y', y0 + height/2 - label.getTextHeight()/2 );
                this.mainLayer.add(label);

                this.meter[title] = meter = new Kinetic.Rect({
                    x: x0 + 0.35*width,
                    y: y0 + height/2 - height/6,
                    width: height/3,
                    height: height/3,
                    cornerRadius: height/3/2,
                    strokeWidth: 2,
                    stroke: '#000000',
                    fill: '#f1c40f'
                });
                this.mainLayer.add(this.meter[title]);

                this.shell[title] = new Kinetic.Rect({
                    x: x0 + 0.35*width,
                    y: y0 + height/2 - height/6,
                    width: width/2,
                    height: height/3,
                    strokeWidth: 2,
                    fill: '#95a5a6',
                    stroke: '#000000',
                    cornerRadius: height/3/2
                });
                this.mainLayer.add(this.shell[title]);

                this.meterMax[title] = new Kinetic.Text({
                    x: x0 + 0.35*width,
                    y: y0 + height/2 - 0.8*fontSize/2 + height/3 + 2,
                    text: 'Max: 0 '+unit,
                    fontSize: 0.8*fontSize,
                    fontFamily: 'Arial',
                    fill: '#999999',
                    align: 'right',
                    width: width/2
                });
                this.mainLayer.add(this.meterMax[title]);

                this.meterNow[title] = new Kinetic.Text({
                    x: x0 + 0.35*width,
                    y: y0 + height/2 - 0.8*fontSize/2 - height/3 - 2,
                    text: 'Now: 0 '+unit,
                    fontSize: 0.8*fontSize,
                    fontFamily: 'Arial',
                    fill: '#999999',
                    align: 'right',
                    width: width/2
                });
                this.mainLayer.add(this.meterNow[title]);
            },

            'updateFillMeter' : function(title, val, max){
                var width = this.shell[title].getAttr('width'),
                    unit = this.meterMax[title].getAttr('text').split(' '),
                    barLength = val/max,
                    color;

                if(barLength<0)
                    barLength = 0;
                if(barLength>1)
                    barLength = 1;

                if(barLength < 0.5)
                    color = '#2ecc71'
                if(barLength >= 0.5)
                    color = '#f1c40f'
                if(barLength >0.9)
                    color = '#c0392b'

                barLength = Math.max(barLength*width, this.shell[title].getAttr('height'));

                unit = unit[unit.length-1];

                this.meterNow[title].setAttr('text', 'Now: ' + val.toFixed() + ' ' +unit)
                this.meterMax[title].setAttr('text', 'Max: ' + max.toFixed() + ' ' +unit);
                this.meter[title].setAttr('width', barLength);
                this.meter[title].setAttr('fill', color);
                this.meter[title].moveToTop();

            }
  
        }
    });

})();

//helpers
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