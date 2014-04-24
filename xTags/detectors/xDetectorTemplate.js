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

                    this.mainLayer[j].add(colorScale);

                    //place ticks on scale
                    this.tickLabels[j] = [];
                    for(i=0; i<11; i++){
                        //tick line
                        tick = new Kinetic.Line({
                            points: [(0.1+i*0.08)*this.width, 0.95*this.height, (0.1+i*0.08)*this.width, 0.96*this.height],
                            stroke: '#999999',
                            strokeWidth: 2
                        });
                        this.mainLayer[j].add(tick);

                        //tick label
                        this.tickLabels[j][i] = new Kinetic.Text({
                            x: (0.1+i*0.08)*this.width,
                            y: 0.96*this.height + 2,
                            text: '',
                            fontSize: 14,
                            fontFamily: 'Arial',
                            fill: '#999999'
                        });
                        this.mainLayer[j].add(this.tickLabels[j][i]);
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
                    this.mainLayer[j].add(this.scaleTitle[j]);

                    //populate labels
                    this.refreshColorScale();

                    this.mainLayer[j].draw();
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
                this.stage.add(this.tooltipLayer);
            },

            //move the tooltip around
            'moveTooltip': function(){
                var mousePos = this.stage[this.displayIndex].getPointerPosition(),
                    TTwidth = this.TTbkg[this.displayIndex].getAttr('width'),
                    TTheight = this.TTbkg[this.displayIndex].getAttr('height');

                //adjust the background size & position
                this.TTbkg[this.displayIndex].setAttr( 'x', Math.min(mousePos.x + 10, this.width - TTwidth) );
                this.TTbkg[this.displayIndex].setAttr( 'y', Math.min(mousePos.y + 10, this.height - TTheight) );
                //make text follow the mouse too
                this.text[this.displayIndex].setAttr( 'x', Math.min(mousePos.x + 20, this.width - TTwidth + 10) );
                this.text[this.displayIndex].setAttr( 'y', Math.min(mousePos.y + 20, this.height - TTheight) ); 

                this.tooltipLayer[this.displayIndex].draw();
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
                    this.scaleTitle[j].setText(logTitle + this.currentView + ' [' + this.currentUnit + ']');
                    this.scaleTitle[j].setAttr('x', this.width/2 - this.scaleTitle[j].getTextWidth()/2);
                }
                
            },

            'summarizeData': function(){
                var i, j, summaryKey, newValue,
                    targets = ['HV', 'threhsold', 'rate'];

                for(j=0; j<targets.length; j++){
                    //bail out if we haven't fetched anything yet
                    if(!window.currentData[targets[j]])
                        continue;

                    //zero out old summaries at this depth
                    for(i=0; i<this.channelNames.length; i++){
                        if(this.channelNames[i].length == this.summaryDepth){
                            window.currentData[targets[j]][this.channelNames[i]] = [0,0];                            
                        }
                    }

                    //now repopulate all summaries; if a constituent is not reporting, the whole summary is 
                    //flagged as not reporting.
                    for(i=0; i<this.channelNames.length; i++){
                        summaryKey = this.channelNames[i].slice(0,this.summaryDepth);
                        if(this.channelNames[i].length == 10 && window.currentData[targets[j]].hasOwnProperty(summaryKey) ){

                            //bail out if summary flagged as nonreporting
                            if(window.currentData[targets[j]][summaryKey] == 0xDEADBEEF) continue;

                            newValue = window.currentData[targets[j]][this.channelNames[i]];
                            //value sought and non found, mark nonreporting:
                            if(!newValue && newValue!=0){
                                window.currentData[targets[j]][summaryKey] = 0xDEADBEEF;
                                continue; 
                            }

                            //looks good, increment the sum and count of terms
                            window.currentData[targets[j]][summaryKey][0] += newValue;
                            window.currentData[targets[j]][summaryKey][1]++;
                        }
                    }

                    //finally, go through all the summaries and turn the [sum, nNterms] pairs into averages:
                    for(i=0; i<this.channelNames.length; i++){
                        if(this.channelNames[i].length == this.summaryDepth && window.currentData[targets[j]][this.channelNames[i]] != 0xDEADBEEF)
                            window.currentData[targets[j]][this.channelNames[i]] = window.currentData[targets[j]][this.channelNames[i]][0] / window.currentData[targets[j]][this.channelNames[i]][1];
                    }
                }
            },

            'trackView': function(){
                //keep track of what state the view state radio is in in a convenient variable right on the detector-demo object
                //intended for binding to the onchange of the radio.
                this.currentView = document.querySelector('input[name="'+this.id+'Nav"]:checked').value;
                this.currentUnit = (this.currentView == 'Rate') ? 'Hz' : ((this.currentView == 'HV') ? 'V' : 'ADC Units' );

                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').value = this.min[this.currentView];
                document.getElementById(this.id + 'PlotControlMax').value = this.max[this.currentView];
                document.getElementById(this.id + 'PlotControlScale').value = this.scaleType[this.currentView];

                this.updateCells();
                this.refreshColorScale();
                this.mainLayer[this.displayIndex].draw();
            },

            'update': function(){
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
                    if(this.currentView == 'HV'){
                        rawValue = window.currentData.HV[this.channelNames[i]];
                    } else if (this.currentView == 'Threshold'){
                        rawValue = window.currentData.threshold[this.channelNames[i]];
                    } else if (this.currentView == 'Rate'){
                        rawValue = window.currentData.rate[this.channelNames[i]];
                    }

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
            },

            //formulate the tooltip text for cell i and write it on the tooltip layer.
            'writeTooltip': function(i){
                var text, HV, thresh, rate;

                if(i!=-1){
                    text = this.channelNames[i];
                    text += '\nHV: ';
                    HV = window.currentData.HV[this.channelNames[i]];
                    if(!HV && HV!=0) 
                        text += 'Not Reporting';
                    else
                        text += parseFloat(HV).toFixed();
                    text += '\nThreshold: ';
                    thresh = window.currentData.threshold[this.channelNames[i]];
                    if(!thresh && thresh!=0) 
                        text += 'Not Reporting'
                    else
                        text += parseFloat(thresh).toFixed();
                    text += '\nRate: ';
                    rate = window.currentData.rate[this.channelNames[i]];
                    if(!rate && rate!=0) 
                        text += 'Not Reporting'
                    else
                        text += parseFloat(rate).toFixed();
                } else {
                    text = '';
                }
                this.lastTTindex = i;
                this.text[this.displayIndex].setText(text);
                if(text != ''){
                    //adjust the background size
                    this.TTbkg[this.displayIndex].setAttr( 'width', this.text[this.displayIndex].getAttr('width') + 20 );
                    this.TTbkg[this.displayIndex].setAttr( 'height', this.text[this.displayIndex].getAttr('height') + 20 ); 
                } else {
                    this.TTbkg[this.displayIndex].setAttr('width', 0);
                    this.TTbkg[this.displayIndex].setAttr('height', 0);                    
                }
                this.tooltipLayer[this.displayIndex].draw();
            },

            //fire an event at interested parties, if they exist:
            'clickCell' : function(cellName){
                var evt,
                    SV = document.getElementById('spectrumViewer');

                //send the clicked channel to the spectrum viewer:
                if(SV){
                    evt = new CustomEvent('changeChannel', {'detail': {'channel' : cellName} });
                    SV.dispatchEvent(evt);
                }
            }

        }
    });

})();
