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

/*
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
*/
                    this.mainLayer[j].draw();
                }
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
                var displayIndex = document.getElementById(this.id+'Deck').selectedIndex,
                    mousePos = this.stage[displayIndex].getPointerPosition();

                //adjust the background size & position
                this.TTbkg[displayIndex].setAttr( 'x', mousePos.x + 10 );
                this.TTbkg[displayIndex].setAttr( 'y', mousePos.y + 10 );
                //make text follow the mouse too
                this.text[displayIndex].setAttr( 'x', mousePos.x + 20 );
                this.text[displayIndex].setAttr( 'y', mousePos.y + 20 ); 

                this.tooltipLayer[displayIndex].draw();
            },

            //refresh the color scale labeling / coloring:
            'refreshColorScale': function(){
                /*
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
                    if(j != document.getElementById(this.id+'Deck').selectedIndex)
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
                */
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
                this.mainLayer.draw();
            },

            'update': function(){
                var displayIndex = document.getElementById(this.id+'Deck').selectedIndex;

                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').setAttribute('value', this.min[this.currentView]);
                document.getElementById(this.id + 'PlotControlMax').setAttribute('value', this.max[this.currentView]);

                //update the cell colors and tooltip content
                //this.updateCells();
                //this.writeTooltip(this.lastTTindex);

                //repaint
                this.mainLayer[displayIndex].draw();
            },

            'updateCells': function(){
                var i, color, rawValue, colorIndex, 
                    currentMin = this.min[this.currentView], 
                    currentMax = this.max[this.currentView],
                    isLog = this.scaleType[this.currentView] == 'log',
                    displayIndex = selected(this.id+'viewSelect');

                //get the scale limits right
                if(isLog){
                    currentMin = Math.log10(currentMin);
                    currentMax = Math.log10(currentMax);
                }

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){
                    //bail out if this cell isn't in the current view
                    if(displayIndex != parseInt(this.channelNames[i].slice(3,5),10) )
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
                var text, HV, thresh, rate,
                    displayIndex = document.getElementById(this.id+'Deck').selectedIndex;

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
                this.text[displayIndex].setText(text);
                if(text != ''){
                    //adjust the background size
                    this.TTbkg[displayIndex].setAttr( 'width', this.text[displayIndex].getAttr('width') + 20 );
                    this.TTbkg[displayIndex].setAttr( 'height', this.text[displayIndex].getAttr('height') + 20 ); 
                } else {
                    this.TTbkg[displayIndex].setAttr('width', 0);
                    this.TTbkg[displayIndex].setAttr('height', 0);                    
                }
                this.tooltipLayer[displayIndex].draw();
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
