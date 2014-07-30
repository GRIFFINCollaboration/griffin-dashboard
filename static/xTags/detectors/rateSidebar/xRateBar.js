//HV control panel
(function(){  

    xtag.register('widget-rateBar', {
        extends: 'div',
        lifecycle: {
            created: function() {
                var barTitle = document.createElement('h2'),
                    host = document.createElement('h4');

                ////////////////////
                //build the DOM
                ////////////////////
                barTitle.setAttribute('id', this.id + 'Title');
                barTitle.innerHTML = 'Click on a rate or threshold channel to get started.';
                this.appendChild(barTitle);

                host.setAttribute('id', this.id + 'Host');
                this.appendChild(host);

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

        }, 
        methods: {
            'updateRates' : function(customEventData){
                window.currentData.host = findHost(customEventData.channel, window.currentData.DAQ),
                window.currentData.ADC = findADC(customEventData.channel, window.currentData.DAQ)

                document.getElementById(this.id + 'Title').innerHTML = customEventData.channel;
                if(window.currentData.host){
                    document.getElementById(this.id + 'Host').innerHTML = window.currentData.host;
                } else{
                    document.getElementById(this.id + 'Host').innerHTML = 'No host!';
                }
                if(!this.UIdeployed){
                    this.setUpUI();
                    this.UIdeployed = true;
                }

/*
                //summon data from the ADC
                if(window.currentData.host && window.currentData.ADC){
                    XHR('http://'+host+'/mscb?node='+(parseInt(ADC,10)+2), this.mapADCdata.bind(this), 'application/json', true);
                    XHR('http://'+host+'/mscb?node=1', this.mapNodeData.bind(this), 'application/json', true);
                }
*/
            },

            //send the response to a request to an ADC node to the appropriate places
            'mapADCdata' : function(response){
                var data = JSON.parse(response),
                    numberID = [    'a_dcofst', 'a_trim',
                                    't_hthres', 't_thres', 't_diff', 't_int', 't_delay', 't_polcor', 't_blrctl', 
                                    'p_int', 'p_diff', 'p_delay', 'p_polec1', 'p_polec2', 'p_bsr', 'p_gain', 'p_pactrl',
                                    'cfd_dly', 'cfd_frac',
                                    'wfr_pret', 'wfr_smpl', 'wfr_dec',
                                    'sim_phgt', 'sim_rise', 'sim_fall', 'sim_rate',
                                    'fix_dead', 'det_type'
                    ],
                    radioName = [   'a_off',
                                    'a_pol',
                                    't_off',
                                    'wfr_supp',
                                    'wfr_off',
                                    'sim_ena',
                                    'sim_rand'
                    ],
                    i;

                //keep hold of this blobject for later, has widths and car types and stuff in it needed for writing back
                window.ADCstructure = data;

                //all number inputs have id == data key name
                for(i=0; i<numberID.length; i++)
                    document.getElementById(numberID[i]).value = data[this.ADC][numberID[i]]['d'];
                //all radio inputs have name == data key name
                for(i=0; i<radioName.length; i++){
                    document.querySelectorAll('input[name = "'+radioName[i]+'"][value = '+data[this.ADC][radioName[i]]['d']+']')[0].checked = true;    
                }

                //special label for the DC offset slider
                document.getElementById('dcofstLabel').innerHTML = (document.getElementById('a_dcofst').value - 2048)*0.6714 + ' mV';

            },

            //send board level information to the MSCB node info panel
            'mapNodeData' : function(response){

                var key, data, i = 0, time
                    content,
                    titles = [
                        'Control Bits: ',
                        'Revision: ',
                        'Serial: ',
                        'FPGA Temperature: ',
                        'Clock Cleaner Locked: ',
                        'Clock Cleaner Frequency: ',
                        'Hardware / Software Match: ',
                        'Hardware ID: ',
                        'Hardware Timestamp: ',
                        'Software ID: ',
                        'Software Timestamp: ',
                        'Uptime: ',
                        'dac_ch: ',
                        'Reference Clock: ',
                        'Enabled Channels: ',
                        'Enabled ADCs: '
                    ]

                data = JSON.parse(response);

                for(key in data){
                    content = titles[i] + data[key].d;
                    if(i==3)
                        content += ' C'
                    if(i==7 || i==9)
                        content = titles[i] + '0x' + parseInt(data[key].d, 10).toString(16);
                    if(i==8 || i==10){
                        time = new Date(parseInt(data[key].d, 10)*1000);
                        content = titles[i] + time.toString();
                    }
                    if(i==11){
                        time = parseInt(data[key].d, 10);
                        content = titles[i] + chewUptime(time);
                    }

                    document.getElementById(key).innerHTML = content;
                    i++;
                }
    
            },

            'updateADC' : function(var_name){
                console.log(var_name)
/*
                var url = 'http://' + this.host + '/mscb_rx'
                ,   addr = 2 + this.ADC
                ,   var_id, width, data, flag, unit, value;

                var_id = window.ADCstructure[window.currentData.ADC][var_name]['id'];
                width = window.ADCstructure[window.currentData.ADC][var_name]['w'];
                flag = window.ADCstructure[window.currentData.ADC][var_name]['f'];
                unit = window.ADCstructure[window.currentData.ADC][var_name]['u'];
                data = new DataView(new ArrayBuffer(width));
                value = this.value;
                if(var_name == 'a_dcofst'){
                    document.getElementById('dcofstLabel').innerHTML = ((this.value - 2048)*0.6714).toFixed(4) + ' mV';
                }

                if(unit == MSCB_DEFINES['UNIT_BOOLEAN']){
                    data.setInt8(0, (value == 'true')? 1 : 0);
                } else {

                    if(flag & MSCB_DEFINES['MSCBF_FLOAT'])
                        data.setFloat32(0, parseFloat(this.value) );
                    else if(flag & MSCB_DEFINES['MSCBF_SIGNED']){
                        if(width==1){
                            data.setInt8(0, parseInt(value,10) );
                        } else if(width==2){
                            data.setInt16(0, parseInt(value,10) );
                        } else if(width==4){
                            data.setInt32(0, parseInt(value,10) );
                        } else{
                            //NOPE
                        }
                    } else {
                        if(width==1){
                            data.setUint8(0, parseInt(value,10) );
                        } else if(width==2){
                            data.setUint16(0, parseInt(value,10) );
                        } else if(width==4){
                            data.setUint32(0, parseInt(value,10) );
                        } else{
                            //NOPE
                        }       
                    }
                }
                    
                //console.log('trying MSCB_WriteVar('+url+', '+addr+', '+var_id+', '+data+')' )
                MSCB_WriteVar( url, addr, var_id, data )
*/
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
                    mainSectionH3[i].onclick = function(i){
                        toggleSection.bind(mainSectionH3[i], mainSections[i]);
                        //menu partially vanishes in chrome after collapsing a section - force reflow to rectify
                        document.getElementById(this.id).setAttribute('style', 'margin: 1em;')
                    }.bind(this, i)
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
                document.getElementById('wrf_off0').onchange = this.updateADC.bind(document.getElementById('wrf_off0'), 'wrf_off');
                document.getElementById('wrf_off1').onchange = this.updateADC.bind(document.getElementById('wrf_off1'), 'wrf_off');

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

            }
        }
    });

})();