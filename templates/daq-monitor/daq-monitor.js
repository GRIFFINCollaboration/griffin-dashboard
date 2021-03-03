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

        channelIndex = dataStore.ODB.DAQ.MSC.MSC.indexOf(DAQblock.MSC);
        channelName = dataStore.ODB.DAQ.MSC.chan[channelIndex];

        if(channelName) // ie channel *must* be in the ODB MSC table
            sortDAQitem(channelName, DAQblock);
    }
}

function regenerateDatastructure(suppressDOMconfig){
    // rebuild an empty data structure to hold sorted DAQ data, based on the MSC table:
    // dataStore.ODB.DAQ.summary = {
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

    var i, address, M,S,C, detPrefix, collectorOption, digiCollectorOption, detectorOption, first;

    if(dataStore.ODB.DAQ.summaryJSON){
        dataStore.ODB.DAQ.summary = JSON.parse(dataStore.ODB.DAQ.summaryJSON);
        return;
    }

    dataStore.ODB.DAQ.summary = {
        master: {requests: 0, accepts: 0},
        collectors: {requests: [], accepts: [], titles: []},
        digitizers: {requests:[], accepts:[], titles: []},
        channels: {requests:[], accepts:[], titles:[]},
        detectors: {requests:[], accepts:[], titles:[], prettyName:[]}
    }

    // initialize 0s in appropriate places
    // msc addresses

    for(i=0; i<dataStore.ODB.DAQ.MSC.MSC.length; i++){
        address = parseMSCindex(dataStore.ODB.DAQ.MSC.MSC[i]);

        M = address[0];
        S = address[1];
        C = address[2];

        dataStore.ODB.DAQ.summary.collectors.requests[M] = 0;
        dataStore.ODB.DAQ.summary.collectors.accepts[M] = 0;
        dataStore.ODB.DAQ.summary.collectors.titles[M] = '0x' + M.toString(16) + '---';

        dataStore.ODB.DAQ.summary.digitizers.requests[M] = dataStore.ODB.DAQ.summary.digitizers.requests[M] || [];
        dataStore.ODB.DAQ.summary.digitizers.accepts[M] = dataStore.ODB.DAQ.summary.digitizers.accepts[M] || [];
        dataStore.ODB.DAQ.summary.digitizers.titles[M] = dataStore.ODB.DAQ.summary.digitizers.titles[M] || [];
        dataStore.ODB.DAQ.summary.digitizers.requests[M][S] = 0;
        dataStore.ODB.DAQ.summary.digitizers.accepts[M][S] = 0;
        dataStore.ODB.DAQ.summary.digitizers.titles[M][S] = '0x' + M.toString(16) + S.toString(16) + '--';

        dataStore.ODB.DAQ.summary.channels.requests[M] = dataStore.ODB.DAQ.summary.channels.requests[M] || [];
        dataStore.ODB.DAQ.summary.channels.requests[M][S] = dataStore.ODB.DAQ.summary.channels.requests[M][S] || [];
        dataStore.ODB.DAQ.summary.channels.accepts[M] = dataStore.ODB.DAQ.summary.channels.accepts[M] || [];
        dataStore.ODB.DAQ.summary.channels.accepts[M][S] = dataStore.ODB.DAQ.summary.channels.accepts[M][S] || [];
        dataStore.ODB.DAQ.summary.channels.titles[M] = dataStore.ODB.DAQ.summary.channels.titles[M] || [];
        dataStore.ODB.DAQ.summary.channels.titles[M][S] = dataStore.ODB.DAQ.summary.channels.titles[M][S] || [];
        dataStore.ODB.DAQ.summary.channels.requests[M][S][C] = 0;
        dataStore.ODB.DAQ.summary.channels.accepts[M][S][C] = 0;
        dataStore.ODB.DAQ.summary.channels.titles[M][S][C] = '.0x' + M.toString(16) + S.toString(16) + (C<16 ? '0' : '') + C.toString(16); // terrible, shameful hack to prevent plotly from turning the hex labels into decimal numbers :/ BM
    }

    //detectors
    for(i=0; i<dataStore.ODB.DAQ.MSC.chan.length; i++){
        detPrefix = dataStore.ODB.DAQ.MSC.chan[i].slice(0,2);

        if(dataStore.ODB.DAQ.summary.detectors.titles.indexOf(detPrefix) == -1){
            dataStore.ODB.DAQ.summary.detectors.titles.push(detPrefix);
            dataStore.ODB.DAQ.summary.detectors.requests.push(0);
            dataStore.ODB.DAQ.summary.detectors.accepts.push(0);
            dataStore.ODB.DAQ.summary.detectors.prettyName.push(dataStore.ODB.DAQ.detectorNames[detPrefix]);
        }
        dataStore.ODB.DAQ.summary.detectors[detPrefix] = {requests: 0, accepts: 0};
    }

    // dom setup
    if(!suppressDOMconfig){

	
	// Create the Master collector channel mask buttons
	for(j=0; j<16; j++){
            ChanMaskButton = document.createElement('button');
	    string = 'ChanMaskButton0-'+j;
            ChanMaskButton.setAttribute('id', string);
            ChanMaskButton.setAttribute('type', 'button');
            ChanMaskButton.setAttribute('class', 'btn btn-default');
            ChanMaskButton.style = 'font-size:10px';
            ChanMaskButton.style.padding = '4px';
            ChanMaskButton.onclick = function(){
                WriteChanMask(this.id);
            }.bind(ChanMaskButton);
            document.getElementById('MasterChanMaskPicker').appendChild(ChanMaskButton);
	}
	SetAllChanMaskButtons(0,dataStore.ODB.DAQ.params.ChanMask[0]);
	
	
        first = true;
        for(i=0; i<dataStore.ODB.DAQ.summary.collectors.titles.length; i++){
            if(dataStore.ODB.DAQ.summary.collectors.titles[i]){
                collectorOption = document.createElement('button');
                collectorOption.setAttribute('type', 'button');
                collectorOption.setAttribute('class', 'btn btn-default');
                collectorOption.setAttribute('value', dataStore.ODB.DAQ.summary.collectors.titles[i].slice(2,3));
                collectorOption.onclick = function(){
                    activeButton('collectorPicker', this);
                    dataStore.collectorValue = this.value
                    repaint();
                }.bind(collectorOption);
                collectorOption.innerHTML = dataStore.ODB.DAQ.summary.collectors.titles[i];
                document.getElementById('collectorPicker').appendChild(collectorOption);

                digiCollectorOption = collectorOption.cloneNode(true);
                digiCollectorOption.onclick = function(){
                    activeButton('digiCollectorPicker', this);
                    dataStore.digiCollectorValue = this.value;
                    updateDigitizerList("digiCollectorPicker"); 
                    repaint();
                }.bind(digiCollectorOption);
                document.getElementById('digiCollectorPicker').appendChild(digiCollectorOption);

                //start with the first collector selected on both collector and digitizer plots
                if(first){
                    dataStore.collectorValue = collectorOption.value;
                    dataStore.digiCollectorValue = collectorOption.value;
                    updateDigitizerList("digiCollectorPicker"); 
                    activeButton('collectorPicker', collectorOption);
                    activeButton('digiCollectorPicker', digiCollectorOption);
                    first = false;
                }

		
		// Create the Collector channel mask buttons
		if(i<8){
                CollectorChanMaskRow = document.createElement('div');
		name = 'CollectorChanMaskRow'+i;
                CollectorChanMaskRow.setAttribute('id', name);
		CollectorChanMaskRow.innerHTML = 'Collector'+(i+1)+': ';
                document.getElementById('CollectorChanMaskPicker').appendChild(CollectorChanMaskRow);
		for(j=0; j<16; j++){
                ChanMaskButton = document.createElement('button');
		string = 'ChanMaskButton'+(i+1)+'-'+j;
                ChanMaskButton.setAttribute('id', string);
                ChanMaskButton.setAttribute('type', 'button');
                ChanMaskButton.setAttribute('class', 'btn btn-default');
                ChanMaskButton.style = 'font-size:10px';
		ChanMaskButton.style.padding = '4px';
                ChanMaskButton.onclick = function(){
                    WriteChanMask(this.id);
                }.bind(ChanMaskButton);
                document.getElementById(name).appendChild(ChanMaskButton);
		}
		SetAllChanMaskButtons(i+1,dataStore.ODB.DAQ.params.ChanMask[i+1]);
		}
            }
        }
        updateDigitizerList("digiCollectorPicker"); 
        repaint();
    }

    dataStore.ODB.DAQ.summaryJSON = JSON.stringify(dataStore.ODB.DAQ.summary);
}

