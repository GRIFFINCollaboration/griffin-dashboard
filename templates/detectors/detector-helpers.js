/////////////////////////
// setup
/////////////////////////

function dataUpdate(){
    //post-heartbeat callback:
    updateRunStatus();
    repaint();
}

function setupDetector(){
    // once the HTML is in place, finish setting up the detector visualization.

    var i, assignErrorPattern;

    // declare some post-html-rendering parameters:
    dataStore.detector.width = document.getElementById('visualizationcollection').offsetWidth;
    dataStore.detector.height = 2/3*dataStore.detector.width;

    // set up kinetic framework
    dataStore.detector.stage = [];
    dataStore.detector.channelLayer = [];
    dataStore.detector.HVLayer = [];
    dataStore.detector.scaleLayer = [];
    for(i=0; i<dataStore.detector.views.length; i++){
        dataStore.detector.stage[i] = new Kinetic.Stage({
            container: dataStore.detector.views[i] + 'Wrap',
            width: dataStore.detector.width,
            height: dataStore.detector.height
        });
        dataStore.detector.channelLayer[i] = new Kinetic.Layer();
        dataStore.detector.HVLayer[i] = new Kinetic.Layer();
        dataStore.detector.scaleLayer[i] = new Kinetic.Layer();

        dataStore.detector.stage[i].add(dataStore.detector.scaleLayer[i]);
        dataStore.detector.stage[i].add(dataStore.detector.channelLayer[i]);
        dataStore.detector.stage[i].add(dataStore.detector.HVLayer[i]);
    }

    //set up error pattern
    dataStore.errorPattern = document.getElementById('errorPattern');
    assignErrorPattern = function(){
        var key;
        for(key in dataStore.detector.cells){
            dataStore.detector.cells[key].setAttr('fillPatternImage', dataStore.errorPattern);
        }
    }
    if(dataStore.errorPattern.complete){
        assignErrorPattern();
    } else {
        dataStore.errorPattern.addEventListener('load', assignErrorPattern);
    }
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
    // decalre the kinetic cells for detectors with only a single view
    // view == 0 for detectors where hv cells == scalar cells
    // view == 1 ow

    var i, channel, cellKey,
        cellCoords = {};

    //each channel listed in dataStore.detector.channelNames gets an entry in dataStore.detector.cells as a Kinetic object:
    dataStore.detector.cells = {};
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i];

        createCell(channel);

        //add the cell to the appropriate layer; we'll use the HV layer for everything in the case where HV cells == scalar cells
        if(isHV(channel))
            dataStore.detector.HVLayer[view].add(dataStore.detector.cells[channel])
        else if(isADCChannel(channel))
            dataStore.detector.channelLayer[view].add(dataStore.detector.cells[channel]);
    }
}

///////////////////////////
// plots & drawing
///////////////////////////

function generateColorScale(scale){
    //generate an initial color scale bar for every view.

    var colorStops = [],
        i, j,
        tick, colorScale;

    //generate a bunch of color stop points for the gradient
    for(i=0; i<101; i++){
        colorStops.push(i/100);
        colorStops.push(scalepickr(i/100, dataStore.detector.plotScales[dataStore.detector.subview].color));
    }

    dataStore.detector.tickLabels = [];
    dataStore.detector.scaleTitle = [];
    for(j=0; j<dataStore.detector.views.length; j++){

        //draw the gradient itself
        colorScale = new Kinetic.Rect({
            x: 0.1*dataStore.detector.width,
            y: 0.9*dataStore.detector.height,
            width: 0.8*dataStore.detector.width,
            height: 0.05*dataStore.detector.height,
            fillLinearGradientStartPoint: {x: 0, y: 0}, //TIL: gradient coords are relative to the shape, not the layer
            fillLinearGradientEndPoint: {x: 0.8*dataStore.detector.width, y: 0},
            fillLinearGradientColorStops: colorStops,
            stroke: '#999999',
            strokeWidth: 2                    
        });

        dataStore.detector.scaleLayer[j].add(colorScale);

        //place empty ticks on scale
        dataStore.detector.tickLabels[j] = [];
        for(i=0; i<11; i++){
            //tick line
            tick = new Kinetic.Line({
                points: [(0.1+i*0.08)*dataStore.detector.width, 0.95*dataStore.detector.height, (0.1+i*0.08)*dataStore.detector.width, 0.96*dataStore.detector.height],
                stroke: '#999999',
                strokeWidth: 2
            });
            dataStore.detector.scaleLayer[j].add(tick);

            //tick label
            dataStore.detector.tickLabels[j][i] = new Kinetic.Text({
                x: (0.1+i*0.08)*dataStore.detector.width,
                y: 0.96*dataStore.detector.height + 2,
                text: '',
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#999999'
            });
            dataStore.detector.scaleLayer[j].add(dataStore.detector.tickLabels[j][i]);
        }

        //place empty title on scale
        dataStore.detector.scaleTitle[j] = new Kinetic.Text({
            x: dataStore.detector.width/2,
            y: 0.9*dataStore.detector.height - 22,
            text: '',
            fontSize : 20,
            fontFamily: 'Arial',
            fill: '#999999'
        })
        dataStore.detector.scaleLayer[j].add(dataStore.detector.scaleTitle[j]);
    }
}

