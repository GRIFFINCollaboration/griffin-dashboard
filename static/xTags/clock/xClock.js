(function(){  

    xtag.register('widget-clock', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i, pageTitle,
                    clockTitle, clockIndex;

                this.currentClockIndex = null;
                this.clockForm = [];
                this.clockAddress = [];
                this.slaveSwitch = [];
                this.masterSwitch = [];

                pageTitle = document.createElement('h1');
                pageTitle.innerHTML = 'GRIFFIN Clock Control'
                this.appendChild(pageTitle);

                for(i=0; i<25; i++){
                    this.clockForm[i] = document.createElement('form');
                    this.clockForm[i].setAttribute('method', 'POST')
                    this.clockForm[i].setAttribute('action', 'toggleClock')
                    this.clockForm[i].setAttribute('id', 'clock'+i);
                    this.clockForm[i].setAttribute('class', 'clockSummary');
                    this.clockForm[i].onclick = this.clickClock.bind(this, i);
                    this.appendChild(this.clockForm[i]);

                    clockTitle = document.createElement('h3');
                    clockTitle.setAttribute('class', 'clockTitle');
                    clockTitle.innerHTML = 'GRIF-Clk '+i;
                    this.clockForm[i].appendChild(clockTitle);

                    this.clockAddress[i] = document.createElement('h4');
                    this.clockAddress[i].setAttribute('id', 'clockAddress'+i);
                    this.clockAddress[i].innerHTML = 'No Host'
                    this.clockForm[i].appendChild(this.clockAddress[i]);

                    radioArray(this.clockForm[i], ['Slave', 'Master'], [0,1], 'radio'+i);
                    this.slaveSwitch[i] = document.getElementById('radio'+i+0);
                    this.masterSwitch[i] = document.getElementById('radio'+i+1);

                    clockIndex = document.createElement('input');
                    clockIndex.setAttribute('name', 'clockIndex');
                    clockIndex.setAttribute('type', 'number');
                    clockIndex.setAttribute('style', 'display:none');
                    clockIndex.setAttribute('value', i);
                    this.clockForm[i].appendChild(clockIndex);

                    document.getElementById('radio'+i+'0').onchange = function(i){
                        this.clockForm[i].submit();
                    }.bind(this, i);
                    document.getElementById('radio'+i+'1').onchange = function(i){
                        this.clockForm[i].submit();
                    }.bind(this, i);

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

                            this.clockAddress[i].innerHTML = window.ODBEquipment['GRIF-Clk'+i].Settings.Devices.SCS2001.Device.split('.')[0];
                        }
                        else 
                            this.clockForm[i].setAttribute('class', 'clockSummary absentClock');
                    }

                }.bind(this));

                //let repopulate know that the active clock would like to be updated every loop:
                if(!window.refreshTargets)
                    window.refreshTargets = [];
                window.refreshTargets[window.refreshTargets.length] = this;
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

                //highlight / unhighlight selected clock
                if(this.currentClockIndex || this.currentClockIndex===0){
                    document.getElementById('clock'+this.currentClockIndex).setAttribute('class', 'clockSummary');
                } 
                this.clockForm[index].setAttribute('class', 'clockSummary clockHighlight')
                this.currentClockIndex = parseInt(index,10);

                this.fetchClock(index);

            },

            'update' : function(){
                if(this.currentClockIndex || this.currentClockIndex === 0)
                    this.fetchClock(this.currentClockIndex);
            },

            'fetchClock' : function(index){
                XHR('http://'+this.MIDAS+'/?cmd=jcopy&odb0=Equipment/GRIF-Clk'+index+'&encoding=json-nokeys', function(responseText){
                    var data = JSON.parse(responseText)[0],
                        controlSidebars = document.getElementsByTagName('widget-clockControl'),
                        evt;

                    window.ODBEquipment['GRIF-Clk'+index] = data;

                    evt = new CustomEvent('postClockChan', {'detail': {   
                        'index' : index,
                        'data' : data
                    } });
                    controlSidebars[0].dispatchEvent(evt);

                }.bind(this));
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
                    outputFreqWrap, outputFreqSlideWrap, outputFreqTitle, outputFreqSlide, outputFreqLabel, channelSubmit,
                    clockIndex, freqStepdown, isMaster,
                    channelCells, eSATAwrap, eSATAtitle;

                this.masterFreq = 100;  //master steps down from 200MHz in the spec, but seems to be 100 in practice?  TBD.
                this.summaryIDs = ['Configuration', 'SyncSource', 'ClockSource', 'RefClock', 'LEMOClock', 'LEMOSync', 'eSATAClock', 'eSATASync', 'SyncTmeS'];
                this.CSACIDs = ['Power', 'Status', 'Mode', 'Alarm', 'UnitPower', 'TuningVoltage', 'LaserCurrent', 'ClockHeaterPower', 'Temperature', 'SerialNo', 'FirmwareVersion'];
                this.CSACunit = ['','','','','',' VDC',' mA',' mW',' C','',''];
                this.suspendUpdate = false;

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

                this.cardWrap = document.createElement('form');
                this.cardWrap.setAttribute('method', 'POST');
                this.cardWrap.setAttribute('action', 'updateClock');
                this.cardWrap.setAttribute('id', 'clockCardWrap');
                this.cardWrap.oninput = function(){
                    console.log('form change')
                    this.suspendUpdate = true;
                }.bind(this)
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
                outputFreqWrap.setAttribute('class', 'clockOutCell masterOutCell');
                outputFreqWrap.setAttribute('id', 'outputFreqWrap');
                this.outputCard.appendChild(outputFreqWrap);
                outputFreqSlideWrap = document.createElement('div');
                outputFreqSlideWrap.setAttribute('id', 'outputFreqSlider');
                outputFreqWrap.appendChild(outputFreqSlideWrap);
                outputFreqTitle = document.createElement('span');
                outputFreqTitle.innerHTML = 'Master Output Freq.';
                outputFreqSlideWrap.appendChild(outputFreqTitle);
                outputFreqSlide = document.createElement('input');
                outputFreqSlide.setAttribute('type', 'range');
                outputFreqSlide.setAttribute('id', 'frequencySlider');
                outputFreqSlide.setAttribute('name', 'frequencySlider');
                outputFreqSlide.setAttribute('min',1);
                outputFreqSlide.setAttribute('max',10);
                outputFreqSlide.oninput = this.determineFrequency.bind(this);
                outputFreqSlideWrap.appendChild(outputFreqSlide);
                outputFreqLabel = document.createElement('label');
                outputFreqLabel.setAttribute('id', 'masterOutputFrequencyLabel');
                outputFreqSlideWrap.appendChild(outputFreqLabel);
                channelSubmit = document.createElement('input');
                channelSubmit.setAttribute('id', 'submitChannelConfig')
                channelSubmit.setAttribute('class', 'stdin');
                channelSubmit.setAttribute('type', 'submit');
                channelSubmit.setAttribute('value', 'Submit All');
                outputFreqWrap.appendChild(channelSubmit);

                channelCells = document.createElement('div');
                channelCells.setAttribute('id', 'clockChannels');
                this.outputCard.appendChild(channelCells);

                this.eSATAlabel = [];
                this.bypassState = [];
                for(i=0; i<8; i++){
                    eSATAwrap = document.createElement('div');
                    eSATAwrap.setAttribute('class', 'clockOutCell eSATAcell');
                    channelCells.appendChild(eSATAwrap);
                    eSATAtitle = document.createElement('span');
                    if(i<6)
                        eSATAtitle.innerHTML = 'eSATA ' + i;
                    else if (i==7)
                        eSATAtitle.innerHTML = 'Left LEMO';
                    else
                        eSATAtitle.innerHTML = 'Right LEMO';
                    eSATAwrap.appendChild(eSATAtitle);

                    if(i<6) radioArray(eSATAwrap, ['Off', 'On'], [0,1], 'eSATAtoggle'+i);
                    this.eSATAlabel[i] = document.createElement('span');
                    eSATAwrap.appendChild(this.eSATAlabel[i]);
                    this.bypassState[i] = document.createElement('span');
                    eSATAwrap.appendChild(this.bypassState[i])
                }

                clockIndex = document.createElement('input');
                clockIndex.setAttribute('name', 'clockIndex');
                clockIndex.setAttribute('id', 'clockIndex');
                clockIndex.setAttribute('style', 'display:none');
                clockIndex.setAttribute('type', 'number');
                channelCells.appendChild(clockIndex);

                freqStepdown = document.createElement('input');
                freqStepdown.setAttribute('name', 'freqStepdown');
                freqStepdown.setAttribute('id', 'freqStepdown');
                freqStepdown.setAttribute('style', 'display:none');
                freqStepdown.setAttribute('type', 'number');
                channelCells.appendChild(freqStepdown);

                isMaster = document.createElement('input');
                isMaster.setAttribute('name', 'isMaster');
                isMaster.setAttribute('id', 'isMaster');
                isMaster.setAttribute('style', 'display:none');
                isMaster.setAttribute('type', 'number');
                channelCells.appendChild(isMaster);

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
                    isMaster = payload.data.Variables.Output[1] == 1,
                    stepdown,
                    hiChan = [11,15,19,23,27,39,31,35],
                    loChan = [12,16,20,24,28,40,32,36];

                if(this.suspendUpdate) return;

                this.currentClock = parseInt(payload.index,10);
                document.getElementById('clockIndex').value = this.currentClock;
                this.clockTitle.innerHTML = 'GRIF-Clk ' + payload.index;

                //clock summary parameters
                for(i=1; i<9; i++){
                    value = this.humanReadableClock(i, parseInt(payload.data.Variables.Output[i],10) );
                    document.getElementById(this.summaryIDs[i - 1]).innerHTML = value;
                }

                //parse master frequency
                this.masterOutputFrequency = this.masterFreq/(parseInt(payload.data.Variables.Output[11],10)+1);

                if(isMaster){
                    //master needs switch for LEMO or AC Ref. Clock:
                    document.getElementById('ClockSourceLabel').innerHTML = 'Ref. Clock';
                    document.getElementById('ClockSource').innerHTML = '';
                    radioArray(document.getElementById('ClockSource'), ['AC','LEMO'], [0, 1], 'masterRef');
                    document.getElementById('masterRef' + payload.data.Variables.Output[4]).checked = true;
                    document.getElementById('masterRef0').onchange = this.changeMasterRef.bind(this);
                    document.getElementById('masterRef1').onchange = this.changeMasterRef.bind(this);

                    //also, don't report FanSel for the master, replace with frequency info:
                    document.getElementById('RefClockLabel').innerHTML = 'Input Freq.:';
                    document.getElementById('RefClock').innerHTML = '10 MHz';

                    //master reports NIM clock, slave reports ESATA clock
                    document.getElementById('SyncTmeSLabel').innerHTML = 'Last NIM Sync';
                    document.getElementById('SyncTmeS').innerHTML = this.humanReadableClock(10,parseInt(payload.data.Variables.Output[10],10));

                    //only master reveals output frequency slider and has CSAC tab:
                    document.getElementById('outputFreqSlider').setAttribute('style', 'display:block');
                    document.getElementById('clockSidebarView2Label').setAttribute('style', 'display:inline-block');
                } else{
                    document.getElementById('ClockSourceLabel').innerHTML = 'Clock Source';

                    document.getElementById('RefClockLabel').innerHTML = 'Ref. Clock';
                    document.getElementById('RefClock').innerHTML = 'N/A';

                    document.getElementById('SyncTmeSLabel').innerHTML = 'Last eSATA Sync';
                    document.getElementById('SyncTmeS').innerHTML = this.humanReadableClock(9,parseInt(payload.data.Variables.Output[9],10));

                    document.getElementById('outputFreqSlider').setAttribute('style', 'display:none');
                    document.getElementById('clockSidebarView2Label').setAttribute('style', 'display:none');
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

                //report the frequency after stepdown of each channel; set slider to stepdown corresponding to first channel:
                for(i=0; i<8; i++){
                    stepdown = (parseInt(payload.data.Variables.Output[hiChan[i]],10) + parseInt(payload.data.Variables.Output[loChan[i]],10)) / 2
                    if(this.bypassState[i].innerHTML == 'Bypass: No')
                        this.eSATAlabel[i].innerHTML = (this.masterFreq / (1 + stepdown)).toFixed(1) + ' MHz out';
                    else
                        this.eSATAlabel[i].innerHTML = this.masterOutputFrequency + ' MHz out';
                }
                document.getElementById('frequencySlider').value = 11 - parseInt(payload.data.Variables.Output[11],10);
                document.getElementById('masterOutputFrequencyLabel').innerHTML = (this.masterOutputFrequency + ' MHz';

                //keep track of whether this is a master or slave channel internally in the form
                document.getElementById('isMaster').value = payload.data.Variables.Output[1];

                //CSAC parameters
                for(i=43; i<54; i++){
                    value = this.humanReadableClock(i, parseFloat(payload.data.Variables.Output[i]).toFixed( (this.CSACunit[i-43] == '')? 0 :2 ) );
                    document.getElementById(this.CSACIDs[i-43]).innerHTML = value + this.CSACunit[i-43];
                }

                //x-deck needs its height babysat:
                document.getElementById('clockControlDeck').setAttribute('style', 'min-height: calc('+ (document.getElementById('outputFreqWrap').offsetHeight + document.getElementById('clockChannels').offsetHeight) + 'px + 2em'    );
            },

            'changeMasterRef' : function(){
                var newRefSetting = parseInt(this.querySelector('input[name="masterRef"]:checked').value);

                //post to ODB
                XHR('http://'+this.MIDAS+'/?cmd=jset&odb=Equipment/GRIF-Clk' + this.currentClock + '/Variables/Output[4]&value='+newRefSetting, function(){});

                //update local ODB copy
                if(window.ODBEquipment){
                    window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[4] = newRefSetting;
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
                }

                document.getElementById('freqStepdown').value = stepdown;

                if(window.ODBEquipment){
                    for(i=0; i<8; i++){
                        window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[11+4*i] = stepdown;
                        window.ODBEquipment['GRIF-Clk'+this.currentClock].Variables.Output[12+4*i] = stepdown;
                    }
                }
            }
        }
    });

})();