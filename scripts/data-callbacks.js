function runSummaryCB(payload){
    //sort the results of fetching dataStore.runSummaryQuery into the dataStore.
    dataStore.ODB.Experiment = payload[0];
    dataStore.ODB.Runinfo = payload[1];
    dataStore.ODB.Equipment_Trigger_Statistics = payload[2];
    dataStore.ODB.Logger = payload[3];
}

function fetchDAQ(payload){
    //the contents of the ODB DAQ directory.

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

    //insert url queries into heartbeat polls:
    for(i=0; i<dataStore.hosts.length; i++){
        dataStore.heartbeat.URLqueries.push('http://' + dataStore.hosts[i] + '/report')
    }

    //bump the heartbeat if it's available
    if(dataStore.heartbeatTimer)
        restart_heartbeat();
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

//extract the ith block out of a dataview object constructed from the arraybuffer returned by a DAQ element:
function unpackDAQ(i, dv){
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