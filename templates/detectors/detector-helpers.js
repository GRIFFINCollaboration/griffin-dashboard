/////////////////////////
// setup
/////////////////////////

function deployDetector(template, title){
    // top level detector setup function

    //handle templates
    templates = ['brand-header', 'brand-footer', 'nav-bar', 'run-status', 'detector-structure', 'detector-view', template, 'adc-sidebar', 'hv-sidebar'];
    dataStore.templates = prepareTemplates(templates);

    parameterizeDetector();

    //inject templates
    injectBoilerplateTemplates(template, title);

    //finish set up and start data fetching
    drawDetector();
    initializeDetector();
}

function setupRequests(){

    //get the ODB DAQ dir and set up adc requests:
    promiseScript('http://' + dataStore.host + '/?cmd=jcopy&odb=/DAQ&encoding=json-p-nokeys&callback=processDAQ');

    //set up HV requests
    dataStore.equipmentQuery = 'http://'+dataStore.host+'/?cmd=jcopy&odb0=Equipment&encoding=json-p-nokeys&callback=sortODBEquipment';

}

function initializeDetector(){
    // set up sidebars and start the heart

    setupADCSidebar('controlsidebar');
    setupHVSidebar('controlsidebar');

    // initiate heartbeat
    dataStore.heartbeat.scriptQueries = [dataStore.runSummaryQuery, dataStore.equipmentQuery, 'http://' + dataStore.host + '/?cmd=jcopy&odb=/DAQ/params&encoding=json-p-nokeys&callback=sortADCparams']
    dataStore.heartbeat.callback = dataUpdate
    heartbeat();
}

function injectBoilerplateTemplates(template, detectorName){
    // set up the boilerplate templates - header, footer, detector structure, navigation and run control

    //header
    document.getElementById('header').innerHTML = Mustache.to_html(
        dataStore.templates['brand-header'], 
        {
            'title': detectorName + ' Detector Status',
        }
    );
    //footer
    document.getElementById('footer').innerHTML = Mustache.to_html(
        dataStore.templates['brand-footer'], 
        {
            
        }
    );
    setupFooter('footerImage', 2, '#999999');
    //detector structure
    document.getElementById('detector-wrap').innerHTML = Mustache.to_html(
        dataStore.templates['detector-structure'], 
        {

        }
    );
    //nav
    document.getElementById('nav').innerHTML = Mustache.to_html(
        dataStore.templates['nav-bar'], 
        {
            
        }
    );
    //run control
    document.getElementById('runStat').innerHTML = Mustache.to_html(
        dataStore.templates['run-status'], 
        {

        }
    );
    //detector display
    document.getElementById('detectorDisplay').innerHTML = Mustache.to_html(
        dataStore.templates[template], 
        {
            'views': dataStore.detector.views,
            'energyButton': dataStore.detector.channelType == 'time' ? [0] : [],
            'timeButton': dataStore.detector.channelType == 'energy' ? [0] : []
        }
    );
    //detector view navigation
    document.getElementById('view-nav').innerHTML = Mustache.to_html(
        dataStore.templates['detector-view'], 
        {
            parameters: dataStore.ADCparameters
        }
    );

}

function processDAQ(payload){
    // do setup things with the DAQ directory from the ODB when it arrives

    fetchDAQ(payload);              // sort the data into useful places
    determineADCrequests();         // decide which ADCs will need to be queried for rates and thresholds
    detectDetectors();              // decide which detectors to link to in the nav bar based on PSC table
}

function processGRIFC(payload){
    // do setup things with the DAQ/GRIFC directory from the ODB when it arrives

    // Not sure if anything needs to be done
    var dataStore.ODB.DAQ.GRIFC = payload;
    console.log('processGRIFC');
}