function refreshColorScale(index){

    var i, isLog, currentMin, currentMax, logTitle;

    //are we in log mode?
    isLog = dataStore.detector.plotScales[dataStore.detector.subview].scale == 'log';

    //what minima and maxima are we using?
    currentMin = dataStore.detector.plotScales[dataStore.detector.subview].min;
    currentMax = dataStore.detector.plotScales[dataStore.detector.subview].max;
    if(isLog){
        currentMin = Math.log10(currentMin);
        currentMax = Math.log10(currentMax);
        logTitle = 'log ';
    } else
        logTitle = '';

    //refresh tick labels
    for(i=0; i<11; i++){
        //update text
        dataStore.detector.tickLabels[index][i].setText(generateTickLabel(currentMin, currentMax, 11, i));
        //update position
        dataStore.detector.tickLabels[index][i].setAttr('x', (0.1+i*0.08)*dataStore.detector.width - dataStore.detector.tickLabels[index][i].getTextWidth()/2);
    }

    //update title
    dataStore.detector.scaleTitle[index].setText(logTitle + dataStore.detector.subviewPrettyText[dataStore.detector.subview] + ' [' + dataStore.detector.subviewUnits[dataStore.detector.subview] + ']');
    dataStore.detector.scaleTitle[index].setAttr('x', dataStore.detector.width/2 - dataStore.detector.scaleTitle[index].getTextWidth()/2);

    dataStore.detector.scaleLayer[index].draw();
    
}

function createCell(channel){
    // stamp out a cell for the given channel and coordinate array key
    // note that cell still has to be added to an appropriate layer on a per-detector basis.

    dataStore.detector.cells[channel] = new Kinetic.Line({
        points: dataStore.detector.cellCoords[channel].vertices,
        fill: '#000000',
        x: dataStore.detector.cellCoords[channel].x || 0,
        y: dataStore.detector.cellCoords[channel].y || 0,
        rotation: dataStore.detector.cellCoords[channel].internalRotation || 0,
        fillPatternOffsetX: 100*Math.random(),
        fillPatternOffsetY: 100*Math.random(),
        stroke: dataStore.frameColor,
        strokeWidth: dataStore.frameLineWidth,
        closed: true,
        listening: true
    });

    //set up the tooltip listeners:
    dataStore.detector.cells[channel].on('mouseover', writeTooltip.bind(null, channel));
    dataStore.detector.cells[channel].on('mousemove', moveTooltip);
    dataStore.detector.cells[channel].on('mouseout',  hideTooltip);

    //set up onclick listeners:
    dataStore.detector.cells[channel].on('click', clickCell.bind(null, channel) );
}

function repaint(){
    // repaint the currently displayed image based on the current state of the dataStore

    var currentViewIndex = dataStore.detector.views.indexOf(dataStore.detector.currentView);

    refreshColorScale(currentViewIndex);
    updateCells();

    if(dataStore.tooltip.currentTooltipTarget)
        writeTooltip(dataStore.tooltip.currentTooltipTarget);

    dataStore.detector.stage[currentViewIndex].draw();
}