function WriteChanMask(id){
    //This function is called when a button representing a specific bit is toggled. The behaviour is as follows:
    //Get the chanmask from the ODB because it may be different to the status of the buttons (page may not have been refreshed recently etc)
    //Change the bit in the chanmask which has been toggled
    //Set the new chanmask value in the ODB
    //Set all the buttons to match the current chanmask
    
    // Determine which button was toggled
    thisCollector = id.match(/\d+/)[0]; 
    thisIdNumber = id.substring(id.indexOf('-'),id.length).match(/\d+/)[0]; 
    
    //Get the chanmask from the ODB
    currentChanmask = dataStore.ODB.DAQ.params.ChanMask[thisCollector];
    
    //Change the bit in the chanmask which has been toggled
    currentChanmask ^= (1 << thisIdNumber);
    
    //Set the new chanmask in the ODB and dataStore
    pokeURL('http://'+dataStore.host+'/?cmd=jset&odb=DAQ/params/ChanMask['+thisCollector+']&value='+currentChanmask);
    dataStore.ODB.DAQ.params.ChanMask[thisCollector] = currentChanmask;
    
    //Change the displayed chanmask to the new value
    //Note that the div for this display has not been created (ie code not added for that)
   // document.getElementById('chanmaskDisplay').innerHTML = '0x'+currentChanmask.toString(16);
    
    //Set all the buttons to match the current chanmask
    SetAllChanMaskButtons(thisCollector,currentChanmask);
    
    return;    
}