function sortADCparams(payload){
    // sort the json representation of the ODB's /DAQ/params into the datastore for future visualization:
    // dataStore.data[<channel name>][<parameter name>]

    var channels = Object.keys(dataStore.data),
        dataType, ADC, parameters, i, j;

    if(!dataStore.ODB.DAQ)
        dataStore.ODB.DAQ = {}

    dataStore.ODB.DAQ.params = payload;

    if(dataStore.ODB.DAQ && dataStore.ODB.DAQ.PSC){
        // only unpack for channels in current view
        for(i=0; i<channels.length; i++){
            // only interested in real channels here, not summaries
            if(channels[i].length != 10)
                continue;
            // determine dataType
            dataType = dataStore.ODB.DAQ.PSC.chan.indexOf(channels[i]);
            dataType = dataStore.ODB.DAQ.PSC.datatype[dataType];

            // no dataType -> channel not present in PSC table, bail. 
            if(!isNumeric(dataType))
                continue;

            // what kind of ADC is this? currently all grif16s, but will need more logic once 4gs are in service...
            ADC = 'grif16';

            parameters = Object.keys(dataStore.ODB.DAQ.params[ADC].template[dataType]);

            for(j=0; j<parameters.length; j++){
                dataStore.data[channels[i]][parameters[j]] = dataStore.ODB.DAQ.params[ADC].template[dataType][parameters[j]];

                // is there a custom override of the template value?
                if(dataStore.ODB.DAQ.params[ADC].custom[channels[i]] && dataStore.ODB.DAQ.params[ADC].custom[channels[i]][parameters[j]])
                    dataStore.data[channels[i]][parameters[j]] = dataStore.ODB.DAQ.params[ADC].custom[channels[i]][parameters[j]];

                // force ODB strings to numeric
                if(dataStore.data[channels[i]][parameters[j]] == false)
                    dataStore.data[channels[i]][parameters[j]] = 0;
                else if(dataStore.data[channels[i]][parameters[j]] == true)
                    dataStore.data[channels[i]][parameters[j]] = 1;
                else if(!isNumeric(dataStore.data[channels[i]][parameters[j]]) && typeof(dataStore.data[channels[i]][parameters[j]])!='boolean' ) // hex string
                    dataStore.data[channels[i]][parameters[j]] = parseFloat(dataStore.data[channels[i]][parameters[j]].slice(2)); 
         
            }
            
        }
    }
}

function setupDetector(){
    // once the HTML is in place, set up the generic aspects of detector visualization

    var i, assignErrorPattern;

    // declare some post-html-rendering parameters:
    dataStore.detector.width = document.getElementById('visualizationcollection').offsetWidth;
    dataStore.detector.height = 2/3*dataStore.detector.width;

    // set up quickdraw framework
    dataStore.detector.stage = [];
    dataStore.detector.channelLayer = [];
    dataStore.detector.HVLayer = [];
    dataStore.detector.scaleLayer = [];
    for(i=0; i<dataStore.detector.views.length; i++){
        dataStore.detector.stage[i] = new quickdraw(dataStore.detector.width, dataStore.detector.height);
        document.getElementById(dataStore.detector.views[i] + 'Wrap').appendChild(dataStore.detector.stage[i].canvas)

        dataStore.detector.channelLayer[i] = new qdlayer('channelLayer'+i);
        dataStore.detector.HVLayer[i] = new qdlayer('HVLayer'+i);
        dataStore.detector.scaleLayer[i] = new qdlayer('scaleLayer'+i);

        dataStore.detector.stage[i].add(dataStore.detector.scaleLayer[i]);
        dataStore.detector.stage[i].add(dataStore.detector.channelLayer[i]);
        dataStore.detector.stage[i].add(dataStore.detector.HVLayer[i]);
    }
}

function preFetch(){
    // just before every heartbeat

    createDataStructure();
}

function dataUpdate(){
    // just after every heartbeat
    updateRunStatus();
    repaint();
}

