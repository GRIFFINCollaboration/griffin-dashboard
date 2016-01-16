function runSummaryCB(payload){
    //sort the results of fetching dataStore.runSummaryQuery into the dataStore.
    dataStore.ODB.Experiment = payload[0];
    dataStore.ODB.Runinfo = payload[1];
    dataStore.ODB.Equipment_Trigger_Statistics = payload[2];
    dataStore.ODB.Logger = payload[3];
}

function fetchDAQ(payload){
    //get the contents of the ODB DAQ directory.

    var i, key;

    dataStore.DAQ = payload;

    //extract hosts list
    dataStore.hosts = [];

    //master
    //dataStore.hosts.push(dataStore.DAQ.hosts.master);
    for(key in dataStore.DAQ.hosts){
        if(dataStore.DAQ.hosts[key].host){
            //collectors
            //dataStore.hosts.push(dataStore.DAQ.hosts[key].host);
            //digitizers
            for(i=0; i<dataStore.DAQ.hosts[key].digitizers.length; i++){
                if(dataStore.DAQ.hosts[key].digitizers[i])
                    dataStore.hosts.push(dataStore.DAQ.hosts[key].digitizers[i])
            }
        }
    }
}

function unpackDAQdv(dv){
    //parse DAQ dataviews into window.currentData variables
    //information for an individual channel is packed in a 14 byte word:
    //[MSC 2 bytes][trig request 4 bytes][trig accept 4 bytes][threshold 4 bytes] <--lowest bit
    var channelIndex, channelName, DAQblock,
        i;

    // @TODO: make grif16 send appropriate mscs and lookup grifadc info based on sent MSC
    for(i=0; i<dv.byteLength/14; i++){
        DAQblock = unpackDAQ(i, dv);

        channelIndex = dataStore.DAQ.MSC.MSC.indexOf(DAQblock.MSC);
        channelName = dataStore.DAQ.MSC.chan[channelIndex];

        if(dataStore.data[channelName]){
            dataStore.data[channelName]['trigger_request'] = DAQblock.trigReq;
            dataStore.data[channelName]['trigger_accept'] = DAQblock.trigAcpt;
            dataStore.data[channelName]['threshold'] = DAQblock.threshold;
        }

    }
}

function unpackDAQ(i, dv){
    //extract the ith block out of a dataview object constructed from the arraybuffer returned by a DAQ element:
    var blockLength = 14,
        thresholdPos = 10,
        trigAcptPos = 2,
        trigReqPos = 6,
        MSCPos = 0,
        unpacked = {};

    unpacked.threshold  = dv.getUint32(i*blockLength + thresholdPos, true);
    unpacked.trigAcpt   = dv.getFloat32(i*blockLength + trigAcptPos, true);
    unpacked.trigReq    = dv.getFloat32(i*blockLength + trigReqPos, true);
    unpacked.MSC        = dv.getUint16(i*blockLength + MSCPos, true);

    return unpacked;
}

function routeADCchannel(ADCjson){
    // take the parsed JSON response of a request like http://grifadc03.triumf.ca/mscb?node=17 and sort it into the adc-sidebar.

    var numberID = [    'a_dcofst', 'a_trim',
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
        warningDiv = document.getElementById('ADCwarning'),
        i;

    //empty response from ADC?
    if(Object.keys(ADCjson).length == 0){
        console.log('no keys')
        warningDiv.classList.remove('hidden');
        return;
    }
    warningDiv.classList.add('hidden');

    //keep hold of this blobject for later, has widths and car types and stuff in it needed for writing back
    dataStore.ADCstructure = ADCjson.vars;

    //all number inputs have id == data key name
    for(i=0; i<numberID.length; i++){
        if(dataStore.ADCstructure[numberID[i]])
            document.getElementById(numberID[i]).value = dataStore.ADCstructure[numberID[i]]['d'];
    }
    //all radio inputs have name == data key name
    for(i=0; i<radioName.length; i++){
        if(dataStore.ADCstructure[radioName[i]])
            document.querySelectorAll('input[name = "'+radioName[i]+'"][value = '+dataStore.ADCstructure[radioName[i]]['d']+']')[0].checked = true;    
    }
}

function routeADCboard(ADCjson){
    // take the parsed JSON response of a request like http://grifadc03.triumf.ca/mscb?node=1 and sort it into the adc-sidebar.

    var keys, time, content, i,
        warningDiv = document.getElementById('ADCwarning'),
        titles = {  'ctrl' : '<br>Control Bits:<br>', 
                    'rev' : '<br>Revision:<br>',
                    'serial': '<br>Serial:<br>',
                    'cpu_temp': '<br>FPGA Temperature:<br>',
                    'cc_lock': '<br>Clock Cleaner Locked:<br>',
                    'cc_freq': '<br>Clock Cleaner Frequency:<br>',
                    'hw_sw_m': '<br>Hardware / Software Match:<br>',
                    'hw_id': '<br>Hardware ID:<br>',
                    'hw_time': '<br>Hardware Timestamp:<br>',
                    'sw_id': '<br>Software ID:<br>',
                    'sw_time': '<br>Software Timestamp:<br>',
                    'uptime': '<br>Uptime:<br>',
                    'ref_clk': '<br>Reference Clock:<br>',
                    'ch_en': '<br>Enabled Channels:<br>',
                    'ch_aa': '<br>Enabled ADCs:<br>'
                };

    //empty response from ADC?
    if(Object.keys(ADCjson).length == 0){
        console.log('no keys')
        warningDiv.classList.remove('hidden');
        return;
    }
    warningDiv.classList.add('hidden');

    keys = Object.keys(ADCjson.vars);
    for(i=0; i<keys.length; i++ ){
        content = titles[keys[i]] + ADCjson.vars[keys[i]].d;
        if(keys[i] == 'cpu_temp')
            content += ' C'
        if(keys[i]=='hw_id' || keys[i]=='sw_id')
            content = titles[keys[i]] + '0x' + parseInt(ADCjson.vars[keys[i]].d, 10).toString(16);
        if(keys[i]=='hw_time' || keys[i]=='sw_time'){
            time = new Date(parseInt(ADCjson.vars[keys[i]].d, 10)*1000);
            content = titles[keys[i]] + time.toString();
        }
        if(keys[i]=='uptime'){
            time = parseInt(ADCjson.vars[keys[i]].d, 10);
            content = titles[keys[i]] + chewUptime(time);
        }
        if(document.getElementById(keys[i]))
            document.getElementById(keys[i]).innerHTML = content;        
    }
}