function SetAllChanMaskButtons(thisCollector,currentNumber){
    //This function sets the initial values of the buttons used for the channel mask
    // Set all 16 buttons appropriately based on the current value of the chanmask
    for(i=0; i<16; i++){
	name='ChanMaskButton'+thisCollector+'-'+(i);
	
	// Determine if this bit is set in the chanmask
	if((currentNumber & (1 << i))!=0){ thisBit=1; }else{ thisBit=0;}
	
	// Set the button attributes appropriately
	if(thisBit){
	    string='0x'+i.toString(16)+'<br>Enabled'
	    document.getElementById(name).innerHTML = string;
	    document.getElementById(name).status = 'true'; 
	    document.getElementById(name).style.background='#5cb85c';
	}else{
	    string='0x'+i.toString(16)+'<br>Disabled'
	    document.getElementById(name).innerHTML = string;
	    document.getElementById(name).status = 'false';
	    document.getElementById(name).style.background='#e74c3c';
	}
    }
    return;
}

function activeButton(groupID, targetButton){
    // make the target button be the only .active button in its group

    var buttons = document.getElementById(groupID).getElementsByTagName('button'),
        i;

    for(i=0; i<buttons.length; i++){
        buttons[i].classList.remove('active');
    }
    targetButton.classList.add('active');
}

function sortDAQitem(detector, block){
    // sort the <block> unpacked by unpackDAQ for <channel> into the dataStore summary of the DAQ:

    var address = parseMSCindex(block.MSC),
        M = address[0],
        S = address[1],
        C = address[2],
        detectorCode = detector.slice(0,2),
        detectorIndex = dataStore.ODB.DAQ.summary.detectors.titles.indexOf(detectorCode);

    // sort data into summary:
    // master
    dataStore.ODB.DAQ.summary.master.requests += block.trigReq;
    dataStore.ODB.DAQ.summary.master.accepts += block.trigAcpt;
    // collectors
    dataStore.ODB.DAQ.summary.collectors.requests[M] += block.trigReq;
    dataStore.ODB.DAQ.summary.collectors.accepts[M] += block.trigAcpt;
    // digitizers
    dataStore.ODB.DAQ.summary.digitizers.requests[M][S] += block.trigReq;
    dataStore.ODB.DAQ.summary.digitizers.accepts[M][S] += block.trigAcpt;
    // digi channels
    dataStore.ODB.DAQ.summary.channels.requests[M][S][C] += block.trigReq;
    dataStore.ODB.DAQ.summary.channels.accepts[M][S][C] += block.trigAcpt;
    // detector
    dataStore.ODB.DAQ.summary.detectors.requests[detectorIndex] += block.trigReq;
    dataStore.ODB.DAQ.summary.detectors.accepts[detectorIndex]  += block.trigAcpt;     

}

function dataUpdate(){
    //run status
    updateRunStatus();

    //repaint histograms
    repaint();
}

function preFetch(){
    //dump old data:

    if(dataStore.ODB.hasOwnProperty('DAQ'))
        regenerateDatastructure();
}

// Rishita ----------------------------------------------------------------------------

function findChannelName(address) {
	// address is 0xMSCC
	var MSC, length, channelIndex, M, S, C, current_address;

	length = dataStore.ODB.DAQ.MSC.MSC.length;
	for(i=0; i < length; i++) {
		MSC = dataStore.ODB.DAQ.MSC.MSC[i];
    		
		M = (MSC & 0xF000) >>> 12;
    		S = (MSC & 0x0F00) >>> 8;
    		C = (MSC & 0x00FF) >>> 0;

		current_address = '0x' + M.toString(16) + S.toString(16) + '--' ;

		if(current_address == address) {
			channelIndex = i;
			break;
		}
	}
	return dataStore.ODB.DAQ.MSC.chan[channelIndex];
}