function createDataStructure(){
    // set up an empty data structure:
    // dataStore.data[channel name][subview name]

    var i, j, channel, subview;

    dataStore.data = {};
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i];
        //summary channels have all keys
        if(channel.length == dataStore.detector.summaryDepth){
            dataStore.data[channel] = {}
            for(j=0; j<dataStore.detector.subviews.length; j++){
                dataStore.data[channel][dataStore.detector.subviews[j]] = null;
            }             
        //real channels report only their own parameters
        } else{
            dataStore.data[channel] = {};
            for(j=0; j<dataStore.detector.subviews.length; j++){
                subview = dataStore.detector.subviews[j];
                if(channelInSubview(channel, subview)){
                    dataStore.data[channel][subview] = null;
                }
            }
        }
    }
}

function instantiateCells(view){
    // decalre the qdshape cells for detectors with only a single view
    // view == 0 for detectors where hv cells == scalar cells
    // view == 1 ow

    var i, channel, cellKey,
        cellCoords = {};

    //each channel listed in dataStore.detector.channelNames gets an entry in dataStore.detector.cells as a qdshape object:
    dataStore.detector.cells = {};
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i];

        createCell(channel);

        //add the cell to the appropriate layer; we'll use the HV layer for everything in the case where HV cells == scalar cells
        if(isHV(channel)){
            dataStore.detector.HVLayer[view].add(dataStore.detector.cells[channel])
        } else if(isADCChannel(channel))
            dataStore.detector.channelLayer[view].add(dataStore.detector.cells[channel]);
    }

    if(typeof(drawWindowDressing) == 'function')
        drawWindowDressing();
    setupErrorPattern();
}

function setupErrorPattern(){
    // get the error pattern in place once it arrives

    dataStore.errorPattern = document.getElementById('errorPattern');
    assignErrorPattern = function(){
        var key;

        for(key in dataStore.detector.cells){
            dataStore.detector.cells[key].fillPatternImage = dataStore.errorPattern;
        }
    }
    if(dataStore.errorPattern.complete){
        assignErrorPattern();
    } else {
        dataStore.errorPattern.addEventListener('load', assignErrorPattern);
    }

}

///////////////////////////
// plots & drawing
///////////////////////////

function generateColorScale(scale){
    //generate an initial color scale bar for every view.

    var colorStops = [],
        i, j,
        tick, colorScale, 
        gradientFill, gradientPath;

    //generate a bunch of color stop points for the gradient
    for(i=0; i<100; i++){
        colorStops.push(scalepickr(i/100, dataStore.detector.plotScales[dataStore.detector.subview].color));
    }

    dataStore.detector.tickLabels = [];
    dataStore.detector.scaleTitle = [];
    for(j=0; j<dataStore.detector.views.length; j++){

        //create a gradient fill object
        gradientFill = dataStore.detector.scaleLayer[j].ctx.createLinearGradient(0.1*dataStore.detector.width,0.9*dataStore.detector.height,0.9*dataStore.detector.width,0.95*dataStore.detector.height)
        for(i=0; i<colorStops.length; i++){
            gradientFill.addColorStop(i/100, colorStops[i]);
        }
        gradientPath = generatePath(
            [
                0,0, 
                0.8*dataStore.detector.width,0, 
                0.8*dataStore.detector.width,0.05*dataStore.detector.height,
                0,0.05*dataStore.detector.height
            ], 
            0.1*dataStore.detector.width,
            0.9*dataStore.detector.height
        );

        colorScale = new qdshape(gradientPath, {
            id: 'gradient'+j,
            fillStyle: gradientFill,
            strokeStyle: '#999999',
            lineWidth: 2,
            z: 1
        });

        dataStore.detector.scaleLayer[j].add(colorScale);

        //place empty ticks on scale
        dataStore.detector.tickLabels[j] = [];
        for(i=0; i<11; i++){
            //tick line
            tick = generatePath([0,0,0,0.01*dataStore.detector.height], (0.1+i*0.08)*dataStore.detector.width, 0.95*dataStore.detector.height);
            tick = new qdshape(tick, {
                id: 'tick'+i,
                strokeStyle: '#999999',
                lineWidth: 2
            });
            dataStore.detector.scaleLayer[j].add(tick);

            //tick label
            dataStore.detector.tickLabels[j][i] = new qdtext('', {
                x: (0.1+i*0.08)*dataStore.detector.width,
                y: 0.98*dataStore.detector.height + 2,
                fontSize: 14,
                typeface: 'Arial',
                fillStyle: '#999999'
            });
            dataStore.detector.scaleLayer[j].add(dataStore.detector.tickLabels[j][i]);
        }

        //place empty title on scale
        dataStore.detector.scaleTitle[j] = new qdtext('', {
            x: dataStore.detector.width/2,
            y: 0.9*dataStore.detector.height - 22,
            fontSize : 20,
            typeface: 'Arial',
            fillStyle: '#999999'
        })
        dataStore.detector.scaleLayer[j].add(dataStore.detector.scaleTitle[j]);
    }
}

