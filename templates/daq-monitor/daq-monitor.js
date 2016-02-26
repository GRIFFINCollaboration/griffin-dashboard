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

function regenerateDatastructure(suppressDOMconfig){
    // rebuild an empty data structure to hold sorted DAQ data, based on the MSC table:
    // dataStore.DAQ.summary = {
    //      master: {
    //          requests: int; total requests
    //          accepts:  int; total accepts
    //      },

    //      collectors: {
    //          requests[i] == requests for ith collector
    //          accepts[i] ==  accepts ''
    //          titles[i] == title ''
    //      }

    //      digitizers: {
    //          requests[i][j] == requests for ith collector, jth digitizer
    //          accepts[i][j]  == accepts ''
    //          titles[i][j] == titles ''
    //      }

    //      channels:{
    //          requests[i][j][k] == requests for ith collector, jth digitizer, kth channel
    //          accepts[i][j][k]  == accepts ''
    //          titles[i][j][k] == titles ''
    //      }

    //      detectors:{
    //          <detector code>: { ie 'GR', 'DS'....
    //              requests: total requests for this detector
    //              accepts: total accepts for this detector
    //          }
    //          ...
    //      }

    // }
    // also does some on-load dom config

    var i, address, M,S,C, detPrefix, collectorOption, detectorOption;

    if(dataStore.DAQ.summaryJSON){
        dataStore.DAQ.summary = JSON.parse(dataStore.DAQ.summaryJSON);
        return;
    }

    dataStore.DAQ.summary = {
        master: {requests: 0, accepts: 0},
        collectors: {requests: [], accepts: [], titles: []},
        digitizers: {requests:[], accepts:[], titles: []},
        channels: {requests:[], accepts:[], titles:[]},
        detectors: {requests:[], accepts:[], titles:[], prettyName:[]}
    }

    // initialize 0s in appropriate places
    // msc addresses

    for(i=0; i<dataStore.DAQ.MSC.MSC.length; i++){
        address = parseMSCindex(dataStore.DAQ.MSC.MSC[i]);

        M = address[0];
        S = address[1];
        C = address[2];

        dataStore.DAQ.summary.collectors.requests[M] = 0;
        dataStore.DAQ.summary.collectors.accepts[M] = 0;
        dataStore.DAQ.summary.collectors.titles[M] = '0x' + M.toString(16) + '---';

        dataStore.DAQ.summary.digitizers.requests[M] = dataStore.DAQ.summary.digitizers.requests[M] || [];
        dataStore.DAQ.summary.digitizers.accepts[M] = dataStore.DAQ.summary.digitizers.accepts[M] || [];
        dataStore.DAQ.summary.digitizers.titles[M] = dataStore.DAQ.summary.digitizers.titles[M] || [];
        dataStore.DAQ.summary.digitizers.requests[M][S] = 0;
        dataStore.DAQ.summary.digitizers.accepts[M][S] = 0;
        dataStore.DAQ.summary.digitizers.titles[M][S] = '0x' + M.toString(16) + S.toString(16) + '--';

        dataStore.DAQ.summary.channels.requests[M] = dataStore.DAQ.summary.channels.requests[M] || [];
        dataStore.DAQ.summary.channels.requests[M][S] = dataStore.DAQ.summary.channels.requests[M][S] || [];
        dataStore.DAQ.summary.channels.accepts[M] = dataStore.DAQ.summary.channels.accepts[M] || [];
        dataStore.DAQ.summary.channels.accepts[M][S] = dataStore.DAQ.summary.channels.accepts[M][S] || [];
        dataStore.DAQ.summary.channels.titles[M] = dataStore.DAQ.summary.channels.titles[M] || [];
        dataStore.DAQ.summary.channels.titles[M][S] = dataStore.DAQ.summary.channels.titles[M][S] || [];
        dataStore.DAQ.summary.channels.requests[M][S][C] = 0;
        dataStore.DAQ.summary.channels.accepts[M][S][C] = 0;
        dataStore.DAQ.summary.channels.titles[M][S][C] = '0x' + M.toString(16) + S.toString(16) + (C<16 ? '0' : '') + C.toString(16);
    }

    //detectors
    for(i=0; i<dataStore.DAQ.MSC.chan.length; i++){
        detPrefix = dataStore.DAQ.MSC.chan[i].slice(0,2);

        if(dataStore.DAQ.summary.detectors.titles.indexOf(detPrefix) == -1){
            dataStore.DAQ.summary.detectors.titles.push(detPrefix);
            dataStore.DAQ.summary.detectors.requests.push(0);
            dataStore.DAQ.summary.detectors.accepts.push(0);
            dataStore.DAQ.summary.detectors.prettyName.push(dataStore.DAQ.detectorNames[detPrefix]);
        }
        dataStore.DAQ.summary.detectors[detPrefix] = {requests: 0, accepts: 0};
    }

    // dom setup
    if(!suppressDOMconfig){
        for(i=0; i<dataStore.DAQ.summary.collectors.titles.length; i++){
            if(dataStore.DAQ.summary.collectors.titles[i]){
                collectorOption = document.createElement('option');
                collectorOption.setAttribute('value', dataStore.DAQ.summary.collectors.titles[i].slice(2,3));
                collectorOption.innerHTML = dataStore.DAQ.summary.collectors.titles[i];
                document.getElementById('collectorPicker').appendChild(collectorOption);
                document.getElementById('digiCollectorPicker').appendChild(collectorOption.cloneNode(true));
            }
        }
        document.getElementById('digiCollectorPicker').onchange();
    }

    dataStore.DAQ.summaryJSON = JSON.stringify(dataStore.DAQ.summary);
}