function findADC(channel){
    //given a channel name, use the ODB's DAQ table to identify which ADC it belongs to.

    var MSC, channelIndex, M, S, C,
        collectorKey;

    channelIndex = dataStore.ODB.DAQ.MSC.chan.indexOf(channel);
    if(channelIndex == -1)
        return null;

    MSC = dataStore.ODB.DAQ.MSC.MSC[channelIndex];

    M = (MSC & 0xF000) >>> 12;
    S = (MSC & 0x0F00) >>> 8;
    C = (MSC & 0x00FF) >>> 0;

    collectorKey = 'collector0x' + M.toString(16);

    return dataStore.ODB.DAQ.hosts[collectorKey].digitizers[S];
}

// ------------------------------------------------------------------------------------

////////////////////////////////////////
// histogram painting and updating
////////////////////////////////////////

function repaint(){
    var collectorFigureIndex = parseInt(dataStore.collectorValue, 16),
        digiCollectorIndex = parseInt(dataStore.digiCollectorValue, 16),
        digitizerFigureIndex = parseInt(dataStore.digitizerValue, 16),
	address, channelName, ADC, url;

    //master summary
    createBarchart(
        'collectorsHisto', 
        dataStore.ODB.DAQ.summary.collectors.titles, 
        dataStore.ODB.DAQ.summary.collectors.requests, 
        dataStore.ODB.DAQ.summary.collectors.accepts, 
        'Master Channel', 'Collector', 'Hz'
    );

    //Collectors plot
    createBarchart(
        'digitizersHisto', 
        dataStore.ODB.DAQ.summary.digitizers.titles[collectorFigureIndex], 
        dataStore.ODB.DAQ.summary.digitizers.requests[collectorFigureIndex], 
        dataStore.ODB.DAQ.summary.digitizers.accepts[collectorFigureIndex], 
        'Collector ' + dataStore.ODB.DAQ.summary.collectors.titles[collectorFigureIndex] + ' Channels', 'Digitizer', 'Hz'
    );

	// Rishita -------------------------------------------------------------------
		address = dataStore.ODB.DAQ.summary.digitizers.titles[digiCollectorIndex][digitizerFigureIndex];
		channelName = findChannelName(address);
		ADC = findADC(channelName);	
    // ---------------------------------------------------------------------------
    LinkString = "<a href=\"https://" + ADC + "\" target=\"_blank\">" + ADC + "</a>";
    document.getElementById("digitizerLink").innerHTML = LinkString;

    //Digitizers plot
    createBarchart(
        'channelsHisto', 
        dataStore.ODB.DAQ.summary.channels.titles[digiCollectorIndex][digitizerFigureIndex], 
        dataStore.ODB.DAQ.summary.channels.requests[digiCollectorIndex][digitizerFigureIndex], 
        dataStore.ODB.DAQ.summary.channels.accepts[digiCollectorIndex][digitizerFigureIndex], 
        'Digitizer ' + dataStore.ODB.DAQ.summary.digitizers.titles[digiCollectorIndex][digitizerFigureIndex] + ' Channels<br>' + ADC, 'Channel', 'Hz'
    );  

    //Detectors plot   
    createBarchart(
        'detectorsHisto', 
        dataStore.ODB.DAQ.summary.detectors.prettyName, 
        dataStore.ODB.DAQ.summary.detectors.requests, 
        dataStore.ODB.DAQ.summary.detectors.accepts, 
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
        masterChannel = dataStore.digiCollectorValue,
        i, option, first;

    digiSelect.innerHTML = '';
    first = true;
    for(i=0; i<dataStore.ODB.DAQ.summary.digitizers.titles[masterChannel].length; i++){
        if(dataStore.ODB.DAQ.summary.digitizers.titles[masterChannel][i]){
            option = document.createElement('button');
            option.setAttribute('type', 'button');
            option.setAttribute('class', 'btn btn-default');
            option.setAttribute('value', dataStore.ODB.DAQ.summary.digitizers.titles[masterChannel][i].slice(3,4));
            option.onclick = function(){
                activeButton('digitizerPicker', this);
                dataStore.digitizerValue = this.value;
                repaint();
            }.bind(option);
            option.innerHTML = dataStore.ODB.DAQ.summary.digitizers.titles[masterChannel][i];
            digiSelect.appendChild(option);   

            // default to the first digitizer:
            if(first){
                activeButton('digitizerPicker', option);
                dataStore.digitizerValue = option.value;
                first = false;
            }        
        }
    }
}