function refreshColorScale(index){

    var i, isLog, currentMin, currentMax, logTitle, parameterIndex, title, units;

    parameterIndex = findADCparameterIndex();

    //are we in log mode? what minima and maxima are we using?
    if(dataStore.detector.subview == 'adc_settings'){
        isLog = dataStore.ADCparameters[parameterIndex].scale == 'log';
        currentMin = dataStore.ADCparameters[parameterIndex].min; 
        currentMax = dataStore.ADCparameters[parameterIndex].max;
        title = dataStore.ADCparameters[parameterIndex].label;
        units = dataStore.ADCparameters[parameterIndex].unit || '';
    } else{
        isLog = dataStore.detector.plotScales[dataStore.detector.subview].scale == 'log';
        currentMin = dataStore.detector.plotScales[dataStore.detector.subview].min;
        currentMax = dataStore.detector.plotScales[dataStore.detector.subview].max;
        title = dataStore.detector.subviewPrettyText[dataStore.detector.subview];
        units = dataStore.detector.subviewUnits[dataStore.detector.subview]
    }

    if(isLog){
        currentMin = Math.log10(currentMin);
        currentMax = Math.log10(currentMax);
        logTitle = 'log ';
    } else
        logTitle = '';

    //refresh tick labels
    for(i=0; i<11; i++){
        //update text
        dataStore.detector.tickLabels[index][i].text = (generateTickLabel(currentMin, currentMax, 11, i));
        //update position
        dataStore.detector.tickLabels[index][i].x = (0.1+i*0.08)*dataStore.detector.width - dataStore.detector.tickLabels[index][i].getTextMetric().width/2;
    }

    //update title
    dataStore.detector.scaleTitle[index].text = logTitle + title + (units.length>0 ? (' ['+units+']') : '' );
    dataStore.detector.scaleTitle[index].x = dataStore.detector.width/2 - dataStore.detector.scaleTitle[index].getTextMetric().width/2;    
}

function createCell(channel){
    // stamp out a cell for the given channel and coordinate array key
    // note that cell still has to be added to an appropriate layer on a per-detector basis.

    var poly = generatePath(
            dataStore.detector.cellCoords[channel].vertices,
            dataStore.detector.cellCoords[channel].x,
            dataStore.detector.cellCoords[channel].y
        ),
        cell = new qdshape(poly, {
            id: channel,
            fillStyle: '#000000',
            strokeStyle: dataStore.frameColor,
            lineWidth: dataStore.frameLineWidth,
            x: dataStore.detector.cellCoords[channel].x,
            y: dataStore.detector.cellCoords[channel].y,
            z: 1,
            internalRotation: dataStore.detector.cellCoords[channel].internalRotation
        });

    dataStore.detector.cells[channel] = cell;

    //set up the tooltip listeners:
    dataStore.detector.cells[channel].mouseover = writeTooltip.bind(null, channel);
    dataStore.detector.cells[channel].mousemove = moveTooltip;
    dataStore.detector.cells[channel].mouseout = hideTooltip;

    //set up onclick listeners:
    dataStore.detector.cells[channel].click = clickCell.bind(null, channel);
}

