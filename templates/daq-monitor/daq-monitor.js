////////////////
// setup
////////////////

function setupDAQ(){


}

////////////////////////////////
// data unpacking & routing
////////////////////////////////

function unpackDAQdv(dv){
    //parse DAQ dataviews into dataStore.data variables - DAQ monitor style
    //information for an individual channel is packed in a 14 byte word:
    //[MSC 2 bytes][trig request 4 bytes][trig accept 4 bytes][threshold 4 bytes] <--lowest bit
    var channelIndex, channelName, DAQblock,
        i;

    // @TODO: make grif16 send appropriate mscs and lookup grifadc info based on sent MSC
    for(i=0; i<dv.byteLength/14; i++){
        DAQblock = unpackDAQ(i, dv);

        channelIndex = dataStore.DAQ.MSC.MSC.indexOf(DAQblock.MSC);
        channelName = dataStore.DAQ.MSC.chan[channelIndex];

        if(channelName) // ie channel *must* be in the ODB MSC table
            sortDAQitem(channelName, DAQblock);
    }
}

function regenerateDatastructure(){
    // rebuild an empty data structure to hold sorted DAQ data, based on the MSC table:
    // dataStore.DAQ.summary = {
    //      master: {
    //          requests: int; total requests
    //          accepts:  int; total accepts
    //      },

    //      collectors: {
    //          requests[i] == requests for ith collector
    //          accepts[i] ==  accepts ''
    //      }

    //      digitizers: {
    //          requests[i][j] == requests for ith collector, jth digitizer
    //          accepts[i][j]  == accepts ''
    //      }

    //      channels:{
    //          requests[i][j][k] == requests for ith collector, jth digitizer, kth channel
    //          accepts[i][j][k]  == accepts ''
    //      }

    //      detectors:{
    //          <detector code>: { ie 'GR', 'DS'....
    //              requests: total requests for this detector
    //              accepts: total accepts for this detector
    //          }
    //          ...
    //      }

    // }

    var i, address, M,S,C, detPrefix;

    if(dataStore.DAQ.summaryJSON){
        dataStore.DAQ.summary = JSON.parse(dataStore.DAQ.summaryJSON);
        return;
    }

    dataStore.DAQ.summary = {
        master: {requests: 0, accepts: 0},
        collectors: {requests: [], accepts: []},
        digitizers: {requests:[], accepts:[]},
        channels: {requests:[], accepts:[]},
        detectors: {}
    }

    for(i=0; i<dataStore.DAQ.MSC.MSC.length; i++){
        address = parseMSCindex(dataStore.DAQ.MSC.MSC[i]);

        M = address[0];
        S = address[1];
        C = address[2];

        dataStore.DAQ.summary.collectors.requests[M] = 0;
        dataStore.DAQ.summary.collectors.accepts[M] = 0;

        dataStore.DAQ.summary.digitizers.requests[M] = dataStore.DAQ.summary.digitizers.requests[M] || [];
        dataStore.DAQ.summary.digitizers.accepts[M] = dataStore.DAQ.summary.digitizers.accepts[M] || [];
        dataStore.DAQ.summary.digitizers.requests[M][S] = 0;
        dataStore.DAQ.summary.digitizers.accepts[M][S] = 0;

        dataStore.DAQ.summary.channels.requests[M] = dataStore.DAQ.summary.channels.requests[M] || [];
        dataStore.DAQ.summary.channels.requests[M][S] = dataStore.DAQ.summary.channels.requests[M][S] || [];
        dataStore.DAQ.summary.channels.accepts[M] = dataStore.DAQ.summary.channels.accepts[M] || [];
        dataStore.DAQ.summary.channels.accepts[M][S] = dataStore.DAQ.summary.channels.accepts[M][S] || [];
        dataStore.DAQ.summary.channels.requests[M][S][C] = 0;
        dataStore.DAQ.summary.channels.accepts[M][S][C] = 0;        
    }

    for(i=0; i<dataStore.DAQ.MSC.chan.length; i++){
        detPrefix = dataStore.DAQ.MSC.chan[i].slice(0,2);

        dataStore.DAQ.summary.detectors[detPrefix] = {requests: 0, accepts: 0};
    }

    dataStore.DAQ.summaryJSON = JSON.stringify(dataStore.DAQ.summary);
}

function sortDAQitem(detector, block){
    // sort the <block> unpacked by unpackDAQ for <channel> into the dataStore summary of the DAQ:

    var address = parseMSCindex(block.MSC),
        M = address[0],
        S = address[1],
        C = address[2],
        detectorCode = detector.slice(0,2);

    // sort data into summary:
    // master
    dataStore.DAQ.summary.master.accepts += block.trigAcpt;
    dataStore.DAQ.summary.master.requests += block.trigReq;
    // collectors
    dataStore.DAQ.summary.collectors.requests[M] += block.trigReq;
    dataStore.DAQ.summary.collectors.accepts[M] += block.trigAcpt;
    // digitizers
    dataStore.DAQ.summary.digitizers.requests[M][S] += block.trigReq;
    dataStore.DAQ.summary.digitizers.accepts[M][S] += block.trigAcpt;
    // digi channels
    dataStore.DAQ.summary.channels.requests[M][S][C] += block.trigReq;
    dataStore.DAQ.summary.channels.accepts[M][S][C] += block.trigAcpt;
    // detector
    dataStore.DAQ.summary.detectors[detectorCode].requests += block.trigReq;
    dataStore.DAQ.summary.detectors[detectorCode].accepts  += block.trigAcpt;     

}

function dataUpdate(){
    if(dataStore.hasOwnProperty('DAQ')){     
        console.log(dataStore.DAQ.summary)
    }

    //repaint histograms
    repaint()
}

function preFetch(){
    //dump old data:

    if(dataStore.hasOwnProperty('DAQ'))
        regenerateDatastructure();
}

////////////////////////////////////////
// histogram painting and updating
////////////////////////////////////////

function repaint(){

    var i,
        channel, req, acpt;

    //collectors
    channel = [];
    req = [];
    acpt = [];
    for(i=0; i<dataStore.DAQ.summary.collectors.length; i++){
        channel[i] = '0x' + i.toString(16) + '---';
        req[i] = dataStore.DAQ.summary.collectors[i].requests;
        acpt[i] = dataStore.DAQ.summary.collectors[i].accepts;
    }
    createBarchart('collectorsHisto', channel, req, acpt)
}

function createBarchart(targetDiv, MSClabels, requests, accepts){
    // re-create the specified histogram

    var layout = {barmode: 'group'},
        req = {
          x: MSClabels,
          y: requests,
          name: 'Requests',
          type: 'bar'
        },
        acpt = {
          x: MSClabels,
          y: accepts,
          name: 'Accepts',
          type: 'bar'
        };

    //collectors
    Plotly.newPlot(targetDiv, [req, acpt], layout);
}