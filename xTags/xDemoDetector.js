//status bar
(function(){  

    xtag.register('detector-demo', {
        extends: 'div',
        lifecycle: {
            created: function(){
                setupSubdetector.bind(this, 'DEMO', ['DEMOCHAN00'], null)();
            },
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

                this.updateCells();
                this.refreshColorScale();

                this.mainLayer.draw();
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
                    y: 0.8*this.height,
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
                        points: [(0.1+i*0.08)*this.width, 0.85*this.height, (0.1+i*0.08)*this.width, 0.86*this.height],
                        stroke: '#999999',
                        strokeWidth: 2
                    });
                    this.mainLayer.add(tick);

                    //tick label
                    this.tickLabels[i] = new Kinetic.Text({
                        x: (0.1+i*0.08)*this.width,
                        y: 0.86*this.height + 2,
                        text: (this.min[this.currentView] + (this.max[this.currentView]-this.min[this.currentView])/10*i).toFixed(0),
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
                    y: 0.8*this.height - 22,
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
                    this.tickLabels[i].setText((this.min[this.currentView] + (this.max[this.currentView]-this.min[this.currentView])/10*i).toFixed(0));
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


//JSONP wrapper function def:
function fetchDetectorData(returnObj){
    if(!window.currentData.ODB)
        window.currentData.ODB = {};
    window.currentData.ODB.DEMO = returnObj;
}

function setupSubdetector(name, channelNames, URL) {
    var headWrapper = document.createElement('div')
    ,   title = document.createElement('h1')
    ,   viewTitles = ['HV', 'Threshold', 'Rate']
    ,   drawTarget = document.createElement('div')
    //image has aspect ratio 3:2 and tries to be 80% of the window width, but not more than 80% of the window height
    ,   width = this.offsetWidth
    ,   height = 2*width/3
    ,   i, subdetectorNav, subdetectorNavLabel
    //,   URL = null //fetch /DashboardConfig/<this.detectorName>, put it on window.currentData.ODB.<this.detectorName>, should contain at least HVscale, ThresholdScale and RateScale arrays of scale limits

    this.detectorName = name;

    //////////////////////
    //Build DOM
    //////////////////////
    headWrapper.setAttribute('id', this.id+'titleWrapper');
    headWrapper.setAttribute('class', 'subdetectorHeadlineWrap')
    this.appendChild(headWrapper);
    //top nav title
    title.setAttribute('id', this.id+'title');
    title.setAttribute('class', 'subdetectorTitle');
    document.getElementById(this.id+'titleWrapper').appendChild(title);
    document.getElementById(this.id+'title').innerHTML = 'Demo Detector';
    //state nav radio
    for(i=0; i<viewTitles.length; i++){
        subdetectorNav = document.createElement('input')
        subdetectorNav.setAttribute('id', this.id+'goto'+viewTitles[i]);
        subdetectorNav.setAttribute('class', 'subdetectorNavRadio');
        subdetectorNav.setAttribute('type', 'radio');
        subdetectorNav.setAttribute('name', this.id+'Nav');
        subdetectorNav.setAttribute('value', viewTitles[i]);
        subdetectorNav.onchange = this.trackView.bind(this);
        if(i==2) subdetectorNav.setAttribute('checked', true); //default to rate view
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNav);
        subdetectorNavLabel = document.createElement('label');
        subdetectorNavLabel.setAttribute('id', this.id+'goto'+viewTitles[i]+'Label');
        subdetectorNavLabel.setAttribute('class', 'subdetectorNavLabel');
        subdetectorNavLabel.setAttribute('for', this.id+'goto'+viewTitles[i]);
        document.getElementById(this.id+'titleWrapper').appendChild(subdetectorNavLabel);
        document.getElementById(this.id+'goto'+viewTitles[i]+'Label').innerHTML = viewTitles[i];
    }

    //div to paint detector in
    drawTarget.setAttribute('id', this.id+'Draw');
    this.appendChild(drawTarget);

    ///////////////////////
    //State variables
    ///////////////////////
    this.currentView = 'Rate';
    this.currentUnit = 'Hz';

    ////////////////////////////
    //Define Channels
    ////////////////////////////
    //declare the detector cell names for this detector:
    this.channelNames = channelNames;
    this.cells = {};

    ////////////////////////////
    //Drawing parameters
    ////////////////////////////
    this.frameLineWidth = 2;
    this.frameColor = '#999999';
    this.width = width;
    this.height = height;

    ///////////////////////////
    //Scale Parameters
    ///////////////////////////
    this.scale = 'ROOT Rainbow';
    this.min = {HV: 0, Threshold: 0, Rate: 0};
    this.max = {HV: 1, Threshold: 1, Rate: 1};

    ///////////////////////////
    //Tooltip state
    ///////////////////////////
    this.lastTTindex = -1;

    ////////////////////////////
    //Kinetic.js setup
    ////////////////////////////
    //point kinetic at the div and set up the staging and layers:
    this.stage = new Kinetic.Stage({
        container: this.id+'Draw',
        width: width,
        height: height
    });
    this.mainLayer = new Kinetic.Layer();       //main rendering layer
    this.tooltipLayer = new Kinetic.Layer();    //layer for tooltip info

    //tooltip text:
    this.text = new Kinetic.Text({
        x: 70,
        y: 10,
        fontFamily: 'Arial',
        fontSize: 14,
        text: '',
        fill: '#999999'
    });
    this.tooltipLayer.add(this.text);

    /////////////////////////////
    //Initialize visualization
    /////////////////////////////
    //initialize all the cells:
    this.instantiateCells();

    //generate the color scale
    this.generateColorScale();

    //append data location information to list of URLs to fetch from:
    if(!window.fetchURL)
        window.fetchURL = [];
    if(URL && window.fetchURL.indexOf(URL) == -1){
        window.fetchURL[window.fetchURL.length] = URL;
    }
    
    //let repopulate know that the status bar would like to be updated every loop:
    if(!window.refreshTargets)
        window.refreshTargets = [];
    window.refreshTargets[window.refreshTargets.length] = this;
    
}
