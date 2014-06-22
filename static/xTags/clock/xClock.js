(function(){  

    xtag.register('widget-clock', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i, pageTitle,
                    clockTitle;

                this.clockDiv = [];
                this.slaveSwitch = [];
                this.masterSwitch = [];

                pageTitle = document.createElement('h1');
                pageTitle.innerHTML = 'GRIFFIN Clock Control'
                this.appendChild(pageTitle);

                for(i=0; i<25; i++){
                    this.clockDiv[i] = document.createElement('div');
                    this.clockDiv[i].setAttribute('id', 'clock'+i);
                    this.clockDiv[i].setAttribute('class', 'clockSummary');
                    this.clockDiv[i].onclick = this.clickClock.bind(this, i);
                    this.appendChild(this.clockDiv[i]);

                    clockTitle = document.createElement('h3');
                    clockTitle.setAttribute('class', 'clockTitle');
                    clockTitle.innerHTML = 'GRIF-Clk '+i;
                    this.clockDiv[i].appendChild(clockTitle);

                    radioArray(this.clockDiv[i], ['Slave', 'Master'], [0,1], 'radio'+i);
                    this.slaveSwitch[i] = document.getElementById('radio'+i+0);
                    this.masterSwitch[i] = document.getElementById('radio'+i+1);

                }

                //grab the whole equipment list, figure out which clocks are reporting, and set their status radio
                XHR('http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/&encoding=json-nokeys', function(responseText){
                    var i;

                    window.ODBEquipment = JSON.parse(responseText)[0];  //comes packed in a one-element array...

                    this.clocksPresent = [];

                    for(i=0; i<25; i++){
                        if(window.ODBEquipment.hasOwnProperty('GRIF-Clk'+i)){
                            this.clocksPresent.push(i);
                            if(window.ODBEquipment['GRIF-Clk'+i].Variables.Output[1] == 1)
                                this.masterSwitch[i].setAttribute('checked', true);
                            else
                                this.slaveSwitch[i].setAttribute('checked', true);
                        }
                        else 
                            this.clockDiv[i].setAttribute('class', 'clockSummary absentClock');
                    }

                }.bind(this));
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
            'clickClock' : function(index){
                var evt, i, ODBblob,
                    controlSidebars = document.getElementsByTagName('widget-clockControl')

                //TODO: highlight this div

                ODBblob = {};
                if(window.ODBEquipment && window.ODBEquipment.hasOwnProperty('GRIF-Clk'+index))
                    ODBblob = window.ODBEquipment['GRIF-Clk'+index];

                if(controlSidebars){
                    for(i=0; i<controlSidebars.length; i++){

                        evt = new CustomEvent('postClockChan', {'detail': {   
                            'index' : index,
                            'data' : ODBblob
                        } });
                        controlSidebars[i].dispatchEvent(evt);
                    }
                }                
            }

        },

    });

})();