function managePlotScale(setFromDataStore){
    // set the plot control UI parameters based on the dataStore if setFromDataStore == true;
    // change the dataStore parameters based on the UI if setFromDataStore == false.

    var currentSubview = dataStore.detector.subview,
        lin = document.getElementById('linScale'),
        log = document.getElementById('logScale'),
        min = document.getElementById('scaleMin'),
        max = document.getElementById('scaleMax'),
        scale, minValue;

    if(setFromDataStore){
        if(dataStore.detector.plotScales[currentSubview].scale == 'lin')
            lin.click();
        else
            log.click();

        min.value = dataStore.detector.plotScales[currentSubview].min;
        max.value = dataStore.detector.plotScales[currentSubview].max;
    } else {
        scale = document.querySelector('input[name="plotScale"]:checked').value;
        minValue = parseInt(min.value, 10);
        if(scale == 'log' && minValue == 0){
            minValue = 1;
            min.value = 1;
        }

        dataStore.detector.plotScales[currentSubview].scale = scale;
        dataStore.detector.plotScales[currentSubview].min = minValue;
        dataStore.detector.plotScales[currentSubview].max = parseInt(max.value,10);

        repaint();
    }

}

////////////////////////
// data management
////////////////////////

function updateCells(){
    //update the color / fill pattern of cells currently on display.

    var i, color, rawValue, colorIndex, channel,
        currentSubview = dataStore.detector.subview,
        currentView = dataStore.detector.currentView,
        currentMin = dataStore.detector.plotScales[currentSubview].min, 
        currentMax = dataStore.detector.plotScales[currentSubview].max,
        currentColor = dataStore.detector.plotScales[currentSubview].color,
        isLog = dataStore.detector.plotScales[currentSubview].scale == 'log';

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
        dataStore.detector.cells[channel].setFillPriority('pattern');

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

            dataStore.detector.cells[channel].fill(color);
            dataStore.detector.cells[channel].setFillPriority('color');

        }
    }
}

function summarizeData(){
    var i, j, summaryKey, newValue, channel, subview;

    // don't bother if the MSC table hasn't arrived yet:
    if(!dataStore.DAQ)
        return 0;

    //zero out old summaries at this depth
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        if(dataStore.detector.channelNames[i].length == dataStore.detector.summaryDepth){
            for(j=0; j<dataStore.detector.subviews.length; j++){
                dataStore.data[dataStore.detector.channelNames[i]][dataStore.detector.subviews[j]] = [0,0];                 
            }
        }
    }

    //now repopulate all summaries; if a constituent is not reporting, the whole summary is 
    //flagged as not reporting - but only consider rate channels in the MSC table, and HV channels in the ODB.Equipment list
    for(i=0; i<dataStore.detector.channelNames.length; i++){
        channel = dataStore.detector.channelNames[i];

        // channel intentionally not plugged in, abort
        if(isADCChannel(channel) && dataStore.DAQ.MSC.chan.indexOf(channel) == -1) continue;
        if(isHV(channel) && findHVcrate(channel) == -1) continue;

        // only summarize the base channels (don't make summaries of summaries):
        if(channel.length != 10) continue;

        summaryKey = channel.slice(0,dataStore.detector.summaryDepth);

        for(j=0; j<dataStore.detector.subviews.length; j++){
            subview = dataStore.detector.subviews[j];

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

        for(j=0; j<dataStore.detector.subviews.length; j++){
            subview = dataStore.detector.subviews[j];

            if(dataStore.data[summaryKey][subview][0] != 0xDEADBEEF){
                dataStore.data[summaryKey][subview] = dataStore.data[summaryKey][subview][0] / dataStore.data[summaryKey][subview][1];
            } else
                dataStore.data[summaryKey][subview] = null;
        }        
    }
}

function findADC(channel){
    //given a channel name, use the ODB's DAQ table to identify which ADC it belongs to.

    var MSC, channelIndex, M, S, C,
        collectorKey;

    channelIndex = dataStore.DAQ.MSC.chan.indexOf(channel);
    if(channelIndex == -1)
        return null;

    MSC = dataStore.DAQ.MSC.MSC[channelIndex];

    M = (MSC & 0xF000) >>> 12;
    S = (MSC & 0x0F00) >>> 8;
    C = (MSC & 0x00FF) >>> 0;

    collectorKey = 'collector0x' + M.toString(16);

    return dataStore.DAQ.hosts[collectorKey].digitizers[S];
}

function findChannel(channel){
    //given a channel name, use the ODB's DAQ table to identify which ADC channel it is on.

    var MSC, channelIndex

    channelIndex = dataStore.DAQ.MSC.chan.indexOf(channel);
    if(channelIndex == -1)
        return null;

    MSC = dataStore.DAQ.MSC.MSC[channelIndex];

    return (MSC & 0x00FF)
}