function repaint(){
    // repaint the currently displayed image based on the current state of the dataStore

    var currentViewIndex = dataStore.detector.views.indexOf(dataStore.detector.currentView);

    refreshColorScale(currentViewIndex);
    updateCells();

    if(dataStore.tooltip.currentTooltipTarget)
        writeTooltip(dataStore.tooltip.currentTooltipTarget);

    dataStore.detector.stage[currentViewIndex].render();
}

function managePlotScale(setFromDataStore){
    // set the plot control UI parameters based on the dataStore if setFromDataStore == true;
    // change the dataStore parameters based on the UI if setFromDataStore == false.

    var currentSubview = dataStore.detector.subview,
        lin = document.getElementById('linScale'),
        log = document.getElementById('logScale'),
        min = document.getElementById('scaleMin'),
        max = document.getElementById('scaleMax'),
        scale, minValue, parameterIndex, i;

    parameterIndex = findADCparameterIndex();

    if(setFromDataStore){
        if(currentSubview == 'adc_settings'){
            scale = dataStore.ADCparameters[parameterIndex].scale;
            min.value = dataStore.ADCparameters[parameterIndex].min;
            max.value = dataStore.ADCparameters[parameterIndex].max;
        } else{
            scale = dataStore.detector.plotScales[currentSubview].scale;
            min.value = dataStore.detector.plotScales[currentSubview].min;
            max.value = dataStore.detector.plotScales[currentSubview].max;
        }

        if(scale == 'lin')
            lin.click();
        else
            log.click();

    } else {
        scale = document.querySelector('input[name="plotScale"]:checked').value;
        minValue = parseInt(min.value, 10);
        if(scale == 'log' && minValue == 0){
            minValue = 1;
            min.value = 1;
        }

        if(currentSubview == 'adc_settings'){
            dataStore.ADCparameters[parameterIndex].scale = scale;
            dataStore.ADCparameters[parameterIndex].min = minValue;
            dataStore.ADCparameters[parameterIndex].max = parseInt(max.value,10);            
        } else {
            dataStore.detector.plotScales[currentSubview].scale = scale;
            dataStore.detector.plotScales[currentSubview].min = minValue;
            dataStore.detector.plotScales[currentSubview].max = parseInt(max.value,10);
        }

        repaint();
    }

}

////////////////////////
// data management
////////////////////////

function updateCells(){
    //update the color / fill pattern of cells currently on display.

    var i, color, rawValue, colorIndex, channel,
        currentSubview, parameterIndex,
        currentView = dataStore.detector.currentView,
        currentMin, currentMax, currentColor, isLog;

    parameterIndex = findADCparameterIndex();

    //are we in log mode? what minima and maxima are we using?
    if(dataStore.detector.subview == 'adc_settings'){
        isLog = dataStore.ADCparameters[parameterIndex].scale == 'log';
        currentMin = dataStore.ADCparameters[parameterIndex].min; 
        currentMax = dataStore.ADCparameters[parameterIndex].max;
        currentSubview = dataStore.detector.displayParameter;
        currentColor = dataStore.ADCparameters[parameterIndex].color;
    } else{
        isLog = dataStore.detector.plotScales[dataStore.detector.subview].scale == 'log';
        currentMin = dataStore.detector.plotScales[dataStore.detector.subview].min;
        currentMax = dataStore.detector.plotScales[dataStore.detector.subview].max;
        currentSubview = dataStore.detector.subview;
        currentColor = dataStore.detector.plotScales[currentSubview].color
    }

    // get the scale limits right
    if(isLog){
        currentMin = Math.log10(currentMin);
        currentMax = Math.log10(currentMax);
    }

    // change the color of each cell to whatever it should be now:
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i]

        // bail out if this cell isn't in the current view
        if(!inCurrentView(channel))
            continue;

        // assume data unavailable until proven otherwise
        dataStore.detector.cells[channel].fillPriority = 'pattern';

        // fetch the most recent raw value from the currentData store:
        if(dataStore.data[channel] && isNumeric(dataStore.data[channel][currentSubview]) ){
            // data successfully found

            rawValue = dataStore.data[channel][currentSubview];

            if(isLog)
                rawValue = Math.log10(rawValue);

            colorIndex = (rawValue - currentMin) / (currentMax - currentMin);
            if(colorIndex < 0) colorIndex = 0;
            if(colorIndex > 1) colorIndex = 1;
            color = scalepickr(colorIndex, currentColor);

            dataStore.detector.cells[channel].fillStyle = color;
            dataStore.detector.cells[channel].fillPriority = 'color';
        }
    }
}

