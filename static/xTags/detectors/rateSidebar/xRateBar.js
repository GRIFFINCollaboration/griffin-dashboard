//HV control panel
(function(){  

    xtag.register('widget-rateBar', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var barTitle = document.createElement('h2')

                ////////////////////
                //build the DOM
                ////////////////////
                barTitle.setAttribute('id', this.id + 'Title');
                barTitle.innerHTML = 'Click on a rate or threshold channel to get started.';
                this.appendChild(barTitle);
                this.UIdeployed = false;

                this.addEventListener('postADC', function(evt){
                    this.updateRates(evt.detail);
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
            'updateRates' : function(customEventData){
                document.getElementById(this.id + 'Title').innerHTML = customEventData.channel
                if(!this.UIdeployed){
                    this.setUpUI();
                    this.UIdeployed = true;
                }
            },

            'setUpUI' : function(){
                var control = document.createElement('div'),
                    mainSections = ['ADCstatusPane', 'ADC', 'trig', 'pulseHeight', 'time', 'waveform', 'simulation', 'misc'],
                    mainSectionDivs = [],
                    mainSectionTitles = ['MSCB Node Info', 'ADC Control', 'Triggering', 'Pulse Height Evaluation', 'Time Evaluation', 'Waveform Readout', 'Simulation Pulse', 'Miscellaneous'],
                    mainSectionH3 = [],
                    mainLists = [],
                    statusIDs = ['ctrl', 'rev', 'serial', 'cpu_temp', 'cc_lock', 'cc_freq', 'hw_sw_m', 'hw_id', 'hw_time', 'sw_id', 'sw_time', 'uptime', 'dac_ch', 'ref_clk', 'ch_en', 'ch_aa'],
                    ADCitemTitles = ['DC Offset:', 'ADC Chan:', 'Trim:', 'Polarity:'],
                    listItem, items, input, label, p,
                    i;

                //wrapper for ADC UI
                control.setAttribute('id', 'control');
                this.appendChild(control);

                //main sections
                for(i=0; i<mainSections.length; i++){
                    mainSectionDivs[i] = document.createElement('div');
                    mainSectionDivs[i].setAttribute('id', mainSections[i]);
                    mainSectionDivs[i].setAttribute('class', 'collapse');

                    mainSectionH3[i] = document.createElement('h3');
                    mainSectionH3[i].setAttribute('class', 'sectionHead');
                    mainSectionH3[i].onclick = toggleSection.bind(mainSectionH3[i], mainSections[i]);
                    mainSectionH3[i].innerHTML = String.fromCharCode(0x25B6) + ' ' +mainSectionTitles[i];
                    mainSectionDivs[i].appendChild(mainSectionH3[i]);

                    mainLists[i] = document.createElement('ul');
                    mainSectionDivs[i].appendChild(mainLists[i]);

                    control.appendChild(mainSectionDivs[i]);
                }

                //ADC status pane elements
                for(i=0; i<statusIDs.length; i++){
                    listItem = document.createElement('li');
                    listItem.setAttribute('id', statusIDs[i]);
                    mainLists[0].appendChild(listItem);
                }

                //ADC pane elements
                items = [];
                for(i=0; i<ADCitemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[1].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = ADCitemTitles[i];
                    mainLists[1].appendChild(label);
                    items.push(listItem);
                }

                input = document.createElement('input');
                setAttributes(input, {
                    "id" : "a_dcofst",
                    "type" : "range",
                    "step" : 1,
                    "min" : 0,
                    "max" : 4095,
                });
                input.oninput = this.updateADC.bind(input, 'a_dcofst');
                items[0].appendChild(input);
                label = document.createElement('label');
                label.setAttribute('id', 'dcofstLabel');
                label.innerHTML = 'mV';
                items[0].appendChild(label);

                radioArray(items[1], ['Enabled', 'Disabled'], [true, false], 'a_off');
                document.getElementById('a_off0').onchange = this.updateADC.bind(document.getElementById('a_off0'), 'a_off');
                document.getElementById('a_off1').onchange = this.updateADC.bind(document.getElementById('a_off1'), 'a_off');

                input = document.createElement('input');
                setAttributes(input, {
                    "id" : "a_trim",
                    "type" : "number",
                    "step" : 1
                });
                input.onchange = this.updateADC.bind(input, 'a_trim');
                items[2].appendChild(input);

                radioArray(items[3], ['Positive', 'Negative'], [true, false], 'a_pol');
                document.getElementById('a_pol0').onchange = this.updateADC.bind(document.getElementById('a_pol0'), 'a_pol');
                document.getElementById('a_pol1').onchange = this.updateADC.bind(document.getElementById('a_pol1'), 'a_pol');                




            },

            'updateADC' : function(var_name){
                console.log(var_name)
            }
        }
    });

})();


function toggleSection(id){
    var section = document.getElementById(id)

    if(section.className == 'collapse'){
        section.className = 'expand'
        this.innerHTML = String.fromCharCode(0x25BC) + this.innerHTML.slice(this.innerHTML.indexOf(' '));
    }
    else{
        section.className = 'collapse'
        this.innerHTML = String.fromCharCode(0x25B6) + this.innerHTML.slice(this.innerHTML.indexOf(' '));   
    }
}