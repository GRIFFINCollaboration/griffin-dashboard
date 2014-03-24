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

            'update': function(){
                //get scale limits from local ODB if this detector has an entry there: 
                if(window.currentData.ODB[this.name]){
                    this.min = {HV: window.currentData.ODB[this.name].HVscale[0], Threshold: window.currentData.ODB[this.name].thresholdScale[0], Rate: window.currentData.ODB[this.name].rateScale[0]};
                    this.min = {HV: window.currentData.ODB[this.name].HVscale[1], Threshold: window.currentData.ODB[this.name].thresholdScale[1], Rate: window.currentData.ODB[this.name].rateScale[1]};
                }

                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').setAttribute('value', this.min[this.currentView]);
                document.getElementById(this.id + 'PlotControlMax').setAttribute('value', this.max[this.currentView]);

                //update the cell colors and tooltip content
                this.updateCells();
                this.writeTooltip(this.lastTTindex);
                //repaint
                this.mainLayer.draw();
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

            'updateCells': function(){
                var i, color, rawValue, colorIndex;

                //change the color of each cell to whatever it should be now:
                for(i=0; i<this.channelNames.length; i++){
                    //determine the color of the cell as a function of the view state:
                    if(this.currentView == 'HV'){
                        rawValue = Math.random();
                    } else if (this.currentView == 'Threshold'){
                        rawValue = Math.random();
                    } else if (this.currentView == 'Rate'){
                        rawValue = Math.random();
                    }

                    colorIndex = (rawValue - this.min[this.currentView]) / (this.max[this.currentView] - this.min[this.currentView]);
                    color = scalepickr(colorIndex, this.scale);

                    //recolor the cell:
                    this.cells[this.channelNames[i]].fill(color);
                }
            },

            'trackView': function(){
                //keep track of what state the view state radio is in in a convenient variable right on the detector-demo object
                //intended for binding to the onchange of the radio.
                this.currentView = document.querySelector('input[name="'+this.id+'Nav"]:checked').value;
                this.currentUnit = (this.currentView == 'Rate') ? 'Hz' : ((this.currentView == 'HV') ? 'V' : 'ADC Units' );

                //make sure the scale control widget is up to date
                document.getElementById(this.id + 'PlotControlMin').setAttribute('value', this.min[this.currentView]);
                document.getElementById(this.id + 'PlotControlMax').setAttribute('value', this.max[this.currentView]);

                this.updateCells();
                this.refreshColorScale();

                this.mainLayer.draw();
            },

            //update scale minima and maxima and other plotting parameters both locally and if necessary, in the ODB
            'updatePlotParameters': function(){
                //update local minima and maxima
                this.min[this.currentView] = parseFloat(document.getElementById(this.id + 'PlotControlMin').value);
                this.max[this.currentView] = parseFloat(document.getElementById(this.id + 'PlotControlMax').value);

                //redraw
                this.updateCells();
            },

            //formulate the tooltip text for cell i and write it on the tooltip layer.
            'writeTooltip': function(i){
                var text; 
                if(i!=-1){
                    text = this.channelNames[i];
                    text += '\nHV: ';
                    text += Math.random();
                    text += '\nThreshold: ';
                    text += Math.random();
                    text += '\nRate: ';
                    text += Math.random();
                } else {
                    text = '';
                }
                this.lastTTindex = i;
                this.text.setText(text);
                this.tooltipLayer.draw();
            },

            //generate the color scale
            'generateColorScale': function(){
                var colorStops = [],
                    i,
                    tick;

                //generate a bunch of color stop points for the gradient
                for(i=0; i<101; i++){
                    colorStops.push(i/100);
                    colorStops.push(scalepickr(i/100, this.scale));
                }

                //draw the gradient itself
                this.colorScale = new Kinetic.Rect({
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

                this.mainLayer.add(this.colorScale);

                //place ticks on scale
                this.tickLabels = [];
                for(i=0; i<11; i++){
                    //tick line
                    tick = new Kinetic.Line({
                        points: [(0.1+i*0.08)*this.width, 0.95*this.height, (0.1+i*0.08)*this.width, 0.96*this.height],
                        stroke: '#999999',
                        strokeWidth: 2
                    });
                    this.mainLayer.add(tick);

                    //tick label
                    this.tickLabels[i] = new Kinetic.Text({
                        x: (0.1+i*0.08)*this.width,
                        y: 0.96*this.height + 2,
                        text: generateTickLabel(this.min[this.currentView], this.max[this.currentView], 11, i),//(this.min[this.currentView] + (this.max[this.currentView]-this.min[this.currentView])/10*i).toFixed(0),
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fill: '#999999'
                    });
                    //center lable under tick
                    this.tickLabels[i].setAttr('x', this.tickLabels[i].getAttr('x') - this.tickLabels[i].getTextWidth()/2);
                    this.mainLayer.add(this.tickLabels[i]);
                }

                //place title on scale
                this.scaleTitle = new Kinetic.Text({
                    x: this.width/2,
                    y: 0.9*this.height - 22,
                    text: this.currentView + ' [' + this.currentUnit + ']',
                    fontSize : 20,
                    fontFamily: 'Arial',
                    fill: '#999999'
                })
                this.scaleTitle.setAttr('x', this.width/2 - this.scaleTitle.getTextWidth()/2);
                this.mainLayer.add(this.scaleTitle);

                this.mainLayer.draw();
            },

            //refresh the color scale labeling / coloring:
            'refreshColorScale': function(){
                var i;

                //refresh tick labels
                for(i=0; i<11; i++){
                    //update text
                    this.tickLabels[i].setText(generateTickLabel(this.min[this.currentView], this.max[this.currentView], 11, i));
                    //update position
                    this.tickLabels[i].setAttr('x', (0.1+i*0.08)*this.width - this.tickLabels[i].getTextWidth()/2);
                }

                //update title
                this.scaleTitle.setText(this.currentView + ' [' + this.currentUnit + ']');
                this.scaleTitle.setAttr('x', this.width/2 - this.scaleTitle.getTextWidth()/2);
            }
        }
    });

})();