function summarizeData(){
    // add up totals for aggregate cells in summary view

    var i, j, summaryKey, newValue, channel, subviews = [], subview;

    // don't bother if the PSC table hasn't arrived yet:
    if(!dataStore.ODB.DAQ)
        return 0;

    // what subviews need be considered?
    for(i=0; i<dataStore.ADCparameters.length; i++){
        subviews.push(dataStore.ADCparameters[i].key);
    }
    subviews = dataStore.detector.subviews.concat(subviews);

    //zero out old summaries at this depth
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        if(dataStore.detector.channelNames[i].length == dataStore.detector.summaryDepth){
            for(j=0; j<subviews.length; j++){
                dataStore.data[dataStore.detector.channelNames[i]][subviews[j]] = [0,0];                 
            }
        }
    }

    //now repopulate all summaries; if a constituent is not reporting, the whole summary is 
    //flagged as not reporting - but only consider adc channels in the PSC table, and HV channels in the ODB.Equipment list
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i];

        // only summarize the base channels (don't make summaries of summaries):
        if(channel.length != 10) continue;

        // channel intentionally not plugged in, abort
        if(isADCChannel(channel) && dataStore.ODB.DAQ.PSC.chan.indexOf(channel) == -1) continue;
        if(isHV(channel) && findHVcrate(channel) == -1) continue;

        summaryKey = channel.slice(0,dataStore.detector.summaryDepth);

        for(j=0; j<subviews.length; j++){
            subview = subviews[j];
            
            //abort if the channel in question doesn't have data appropriate for this subview
            if( !channelInSubview(channel, subview) ) continue;

            // increment the sum by this new channel if it is present and no absent channel found yet:
            if( isNumeric(dataStore.data[channel][subview]) && dataStore.data[summaryKey][subview][0] != 0xDEADBEEF ){
                dataStore.data[summaryKey][subview][0] += dataStore.data[channel][subview];
                dataStore.data[summaryKey][subview][1] += 1;
            } else {
                dataStore.data[summaryKey][subview][0] = 0xDEADBEEF;
            }
        }
    }

    //finally, go through all the summaries and turn the [sum, nNterms] pairs into averages:
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        summaryKey = dataStore.detector.channelNames[i];

        if(summaryKey.length != dataStore.detector.summaryDepth) continue;

        for(j=0; j<subviews.length; j++){
            subview = subviews[j];

            if(dataStore.data[summaryKey][subview][0] != 0xDEADBEEF){
                dataStore.data[summaryKey][subview] = dataStore.data[summaryKey][subview][0] / dataStore.data[summaryKey][subview][1];
            } else
                dataStore.data[summaryKey][subview] = null;
        }        
    }
}

function findADC(channel){
    //given a channel name, use the ODB's DAQ table to identify which ADC it belongs to.

    var PSC, channelIndex, P, S, C,
        collectorKey;

    channelIndex = dataStore.ODB.DAQ.PSC.chan.indexOf(channel);
    if(channelIndex == -1)
        return null;

    PSC = dataStore.ODB.DAQ.PSC.PSC[channelIndex];

    P = (PSC & 0xF000) >>> 12;
    S = (PSC & 0x0F00) >>> 8;
    C = (PSC & 0x00FF) >>> 0;

    collectorKey = 'collector0x' + P.toString(16);

    return dataStore.ODB.DAQ.hosts[collectorKey].digitizers[S];
}