function determineADCrequests(){
    // generate the URLs for rate and threshold requests, park them in the dataStore, and kick the heartbeat to start fetching.

    var i;

    //insert url queries into heartbeat polls:
    for(i=0; i<dataStore.hosts.length; i++){
        dataStore.heartbeat.URLqueries.push(['http://' + dataStore.hosts[i] + '/report', 'arraybuffer', unpackDAQdv])
    }

    //bump the heartbeat
    startHeart();

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


function findHVcrate(channel){
    //given an HV cell name, return the index of the HV crate it is powered by

    var i=0,
        match = false,
        crateID = -1;

    while(!match && dataStore.ODB.Equipment['HV-'+i]){
        if(dataStore.ODB.Equipment['HV-'+i].Settings.Names.indexOf(channel) != -1){
            match = true;
            crateID = i;
        }
        else 
            i++;
    }

    if(match)
        return crateID;
    else
        return -1;
}

function unpackDAQdv(dv){
    //parse DAQ dataviews into dataStore.data variables
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

//////////////////////////
// tooltip management
//////////////////////////

function writeTooltip(channel){

    var tooltip = document.getElementById('tooltip'),
        text = '<span class="highlightText">' + channel + '</span><br>', 
        i, key, val,
        dataKeys = Object.keys(dataStore.data[channel]);

    dataStore.tooltip.currentTooltipTarget = channel;

    for(i=0; i<dataKeys.length; i++){
        key = dataKeys[i];
        val = dataStore.data[channel][dataKeys[i]];
        text += dataStore.detector.subviewPrettyText[dataKeys[i]] + ': ';
        text += (isNumeric(val) ? val.toFixed() + ' ' + dataStore.detector.subviewUnits[key] : 'Not Reporting') + '<br>';
    }

    tooltip.innerHTML = text;
}

function hideTooltip(){

    var tooltip = document.getElementById('tooltip');
    tooltip.setAttribute('style', 'display:none;');   
}

function moveTooltip(event){

    var tooltip = document.getElementById('tooltip'),
        offset = getPosition(document.getElementById('detectorDisplay')),
        gap = 20;

    tooltip.setAttribute('style', 'display:inline-block; z-index:10; position: absolute; left:' + (event.pageX - offset.x + gap) + '; top:' + (event.pageY - offset.y + gap)  + ';');
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

    //manage actual image; note first view always shows the HV layer, ie for summaries and detectors with HV channels == scalar channels
    for(i=1; i<dataStore.detector.views.length; i++){
        if(target == 'HV'){
            dataStore.detector.HVLayer[i].show();
            dataStore.detector.channelLayer[i].hide();
        } else{
            dataStore.detector.HVLayer[i].hide();
            dataStore.detector.channelLayer[i].show();
        }
    }

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
    highlightCell(cellName);
}

function broadcastCellClick(channel){
    // send the string <channel> in a custom event to everyone listening listed on dataStore.ADCClickListeners

    var evt, i;

    if(isADCChannel(channel)){
        evt = new CustomEvent('postADC', {'detail': {'channel' : channel} });
        for(i=0; i<dataStore.ADCClickListeners.length; i++){
            document.getElementById(dataStore.ADCClickListeners[i]).dispatchEvent(evt);
        }
    } else if(isHV(channel)){
        evt = new CustomEvent('postHV', {'detail': {'channel' : channel} });
        for(i=0; i<dataStore.HVClickListeners.length; i++){
            document.getElementById(dataStore.HVClickListeners[i]).dispatchEvent(evt);
        }
    }
}

function highlightCell(channel){
    // draw a big red border around the last cell clicked, and remove the previous big red border if it exists.

    if(dataStore.detector.lastCellClick){
        dataStore.detector.cells[dataStore.detector.lastCellClick].setAttr('stroke', dataStore.frameColor);
        dataStore.detector.cells[dataStore.detector.lastCellClick].setAttr('strokeWidth', dataStore.frameLineWidth);
    }
    dataStore.detector.lastCellClick = channel;
    dataStore.detector.cells[channel].setAttr('stroke', '#FF0000');
    dataStore.detector.cells[channel].setAttr('strokeWidth', 6);
    dataStore.detector.cells[channel].moveToTop();
    
    repaint();
}