(function(){  

    xtag.register('widget-clockControl', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var xString,
                    summaryItems = ['Configuration:', 'Sync Source:', 'Clock Source:', 'Ref. Clock:', 'LEMO Clock:', 'LEMO Sync:', 'eSATA Clock:', 'eSATA Sync:', 'SyncTmeS:'],
                    CSACItems = ['Power:', 'Status:', 'Mode:', 'Alarm:', 'Unit Power:', 'Tuning Voltage:', 'Laser Current:', 'Clock Heater Power:', 'Temperature:', 'Serial No.:', 'Firmware Version:'],
                    i, row, cell, radios,
                    outputFreqWrap, outputFreqTitle, outputFreqSlide, outputFreqLabel,
                    channelCells, eSATAwrap, eSATAtitle;

                this.masterFreq = 100;  //master steps down from 200MHz in the spec, but seems to be 100 in practice?  TBD.
                this.summaryIDs = ['Configuration', 'SyncSource', 'ClockSource', 'RefClock', 'LEMOClock', 'LEMOSync', 'eSATAClock', 'eSATASync', 'SyncTmeS'];
                this.CSACIDs = ['Power', 'Status', 'Mode', 'Alarm', 'UnitPower', 'TuningVoltage', 'LaserCurrent', 'ClockHeaterPower', 'Temperature', 'SerialNo', 'FirmwareVersion'];
                this.CSACunit = ['','','','','',' VDC',' mA',' mW',' C','',''];

                this.introTitle = document.createElement('h2');
                this.wrap = document.createElement('div');
                this.clockTitle = document.createElement('h2');

                this.introTitle.innerHTML = 'Click on a clock to get started.'
                this.appendChild(this.introTitle)

                this.wrap.setAttribute('style', 'display:none');
                this.appendChild(this.wrap);

                this.wrap.appendChild(this.clockTitle);

                radioArray(this.wrap, ['Summary', 'Outputs', 'CSAC'], [0,1,2], 'clockSidebarView');
                radios = this.wrap.querySelectorAll('input[type=radio]');
                for(i=0; i<radios.length; i++){
                    radios[i].onchange = this.changeView.bind(this);
                    if(i==0)
                        radios[i].checked = true;
                }

                this.cardWrap = document.createElement('div');
                this.cardWrap.setAttribute('id', 'clockCardWrap')
                this.wrap.appendChild(this.cardWrap);
                xString = '<x-deck id="clockControlDeck" selected-index=0>'
                xString += '<x-card id="summaryCard"></x-card>'
                xString += '<x-card id="outputCard"></x-card>'
                xString += '<x-card id="CSACCard"></x-card>'
                xString += '</x-deck>'
                xtag.innerHTML(this.cardWrap, xString);
                this.deck = document.getElementById('clockControlDeck');
                this.summaryCard = document.getElementById('summaryCard');
                this.outputCard = document.getElementById('outputCard');
                this.CSACCard = document.getElementById('CSACCard');

                //summary card contents
                this.summaryTable = document.createElement('table');
                this.summaryTable.setAttribute('class', 'clockTable');
                this.summaryCard.appendChild(this.summaryTable);
                for(i=0; i<summaryItems.length; i++){
                    row = document.createElement('tr');
                    this.summaryTable.appendChild(row);
                    cell = document.createElement('td');
                    cell.setAttribute('id', this.summaryIDs[i]+'Label')
                    cell.innerHTML = summaryItems[i];
                    row.appendChild(cell);
                    cell = document.createElement('td');
                    cell.setAttribute('id', this.summaryIDs[i]);
                    row.appendChild(cell);
                }

                //output card contents
                outputFreqWrap = document.createElement('div');
                outputFreqWrap.setAttribute('class', 'clockOutCell');
                this.outputCard.appendChild(outputFreqWrap);
                outputFreqTitle = document.createElement('span');
                outputFreqTitle.innerHTML = 'Master Output Freq.';
                outputFreqWrap.appendChild(outputFreqTitle);
                outputFreqSlide = document.createElement('input');
                outputFreqSlide.setAttribute('type', 'range');
                outputFreqSlide.setAttribute('id', 'frequencySlider');
                outputFreqSlide.setAttribute('min',1);
                outputFreqSlide.setAttribute('max',10);
                outputFreqSlide.oninput = this.determineFrequency.bind(this);
                outputFreqWrap.appendChild(outputFreqSlide);
                outputFreqLabel = document.createElement('label');
                outputFreqLabel.setAttribute('id', 'masterOutputFrequencyLabel');
                outputFreqLabel.innerHTML = 'MHz'
                outputFreqWrap.appendChild(outputFreqLabel);

                channelCells = document.createElement('div');
                channelCells.setAttribute('id', 'clockChannels');
                this.outputCard.appendChild(channelCells);

                this.eSATAlabel = [];
                this.bypassState = [];
                for(i=0; i<6; i++){
                    eSATAwrap = document.createElement('div');
                    eSATAwrap.setAttribute('class', 'clockOutCell eSATAcell');
                    channelCells.appendChild(eSATAwrap);
                    eSATAtitle = document.createElement('span');
                    eSATAtitle.innerHTML = 'eSATA ' + i;
                    eSATAwrap.appendChild(eSATAtitle);

                    radioArray(eSATAwrap, ['Off', 'On'], [0,1], 'eSATAtoggle'+i);
                    this.eSATAlabel[i] = document.createElement('span');
                    this.eSATAlabel[i].innerHTML = '-1 MHz out';
                    eSATAwrap.appendChild(this.eSATAlabel[i]);
                    this.bypassState[i] = document.createElement('span');
                    eSATAwrap.appendChild(this.bypassState[i])
                }
                eSATAwrap = document.createElement('div');
                eSATAwrap.setAttribute('class', 'clockOutCell eSATAcell');
                channelCells.appendChild(eSATAwrap);
                eSATAtitle = document.createElement('span');
                eSATAtitle.innerHTML = 'Left LEMO';
                eSATAwrap.appendChild(eSATAtitle);
                this.eSATAlabel[6] = document.createElement('span');
                this.eSATAlabel[6].innerHTML = '-1 MHz out';
                eSATAwrap.appendChild(this.eSATAlabel[6]);
                this.bypassState[6] = document.createElement('span');
                eSATAwrap.appendChild(this.bypassState[6])
                eSATAwrap = document.createElement('div');
                eSATAwrap.setAttribute('class', 'clockOutCell eSATAcell');
                channelCells.appendChild(eSATAwrap);
                eSATAtitle = document.createElement('span');
                eSATAtitle.innerHTML = 'Right LEMO';
                eSATAwrap.appendChild(eSATAtitle);
                this.eSATAlabel[7] = document.createElement('span');
                this.eSATAlabel[7].innerHTML = '-1 MHz out';
                eSATAwrap.appendChild(this.eSATAlabel[7]);
                this.bypassState[7] = document.createElement('span');
                eSATAwrap.appendChild(this.bypassState[7])

                //CSAC card contents
                this.CSACTable = document.createElement('table');
                this.CSACTable.setAttribute('class', 'clockTable');
                this.CSACCard.appendChild(this.CSACTable);
                for(i=0; i<CSACItems.length; i++){
                    row = document.createElement('tr');
                    this.CSACTable.appendChild(row);
                    cell = document.createElement('td');
                    cell.innerHTML = CSACItems[i];
                    row.appendChild(cell);
                    cell = document.createElement('td');
                    cell.setAttribute('id', this.CSACIDs[i]);
                    row.appendChild(cell);
                }

                outputFreqSlide.oninput();

                this.addEventListener('postClockChan', function(evt){
                    this.updateForm(evt.detail);
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
            'updateForm' : function(payload){
                var i, value, isOn,
                    isMaster = payload.data.Variables.Output[1] == 1;

                this.currentClock = parseInt(payload.index,10);

                this.clockTitle.innerHTML = 'GRIF-Clk ' + payload.index;

                //clock summary parameters
                for(i=1; i<9; i++){
                    value = this.humanReadableClock(i, parseInt(payload.data.Variables.Output[i],10) );
                    document.getElementById(this.summaryIDs[i - 1]).innerHTML = value;
                }

                if(isMaster){
                    //master needs switch for LEMO or AC Ref. Clock:
                    document.getElementById('ClockSourceLabel').innerHTML = 'Ref. Clock';
                    document.getElementById('ClockSource').innerHTML = '';
                    radioArray(document.getElementById('ClockSource'), ['LEMO', 'AC'], ['LEMO', 'AC'], 'masterRef');

                    //also, don't report FanSel for the master, replace with frequency info:
                    document.getElementById('RefClockLabel').innerHTML = 'Input Freq.:';
                    document.getElementById('RefClock').innerHTML = '10 MHz';

                    //master reports NIM clock, slave reports ESATA clock
                    document.getElementById('SyncTmeSLabel').innerHTML = 'Last NIM Sync';
                    document.getElementById('SyncTmeS').innerHTML = this.humanReadableClock(10,parseInt(payload.data.Variables.Output[10],10));
                } else{
                    document.getElementById('ClockSourceLabel').innerHTML = 'Clock Source';

                    document.getElementById('RefClockLabel').innerHTML = 'Ref. Clock';
                    document.getElementById('RefClock').innerHTML = 'N/A';

                    document.getElementById('SyncTmeSLabel').innerHTML = 'Last eSATA Sync';
                    document.getElementById('SyncTmeS').innerHTML = this.humanReadableClock(9,parseInt(payload.data.Variables.Output[9],10));
                }

                //decode which channels are on / off:
                for(i=0; i<6; i++){
                    isOn = (0xF << 4*i) & parseInt(payload.data.Variables.Output[0], 10);
                    if(isOn){
                        document.getElementById('eSATAtoggle'+i+1).setAttribute('checked', true);
                    } else{
                        document.getElementById('eSATAtoggle'+i+0).setAttribute('checked', true);
                    }
                }

                //report bipass state of each channel (yes, LEMOs got stuck in between the 5th and 6th eSATA channels...)
                for(i=0; i<5; i++){
                    this.bypassState[i].innerHTML = 'Bypass: ' + this.humanReadableClock(13 + 4*i, parseInt(payload.data.Variables.Output[13+4*i],10) );
                }
                this.bypassState[5].innerHTML = 'Bypass: ' + this.humanReadableClock(41, parseInt(payload.data.Variables.Output[41],10) );
                this.bypassState[6].innerHTML = 'Bypass: ' + this.humanReadableClock(33, parseInt(payload.data.Variables.Output[33],10) );
                this.bypassState[7].innerHTML = 'Bypass: ' + this.humanReadableClock(37, parseInt(payload.data.Variables.Output[37],10) );

                this.introTitle.setAttribute('style','display:none');
                this.wrap.setAttribute('style', 'display:block');

                //CSAC parameters
                for(i=43; i<54; i++){
                    value = this.humanReadableClock(i, parseFloat(payload.data.Variables.Output[i]).toFixed( (this.CSACunit[i-43] == '')? 0 :2 ) );
                    document.getElementById(this.CSACIDs[i-43]).innerHTML = value + this.CSACunit[i-43];
                }
            },

            'changeView' : function(){
                var targetView = parseInt(this.wrap.querySelector('input[name="clockSidebarView"]:checked').value,10);

                this.deck.shuffleTo(targetView);
            },

            //translate clock parameter i of value v into something a human can comprehend:
            'humanReadableClock' : function(i, v){
                if(i == 1)
                    return (parseInt(v,10)) ? 'Master' : 'Slave';
                else if(i == 2)
                    return (parseInt(v,10)) ? 'LEMO' : 'eSATA';
                else if(i == 3)
                    return (parseInt(v,10)) ? 'LEMO' : 'eSATA';
                else if(i == 4)
                    return (parseInt(v,10)) ? 'LEMO' : 'Atomic Clock'
                else if(i>4 && i<9)
                    return (parseInt(v,10)) ? 'Present' : 'Absent';
                else if(i==9 || i==10)
                    return Math.floor(v/3600) + ' h: ' + Math.floor((v%3600)/60) + ' m';
                else if(i==13 || i==17 || i==21 || i==25 || i==29 || i==33 || i==37 || i==41)
                    return (parseInt(v,10)) ? 'Yes' : 'No';
                else if(i==43)
                    return (parseInt(v,10)) ? 'Up' : 'Down';
                else
                    return v;
            },

            'determineFrequency' : function(){
                var slider = document.getElementById('frequencySlider'),
                    stepdown = -(slider.valueAsNumber - parseInt(slider.max,10)-1),
                    freqOut = this.masterFreq / (1+stepdown), 
                    i;

                document.getElementById('masterOutputFrequencyLabel').innerHTML = freqOut.toFixed(1) + ' MHz';
                for(i=0; i<8; i++){
                    this.eSATAlabel[i].innerHTML = freqOut.toFixed(1) + ' MHz out';

                    window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[11+4*i] = stepdown;
                    window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[12+4*i] = stepdown;
                }

                if(window.ODBEquipment){
                    for(i=0; i<8; i++){
                        window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[11+4*i] = stepdown;
                        window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[12+4*i] = stepdown;
                    }

                    XHR('http://'+this.MIDAS+'/?cmd=jset&odb0=Equipment/GRIF-Clk'+this.currentClock+'/Variables/Output[*]&value='+JSON.stringify(window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output), function(){});
                }
            }
        }
    });

})();