function findChannel(channel){
    //given a channel name, use the ODB's DAQ table to identify which ADC channel it is on.

    var PSC, channelIndex

    channelIndex = dataStore.ODB.DAQ.PSC.chan.indexOf(channel);
    if(channelIndex == -1)
        return null;

    PSC = dataStore.ODB.DAQ.PSC.PSC[channelIndex];

    return (PSC & 0x00FF)
}

function findADCparameterIndex(){
    //where is the current adc display parameter in the array of ADC parameters
    var i;

    for(i=0; i<dataStore.ADCparameters.length; i++){
        if(dataStore.ADCparameters[i].key == dataStore.detector.displayParameter)
            return i;
    }

    return -1;
}

function sortODBEquipment(payload){
    // take the ODB equipment directory and populate the HV info with it.

    var i, j,
        keys = Object.keys(payload[0]), 
        HVcrates = [],
        channel;

    dataStore.ODB.Equipment = payload[0];

    //extract the HV crates from the equipment directory
    for(i=0; i<keys.length; i++){
        if(keys[i].slice(0,3) == 'HV-')
            HVcrates.push(payload[0][keys[i]]);
    }

    // sort measured voltage into dataStore.data[channel name].HV
    for(i=0; i<HVcrates.length; i++){
        for(j=0; j<HVcrates[i].Settings.Names.length; j++){
            channel = HVcrates[i].Settings.Names[j];
            if(dataStore.data[channel]){
                dataStore.data[channel].HV = HVcrates[i].Variables.Measured[j];
                dataStore.data[channel].HV_demand = HVcrates[i].Variables.Demand[j];
            }
        }
    }

    // update hv sidebar if present
    if(dataStore.activeHVsidebar)
        populateHVsidebar(dataStore.activeHVsidebar);
}

function unpackDAQdv(dv){
    //parse DAQ dataviews into dataStore.data variables - detector style
    //information for an individual channel is packed in a 14 byte word:
    //[PSC 2 bytes][trig request 4 bytes][trig accept 4 bytes][threshold 4 bytes] <--lowest bit
    var channelIndex, channelName, DAQblock,
        i;

    // @TODO: make grif16 send appropriate pscs and lookup grifadc info based on sent PSC
    for(i=0; i<dv.byteLength/14; i++){
        DAQblock = unpackDAQ(i, dv);

        channelIndex = dataStore.ODB.DAQ.PSC.PSC.indexOf(DAQblock.PSC);
        channelName = dataStore.ODB.DAQ.PSC.chan[channelIndex];

        if(dataStore.data[channelName]){
            dataStore.data[channelName]['trigger_request'] = DAQblock.trigReq;
            dataStore.data[channelName]['trigger_accept'] = DAQblock.trigAcpt;
            dataStore.data[channelName]['threshold'] = DAQblock.threshold;
        }

    }
}

//////////////////////////
// tooltip management
//////////////////////////

function writeTooltip(channel){

    var tooltip = document.getElementById('tooltip'),
        text = '<span class="highlightText">' + channel + '</span><br>', 
        i, key, val, unit,
        dataKeys = Object.keys(dataStore.data[channel]),
        parameterIndex = findADCparameterIndex();

    dataStore.tooltip.currentTooltipTarget = channel;

    // main values (rates, HV, thresholds)
    for(i=0; i<dataKeys.length; i++){
        if(!dataStore.detector.subviewPrettyText[dataKeys[i]])
            continue;
        key = dataKeys[i];
        val = dataStore.data[channel][dataKeys[i]];
        text += dataStore.detector.subviewPrettyText[dataKeys[i]] + ': ';
        text += (isNumeric(val) ? val.toFixed() + ' ' + dataStore.detector.subviewUnits[key] : 'Not Reporting') + '<br>';
    }

    // current ADC parameter
    if(isADCChannel(channel)){
        val = dataStore.data[channel][dataStore.detector.displayParameter];
        unit = dataStore.ADCparameters[parameterIndex].unit;
        text += dataStore.ADCparameters[parameterIndex].label + ': ';
        if(unit == 'bool')
            text += isNumeric(val) ? ( ((val == 1) ? 'True' : 'False')) : 'Not Reporting'
        else
            text += (isNumeric(val) ? val.toFixed() + ' ' + unit : 'Not Reporting');
    }

    tooltip.innerHTML = text;
}

