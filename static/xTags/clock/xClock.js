(function(){  

    xtag.register('widget-clock', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var i,
                    clockDiv,
                    clockTitle;

                for(i=0; i<25; i++){
                    clockDiv = document.createElement('div');
                    clockDiv.setAttribute('id', 'clock'+i);
                    clockDiv.setAttribute('class', 'clockSummary');
                    clockDiv.onclick = this.clickClock.bind(this, i);
                    this.appendChild(clockDiv);

                    clockTitle = document.createElement('h2');
                    clockTitle.setAttribute('class', 'clockTitle');
                    clockTitle.innerHTML = 'GRIF-Clk '+i;
                    clockDiv.appendChild(clockTitle);

                    radioArray(clockDiv, ['Slave', 'Master'], [0,1], 'radio'+i);

                    if(i%5 == 0)
                        clockDiv.setAttribute('class', 'clockSummary absentClock')
                }
            },

            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {

        }, 
        methods: {
            'clickClock' : function(index){
                var evt, i,
                    controlSidebars = document.getElementsByTagName('widget-clockControl')

                if(controlSidebars){
                    for(i=0; i<controlSidebars.length; i++){

                        evt = new CustomEvent('postClockChan', {'detail': {   
                            'index' : index
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
                    summaryItems = ['Configuration', 'Sync Source', 'Clock Source', 'Ref. Clock', 'LEMO Clock', 'LEMO Sync', 'eSATA Clock', 'eSATA Sync', 'SyncTmeS'],
                    CSACItems = ['Power', 'Status', 'Mode', 'Alarm', 'Unit Power', 'Tuning Voltage', 'Laser Current', 'Clock Heater Power', 'Temperature', 'Serial No.', 'Firmware Version'],
                    i, row, cell, radios,
                    outputFreqWrap, outputFreqTitle, outputFreqSlide, outputFreqLabel,
                    channelCells, eSATAwrap, eSATAtitle;

                this.introTitle = document.createElement('h3');
                this.wrap = document.createElement('div');
                this.clockTitle = document.createElement('h3');

                this.introTitle.innerHTML = 'Click on a clock to get started.'
                this.appendChild(this.introTitle)

                this.wrap.setAttribute('style', 'display:none');
                this.appendChild(this.wrap);

                this.wrap.appendChild(this.clockTitle);

                radioArray(this.wrap, ['Summary', 'Outputs', 'CSAC Param.'], [0,1,2], 'clockSidebarView');
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
                    cell.innerHTML = summaryItems[i];
                    row.appendChild(cell);
                    cell = document.createElement('td');
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
                outputFreqWrap.appendChild(outputFreqSlide);
                outputFreqLabel = document.createElement('label');
                outputFreqLabel.setAttribute('id', 'masterOutputFrequencyLabel');
                outputFreqLabel.innerHTML = 'MHz'
                outputFreqWrap.appendChild(outputFreqLabel);

                channelCells = document.createElement('div');
                channelCells.setAttribute('id', 'clockChannels');
                this.outputCard.appendChild(channelCells);

                this.eSATAlabel = [];
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
                eSATAwrap = document.createElement('div');
                eSATAwrap.setAttribute('class', 'clockOutCell eSATAcell');
                channelCells.appendChild(eSATAwrap);
                eSATAtitle = document.createElement('span');
                eSATAtitle.innerHTML = 'Right LEMO';
                eSATAwrap.appendChild(eSATAtitle);
                this.eSATAlabel[7] = document.createElement('span');
                this.eSATAlabel[7].innerHTML = '-1 MHz out';
                eSATAwrap.appendChild(this.eSATAlabel[7]);


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
                    row.appendChild(cell);
                }


                this.addEventListener('postClockChan', function(evt){
                    this.updateForm(evt.detail.index);
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
            'updateForm' : function(index){

                this.clockTitle.innerHTML = 'GRIF-Clk ' + index;

                this.introTitle.setAttribute('style','display:none');
                this.wrap.setAttribute('style', 'display:block');
            },

            'changeView' : function(){
                var targetView = parseInt(this.wrap.querySelector('input[name="clockSidebarView"]:checked').value,10);

                this.deck.shuffleTo(targetView);
            }
        }
    });

})();