function sortDAQitem(detector, block){
    // sort the <block> unpacked by unpackDAQ for <channel> into the dataStore summary of the DAQ:

    var address = parseMSCindex(block.MSC),
        M = address[0],
        S = address[1],
        C = address[2],
        detectorCode = detector.slice(0,2),
        detectorIndex = dataStore.DAQ.summary.detectors.titles.indexOf(detectorCode);

    // sort data into summary:
    // master
    dataStore.DAQ.summary.master.requests += block.trigReq;
    dataStore.DAQ.summary.master.accepts += block.trigAcpt;
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
    dataStore.DAQ.summary.detectors.requests[detectorIndex] += block.trigReq;
    dataStore.DAQ.summary.detectors.accepts[detectorIndex]  += block.trigAcpt;     

}

function dataUpdate(){
    //repaint histograms
    repaint();

    //run status
    updateRunStatus();
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

    var collectorFigureIndex = parseInt(selected('collectorPicker'), 16),
        digiCollectorIndex = parseInt(selected('digiCollectorPicker'), 16),
        digitizerFigureIndex = parseInt(selected('digitizerPicker'), 16);

    //master summary
    createBarchart(
        'collectorsHisto', 
        dataStore.DAQ.summary.collectors.titles, 
        dataStore.DAQ.summary.collectors.requests, 
        dataStore.DAQ.summary.collectors.accepts, 
        'Master Channel', 'Collector', 'Hz'
    );

    //Collectors plot
    createBarchart(
        'digitizersHisto', 
        dataStore.DAQ.summary.digitizers.titles[collectorFigureIndex], 
        dataStore.DAQ.summary.digitizers.requests[collectorFigureIndex], 
        dataStore.DAQ.summary.digitizers.accepts[collectorFigureIndex], 
        'Collector ' + dataStore.DAQ.summary.collectors.titles[collectorFigureIndex] + ' Channels', 'Digitizer', 'Hz'
    );

    //Digitizers plot
    createBarchart(
        'channelsHisto', 
        dataStore.DAQ.summary.channels.titles[digiCollectorIndex][digitizerFigureIndex], 
        dataStore.DAQ.summary.channels.requests[digiCollectorIndex][digitizerFigureIndex], 
        dataStore.DAQ.summary.channels.accepts[digiCollectorIndex][digitizerFigureIndex], 
        'Digitizer ' + dataStore.DAQ.summary.digitizers.titles[digiCollectorIndex][digitizerFigureIndex] + ' Channels', 'Channel', 'Hz'
    );    

    //Detectors plot   
    createBarchart(
        'detectorsHisto', 
        dataStore.DAQ.summary.detectors.prettyName, 
        dataStore.DAQ.summary.detectors.requests, 
        dataStore.DAQ.summary.detectors.accepts, 
        'Detector Channels', 'Channel', 'Hz'
    );    
}

function createBarchart(targetDiv, MSClabels, requests, accepts, plotTitle, xTitle, yTitle){
    // re-create the specified histogram

    var layout = {
            barmode: 'group',
            title: plotTitle,
            xaxis: {
                title: xTitle,
                ticktext: MSClabels
            },
            yaxis: {
                title: yTitle
            }
        },
        req = {
          x: MSClabels,
          y: requests,
          name: 'Requests',
          type: 'bar',

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

/////////////////////
// dom wrangling
/////////////////////

function updateDigitizerList(digiSelectID){
    //update the options in the select element digiSelectID with the digitizer addresses in the collector on masterChannel

    var digiSelect = document.getElementById('digitizerPicker'),
        masterChannel = selected('digiCollectorPicker'),
        i, option;

    digiSelect.innerHTML = '';

    for(i=0; i<dataStore.DAQ.summary.digitizers.titles[masterChannel].length; i++){
        if(dataStore.DAQ.summary.digitizers.titles[masterChannel][i]){
            option = document.createElement('option')
            option.setAttribute('value', dataStore.DAQ.summary.digitizers.titles[masterChannel][i].slice(3,4));
            option.innerHTML = dataStore.DAQ.summary.digitizers.titles[masterChannel][i];
            digiSelect.appendChild(option);           
        }
    }
}










