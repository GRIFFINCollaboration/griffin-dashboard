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
                    mainSectionTitles = ['MSCB Node Info', 'ADC Control', 'Triggering', 'Pulse Height Eval.', 'Time Eval.', 'Waveform Readout', 'Simulation Pulse', 'Miscellaneous'],
                    mainSectionH3 = [],
                    mainLists = [],
                    statusIDs = ['ctrl', 'rev', 'serial', 'cpu_temp', 'cc_lock', 'cc_freq', 'hw_sw_m', 'hw_id', 'hw_time', 'sw_id', 'sw_time', 'uptime', 'dac_ch', 'ref_clk', 'ch_en', 'ch_aa'],
                    ADCitemTitles = ['DC Offset:', 'ADC Chan:', 'Trim:', 'Polarity:'],
                    triggeringItemTitles = ['Channel:', 'Hit Thresh:', 'Trig Thresh:', 'Differentiation:', 'Integration:', 'Delay:', 'Pole Cxn:', 'BLR Control:'],
                    pulseheightItemTitles = ['Integration:', 'Differentiation:', 'Delay:', 'Pole Cxn 1:', 'Pole Cxn 2:', 'Baseline Rest:', 'Gain:', 'Pileup Algo:'],
                    timeItemTitles = ['CFD Delay:', 'CFD Fraction:'],
                    waveformItemTitles = ['', 'Pretrigger:', 'Samples:', 'Decimation:', 'Filter WF:'],
                    simulationItemTitles = ['', 'Pulse Height:', 'Risetime:', 'Falltime:', 'Rate:', 'Period:'],
                    miscItemTitles = ['Fixed Deadtime:', 'Detector Type:'],
                    listItem, items, input, label, p,
                    id, step,
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

                ////////////////////////////
                //ADC status pane elements
                ////////////////////////////
                for(i=0; i<statusIDs.length; i++){
                    listItem = document.createElement('li');
                    listItem.setAttribute('id', statusIDs[i]);
                    mainLists[0].appendChild(listItem);
                }

                //////////////////////////
                //ADC pane elements
                //////////////////////////
                items = [];
                for(i=0; i<ADCitemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[1].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = ADCitemTitles[i];
                    listItem.appendChild(label);
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
                    "step" : 1,
                    "class" : "stdin"
                });
                input.onchange = this.updateADC.bind(input, 'a_trim');
                items[2].appendChild(input);

                radioArray(items[3], ['Positive', 'Negative'], [true, false], 'a_pol');
                document.getElementById('a_pol0').onchange = this.updateADC.bind(document.getElementById('a_pol0'), 'a_pol');
                document.getElementById('a_pol1').onchange = this.updateADC.bind(document.getElementById('a_pol1'), 'a_pol');                

                ////////////////////////////////
                //Triggering pane elements
                ////////////////////////////////
                items = [];
                for(i=0; i<triggeringItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[2].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = triggeringItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }

                radioArray(items[0], ['Enabled', 'Disabled'], [true, false], 't_off');
                document.getElementById('t_off0').onchange = this.updateADC.bind(document.getElementById('t_off0'), 't_off');
                document.getElementById('t_off1').onchange = this.updateADC.bind(document.getElementById('t_off1'), 't_off');

                id = ['t_hthresh', 't_thresh', 't_diff', 't_int', 't_delay', 't_polcor', 't_blrctl'];
                step = ["any", "any", 1, 1, 1, "any", "any"];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i+1].appendChild(input);                    
                }

                /////////////////////////////////
                //pulse height pane elements
                /////////////////////////////////
                items = [];
                for(i=0; i<pulseheightItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[3].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = pulseheightItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }                

                id = ['p_int', 'p_diff', 'p_delay', 'p_polec1', 'p_polec2', 'p_bsr', 'p_gain', 'p_pactrl'];
                step = [1,1,1,"any","any","any","any", 1];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i].appendChild(input);                    
                }

                label = document.createElement('label');
                label.innerHTML = 'keV/chan';
                items[6].appendChild(label);

                ///////////////////////////////
                //Time eval pane elements
                ///////////////////////////////
                items = [];
                for(i=0; i<timeItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[4].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = timeItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }                

                id = ['cfd_dly', 'cfd_frac'];
                step = [1,"any"];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i].appendChild(input);                    
                }   

                //////////////////////////////
                //Waveform pane elements      
                //////////////////////////////
                items = [];
                for(i=0; i<waveformItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[5].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = waveformItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }

                radioArray(items[0], ['Suppressed', 'Unsuppressed'], [true, false], 'wrf_supp');
                document.getElementById('wrf_supp0').onchange = this.updateADC.bind(document.getElementById('wrf_supp0'), 'wrf_supp');
                document.getElementById('wrf_supp1').onchange = this.updateADC.bind(document.getElementById('wrf_supp1'), 'wrf_supp');

                id = ['wrf_pret', 'wrf_smpl', 'wrf_dec'];
                step = [1,1,1];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i+1].appendChild(input);                    
                }

                radioArray(items[4], ['Enabled', 'Disabled'], [true, false], 'wrf_off');
                document.getElementById('wrf_supp0').onchange = this.updateADC.bind(document.getElementById('wrf_off0'), 'wrf_off');
                document.getElementById('wrf_supp1').onchange = this.updateADC.bind(document.getElementById('wrf_off1'), 'wrf_off');

                //////////////////////////////
                //Simulation pane elements      
                //////////////////////////////
                items = [];
                for(i=0; i<simulationItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[6].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = simulationItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }

                radioArray(items[0], ['Enabled', 'Disabled'], [true, false], 'sim_ena');
                document.getElementById('sim_ena0').onchange = this.updateADC.bind(document.getElementById('sim_ena0'), 'sim_ena');
                document.getElementById('sim_ena1').onchange = this.updateADC.bind(document.getElementById('sim_ena1'), 'sim_ena');

                id = ['sim_phgt', 'sim_rise', 'sim_fall', 'sim_rate'];
                step = ["any", "any", "any", "any"];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i+1].appendChild(input);                    
                }

                radioArray(items[5], ['Random', 'Fixed'], [true, false], 'sim_rand');
                document.getElementById('sim_rand0').onchange = this.updateADC.bind(document.getElementById('sim_rand0'), 'sim_rand');
                document.getElementById('sim_rand1').onchange = this.updateADC.bind(document.getElementById('sim_rand1'), 'sim_rand');


                ///////////////////////////////
                //Misc pane elements
                ///////////////////////////////
                items = [];
                for(i=0; i<miscItemTitles.length; i++){
                    listItem = document.createElement('li');
                    mainLists[7].appendChild(listItem);
                    label = document.createElement('label');
                    label.innerHTML = miscItemTitles[i];
                    listItem.appendChild(label);
                    items.push(listItem);
                }                

                id = ['fix_dead', 'det_type'];
                step = [1,1];

                for(i=0; i<id.length; i++){
                    input = document.createElement('input');
                    setAttributes(input, {
                        "id" : id[i],
                        "type" : "number",
                        "step" : step[i],
                        "class" : "stdin"
                    });
                    input.onchange = this.updateADC.bind(input, id[i]);
                    items[i].appendChild(input);                    
                }

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