/////////////////////
// view management
/////////////////////

function manageView(suppressRepaint){
    //show the selected detector view
    //intended as an onchange callback to the view select for multi-view detectors

    if(dataStore.detector.currentView)
        document.getElementById(dataStore.detector.currentView + 'Wrap').classList.add('hidden');

    document.getElementById(selected('detectorView') + 'Wrap').classList.remove('hidden');
    dataStore.detector.currentView = selected('detectorView');

    if(!suppressRepaint)
        repaint();
}

function manageSubview(target, suppressRepaint){
    //maange which variable is being plotted in the detector displays

    var i;
    
    //manage button state
    if(dataStore.detector.subview)
        document.getElementById(dataStore.detector.subview + 'Select').classList.remove('active');
    document.getElementById(target + 'Select').classList.add('active');
    dataStore.detector.subview = target;
    dataStore.detector.displayParameter = selected('adc_parameter');

    //manage actual image; note first view always shows the HV layer, ie for summaries and detectors with HV channels == scalar channels
    for(i=1; i<dataStore.detector.views.length; i++){
        if(target == 'HV' || dataStore.detector.singleSubview){
            dataStore.detector.HVLayer[i].display = true;
            dataStore.detector.channelLayer[i].display = false;
        } else{
            dataStore.detector.HVLayer[i].display = false;
            dataStore.detector.channelLayer[i].display = true;
        }
    }

    // hide or show adc parameter control
    if(dataStore.detector.subview == 'adc_settings')
        document.getElementById('adc_parameter').classList.remove('hidden');
    else
        document.getElementById('adc_parameter').classList.add('hidden');

    //repopulate scale control
    managePlotScale(true);

    if(!suppressRepaint)
        repaint();
}

function isHV(cellName){
    // is the named cell an HV channel? To be reimplemented for more complicated detectors.

    return true;
}

function isADCChannel(cellName){
    // is cellName a rate / threshold channel? To be reimplemented for more complicated detectors.

    return true;
}

function inCurrentView(channelName){
    //is channelName currently displayed on screen? To be reimplemented for more complicated detectors.

    return true;
}

function channelInSubview(channelName, subview){
    //should channelName have information relevant to subview? To be reimplemented for more complicated detectors.

    return true;
}

///////////////////////////
// cell click management
///////////////////////////

function clickCell(cellName){
    // response to clicking on <cellName>; reimplemented for detectors with a summary view

    // let everyone know this cell was clicked
    broadcastCellClick(cellName);

    // highlight the cell
    highlightCell(dataStore.detector.cells[cellName]);
}

function broadcastCellClick(channel){
    // send the string <channel> in a custom event to everyone listening listed on dataStore.ADCClickListeners or dataStore.HVClickListners

    var evt, i;

    if(isADCChannel(channel)){
        evt = new CustomEvent('postADC', {'detail': {'channel' : channel} });
        for(i=0; i<dataStore.ADCClickListeners.length; i++){
            document.getElementById(dataStore.ADCClickListeners[i]).dispatchEvent(evt);
        }
    } else if(isHV(channel)){
        evt = new CustomEvent('postHV', 
            {
                'detail': {
                    'channel' : channel,
                    'crate': 'HV-'+findHVcrate(channel)
                } 
            }
        );
        for(i=0; i<dataStore.HVClickListeners.length; i++){
            document.getElementById(dataStore.HVClickListeners[i]).dispatchEvent(evt);
        }
    }
}








