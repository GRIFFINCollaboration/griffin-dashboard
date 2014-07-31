//abstraction tag for detectors to inherit from
(function(){  

    xtag.register('detector-template', {
        extends: 'div',
        lifecycle: {
            created: function() {},
            inserted: function() {},
            removed: function() {},
            attributeChanged: function() {}
        }, 
        events: { 

        },
        accessors: {

        }, 
        methods: {
            //generate the color scale
            'generateColorScale': function(){
                var colorStops = [],
                    i, j,
                    tick, colorScale;

                //generate a bunch of color stop points for the gradient
                for(i=0; i<101; i++){
                    colorStops.push(i/100);
                    colorStops.push(scalepickr(i/100, this.scale));
                }

                this.tickLabels = [];
                this.scaleTitle = [];
                for(j=0; j<this.viewNames.length; j++){

                    //draw the gradient itself
                    colorScale = new Kinetic.Rect({
                        x: 0.1*this.width,
                        y: 0.9*this.height,
                        width: 0.8*this.width,
                        height: 0.05*this.height,
                        fillLinearGradientStartPoint: {x: 0, y: 0}, //TIL: gradient coords are relative to the shape, not the layer
                        fillLinearGradientEndPoint: {x: 0.8*this.width, y: 0},
                        fillLinearGradientColorStops: colorStops,
                        stroke: '#999999',
                        strokeWidth: 2                    
                    });

                    this.scaleLayer[j].add(colorScale);

                    //place ticks on scale
                    this.tickLabels[j] = [];
                    for(i=0; i<11; i++){
                        //tick line
                        tick = new Kinetic.Line({
                            points: [(0.1+i*0.08)*this.width, 0.95*this.height, (0.1+i*0.08)*this.width, 0.96*this.height],
                            stroke: '#999999',
                            strokeWidth: 2
                        });
                        this.scaleLayer[j].add(tick);

                        //tick label
                        this.tickLabels[j][i] = new Kinetic.Text({
                            x: (0.1+i*0.08)*this.width,
                            y: 0.96*this.height + 2,
                            text: '',
                            fontSize: 14,
                            fontFamily: 'Arial',
                            fill: '#999999'
                        });
                        this.scaleLayer[j].add(this.tickLabels[j][i]);
                    }

                    //place title on scale
                    this.scaleTitle[j] = new Kinetic.Text({
                        x: this.width/2,
                        y: 0.9*this.height - 22,
                        text: '',
                        fontSize : 20,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    })
                    this.scaleLayer[j].add(this.scaleTitle[j]);

                    //populate labels
                    this.refreshColorScale();
                    this.stage[j].add(this.scaleLayer[j]);
                    this.scaleLayer[j].draw();
                }
            },

            'inCurrentView': function(channelName){
                return true; //appropriate for a detector with only a single view, reimplement if >1 view.
            },

            'instantiateCells': function(){
                var i;

                //each channel listed in this.channelNames gets an entry in this.cells as a Kinetic object:
                for(i=0; i<this.channelNames.length; i++){
                    this.cells[this.channelNames[i]] = new Kinetic.Line({
                        points: [100,100,200,100,200,200,100,200,100,100],
                        fill: '#000000',
                        stroke: this.frameColor,
                        strokeWidth: this.frameLineWidth,
                        closed: true,
                        listening: true
                    });

                    //set up the tooltip listeners:
                    this.cells[this.channelNames[i]].on('mouseover', this.writeTooltip.bind(this, i) );
                    this.cells[this.channelNames[i]].on('mouseout', this.writeTooltip.bind(this, -1));

                    //add the cell to the main layer
                    this.mainLayer.add(this.cells[this.channelNames[i]]);
                }

                //add the layers to the stage
                this.stage.add(this.mainLayer);
            },

            //move the tooltip around
            'moveTooltip' : function(evt){
                var tt = document.getElementById('tooltip');

                tt.setAttribute('style', 'display:block; z-index:10; position: absolute; left:' + evt.pageX + '; top:' + evt.pageY  + ';');
            },

            //refresh the color scale labeling / coloring:
            'refreshColorScale': function(){

                var i, j, isLog, currentMin, currentMax, logTitle;

                //are we in log mode?
                isLog = this.scaleType[this.currentView] == 'log';

                //what minima and maxima are we using?
                currentMin = this.min[this.currentView];
                currentMax = this.max[this.currentView];
                if(isLog){
                    currentMin = Math.log10(currentMin);
                    currentMax = Math.log10(currentMax);
                    logTitle = 'log ';
                } else
                    logTitle = '';

                //refresh tick labels
                for(j=0; j<this.viewNames.length; j++){
                    //bail out if this scale isn't on display:
                    if(j != this.displayIndex)
                        continue

                    for(i=0; i<11; i++){
                        //update text
                        this.tickLabels[j][i].setText(generateTickLabel(currentMin, currentMax, 11, i));
                        //update position
                        this.tickLabels[j][i].setAttr('x', (0.1+i*0.08)*this.width - this.tickLabels[j][i].getTextWidth()/2);
                    }

                    //update title
                    this.scaleTitle[j].setText(logTitle + this.viewLabels[this.views.indexOf(this.currentView)] + ' [' + this.currentUnit + ']');
                    this.scaleTitle[j].setAttr('x', this.width/2 - this.scaleTitle[j].getTextWidth()/2);

                    this.scaleLayer[this.displayIndex].draw();
                }
                
            },

            'summarizeData': function(){
                var i, j, summaryKey, newValue;

                for(j=0; j<this.views.length; j++){
                    //bail out if we haven't fetched anything yet
                    if(!window.currentData[this.views[j]])
                        continue;

                    //zero out old summaries at this depth
                    for(i=0; i<this.channelNames.length; i++){
                        if(this.channelNames[i].length == this.summaryDepth){
                            window.currentData[this.views[j]][this.channelNames[i]] = [0,0];                            
                        }
                    }

                    //now repopulate all summaries; if a constituent is not reporting, the whole summary is 
                    //flagged as not reporting.
                    for(i=0; i<this.channelNames.length; i++){
                    
                        summaryKey = this.channelNames[i].slice(0,this.summaryDepth);
                        if(this.channelNames[i].length == 10 && window.currentData[this.views[j]].hasOwnProperty(summaryKey) ){

                            //bail out if this cell isn't appropriate for this summary
                            if(this.vetoSummary(this.views[j], this.channelNames[i])) continue;

                            //bail out if summary flagged as nonreporting
                            if(window.currentData[this.views[j]][summaryKey] == 0xDEADBEEF) continue;

                            newValue = window.currentData[this.views[j]][this.channelNames[i]];
                            //value sought and not found, mark nonreporting:
                            if(!newValue && newValue!=0){
                                window.currentData[this.views[j]][summaryKey] = 0xDEADBEEF;
                                continue; 
                            }

                            //looks good, increment the sum and count of terms
                            window.currentData[this.views[j]][summaryKey][0] += newValue;
                            window.currentData[this.views[j]][summaryKey][1]++;
                        }
                    }

                    //finally, go through all the summaries and turn the [sum, nNterms] pairs into averages:
                    for(i=0; i<this.channelNames.length; i++){
                        if(this.channelNames[i].length == this.summaryDepth && window.currentData[this.views[j]][this.channelNames[i]] != 0xDEADBEEF)
                            window.currentData[this.views[j]][this.channelNames[i]] = window.currentData[this.views[j]][this.channelNames[i]][0] / window.currentData[this.views[j]][this.channelNames[i]][1];
                    }
                }
            },

            'trackView': function(){
                var i;

                //keep track of what state the view state radio is in in a convenient variable right on the detector object
                //intended for binding to the onchange of the radio.
                this.currentView = document.querySelector('input[name="'+this.id+'Nav"]:checked').value;
                this.currentUnit = this.units[this.views.indexOf(this.currentView)];

                //manage which layer is showing, if there are different layers for different views
                //(ie different rate / HV segmentation)
                //summary views never segment differently.
                if(this.HVlayer){
                    for(i=0; i<this.viewNames.length; i++){
                        if(this.currentView == 'HV' && this.viewNames[i] != 'Summary'){
                            this.mainLayer[i].hide();
                            this.HVlayer[i].show();
                        } else {
                            this.mainLayer[i].show();
                            this.HVlayer[i].hide();
                        }
                    }
                }

                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').value = this.min[this.currentView];
                document.getElementById(this.id + 'PlotControlMax').value = this.max[this.currentView];
                document.getElementById(this.id + 'PlotControlScale').value = this.scaleType[this.currentView];

                //make sure the sidebar is following along
                if(this.currentView == 'HV')
                    document.getElementById(this.id + 'SidebarDeck').shuffleTo(0);
                else
                    document.getElementById(this.id + 'SidebarDeck').shuffleTo(1);

                this.updateCells();
                this.refreshColorScale();
                this.mainLayer[this.displayIndex].draw();
                if(this.HVlayer)
                    this.HVlayer[this.displayIndex].draw();
            },

            'update': function(){
                //trigger a new round of data fetching
                if(window.currentData.DAQ){
                    this.acquireDAQ();
                    this.acquireHV();                
                }
            },

            'populate' : function(){
                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').setAttribute('value', this.min[this.currentView]);
                document.getElementById(this.id + 'PlotControlMax').setAttribute('value', this.max[this.currentView]);

                //sort data into summary statistics if necessary
                if(this.summaryDepth)
                    this.summarizeData();

                //update the cell colors and tooltip content
                this.updateCells();

                this.writeTooltip(this.lastTTindex);

                //repaint
                this.mainLayer[this.displayIndex].draw();
                if(this.HVlayer)
                    this.HVlayer[this.displayIndex].draw();
            },

            'updateCells': function(){
                var i, color, rawValue, colorIndex, 
                    currentMin = this.min[this.currentView], 
                    currentMax = this.max[this.currentView],
                    isLog = this.scaleType[this.currentView] == 'log';

                //get the scale limits right
                if(isLog){
                    currentMin = Math.log10(currentMin);
                    currentMax = Math.log10(currentMax);
                }

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){
                    //bail out if this cell isn't in the current view
                    if(!this.inCurrentView(this.channelNames[i]))
                        continue;

                    //fetch the most recent raw value from the currentData store:
                    rawValue = window.currentData[this.currentView][this.channelNames[i]];

                    //if no data was found, raise exception code:
                    if(!rawValue && rawValue!=0)
                        rawValue = 0xDEADBEEF;

                    //value found and parsable, recolor cell:
                    if(rawValue != 0xDEADBEEF){
                        if(isLog)
                            rawValue = Math.log10(rawValue);

                        colorIndex = (rawValue - currentMin) / (currentMax - currentMin);
                        if(colorIndex < 0) colorIndex = 0;
                        if(colorIndex > 1) colorIndex = 1;
                        color = scalepickr(colorIndex, this.scale);

                        this.cells[this.channelNames[i]].fill(color);
                        this.cells[this.channelNames[i]].setFillPriority('color');

                    //no value reporting, show error pattern
                    } else{
                        this.cells[this.channelNames[i]].setFillPriority('pattern')
                    }
                }
            },

            //update scale minima and maxima and other plotting parameters both locally and in localStorage.
            'updatePlotParameters': function(){
                //update local minima and maxima
                this.min[this.currentView] = parseFloat(document.getElementById(this.id + 'PlotControlMin').value);
                this.max[this.currentView] = parseFloat(document.getElementById(this.id + 'PlotControlMax').value);
                //update lin / log option
                this.scaleType[this.currentView] = selected(this.id+'PlotControlScale');

                //save the change for later in localStorage
                localStorage.setItem(this.name + this.currentView + 'min', this.min[this.currentView]);
                localStorage.setItem(this.name + this.currentView + 'max', this.max[this.currentView]);
                localStorage.setItem(this.name + this.currentView + 'scaleType', this.scaleType[this.currentView]);

                //redraw
                this.updateCells();
                this.refreshColorScale();
                this.mainLayer[document.getElementById(this.id+'Deck').selectedIndex].draw();
                if(this.HVlayer)
                    this.HVlayer[document.getElementById(this.id+'Deck').selectedIndex].draw();
            },

            //return true if <channel> shouldn't be included in the summary stat in <view>
            'vetoSummary' : function(view, channel){
                return false
            },

            //formulate the tooltip text for cell i and write it on the tooltip layer.
            'writeTooltip': function(i){
                var text, value, j;

                if(i!=-1){
                    text = this.channelNames[i];

                    for(j=0; j<this.views.length; j++){
                        text += '<br>'+this.viewLabels[j]+': ';
                        value = window.currentData[this.views[j]][this.channelNames[i]];
                        text += scrubNumber(value);                       
                    }
                } else {
                    text = '';
                }
            
                this.lastTTindex = i;
                if(text != '')
                    document.getElementById('tooltip').innerHTML = text;
                else
                    document.getElementById('tooltip').setAttribute('style', '');
            },

            //decide whether or not to shuffle a clicked cell to the front
            'shuffleCell' : function(cellName){
                return true;
            },

            //fire an event at interested parties, if they exist:
            'clickCell' : function(cellName){
                var evt,
                    rateSidebar = document.getElementById('ratesAndThresholds'),
                    HVsidebar = document.getElementById('HVcontrol'),
                    HVcell = this.isHV(cellName),
                    RateCell = this.isRate(cellName),
                    crateIndex = this.findHVcrate(cellName);

                if(rateSidebar && RateCell){
                    evt = new CustomEvent('postADC', {'detail': {'channel' : cellName} });
                    rateSidebar.dispatchEvent(evt);

                    if(this.lastRateClick){
                        this.cells[this.lastRateClick].setAttr('stroke', this.frameColor);
                        this.cells[this.lastRateClick].setAttr('strokeWidth', this.frameLineWidth);

                    }
                    this.lastRateClick = cellName;
                    this.cells[cellName].setAttr('stroke', '#FF0000');
                    this.cells[cellName].setAttr('strokeWidth', 6);
                    if(this.shuffleCell(cellName))
                        this.cells[cellName].moveToTop();
                    this.mainLayer[this.displayIndex].draw()
                }

                if(HVsidebar && HVcell){
                    evt = new CustomEvent('postHVchan', {'detail': {
                        'channel' : cellName, 
                        'ODBblob': window.ODBEquipment['HV-' + crateIndex], 
                        'crateIndex': crateIndex
                    } });
                    HVsidebar.dispatchEvent(evt);

                    if(this.lastHVClick){
                        this.cells[this.lastHVClick].setAttr('stroke', this.frameColor);
                        this.cells[this.lastHVClick].setAttr('strokeWidth', this.frameLineWidth);

                    }
                    this.lastHVClick = cellName;
                    this.cells[cellName].setAttr('stroke', '#FF0000');
                    this.cells[cellName].setAttr('strokeWidth', 6);
                    if(this.shuffleCell(cellName))
                        this.cells[cellName].moveToTop();
                    if(this.HVlayer)
                        this.HVlayer[this.displayIndex].draw()
                }


            },

            //decide if the named cell is an HV cell
            'isHV' : function(cellName){
                if(cellName.length == 10)
                    return true //default for detectors with rate / HV symmetry
            },

            //decide if the named cell is a rate cell
            'isRate' : function(cellName){
                if(cellName.length == 10)
                    return true //default for detectors with rate / HV symmetry
            },

            //given an HV cell name, return the index of the HV crate it is powered by
            'findHVcrate' : function(cellName){
                var i=0,
                    match = false,
                    crateID = -1;

                if(!window.ODBEquipment || window.ODBEquipment == {}) return  //TODO: should actually deal with this

                while(!match && window.ODBEquipment['HV-'+i]){
                    if(window.ODBEquipment['HV-'+i].Settings.Names.indexOf(cellName) != -1){
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
            },

            //get dataviews from some list of DAQ nodes
            'acquireDAQ' : function(){
                var key, i;

                //dump stale data
                window.currentData.reqRate = {};
                window.currentData.acptRate = {};
                window.currentData.Threshold = {};

                //make a list of who to ask for data
                if(!window.currentData.hostList){
                    window.currentData.hostList = [];

                    //master
                    //window.currentData.hostList.push(window.currentData.DAQ.hosts.master);
                    for(key in window.currentData.DAQ.hosts){
                        if(window.currentData.DAQ.hosts[key].host){
                            //collectors
                            //window.currentData.hostList.push(window.currentData.DAQ.hosts[key].host);
                            //digitizers
                            for(i=0; i<window.currentData.DAQ.hosts[key].digitizers.length; i++){
                                if(window.currentData.DAQ.hosts[key].digitizers[i])
                                    window.currentData.hostList.push(window.currentData.DAQ.hosts[key].digitizers[i])
                            }
                        }
                    }
                }

                //send arraybuffer XHR requests to each of some list of URLS;
                //callback unpacks bytes into window.currentData rates and thresholds.
                for(i=0; i<window.currentData.hostList.length; i++){
                    XHR('http://'+window.currentData.hostList[i]+'/report', this.unpackDAQdv, false, true, true);
                }

            },

            //parse DAQ dataviews into window.currentData variables
            //information for an individual channel is packed in a 14 byte word:
            //[MSC 2 bytes][trig request 4 bytes][trig accept 4 bytes][threshold 4 bytes] <--lowest bit
            'unpackDAQdv' : function(dv){
                var channelIndex, channelName, DAQblock,
                    i;

                for(i=0; i<dv.byteLength/14; i++){
                    DAQblock = unpackDAQ(i, dv);

                    channelIndex = window.currentData.DAQ.MSC.MSC.indexOf(DAQblock.MSC);
                    channelName = window.currentData.DAQ.MSC.chan[channelIndex];
console.log([channelIndex, channelName])
                    window.currentData.reqRate[channelName] = DAQblock.trigReq;
                    window.currentData.acptRate[channelName] = DAQblock.trigAcpt;
                    window.currentData.Threshold[channelName] = DAQblock.threshold;
                }
            },

            //fetch HV
            'acquireHV' : function(){
                var i,
                    query='/?cmd=jcopy&encoding=json-nokeys';

                if(this.HVcrates == 0) return;

                for(i=0; i<this.HVcrates; i++)
                    query += '&odb' + i + '=/Equipment/HV-' + i;

                XHR('http://' + this.MIDAS + query, function(res){
                    var data;
                    data = JSON.parse(res);
                    parseHV(data);
                    this.populate();
                    this.updateHVsidebar();
                }.bind(this), 'application/json');
            },

            'updateHVsidebar' : function(){
                var HVsidebar = document.getElementsByTagName('widget-HVcontrol'),
                    HVcrate = this.findHVcrate(this.lastHVClick)

                if(!this.lastHVClick) return;  //no click = nothing to update

                evt = new CustomEvent('postHVchan', {'detail': {
                    'channel' : this.lastHVClick, 
                    'ODBblob': window.ODBEquipment['HV-' + HVcrate], 
                    'crateIndex': HVcrate
                } });
                HVsidebar[0].dispatchEvent(evt);
            },

            //grab the whole DAQ table in memory
            'buildHostmap' : function(){
                XHR('http://' + this.MIDAS + '/?cmd=jcopy&encoding=json-nokeys&odb=/DAQ', function(res){
                    window.currentData.DAQ = JSON.parse(res);
                    this.update();
                }.bind(this), 'application/json');
            }


        }
    });

})();
